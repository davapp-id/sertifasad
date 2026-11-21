// ============================================================
//  APLIKASI — Cetak Sertifikat ASAD (UI, data, sinkron server)
// ============================================================
{
const HASIL=['Juara 1','Juara 2','Juara 3','Juara Harapan 1','Juara Harapan 2','Juara Harapan 3','Peserta'];
const KAT=['','Putra','Putri'];
const LSK='asad-online:v1:';
function lsGet(k,d){try{const v=localStorage.getItem(LSK+k);return v?JSON.parse(v):d}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(LSK+k,JSON.stringify(v));return true}catch(e){return false}}
var Sync=null;
const DEF={ev:'KEJURKAB KATEGORI USIA DINI',tempat:'Padepokan Permai Raya',tanggal:'Kutai Timur, ........................ 2026',s1t:'Dewan Pembina\nPersinas ASAD KUTIM',s1n:'H. MUFLIKUN ASSIDDIQI, SH.',s2t:'Ketua\nPersinas ASAD KUTIM',s2n:'H. KHOIRUL ARIFIN, S.Sos., S.H., M.H.',wm:0.14};
const SAMPLE=[['Ahmad Fauzan','Juara 1','','Sangatta Utara','1-2','A'],['Nabila Zahra','Juara 2','','Bengalon','1-2','B'],['Rizky Pratama','Juara 3','','Sangatta Selatan','3-4','A'],['Aisyah Rahma','Peserta','','Sangatta Utara','3-4','C'],['Muhammad Iqbal','Peserta','','Bengalon','5-6','D']];
const sampleRows=()=>SAMPLE.map(r=>({n:r[0],h:r[1],k:r[2],d:r[3],sd:r[4],kk:r[5]}));
const SAMPLE_DESA=[['Permai Raya','Juara 1','Putri'],['Sangatta Selatan','Juara 2','Putri'],['Sangatta Utara','Juara 3','Putri'],['Bengalon','Peserta','Putri']];
let st={cfg:{...DEF,mode:'orang'},rows:[],sample:false,sel:0,selEl:-1,layout:null,ev:null,cur:'kejurkab',synced:null};
{const c=lsGet('state',null);if(c&&c.ev)st={...st,...c}}

function syncCur(){if(st.ev)st.ev[st.cur]={...st.ev[st.cur],rows:st.rows,layout:st.layout,cfg:st.cfg,sample:st.sample,sel:st.sel}}
function saveLocal(){syncCur();const o={...st};delete o.rows;delete o.layout;delete o.cfg;delete o.sample;return lsSet('state',o)}
const save=()=>{const okL=saveLocal();if(Sync)Sync.schedule();return okL};
function setSaved(){}
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

if(!st.ev){st.ev=defaultEvents();st.synced=null;st.cur='kejurkab'}
function defaultEvents(){const mk=(nama,mode)=>{const cfg={...DEF,ev:nama,mode,prefix:'Desa'};return{rows:[],layout:defaultLayout(cfg,mode),cfg,sample:false,sel:0,rev:0}};return{kejurkab:mk('KEJURKAB KATEGORI USIA DINI','orang'),pasanggiri:mk('KEJUARAAN PASANGGIRI','desa')}}
function loadCur(){let e=st.ev[st.cur];if(!e){st.cur=Object.keys(st.ev)[0];e=st.ev[st.cur]}st.rows=e.rows||[];st.cfg={...DEF,...e.cfg};st.layout=Array.isArray(e.layout)?e.layout:defaultLayout(st.cfg,st.cfg.mode);st.sample=!!e.sample;st.sel=Math.min(e.sel||0,Math.max(0,st.rows.length-1));st.selEl=-1}
loadCur();

/* ---------- tampilan ---------- */
const pv=$('pv'),pc=pv.getContext('2d');let raf=0,boxes=[],guide=false,hdl=null;
function prevPerson(){let p=st.rows[st.sel]||(st.cfg.mode==='desa'?{n:'',h:'Juara 1',k:'Putri'}:{n:'',h:'Juara 1',k:'',d:'Sangatta Utara',sd:'1-2',kk:'A'});const el=st.layout[st.selEl];if(el&&!el.hidden&&!visible(el,p))p={...p,h:el.show==='juara'?'Juara 1':'Peserta'};return p}
function redraw(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const sc=pv.width/1123;boxes=[];drawCert(pc,sc,prevPerson(),st.cfg,st.layout,boxes);
  const b=boxes[st.selEl];pc.setTransform(sc,0,0,sc,0,0);
  if(guide){pc.setLineDash([6,4]);line(pc,561,0,561,794,'#d6336c',1.5)}
  hdl=null;if(b){pc.setLineDash([6,4]);pc.strokeStyle='#2563eb';pc.lineWidth=2;pc.strokeRect(b.x1-5,b.y1-5,b.x2-b.x1+10,b.y2-b.y1+10);pc.setLineDash([]);
    const r=7*1123/Math.max(1,pv.clientWidth);hdl={x:b.x2+5,y:b.y2+5,r,cx:(b.x1+b.x2)/2,cy:(b.y1+b.y2)/2};pc.fillStyle='#fff';pc.lineWidth=2*r/7;pc.fillRect(hdl.x-r,hdl.y-r,2*r,2*r);pc.strokeRect(hdl.x-r,hdl.y-r,2*r,2*r)}
  pc.setLineDash([]);pc.setTransform(1,0,0,1,0,0);pv.style.touchAction=st.selEl>=0?'none':'pan-x pan-y';
  $('evChip').textContent=st.cfg.ev;$('pvName').textContent=st.rows.length?`Sertifikat ${st.sel+1} dari ${st.rows.length}`:'Daftar masih kosong'})}
function stats(){const j=st.rows.filter(r=>r.h!=='Peserta').length;$('sampleNote').hidden=!st.sample}
function renderList(){
  const desas=[...new Set(st.rows.map(r=>r.d).filter(Boolean))];$('dlD').innerHTML=desas.map(d=>`<option value="${esc(d)}">`).join('');
  const isD=st.cfg.mode==='desa',who=isD?'desa':'peserta';$('list').classList.toggle('desa',isD);
  $('rowCount').textContent=st.rows.length+' '+who;
  const hs=(r,i)=>`<td class="hcell w-h"><select data-f="h" aria-label="Hasil ${who} ${i+1}">${HASIL.map(h=>`<option${h===r.h?' selected':''}>${h}</option>`).join('')}</select></td>`;
  const head=isD?'<tr><th>No</th><th>Nama Desa</th><th>Hasil</th><th>Putra / Putri</th><th><span class="vh">Hapus</span></th></tr>'
    :'<tr><th>No</th><th>Nama Peserta</th><th>Desa</th><th>SD Kelas</th><th>Kategori Kelas</th><th>Hasil</th><th><span class="vh">Hapus</span></th></tr>';
  const body=st.rows.map((r,i)=>`<tr class="item${i===st.sel?' sel':''}${r.h!=='Peserta'?' juara':''}" data-i="${i}"><td class="no">${i+1}</td>
<td><input data-f="n" value="${esc(r.n)}" aria-label="Nama ${who} ${i+1}" placeholder="${isD?'Nama desa':'Nama peserta'}"></td>
${isD?hs(r,i)+`<td class="w-k"><select data-f="k" aria-label="Putra atau putri, desa ${i+1}">${KAT.map(k=>`<option value="${k}"${k===r.k?' selected':''}>${k||'—'}</option>`).join('')}</select></td>`
:`<td class="w-d"><input data-f="d" list="dlD" value="${esc(r.d||'')}" aria-label="Desa peserta ${i+1}"></td>
<td class="w-sd"><input data-f="sd" list="dlSD" value="${esc(r.sd||'')}" aria-label="SD kelas peserta ${i+1}"></td>
<td class="w-kk"><input data-f="kk" list="dlKK" value="${esc(r.kk||'')}" aria-label="Kategori kelas peserta ${i+1}"></td>`+hs(r,i)}
<td class="del"><button type="button" data-del="${i}" aria-label="Hapus baris ${i+1}" title="Hapus baris">✕</button></td></tr>`).join('');
  $('list').innerHTML=`<thead>${head}</thead><tbody>${body||`<tr><td colspan="${isD?5:7}" style="padding:16px;color:var(--mut)">Belum ada ${who}. Klik "+ Tambah baris", unggah Excel, atau tempel data ke sini.</td></tr>`}</tbody>`;
  stats();renderWho();renderPrint();if(st.ev)renderEvTabs();
}
function touch(){if(st.sample){st.sample=false}stats();save();redraw()}
$('list').addEventListener('input',e=>{const it=e.target.closest('.item');if(!it)return;const i=+it.dataset.i;st.rows[i][e.target.dataset.f]=e.target.value;st.sel=i;touch();renderWho()});
$('list').addEventListener('focusin',e=>{const it=e.target.closest('.item');if(!it)return;const i=+it.dataset.i;if(i!==st.sel){st.sel=i;document.querySelectorAll('.item').forEach(x=>x.classList.toggle('sel',+x.dataset.i===i));$('pvWho').value=i;redraw()}});
let lastDel=null;
$('list').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(!b)return;const i=+b.dataset.del;lastDel={i,r:st.rows[i]};st.rows.splice(i,1);st.sel=Math.max(0,Math.min(st.sel,st.rows.length-1));$('btnUndo').hidden=false;renderList();touch()});
$('btnUndo').onclick=()=>{if(!lastDel)return;st.rows.splice(lastDel.i,0,lastDel.r);st.sel=lastDel.i;lastDel=null;$('btnUndo').hidden=true;renderList();touch()};
$('list').addEventListener('change',e=>{if(e.target.dataset.f==='h'){const tr=e.target.closest('tr');if(tr)tr.classList.toggle('juara',e.target.value!=='Peserta')}});
function addRow(after){const p=st.rows[after]||st.rows[st.rows.length-1]||{};const r={n:'',h:'Peserta',k:st.cfg.mode==='desa'?(p.k||''):'',d:p.d||'',sd:p.sd||'',kk:''};const at=after==null?st.rows.length:after+1;st.rows.splice(at,0,r);st.sel=at;return at}
function focusCell(i,f){const el=document.querySelector(`#list tr[data-i="${i}"] [data-f="${f}"]`);if(el){el.focus();if(el.select)el.select()}}
$('btnAdd').onclick=()=>{if(st.sample){st.rows=[];st.sample=false}const i=addRow();renderList();touch();focusCell(i,'n')};
$('list').addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing)return;const t=e.target,tr=t.closest('tr.item');if(!tr||!t.dataset.f)return;e.preventDefault();
  const i=+tr.dataset.i,f=t.dataset.f;let n=e.shiftKey?i-1:i+1;if(n<0)return;if(n>=st.rows.length){if(!st.rows[i].n.trim())return;n=addRow(i);renderList();touch()}focusCell(n,f)});
