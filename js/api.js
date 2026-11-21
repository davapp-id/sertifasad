// ============================================================
//  API — komunikasi ke Google Apps Script (fetch, bukan google.script.run)
//  Pola gas-instant-ux-pro & gas-scale-turbo:
//  timeout + retry, reqId idempoten untuk simpan, gabung baca identik,
//  pengukur waktu (Perf.table()), pemanasan server, modul dimuat saat dipakai.
// ============================================================
const GAS_URL = (window.APP_CONFIG || {}).GAS_URL || '';
const APP_VER = (window.APP_CONFIG || {}).VERSION || '1';

function gasReady() { return /^https?:\/\/.+\/exec$/.test(GAS_URL) && !/GANTI_DENGAN/.test(GAS_URL); }

/** Pengukur: ketik Perf.table() atau Perf.summary() di Console browser. */
const Perf = {
  rows: [],
  add(action, total, server, cached) {
    this.rows.push({ aksi: action, total_ms: total, server_ms: server ?? null, jaringan_ms: server != null ? total - server : null, cache: cached ? '✓' : '', waktu: new Date().toLocaleTimeString('id-ID') });
    if (this.rows.length > 200) this.rows.shift();
  },
  table() { console.table(this.rows.slice(-30)); },
  summary() {
    const g = {};
    this.rows.forEach(r => { const x = g[r.aksi] = g[r.aksi] || { kali: 0, total: 0, server: 0 }; x.kali++; x.total += r.total_ms; x.server += r.server_ms || 0; });
    console.table(Object.keys(g).map(k => ({ aksi: k, kali: g[k].kali, rata_total_ms: Math.round(g[k].total / g[k].kali), rata_server_ms: Math.round(g[k].server / g[k].kali) })));
  }
};

const Auth = {
  key: 'asad-online:token',
  get token() { try { return localStorage.getItem(this.key) || ''; } catch (e) { return ''; } },
  set(t) { try { t ? localStorage.setItem(this.key, t) : localStorage.removeItem(this.key); } catch (e) { /* mode privat */ } },
  onExpired: null
};

const READ_ACTIONS = /^(bootstrap|assets|batch|ping)$/;

async function apiOnce(action, data, timeout, reqId) {
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), timeout), t0 = performance.now();
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST', redirect: 'follow', cache: 'no-store', signal: ctrl.signal,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },            // text/plain: tanpa CORS preflight
      body: JSON.stringify({ action, token: Auth.token, reqId, data: data || {} })
    });
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      Perf.add(action, Math.round(performance.now() - t0), j.ms, j.data && j.data.cached);
      return j;
    } catch (e) {
      return { success: false, network: true, retryable: res.status >= 500 || res.status === 429, message: 'Server membalas HTTP ' + res.status + ' (bukan JSON). Periksa GAS_URL & deployment.' };
    }
  } catch (err) {
    return { success: false, network: true, retryable: true, message: err.name === 'AbortError' ? 'Server terlalu lama merespons.' : 'Koneksi ke server terputus.' };
  } finally { clearTimeout(timer); }
}

function waitOnline(ms) {
  return new Promise(r => {
    if (navigator.onLine !== false) return r();
    const t = setTimeout(done, ms);
    function done() { clearTimeout(t); removeEventListener('online', done); r(); }
    addEventListener('online', done);
  });
}

async function apiRetry(action, data, isRead) {
  const reqId = isRead ? '' : (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2));
  const tries = isRead ? 3 : 2;                         // simpan aman diulang: reqId sama → server tidak menyimpan dua kali
  let res;
  for (let i = 0; i < tries; i++) {
    if (i) { await new Promise(r => setTimeout(r, 1200 * i)); if (navigator.onLine === false) await waitOnline(15000); }
    res = await apiOnce(action, data, isRead ? (i ? 40000 : 25000) : 90000, reqId);
    if (res.success || !res.retryable) break;
  }
  if (!res.success && res.code === 'AUTH' && Auth.onExpired) Auth.onExpired();
  return res;
}

const _inflight = {}; let _writeEpoch = 0;
/** Panggil API. Baca identik yang sedang berjalan akan menumpang (tidak dobel). */
function api(action, data) {
  if (!gasReady()) return Promise.resolve({ success: false, code: 'CONFIG', message: 'GAS_URL di js/config.js belum diisi dengan URL /exec dari Apps Script.' });
  if (!READ_ACTIONS.test(action)) { _writeEpoch++; return apiRetry(action, data, false); }
  const k = _writeEpoch + '|' + action + '|' + JSON.stringify(data || {});
  if (_inflight[k]) return _inflight[k];
  const p = apiRetry(action, data, true);
  _inflight[k] = p;
  p.finally(() => { delete _inflight[k]; });
  return p;
}

/** Panaskan server (tanpa menunggu jawaban), maks. 1×/4 menit per lingkup. */
function warmUp(scope) {
  if (!gasReady()) return;
  try { const k = 'asad-warm-' + scope, last = +sessionStorage.getItem(k) || 0; if (Date.now() - last < 240000) return; sessionStorage.setItem(k, Date.now()); } catch (e) {}
  fetch(GAS_URL + '?w=' + encodeURIComponent(scope) + '&t=' + Date.now(), { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
}

/** Pustaka berat dimuat hanya saat dibutuhkan. */
const LIBS = {
  jspdf: ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => window.jspdf],
  exceljs: ['https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js', () => window.ExcelJS],
  xlsx: ['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', () => window.XLSX]
};
const _libP = {};
function loadLib(name) {
  const [url, test] = LIBS[name];
  if (test()) return Promise.resolve(test());
  return _libP[name] || (_libP[name] = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = url; s.async = true;
    s.onload = () => (test() ? res(test()) : rej(new Error('Modul ' + name + ' tidak termuat.')));
    s.onerror = () => { delete _libP[name]; rej(new Error('Gagal memuat modul ' + name + '. Periksa koneksi internet lalu coba lagi.')); };
    document.head.appendChild(s);
  }));
}
function preloadLib(name) {
  const go = () => loadLib(name).catch(() => {});
  if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 3000 }); else setTimeout(go, 1500);
}

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h + ':' + s.length; }