$('list').addEventListener('paste',e=>{const t=e.target,tr=t.closest&&t.closest('tr.item');if(!tr||!t.dataset.f)return;const txt=(e.clipboardData||window.clipboardData).getData('text');if(!/[\t\n]/.test(txt.replace(/\s+$/,'')))return;e.preventDefault();
  const order=st.cfg.mode==='desa'?['n','h','k']:['n','d','sd','kk','h'];let start=order.indexOf(t.dataset.f);if(start<0)start=0;
  let lines=txt.replace(/\r/g,'').replace(/\n+$/,'').split('\n').map(l=>l.split('\t'));
  if(lines.length>1&&lines[0].filter(x=>colRole(x)).length>=Math.min(2,lines[0].length))lines=lines.slice(1);
  if(st.sample){st.rows=[];st.sample=false}let i=+tr.dataset.i;if(i>=st.rows.length)i=st.rows.length;
  lines.forEach((cells,r)=>{if(!st.rows[i+r])st.rows.push({n:'',h:'Peserta',k:'',d:'',sd:'',kk:''});const row=st.rows[i+r];
    cells.forEach((v,c)=>{const f=order[start+c];if(!f)return;v=v.trim();row[f]=f==='h'?parseHasil(v):f==='k'?parseKat(v):v})});
  st.sel=i;renderList();touch();focusCell(i,t.dataset.f);msg('');xmsg(lines.length+' baris ditempel ke tabel.')});
let clr=0;$('btnClear').onclick=()=>{const b=$('btnClear');if(!clr){b.textContent='Yakin? Klik lagi untuk mengosongkan';clr=setTimeout(()=>{clr=0;b.textContent='Kosongkan daftar'},3500);return}clearTimeout(clr);clr=0;b.textContent='Kosongkan daftar';st.rows=[];st.sel=0;renderList();touch()};

function parseHasil(t){t=(t||'').toLowerCase().trim();if(!t||/peserta|partisipan/.test(t))return'Peserta';const n=(t.match(/[1-3]/)||[])[0];if(!n)return'Peserta';return /harapan/.test(t)?'Juara Harapan '+n:'Juara '+n}
function parseKat(t){t=(t||'').toLowerCase();return /putri|wanita|perempuan/.test(t)?'Putri':/putra|laki/.test(t)?'Putra':''}
function colRole(t){t=String(t||'').toLowerCase().trim();if(!t)return'';if(/kategori\s*kelas|kelas\s*tanding|kelas\s*kategori|kelas\s*berat/.test(t))return'kk';if(/(^|\s)sd(\s|$)|sd\s*kelas|kelas\s*sd|^kelas$/.test(t))return'sd';if(/desa|kontingen|asal|ranting|unit/.test(t))return'd';if(/nama/.test(t))return'n';if(/hasil|juara|prestasi|peringkat|keterangan/.test(t))return'h';if(/putra|putri|jenis|gender|kategori/.test(t))return'k';return''}
function headerMap(cells){const m={};cells.forEach((v,i)=>{const r=colRole(v);if(r&&m[r]==null)m[r]=i});
  if(st.cfg.mode==='desa'){if(m.d!=null)m.n=m.d;delete m.d;delete m.sd;delete m.kk}else delete m.k;return m.n!=null?m:null}
function rowsFrom(table,map,fill){const out=[];let lastD='',lastSD='';
  for(const c of table){const g=k=>map[k]!=null?String(c[map[k]]??'').trim():'';const n=g('n');const dRaw=g('d');
    if(/^(total|jumlah)/i.test(dRaw)||/^(total|jumlah)/i.test(n)){continue}
    if(dRaw){if(dRaw!==lastD)lastSD='';lastD=dRaw}const sdRaw=g('sd');if(sdRaw)lastSD=sdRaw;
    if(!n||/^\d+$/.test(n)||/^=/.test(n))continue;
    out.push({n,h:parseHasil(g('h')),k:parseKat(g('k')),d:fill?lastD:dRaw,sd:fill?lastSD:sdRaw,kk:g('kk')})}
  return out}
$('btnPaste').onclick=()=>{
  const lines=$('paste').value.split(/\r?\n/).filter(l=>l.trim());const cells=lines.map(l=>(l.includes('\t')?l.split('\t'):l.split(';')).map(x=>x.trim()));
  let map=st.cfg.mode==='desa'?{n:0,h:1,k:2}:{n:0,h:1,d:2,sd:3,kk:4},fill=false,body=cells;const hi=cells.findIndex(c=>headerMap(c));
  if(hi>=0&&hi<5){map=headerMap(cells[hi]);fill=true;body=cells.slice(hi+1)}
  const add=rowsFrom(body,map,fill);
  if(!add.length){msg('Belum ada nama yang bisa dibaca dari kotak tempel.',1);return}
  if(st.sample){st.rows=[]}st.rows.push(...add);st.sel=st.rows.length-add.length;$('paste').value='';renderList();touch();msg(add.length+' peserta ditambahkan ke daftar.');
};

/* pengaturan & kejuaraan */
const BUILT={kejurkab:1,pasanggiri:1};
function loadCfg(){
  $('evSel').innerHTML=Object.entries(st.ev).map(([id,e])=>`<option value="${id}"${id===st.cur?' selected':''}>${esc((id===st.cur?st.cfg:e.cfg).ev||'(tanpa nama)')}</option>`).join('')+'<option value="__baru">+ Kejuaraan baru…</option>';
  $('evName').value=st.cfg.ev;$('tempat').value=st.cfg.tempat||'';$('prefix').value=st.cfg.prefix||'';
  document.querySelectorAll('[name=mode]').forEach(r=>r.checked=r.value===st.cfg.mode);$('btnEvDel').hidden=!!BUILT[st.cur];applyMode()}
function short(ev){return String(ev||'').replace(/^KEJUARAAN\s+/i,'').replace(/\s+KATEGORI\b.*$/i,'').trim()||'Kejuaraan'}
function renderEvTabs(){$('evTabs').innerHTML=Object.entries(st.ev).map(([id,e])=>{const c=id===st.cur?st.cfg:e.cfg;return`<button type="button" role="tab" aria-selected="${id===st.cur}" data-evtab="${id}"><b>${esc(short(c.ev))}</b><span>${c.mode==='desa'?'Per desa · putra/putri':'Perorangan'} · ${(id===st.cur?st.rows:e.rows||[]).length} data</span></button>`}).join('')}
function applyMode(){const d=st.cfg.mode==='desa';document.body.classList.toggle('mode-desa',d);$('prefixBox').hidden=!d;
  $('listTitle').textContent=d?'Daftar Desa':'Daftar Peserta';
  $('pasteHelp').innerHTML=d?'Satu desa per baris. Paling mudah: salin dari Excel <b>beserta baris judulnya</b> (Nama Desa, Hasil, Kategori). Tanpa judul, urutannya: Nama desa; Hasil; Putra/Putri.':'Satu peserta per baris. Paling mudah: salin dari Excel <b>beserta baris judulnya</b> (Nama, Desa, SD Kelas, Kategori Kelas, Hasil). Tanpa judul, urutannya: Nama; Hasil; Desa; SD Kelas; Kategori Kelas.';
  $('paste').placeholder=d?'Permai Raya;Juara 1;Putri\nSangatta Selatan;Juara 2;Putra\nBengalon;;Putri':'Ahmad Fauzan;Juara 1;Sangatta Utara;1-2;A\nNabila Zahra;Juara 2;Bengalon;3-4;B\nRizky Pratama';
  $('xlStep').innerHTML=d?'Isi <b>Nama Desa</b>, lalu pilih <b>Hasil</b> dan <b>Kategori</b> (Putra/Putri) dari daftar pilihan.':'Isi Nama, Desa, SD Kelas, dan Kategori Kelas, lalu pilih <b>Hasil</b> dari daftar pilihan.';
  $('sampleNote').textContent=d?'Daftar ini berisi contoh desa. Ganti atau kosongkan, lalu isi dengan desa peserta Anda.':'Daftar ini berisi contoh nama. Ganti atau kosongkan, lalu isi dengan peserta Anda.';
  $('pvWhoLbl').textContent=d?'Pratinjau untuk desa':'Pratinjau untuk peserta';
  const sh=short(st.cfg.ev);$('xlTitle').textContent='Excel '+sh;$('btnTpl').textContent='Unduh template Excel '+sh;$('btnExp').textContent='Ekspor daftar '+sh+' ke Excel';renderEvTabs();
  $('xlNote').innerHTML=d?'File rekap lain juga bisa diunggah selama ada kolom <b>Desa</b> atau <b>Nama Desa</b>; kolom Hasil dan Kategori (Putra/Putri) dikenali otomatis.':'File rekap lain, misalnya Rekap Atlit Perdesa, juga bisa langsung diunggah selama ada kolom <b>Nama</b>. Kolom Desa, SD Kelas, dan Kategori Kelas dikenali otomatis, termasuk sel yang digabung (merge).'}
function switchEv(id){syncCur();st.cur=id;loadCur();if(typeof hist!=='undefined'){hist.length=0;$('btnLUndo').disabled=true}loadCfg();renderList();renderElSel();insp();loadFonts(st.layout).then(redraw);redraw();save()}
$('evTabs').addEventListener('click',e=>{const b=e.target.closest('[data-evtab]');if(b&&b.dataset.evtab!==st.cur)switchEv(b.dataset.evtab)});
$('evSel').onchange=()=>{const v=$('evSel').value;
  if(v==='__baru'){syncCur();const id='ev'+Date.now().toString(36);st.ev[id]={rows:[],layout:defaultLayout(st.cfg,'orang'),cfg:{...DEF,ev:'KEJUARAAN BARU',tempat:st.cfg.tempat,mode:'orang',prefix:'Desa'},sample:false,sel:0};switchEv(id);$('evName').focus();$('evName').select();return}
  switchEv(v)};
$('evName').addEventListener('input',()=>{st.cfg.ev=$('evName').value.toUpperCase();const o=$('evSel').selectedOptions[0];if(o)o.textContent=st.cfg.ev||'(tanpa nama)';save();redraw()});
$('tempat').addEventListener('input',()=>{st.cfg.tempat=$('tempat').value;save();redraw()});
$('prefix').addEventListener('input',()=>{st.cfg.prefix=$('prefix').value.trim();save();redraw()});
document.querySelectorAll('[name=mode]').forEach(r=>r.onchange=()=>{st.cfg.mode=r.value;applyMode();renderList();redraw();save()});
let evd=0;$('btnEvDel').onclick=()=>{const b=$('btnEvDel');if(!evd){b.textContent='Yakin? Klik lagi untuk menghapus kejuaraan ini beserta datanya';evd=setTimeout(()=>{evd=0;b.textContent='Hapus kejuaraan ini'},3500);return}
  clearTimeout(evd);evd=0;b.textContent='Hapus kejuaraan ini';delete st.ev[st.cur];st.cur='kejurkab';loadCur();loadCfg();renderList();renderElSel();insp();redraw();save()};

/* ---------- editor tata letak ---------- */
const WTS=[[400,'Tipis'],[500,'Normal'],[600,'Agak tebal'],[700,'Tebal'],[800,'Sangat tebal']];
const SHOW=[['all','Semua sertifikat'],['juara','Sertifikat juara saja'],['peserta','Sertifikat penghargaan saja']];
const KIND={text:'Teks',image:'Gambar',ribbon:'Pita',medal:'Medali',divider:'Hiasan',rule:'Garis'};
function lmsg(t,err){const m=$('lmsg');m.textContent=t;m.style.color=err?'var(--warn)':'var(--g)'}
const hist=[];let pendSnap=null;
function snap(){hist.push(JSON.stringify(st.layout));if(hist.length>40)hist.shift();$('btnLUndo').disabled=false}
let svT=0;function saveSoon(){clearTimeout(svT);svT=setTimeout(()=>{if(!save())lmsg('Tata letak belum bisa disimpan otomatis (gambar terlalu besar). Gunakan "Simpan tata letak (file)".',1)},400)}
function elName(el){return KIND[el.type]+': '+(el.label||(el.t||'').slice(0,30))}
function renderElSel(){$('elList').innerHTML=st.layout.map((el,i)=>`<div class="eli${i===st.selEl?' sel':''}"><input type="checkbox" data-vis="${i}"${el.hidden?'':' checked'} aria-label="Tampilkan ${esc(elName(el))}"><button type="button" data-pick="${i}">${esc(el.label||KIND[el.type])}</button><span class="tag">${KIND[el.type]}</span></div>`).join('')}
function pick(i){st.selEl=i;renderElSel();insp();redraw()}
const opt=(arr,v)=>arr.map(([a,b])=>`<option value="${a}"${String(a)===String(v)?' selected':''}>${b}</option>`).join('');
function insp(){
  const el=st.layout[st.selEl],box=$('insp');
  if(!el){box.innerHTML='<div class="info"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg><p>Klik salah satu elemen pada sertifikat untuk mengatur isi, posisi, ukuran, huruf, dan warnanya.</p></div>';return}
  const num=(k,l,min,max,step=1)=>`<div><label>${l}<input type="number" data-k="${k}" data-num min="${min}" max="${max}" step="${step}" value="${+el[k]}"></label></div>`;
  const rng=(k,l,min,max,step,fmt=v=>v)=>`<div><label>${l}: <output>${fmt(+el[k])}</output><input type="range" data-k="${k}" data-num min="${min}" max="${max}" step="${step}" value="${+el[k]}"></label></div>`;
  const col=(k,l)=>`<div><label>${l}<input type="color" data-k="${k}" value="${el[k]}"></label></div>`;
  const sel=(k,l,o)=>`<div><label>${l}<select data-k="${k}">${o}</select></label></div>`;
  const chk=(k,l)=>`<label class="chk"><input type="checkbox" data-k="${k}"${el[k]?' checked':''}> ${l}</label>`;
  let h='';
  if(el.type==='text'){
    h+=`<label>Isi teks<textarea data-k="t" rows="2">${esc(el.t)}</textarea></label>`;
    if(el.tp!=null)h+=`<label>Isi teks untuk sertifikat penghargaan (peserta)<textarea data-k="tp" rows="2">${esc(el.tp)}</textarea></label>`;
    h+=`<p class="note">Kode otomatis: <b>{nama}</b>, <b>{hasil}</b>, <b>{kelas}</b> (kategori kelas), <b>{sdkelas}</b>, <b>{desa}</b>, <b>{keterangan}</b> (kelas · SD kelas · desa sekaligus), <b>{event}</b>, <b>{tempat}</b>. Apit dengan **dua bintang** untuk menebalkan sebagian kata. Enter untuk baris baru.</p>
<div class="grid3">${sel('font','Jenis huruf',FONTS.map(f=>`<option${f===el.font?' selected':''} style="font-family:'${f}'">${f}</option>`).join(''))}${num('s','Ukuran huruf',6,160)}${sel('w','Tebal / tipis',opt(WTS,el.w))}
${col('color','Warna huruf')}${num('sp','Jarak antarhuruf',0,40)}${sel('align','Rata',opt([['center','Tengah'],['left','Kiri'],['right','Kanan']],el.align))}</div>
<div class="chks">${chk('it','Miring (italic)')}${chk('upper','HURUF BESAR semua')}</div>
<div class="grid3">${num('maxW','Lebar maksimum (0 = bebas)',0,1100)}${sel('deco','Hiasan',opt([['','Tidak ada'],['underline','Garis emas di bawah'],['lines','Garis emas kiri-kanan']],el.deco))}${sel('show','Tampil di',opt(SHOW,el.show))}</div>`;
  }else if(el.type==='image'){
    h+=`<div class="row-btns" style="margin-top:0"><label class="filebtn ghostf" for="imgRep">Ganti gambar<input type="file" id="imgRep" accept="image/*" class="vh"></label></div>
<div class="grid3">${rng('w','Lebar',10,1123,1,v=>v+' px')}${rng('op','Ketebalan / tampak',0.02,1,0.01,v=>Math.round(v*100)+'%')}${sel('show','Tampil di',opt(SHOW,el.show))}</div>`;
  }else{
    h+=`<div class="grid3">${rng('w','Lebar',el.type==='medal'?30:60,1123,1,v=>v+' px')}${el.color!=null&&el.type!=='medal'?col('color','Warna'):''}${el.type==='rule'?num('h','Tebal garis',1,12):''}${sel('show','Tampil di',opt(SHOW,el.show))}</div>`;
  }
  h+=`<div class="grid3">${num('x','Posisi mendatar (X)',-200,1323)}${num('y','Posisi tegak (Y)',-200,994)}<div><label>Nama elemen<input data-k="label" value="${esc(el.label||'')}"></label></div></div>
<div class="row-btns"><button type="button" class="ghost" data-act="center">Tengahkan</button><button type="button" class="ghost" data-act="front">Ke depan</button><button type="button" class="ghost" data-act="back">Ke belakang</button><button type="button" class="ghost" data-act="dup">Duplikat</button><button type="button" class="ghost danger" data-act="del">Hapus</button></div>`;
  box.innerHTML=h;
}
$('insp').addEventListener('focusin',()=>{pendSnap=JSON.stringify(st.layout)});
$('insp').addEventListener('input',e=>{const t=e.target,k=t.dataset.k,el=st.layout[st.selEl];if(!k||!el)return;
  if(pendSnap){hist.push(pendSnap);pendSnap=null;$('btnLUndo').disabled=false}
  el[k]=t.type==='checkbox'?t.checked:t.dataset.num!=null?(t.value===''?0:+t.value):t.value;
  const o=t.parentElement.querySelector('output');if(o)o.textContent=k==='op'?Math.round(el[k]*100)+'%':el[k]+' px';
  if(k==='label')renderElSel();
  if(k==='font'||k==='w'||k==='it')loadFonts([el]).then(redraw);
  redraw();saveSoon()});
$('insp').addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const i=st.selEl,el=st.layout[i];if(!el)return;snap();
  const act=a.dataset.act;
  if(act==='center'){el.x=561}
  if(act==='dup'){const d=JSON.parse(JSON.stringify(el));d.x+=20;d.y+=20;d.label=(d.label||'')+' (salinan)';st.layout.splice(i+1,0,d);st.selEl=i+1}
  if(act==='del'){st.layout.splice(i,1);st.selEl=-1;lmsg('Elemen dihapus. Tekan "Urungkan" untuk mengembalikan.')}
  if(act==='front'&&i<st.layout.length-1){st.layout.splice(i,1);st.layout.push(el);st.selEl=st.layout.length-1}
  if(act==='back'&&i>0){st.layout.splice(i,1);st.layout.unshift(el);st.selEl=0}
  renderElSel();insp();redraw();saveSoon()});
$('insp').addEventListener('change',async e=>{if(e.target.id!=='imgRep')return;const f=e.target.files[0];if(!f)return;
  try{const u=await readImg(f);snap();st.layout[st.selEl].src=u;redraw();saveSoon();lmsg('Gambar diganti.')}catch(err){lmsg('Gambar tidak bisa dibuka: '+(err.message||err),1)}});
$('elList').addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(b)pick(+b.dataset.pick)});
$('elList').addEventListener('change',e=>{const c=e.target.closest('[data-vis]');if(!c)return;snap();st.layout[+c.dataset.vis].hidden=!c.checked;redraw();saveSoon()});
$('btnAddText').onclick=()=>{snap();st.layout.push(T({label:'Teks baru',t:'Teks baru',x:561,y:397,s:28,w:700}));pick(st.layout.length-1);saveSoon();const ta=$('insp').querySelector('textarea');if(ta){ta.focus();ta.select()}};
function readImg(file){return new Promise((res,rej)=>{if(!/^image\//.test(file.type)){rej(new Error('file bukan gambar'));return}
  const r=new FileReader();r.onerror=()=>rej(new Error('file tidak terbaca'));r.onload=()=>{const im=new Image();im.onerror=()=>rej(new Error('format gambar tidak didukung'));
  im.onload=()=>{const m=1000,k=Math.min(1,m/Math.max(im.naturalWidth||m,im.naturalHeight||m));const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round((im.naturalWidth||m)*k));cv.height=Math.max(1,Math.round((im.naturalHeight||m)*k));cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);res(cv.toDataURL(file.type==='image/jpeg'?'image/jpeg':'image/png',.9))};im.src=r.result};r.readAsDataURL(file)})}
$('imgAdd').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const u=await readImg(f);snap();st.layout.push({type:'image',label:f.name.replace(/\.[^.]+$/,''),src:u,x:561,y:397,w:160,op:1,show:'all'});pick(st.layout.length-1);saveSoon();lmsg('Gambar ditambahkan di tengah. Geser ke posisi yang diinginkan.')}catch(err){lmsg('Gambar tidak bisa dibuka: '+(err.message||err),1)}};
$('btnLUndo').onclick=()=>{if(!hist.length)return;st.layout=JSON.parse(hist.pop());if(st.selEl>=st.layout.length)st.selEl=-1;$('btnLUndo').disabled=!hist.length;renderElSel();insp();loadFonts(st.layout).then(redraw);redraw();saveSoon()};
let rst=0;$('btnLReset').onclick=()=>{const b=$('btnLReset');if(!rst){b.textContent='Yakin? Klik lagi untuk mengembalikan';rst=setTimeout(()=>{rst=0;b.textContent='Kembalikan tata letak awal'},3500);return}
  clearTimeout(rst);rst=0;b.textContent='Kembalikan tata letak awal';snap();st.layout=defaultLayout(st.cfg,st.cfg.mode);st.selEl=-1;renderElSel();insp();redraw();saveSoon();lmsg('Tata letak dikembalikan ke awal. Tekan "Urungkan" bila berubah pikiran.')};
$('btnLSave').onclick=async()=>{const r=await saveFile('Tata letak sertifikat ASAD.json',new Blob([JSON.stringify({app:'sertifikat-asad',v:1,layout:st.layout})]));lmsg(r===true?'Tata letak tersimpan sebagai file.':r,r!==true)};
$('layFile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
  try{const d=JSON.parse(await f.text());const L=Array.isArray(d)?d:d.layout;if(!Array.isArray(L)||!L.every(x=>x&&KIND[x.type]))throw new Error('bukan file tata letak');
    snap();st.layout=L;st.selEl=-1;renderElSel();insp();loadFonts(L).then(redraw);redraw();saveSoon();lmsg('Tata letak dibuka dari "'+f.name+'".')}catch(err){lmsg('File tidak bisa dibuka: '+(err.message||err),1)}};

/* geser di pratinjau */
let drag=null;
function toCert(e){const r=pv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*1123,y:(e.clientY-r.top)/r.height*794}}
function hit(pt){for(let i=boxes.length-1;i>=0;i--){const b=boxes[i];if(b&&pt.x>=b.x1-4&&pt.x<=b.x2+4&&pt.y>=b.y1-4&&pt.y<=b.y2+4)return i}return -1}
function syncXY(){const el=st.layout[st.selEl];if(!el)return;$('insp').querySelectorAll('[data-k=x],[data-k=y]').forEach(i=>i.value=Math.round(el[i.dataset.k]))}
pv.addEventListener('pointerdown',e=>{const pt=toCert(e);
  if(hdl&&st.layout[st.selEl]&&Math.hypot(pt.x-hdl.x,pt.y-hdl.y)<=hdl.r*1.8){snap();const el=st.layout[st.selEl];drag={mode:'rs',d0:Math.max(4,Math.hypot(pt.x-hdl.cx,pt.y-hdl.cy)),cx:hdl.cx,cy:hdl.cy,s0:{...el},moved:false};pv.setPointerCapture(e.pointerId);e.preventDefault();return}
  const i=hit(pt);if(i<0){if(st.selEl>=0)pick(-1);return}
  if(i!==st.selEl)pick(i);snap();const el=st.layout[i];drag={dx:pt.x-el.x,dy:pt.y-el.y,moved:false};pv.setPointerCapture(e.pointerId);e.preventDefault()});
pv.addEventListener('pointermove',e=>{const pt=toCert(e);
  if(!drag){pv.style.cursor=hdl&&Math.hypot(pt.x-hdl.x,pt.y-hdl.y)<=hdl.r*1.8?'nwse-resize':hit(pt)>=0?'move':'default';return}
  if(drag.mode==='rs'){const el=st.layout[st.selEl],f=Math.max(.1,Math.hypot(pt.x-drag.cx,pt.y-drag.cy)/drag.d0),o=drag.s0;
    if(el.type==='text'){el.s=Math.max(6,Math.min(200,Math.round(o.s*f)));if(+o.maxW)el.maxW=Math.round(o.maxW*f);if(+o.sp)el.sp=Math.round(o.sp*f*10)/10}
    else el.w=Math.max(10,Math.min(2000,Math.round(o.w*f)));drag.moved=true;redraw();return}
  const el=st.layout[st.selEl];let nx=pt.x-drag.dx,ny=pt.y-drag.dy;guide=Math.abs(nx-561)<6;if(guide)nx=561;
  el.x=Math.round(nx);el.y=Math.round(ny);drag.moved=true;syncXY();redraw()});
const endDrag=()=>{if(!drag)return;if(!drag.moved){hist.pop();$('btnLUndo').disabled=!hist.length}const rs=drag.mode==='rs'&&drag.moved;drag=null;guide=false;if(rs)insp();redraw();saveSoon()};
pv.addEventListener('pointerup',endDrag);pv.addEventListener('pointercancel',endDrag);
pv.addEventListener('keydown',e=>{const el=st.layout[st.selEl];const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!el||!d)return;e.preventDefault();
  if(!e.repeat)snap();const m=e.shiftKey?step*10:step;el.x+=d[0]*m;el.y+=d[1]*m;syncXY();redraw();saveSoon()});

/* ---------- perbesar pratinjau ---------- */
const STEPS=[1,1.25,1.5,2,2.5,3,4];let zoom=1;const zw=$('zw');
function layoutCanvas(){if(!zw.clientWidth)return;const pad=zw.clientWidth<600?16:28,W=zw.clientWidth-pad,H=zw.clientHeight-pad;const fit=Math.max(240,H>120?Math.min(W,H*1123/794):W);
  pv.style.width=Math.round(fit*zoom)+'px';const R=Math.round(Math.min(3400,Math.max(1123,fit*zoom*Math.min(2,window.devicePixelRatio||1))));
  if(Math.abs(pv.width-R)>8){pv.width=R;pv.height=Math.round(R*794/1123)}redraw()}
function setZoom(z){const cx=(zw.scrollLeft+zw.clientWidth/2)/zw.scrollWidth,cy=(zw.scrollTop+zw.clientHeight/2)/zw.scrollHeight;
  zoom=Math.min(4,Math.max(1,z));layoutCanvas();$('zFit').textContent=Math.round(zoom*100)+'%';$('zOut').disabled=zoom<=1;$('zIn').disabled=zoom>=4;
  zw.scrollLeft=cx*zw.scrollWidth-zw.clientWidth/2;zw.scrollTop=cy*zw.scrollHeight-zw.clientHeight/2}
$('zIn').onclick=()=>setZoom(STEPS.find(v=>v>zoom+.01)||4);
$('zOut').onclick=()=>setZoom([...STEPS].reverse().find(v=>v<zoom-.01)||1);
$('zFit').onclick=()=>setZoom(1);
zw.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();setZoom(zoom*(e.deltaY<0?1.1:1/1.1))},{passive:false});
function setFull(on){$('center').classList.toggle('full',on);$('zFull').textContent=on?'Tutup layar penuh':'Layar penuh';requestAnimationFrame(layoutCanvas)}
$('zFull').onclick=()=>setFull(!$('center').classList.contains('full'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('center').classList.contains('full'))setFull(false)});
new ResizeObserver(layoutCanvas).observe(zw);
st.ui=st.ui||{L:true,R:true};
function applyPanels(){const v=$('v-desain');v.classList.toggle('hideL',!st.ui.L);v.classList.toggle('hideR',!st.ui.R);$('tgL').setAttribute('aria-pressed',st.ui.L);$('tgR').setAttribute('aria-pressed',st.ui.R);requestAnimationFrame(layoutCanvas)}
$('tgL').onclick=()=>{st.ui.L=!st.ui.L;applyPanels();save()};$('tgR').onclick=()=>{st.ui.R=!st.ui.R;applyPanels();save()};
applyPanels();
let step=1;$('stepChip').onclick=()=>{step=step===1?5:step===5?10:1;$('stepChip').textContent='Geser per '+step+' px'};

/* ---------- menu & halaman ---------- */
const VIEWS={desain:'Desain Sertifikat',peserta:'Data Peserta',cetak:'Cetak Sertifikat'};
function show(v){if(!VIEWS[v])v='desain';document.querySelectorAll('.view').forEach(x=>x.hidden=x.id!=='v-'+v);
  document.querySelectorAll('[data-view]').forEach(b=>{const on=b.dataset.view===v;b.classList.toggle('on',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});
  $('crumb').textContent=VIEWS[v];if(location.hash.slice(1)!==v){try{history.replaceState(null,'','#'+v)}catch(e){}}
  if(v==='desain')requestAnimationFrame(layoutCanvas);if(v==='cetak'){renderPrint();preloadLib('jspdf')}if(v==='peserta')preloadLib('xlsx')}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));
window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
function renderWho(){const w=$('pvWho');w.innerHTML=st.rows.length?st.rows.map((r,i)=>`<option value="${i}"${i===st.sel?' selected':''}>${i+1}. ${esc(r.n||'(tanpa nama)')} — ${r.h}${r.k?' '+r.k:''}${r.kk?' · Kelas '+esc(r.kk):''}</option>`).join(''):'<option value="0">Belum ada peserta (contoh)</option>'}
$('pvWho').onchange=()=>{st.sel=+$('pvWho').value||0;renderList();redraw()};

/* ---------- PDF & cetak ---------- */
function msg(t,err){const m=$('msg');m.textContent=t;m.className=err?'err':''}
const uniq=(rows,k)=>[...new Set(rows.map(r=>r[k]).filter(Boolean))].sort((x,y)=>String(x).localeCompare(String(y),'id',{numeric:true}));
function evData(id){syncCur();const e=st.ev[id];return{rows:e.rows||[],layout:e.layout,cfg:{...DEF,...e.cfg}}}
function pfilter(id){const c=document.querySelector(`.pc[data-ev="${id}"]`);if(!c)return{f:'all'};const q=x=>c.querySelector(x);return{f:(q(`[name="flt-${id}"]:checked`)||{}).value||'all',d:q('.fD')?q('.fD').value:'',sd:q('.fS')?q('.fS').value:'',k:(q(`[name="fk-${id}"]:checked`)||{}).value||''}}
function selRows(rows,f,over={}){f={...f,...over};return rows.filter(r=>(f.f==='all'||(f.f==='juara'?r.h!=='Peserta':r.h==='Peserta'))&&(!f.d||r.d===f.d)&&(!f.sd||r.sd===f.sd)&&(!f.k||r.k===f.k))}
let dlOK=true;
function renderPrint(){const box=$('printCards');if(!box||!st.ev)return;syncCur();
  const keep={};document.querySelectorAll('.pc').forEach(c=>{keep[c.dataset.ev]=pfilter(c.dataset.ev)});
  box.innerHTML=Object.entries(st.ev).map(([id,e])=>{const rows=e.rows||[],cfg={...DEF,...e.cfg},isD=cfg.mode==='desa',j=rows.filter(r=>r.h!=='Peserta').length,f=keep[id]||{f:'all'},sh=short(cfg.ev);
    const sel=(cls,lbl,vals,v,all)=>vals.length?`<div><label>${lbl}<select class="${cls}"><option value="">${all}</option>${vals.map(x=>`<option${x===v?' selected':''}>${esc(x)}</option>`).join('')}</select></label></div>`:'';
    const sds=isD?[]:uniq(rows,'sd');
    return `<div class="card pc" data-ev="${id}"><div class="pchead"><h2>${esc(cfg.ev)}</h2><span class="tag">${isD?'Per desa · putra/putri':'Perorangan'}</span></div>
<div class="kpis"><div class="kpi"><b>${rows.length}</b><span>sertifikat</span></div><div class="kpi"><b>${j}</b><span>juara</span></div><div class="kpi"><b>${rows.length-j}</b><span>penghargaan</span></div></div>
<div class="seg" role="radiogroup" aria-label="Yang dicetak, ${esc(sh)}">${[['all','Semua'],['juara','Juara saja'],['peserta','Penghargaan saja']].map(([v,l])=>`<label><input type="radio" name="flt-${id}" value="${v}"${(f.f||'all')===v?' checked':''}> ${l}</label>`).join('')}</div>
${isD?`<p class="lbl2">Putra / putri</p><div class="seg" role="radiogroup" aria-label="Putra atau putri, ${esc(sh)}">${[['Putra','Putra'],['Putri','Putri'],['','Putra &amp; Putri']].map(([v,l])=>`<label><input type="radio" name="fk-${id}" value="${v}"${(f.k||'')===v?' checked':''}> ${l} <span class="cnt">(${v?rows.filter(r=>r.k===v).length:rows.length})</span></label>`).join('')}</div>`:''}<div class="grid3" style="margin-top:4px">${isD?'':sel('fD','Desa',uniq(rows,'d'),f.d,'Semua desa')+sel('fS','SD kelas',sds,f.sd,'Semua SD kelas')}</div>
<p class="note pcount" style="font-weight:600;color:var(--acc2)"></p>
<div class="row-btns" style="margin-top:8px"><button type="button" data-pdf="${id}">Unduh PDF ${esc(sh)}</button>${window.claude?'':`<button type="button" class="ghost" data-prn="${id}">Cetak langsung</button>`}</div>
${sds.length?`<div class="persd"><p class="lbl">Unduh PDF terpisah per SD kelas</p><div class="row-btns" style="margin-top:6px">${sds.map(x=>`<button type="button" class="ghost" data-pdf="${id}" data-sd="${esc(x)}">SD Kelas ${esc(x)} <span class="cnt"></span></button>`).join('')}<button type="button" class="ghost" data-allsd="${id}">Semua SD kelas (${sds.length} file)</button></div></div>`:''}
</div>`}).join('');
  document.querySelectorAll('.pc').forEach(c=>countCard(c.dataset.ev))}
function countCard(id){const c=document.querySelector(`.pc[data-ev="${id}"]`);if(!c)return;const rows=st.ev[id].rows||[],f=pfilter(id);
  c.querySelector('.pcount').textContent=selRows(rows,f).length+' sertifikat sesuai pilihan di atas';
  c.querySelectorAll('[data-sd]').forEach(b=>{b.querySelector('.cnt').textContent='('+selRows(rows,f,{sd:b.dataset.sd}).length+')'});
  if(!dlOK)c.querySelectorAll('[data-pdf],[data-allsd]').forEach(b=>b.disabled=true)}
$('printCards').addEventListener('change',e=>{const c=e.target.closest('.pc');if(c)countCard(c.dataset.ev)});
function suffix(f,over){const g={...f,...over};return[g.sd?'SD Kelas '+g.sd:'',g.d||'',g.k||'',g.f==='juara'?'Juara':g.f==='peserta'?'Penghargaan':''].filter(Boolean).join(' - ')}
async function pages(list,each,layout,cfg){await loadFonts(layout);const cv=document.createElement('canvas');cv.width=2246;cv.height=1588;const c=cv.getContext('2d');
  for(let i=0;i<list.length;i++){drawCert(c,2,list[i],cfg,layout);await each(cv.toDataURL('image/jpeg',.88),i);msg(`Menyiapkan sertifikat ${i+1} dari ${list.length}…`);await new Promise(r=>setTimeout(r,0))}}
async function doPdf(ed,list,suf,b){if(!list.length){msg('Tidak ada sertifikat untuk pilihan ini.',1);return false}
  try{await loadLib('jspdf')}catch(e){msg(e.message,1);return false}
  b.disabled=true;
  try{await ready;const doc=new window.jspdf.jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
    await pages(list,(u,i)=>{if(i)doc.addPage('a4','landscape');doc.addImage(u,'JPEG',0,0,297,210,undefined,'FAST')},ed.layout,ed.cfg);
    const name=('Sertifikat '+short(ed.cfg.ev)+(suf?' - '+suf:'')+' ('+list.length+' nama).pdf').replace(/[\\/:*?"<>|]/g,'');
    const r=await saveFile(name,doc.output('blob'));msg(r===true?'PDF tersimpan: '+name:r,r!==true);return r}
  catch(err){msg('Gagal membuat PDF: '+(err.message||err),1);return false}finally{b.disabled=false}}
$('printCards').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.pdf){const id=b.dataset.pdf,ed=evData(id),f=pfilter(id),over=b.dataset.sd!=null?{sd:b.dataset.sd}:{};await doPdf(ed,selRows(ed.rows,f,over),suffix(f,over),b)}
  else if(b.dataset.allsd){const id=b.dataset.allsd,ed=evData(id),f=pfilter(id);let n=0;for(const x of uniq(ed.rows,'sd')){const list=selRows(ed.rows,f,{sd:x});if(!list.length)continue;const r=await doPdf(ed,list,suffix(f,{sd:x}),b);if(r!==true)return;n++}if(n)msg(n+' file PDF per SD kelas tersimpan.')}
  else if(b.dataset.prn){const id=b.dataset.prn,ed=evData(id),list=selRows(ed.rows,pfilter(id));if(!list.length){msg('Tidak ada sertifikat untuk pilihan ini.',1);return}
    b.disabled=true;const pa=$('printArea');pa.innerHTML='';await ready;await pages(list,u=>{const im=new Image();im.src=u;im.alt='';pa.appendChild(im)},ed.layout,ed.cfg);
    await Promise.all([...pa.images].map(i=>i.decode().catch(()=>{})));msg('Membuka jendela cetak…');b.disabled=false;window.print()}});
let dl=null;
async function saveFile(name,blob){
  if(dl){try{await dl.save({filename:name,data:blob});return true}catch(e){return e&&e.code==='declined'?'Penyimpanan dibatalkan.':'File tidak bisa disimpan di tampilan ini.'}}
  if(window.claude)return 'Unduhan tidak tersedia di tampilan ini.';
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);return true;
}

/* ---------- Excel ---------- */
function xmsg(t,err){const m=$('xmsg');m.textContent=t;m.style.color=err?'var(--warn)':'var(--g)'}
const XNAME='Template Peserta Sertifikat ASAD.xlsx',ROWS=500;
async function buildXlsx(rows){
  const wb=new ExcelJS.Workbook();wb.creator='Cetak Sertifikat ASAD';
  const ws=wb.addWorksheet('Peserta',{views:[{state:'frozen',ySplit:1}]});
  const isD=st.cfg.mode==='desa',NC=isD?4:6;
  ws.columns=isD?[{header:'No',key:'no',width:6},{header:'Nama Desa',key:'n',width:34},{header:'Hasil',key:'h',width:19},{header:'Kategori',key:'k',width:12}]:[{header:'No',key:'no',width:6},{header:'Nama Peserta',key:'n',width:36},{header:'Desa',key:'d',width:22},{header:'SD Kelas',key:'sd',width:11},{header:'Kategori Kelas',key:'kk',width:16},{header:'Hasil',key:'h',width:19}];
  const hd=ws.getRow(1);hd.height=24;
  hd.eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFBF1'},name:'Arial',size:11};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF1F4D2E'}};c.alignment={vertical:'middle',horizontal:'center'};c.border={bottom:{style:'medium',color:{argb:'FFB8913A'}}}});
  rows.forEach((r,i)=>ws.addRow({no:i+1,n:r.n,d:r.d||'',sd:r.sd||'',kk:r.kk||'',h:r.h,k:r.k}));
  for(let i=2;i<=ROWS+1;i++){
    const row=ws.getRow(i);
    if(i>rows.length+1)row.getCell(1).value={formula:`IF(B${i}="","",ROW()-1)`};
    row.getCell(1).alignment={horizontal:'center'};
    const vH={type:'list',allowBlank:true,formulae:['"'+HASIL.join(',')+'"'],showErrorMessage:true,errorTitle:'Hasil tidak dikenal',error:'Pilih dari daftar: Juara 1–3, Juara Harapan 1–3, atau Peserta.'};
    if(isD){row.getCell(3).dataValidation=vH;row.getCell(4).dataValidation={type:'list',allowBlank:true,formulae:['"Putra,Putri"'],showErrorMessage:true,errorTitle:'Kategori tidak dikenal',error:'Pilih Putra atau Putri.'}}
    else{row.getCell(4).numFmt='@';row.getCell(5).numFmt='@';row.getCell(4).dataValidation={type:'list',allowBlank:true,formulae:['"1-2,3-4,5-6"'],showErrorMessage:false};row.getCell(6).dataValidation=vH}
    if(i%2)for(let c=1;c<=NC;c++)row.getCell(c).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF6EFDC'}};
  }
  const p=wb.addWorksheet('Petunjuk');p.getColumn(1).width=100;
  (isD?['PETUNJUK PENGISIAN — '+st.cfg.ev,'','1. Isi satu desa per baris di kolom "Nama Desa" (misal Permai Raya). Kata "Desa" ditambahkan otomatis di sertifikat.','2. Pilih Hasil: Juara 1–3, Juara Harapan 1–3, atau Peserta (sertifikat penghargaan).','3. Pilih Kategori: Putra atau Putri. Desa yang ikut di putra dan putri ditulis dua baris.','4. Kolom No terisi otomatis. Jangan mengubah baris judul (baris 1).','5. Simpan file, lalu unggah di aplikasi lewat tombol "Unggah file Excel".']
  :['PETUNJUK PENGISIAN — '+st.cfg.ev,'','1. Isi satu peserta per baris: Nama Peserta, Desa, SD Kelas (misal 1-2, 3-4, 5-6), dan Kategori Kelas (misal Under, A, B, Bebas).','2. Pilih Hasil: Juara 1–3, Juara Harapan 1–3, atau Peserta. Yang tidak juara pilih "Peserta" atau biarkan kosong — mereka mendapat Sertifikat Penghargaan.','3. Desa dan SD Kelas boleh hanya ditulis di baris pertama kelompoknya (atau sel digabung/merge) — baris di bawahnya otomatis ikut.','4. Kolom No terisi otomatis. Jangan mengubah baris judul (baris 1).','5. Simpan file, lalu unggah di aplikasi lewat tombol "Unggah file Excel". File rekap lain juga bisa diunggah selama ada kolom "Nama".'])
    .forEach((t,i)=>{const c=p.getCell(i+1,1);c.value=t;if(!i)c.font={bold:true,size:14,color:{argb:'FF1F4D2E'}}});
  return new Blob([await wb.xlsx.writeBuffer()]);
}
function cellText(v){if(v==null)return'';if(typeof v==='object'){if(v.richText)return v.richText.map(x=>x.text).join('');if('result' in v)return cellText(v.result);if(v.text)return String(v.text);if(v instanceof Date)return v.toLocaleDateString('id-ID')}return String(v).trim()}
let pending=null;
$('btnTpl').onclick=async()=>{try{await loadLib('exceljs')}catch(e){xmsg(e.message,1);return}
  try{const r=await saveFile('Template '+(st.cfg.mode==='desa'?'Desa ':'Peserta ')+st.cfg.ev.replace(/[\\/:*?"<>|]/g,'')+'.xlsx',await buildXlsx([]));xmsg(r===true?'Template tersimpan. Isi lalu unggah kembali di sini.':r,r!==true)}catch(e){xmsg('Gagal membuat template: '+(e.message||e),1)}};
$('btnExp').onclick=async()=>{try{await loadLib('exceljs')}catch(e){xmsg(e.message,1);return}
  if(!st.rows.length){xmsg('Daftar masih kosong, belum ada yang bisa diekspor.',1);return}
  try{const r=await saveFile((st.cfg.mode==='desa'?'Daftar Desa ':'Daftar Peserta ')+st.cfg.ev.replace(/[\\/:*?"<>|]/g,'')+'.xlsx',await buildXlsx(st.rows));xmsg(r===true?st.rows.length+' peserta diekspor ke Excel.':r,r!==true)}catch(e){xmsg('Gagal mengekspor: '+(e.message||e),1)}};
let pendingFile=null,switchTo=null;
function impMode(sw){$('impReplace').hidden=sw;$('impAppend').hidden=sw||st.sample||!st.rows.length;$('impSwitch').hidden=!sw;$('impHere').hidden=!sw}
async function importFile(f,force){
  try{await loadLib('xlsx')}catch(e){xmsg(e.message,1);return}
  try{
    const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
    const sn=wb.SheetNames.find(n=>/peserta|desa/i.test(n))||wb.SheetNames[0];if(!sn)throw new Error('lembar kerja tidak ditemukan');
    const all=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:false,defval:'',blankrows:false});
    const roles=all.slice(0,15).map(r=>new Set(r.map(colRole))).find(x=>x.has('n')||x.has('d'))||new Set();
    const isD=st.cfg.mode==='desa',looksKJ=roles.has('sd')||roles.has('kk')||(roles.has('n')&&roles.has('d')),looksPG=!roles.has('n')&&roles.has('d')&&!roles.has('sd')&&!roles.has('kk');
    if(!force&&((isD&&looksKJ)||(!isD&&looksPG))){const tid=Object.keys(st.ev).find(id=>id!==st.cur&&((st.ev[id].cfg||{}).mode==='desa')===!isD);
      if(tid){pendingFile=f;switchTo=tid;const tn=short(st.ev[tid].cfg.ev);
        $('impTxt').textContent=`File "${f.name}" sepertinya data ${tn} (${looksKJ?'ada kolom nama peserta / SD kelas / kategori kelas':'berisi nama desa dan putra/putri'}), padahal yang sedang dibuka ${short(st.cfg.ev)}.`;
        $('impSwitch').textContent='Pindah ke '+tn+' lalu impor';$('impHere').textContent='Tetap impor ke '+short(st.cfg.ev);impMode(true);$('impBox').hidden=false;xmsg('');return}}
    let hr=-1,map={};
    for(let r=0;r<Math.min(15,all.length)&&hr<0;r++){const m=headerMap(all[r]);if(m){hr=r;map=m}}
    const fill=hr>=0;if(!fill)map={n:0};
    const out=rowsFrom(all.slice(hr+1),map,fill);
    if(!out.length){xmsg(isD?'Tidak ada nama desa di file ini. Pastikan ada kolom "Nama Desa".':'Tidak ada nama di file ini. Pastikan ada kolom "Nama Peserta".',1);return}
    pending=out;const j=out.filter(r=>r.h!=='Peserta').length,nd=isD?0:new Set(out.map(r=>r.d).filter(Boolean)).size;
    $('impTxt').textContent=`Ditemukan ${out.length} ${isD?'desa':'peserta'} untuk ${short(st.cfg.ev)} di "${f.name}"${nd?` dari ${nd} desa`:''} (${j} juara, ${out.length-j} penghargaan). Mau diapakan?`;impMode(false);$('impBox').hidden=false;xmsg('');
  }catch(err){xmsg('File tidak bisa dibaca: '+(err.message||err)+'. Gunakan file .xlsx dari template.',1)}
}
$('xlsFile').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)importFile(f,false)};
$('impSwitch').onclick=()=>{if(!pendingFile||!switchTo)return;switchEv(switchTo);importFile(pendingFile,true)};
$('impHere').onclick=()=>{if(pendingFile)importFile(pendingFile,true)};
function applyImport(replace){if(!pending)return;const n=pending.length;if(replace||st.sample)st.rows=[];const start=st.rows.length;st.rows.push(...pending);pending=null;st.sel=start;$('impBox').hidden=true;renderList();touch();xmsg(n+(st.cfg.mode==='desa'?' desa':' peserta')+' dari Excel dimasukkan ke daftar '+short(st.cfg.ev)+'.')}
$('impReplace').onclick=()=>applyImport(true);$('impAppend').onclick=()=>applyImport(false);$('impCancel').onclick=()=>{pending=null;pendingFile=null;$('impBox').hidden=true;xmsg('Impor dibatalkan.')};
const ready=Promise.all([loadFonts(st.layout),...['logo','tiger'].map(k=>img(k).decode().catch(()=>{}))]);
/* ---------- sinkron ke server (local-first) ---------- */
function slimRow(r) { return { n: r.n || '', h: r.h || 'Peserta', k: r.k || '', d: r.d || '', sd: r.sd || '', kk: r.kk || '' }; }
function evPayload(id, e, i) { const c = e.cfg || {}; return { id, nama: c.ev || '', mode: c.mode === 'desa' ? 'desa' : 'orang', awalan: c.prefix || '', tempat: c.tempat || '', urutan: i + 1 }; }
function toast(t, err) { const el = $('toast'); el.textContent = t; el.className = 'toast show' + (err ? ' err' : ''); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), err ? 7000 : 3500); }

Sync = {
  timer: 0, busy: false, again: false, state: 'ok',
  schedule(ms) { clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), ms == null ? 1200 : ms); if (this.state !== 'saving' && Auth.token) this.show('pending'); },
  show(s, m) {
    this.state = s; const c = $('saveChip'); if (!c) return;
    const T = { ok: 'Tersimpan', pending: 'Menyimpan…', saving: 'Menyimpan…', offline: 'Offline · tersimpan di perangkat', error: 'Gagal menyimpan', login: 'Belum masuk' };
    c.textContent = T[s] || s; c.classList.toggle('warn', s === 'error' || s === 'offline' || s === 'login'); c.title = m || '';
  },
  sigs() {
    syncCur(); const o = {};
    Object.keys(st.ev).forEach((id, i) => { const e = st.ev[id]; o[id] = { c: hashStr(JSON.stringify(evPayload(id, e, i))), r: hashStr(JSON.stringify((e.rows || []).map(slimRow))), l: hashStr(JSON.stringify(e.layout || null)) }; });
    return o;
  },
  dirty() {
    const cur = this.sigs(), b = st.synced || {}, ids = new Set();
    for (const id in cur) { const x = b[id]; if (!x || x.c !== cur[id].c || x.r !== cur[id].r || x.l !== cur[id].l) ids.add(id); }
    for (const id in b) if (!cur[id]) ids.add(id);
    return ids;
  },
  async run() {
    if (!Auth.token) { this.show('login'); return; }
    if (this.busy) { this.again = true; return; }
    if (navigator.onLine === false) { this.show('offline'); return; }
    this.busy = true;
    try {
      await uploadPendingImages();
      const cur = this.sigs(), b = st.synced || {}, p = { events: [], deleted: [], rows: {}, layouts: {} };
      let any = false;
      Object.keys(st.ev).forEach((id, i) => {
        const e = st.ev[id], x = b[id] || {};
        if (x.c !== cur[id].c) { p.events.push(evPayload(id, e, i)); any = true; }
        if (x.r !== cur[id].r) { p.rows[id] = { rows: (e.rows || []).map(slimRow), baseRev: x.r ? (e.rev || 0) : null }; any = true; }
        if (x.l !== cur[id].l) { p.layouts[id] = e.layout || null; any = true; }
      });
      for (const id in b) if (!cur[id]) { p.deleted.push(id); any = true; }
      if (!any) { this.show('ok'); return; }
      this.show('saving');
      const res = await api('sync', p);
      if (!res.success) {
        if (res.code === 'AUTH') { this.show('login'); return; }
        this.show(res.network ? 'offline' : 'error', res.message);
        clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), res.network ? 8000 : 15000);
        return;
      }
      const d = res.data, syn = Object.assign({}, st.synced || {});
      Object.keys(cur).forEach(id => {
        if (!st.ev[id]) return;
        const s = Object.assign({}, syn[id] || {});
        if (p.events.some(e => e.id === id)) s.c = cur[id].c;
        if (p.rows[id]) s.r = cur[id].r;
        if (id in p.layouts) s.l = cur[id].l;
        syn[id] = s;
        if (d.revs && d.revs[id] != null) st.ev[id].rev = d.revs[id];
      });
      p.deleted.forEach(id => delete syn[id]);
      const names = [];
      (d.conflicts || []).forEach(cf => {
        const e = st.ev[cf.ev]; if (!e) return;
        e.rows = cf.rows.map(slimRow); e.rev = cf.rev;
        syn[cf.ev] = Object.assign({}, syn[cf.ev], { r: hashStr(JSON.stringify(e.rows)) });
        if (cf.ev === st.cur) { st.rows = e.rows; st.sel = Math.min(st.sel, Math.max(0, st.rows.length - 1)); }
        names.push(short(e.cfg.ev));
      });
      st.synced = syn; saveLocal();
      if (names.length) { renderList(); redraw(); toast('Data ' + names.join(', ') + ' baru saja diubah dari perangkat lain. Daftar dimuat ulang dari server — periksa lalu ulangi perubahan Anda.', 1); }
      this.show('ok');
    } catch (err) {
      this.show('error', err.message); clearTimeout(this.timer); this.timer = setTimeout(() => this.run(), 15000);
    } finally {
      this.busy = false;
      if (this.again) { this.again = false; this.schedule(300); }
    }
  }
};

/** Gambar baru (data:…) diunggah dulu ke server, lalu tata letak cukup menyimpan rujukan asset:ID. */
async function uploadPendingImages() {
  syncCur();
  const todo = new Map();
  Object.values(st.ev).forEach(e => (e.layout || []).forEach(el => { if (el.type === 'image' && /^data:image\//.test(el.src || '')) { if (!todo.has(el.src)) todo.set(el.src, []); todo.get(el.src).push(el); } }));
  for (const [url, els] of todo) {
    const m = url.match(/^data:(image\/[a-z+]+);base64,(.*)$/);
    if (!m) continue;
    const res = await api('saveAsset', { nama: els[0].label || 'gambar', mime: m[1], data: m[2] });
    if (!res.success) throw new Error(res.message || 'Gagal mengunggah gambar.');
    const id = res.data.id;
    assetStore[id] = url; lsSet('as:' + id, url);
    els.forEach(el => { el.src = 'asset:' + id; });
  }
  if (todo.size) saveLocal();
}

let _assetT = 0; const _assetAsked = new Set();
window.onAssetMissing = id => { if (_assetAsked.has(id)) return; _assetAsked.add(id); clearTimeout(_assetT); _assetT = setTimeout(fetchMissingAssets, 50); };
window.onImgLoad = () => redraw();
async function fetchMissingAssets() {
  const need = new Set();
  Object.values(st.ev || {}).forEach(e => (e.layout || []).forEach(el => { if (el.type === 'image' && /^asset:/.test(el.src || '')) { const id = el.src.slice(6); if (!assetStore[id]) need.add(id); } }));
  const ask = [];
  need.forEach(id => { const loc = lsGet('as:' + id, null); if (loc) assetStore[id] = loc; else ask.push(id); });
  for (let i = 0; i < ask.length; i += 20) {
    const res = await api('assets', { ids: ask.slice(i, i + 20) });
    if (res.success) Object.keys(res.data).forEach(id => { if (res.data[id]) { assetStore[id] = res.data[id]; lsSet('as:' + id, res.data[id]); } });
  }
  redraw();
}

/** Terapkan data dari server; perubahan lokal yang belum terkirim tetap dipertahankan. */
function applyServer(b) {
  syncCur();
  const pend = st.ev ? Sync.dirty() : new Set(), prev = st.synced || {}, ev = {}, syn = {};
  (b.events || []).forEach(e => {
    const cfg = Object.assign({}, DEF, { ev: e.nama, mode: e.mode, prefix: e.awalan, tempat: e.tempat });
    const lay = Array.isArray(b.layouts && b.layouts[e.id]) ? b.layouts[e.id] : defaultLayout(cfg, e.mode);
    const rows = ((b.rows && b.rows[e.id]) || []).map(slimRow);
    const loc = st.ev && st.ev[e.id];
    if (loc && pend.has(e.id) && prev[e.id]) { ev[e.id] = loc; syn[e.id] = Object.assign({}, prev[e.id]); }
    else { ev[e.id] = { rows, layout: lay, cfg, sample: false, sel: loc ? Math.min(loc.sel || 0, Math.max(0, rows.length - 1)) : 0, rev: e.rev }; syn[e.id] = { c: null, r: hashStr(JSON.stringify(rows)), l: hashStr(JSON.stringify(lay)) }; }
  });
  if (st.ev) for (const id in st.ev) if (!ev[id] && !prev[id] && id !== 'kejurkab' && id !== 'pasanggiri') ev[id] = st.ev[id];   // dibuat saat offline
  Object.keys(ev).forEach((id, i) => { if (syn[id] && syn[id].c === null) syn[id].c = hashStr(JSON.stringify(evPayload(id, ev[id], i))); });
  st.ev = ev; st.synced = syn;
  if (!st.ev[st.cur]) st.cur = Object.keys(st.ev)[0];
  loadCur(); saveLocal(); renderAll(); fetchMissingAssets();
  if (Sync.dirty().size) Sync.schedule(400); else Sync.show('ok');
}
function renderAll() { loadCfg(); renderList(); renderElSel(); insp(); renderPrint(); loadFonts(st.layout).then(redraw); redraw(); }

let lastFetch = 0;
async function refresh(fresh) {
  if (!Auth.token) return false;
  const res = await api('bootstrap', fresh ? { _fresh: true } : {});
  if (res.success) { lastFetch = Date.now(); applyServer(res.data); return true; }
  if (res.code !== 'AUTH') Sync.show(res.network ? 'offline' : 'error', res.message);
  return false;
}

/* ---------- masuk / keluar ---------- */
function showLogin(m) { $('login').hidden = false; $('loginMsg').textContent = m || ''; Sync.show('login'); warmUp('pub'); setTimeout(() => $('pin').focus(), 60); }
Auth.onExpired = () => { Auth.set(''); showLogin('Sesi berakhir. Masukkan PIN lagi.'); };
$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const b = $('btnLogin'); b.disabled = true; b.textContent = 'Memeriksa…'; $('loginMsg').textContent = '';
  const res = await api('login', { pin: $('pin').value.trim() });
  b.disabled = false; b.textContent = 'Masuk';
  if (!res.success) { $('loginMsg').textContent = res.message || 'Gagal masuk.'; $('pin').select(); return; }
  Auth.set(res.data.token); $('pin').value = ''; $('login').hidden = true; lastFetch = Date.now();
  applyServer(res.data.boot); toast('Berhasil masuk. Data dimuat dari server.');
});
let _lo = 0;
$('btnLogout').onclick = async () => {
  const b = $('btnLogout');
  if (!_lo) { b.textContent = Sync.dirty().size ? 'Ada yang belum tersimpan! Klik lagi' : 'Yakin keluar?'; _lo = setTimeout(() => { _lo = 0; b.textContent = 'Keluar'; }, 3500); return; }
  clearTimeout(_lo); _lo = 0; b.textContent = 'Keluar';
  api('logout', {}); Auth.set('');
  try { Object.keys(localStorage).filter(k => k.indexOf(LSK) === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  st.ev = null; st.synced = null; location.hash = '#desain'; location.reload();
};
$('btnRefresh').onclick = async () => {
  const b = $('btnRefresh'); b.disabled = true;
  if (Sync.dirty().size) await Sync.run();
  const okR = await refresh(true); b.disabled = false;
  toast(okR ? 'Data terbaru dari server sudah dimuat.' : 'Belum bisa memuat dari server. Coba lagi.', !okR);
};
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Auth.token && Date.now() - lastFetch > 60000 && !Sync.busy && !Sync.dirty().size) refresh(false); });
addEventListener('online', () => Sync.schedule(200));
addEventListener('offline', () => Sync.show('offline'));

/* ---------- mulai ---------- */
loadCfg();renderList();renderElSel();insp();show(location.hash.slice(1));ready.then(redraw);fetchMissingAssets();
if(!gasReady())showLogin('Alamat server (GAS_URL) di js/config.js belum diisi.');
else if(!Auth.token)showLogin();
else{Sync.show(Sync.dirty().size?'pending':'ok');refresh(false)}
}
