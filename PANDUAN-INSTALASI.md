# 📋 Panduan Instalasi — Cetak Sertifikat ASAD (versi online)

Aplikasi panitia **Persinas ASAD Kutai Timur** untuk mengelola peserta KEJURKAB & Pasanggiri dan mencetak sertifikat massal.
Data disimpan di **Google Sheets** milik Anda, tampilan dibuka lewat **GitHub Pages** — bisa dipakai dari laptop dan HP mana pun dengan data yang sama.

```
Browser (laptop/HP)  ──fetch──►  Google Apps Script /exec  ──►  Google Sheets (database)
   GitHub Pages                     Kode.gs (REST API)              + folder Drive
```

---

## 📦 Isi paket

| Berkas | Untuk apa |
|---|---|
| `Kode.gs` (terpisah) | Ditempel ke editor Google Apps Script (backend) |
| `cetak-sertifikat-asad.zip` | Frontend untuk GitHub Pages — **isi ZIP inilah yang di-upload ke GitHub** |
| `PANDUAN-INSTALASI.md` | Panduan ini (salinannya juga ada di dalam ZIP) |

Isi ZIP setelah diekstrak:

```
cetak-sertifikat-asad\        ← folder INI yang nanti di-"git init"
├── index.html                ← harus terlihat langsung di sini
├── PANDUAN-INSTALASI.md
├── README.md
├── css\style.css
├── js\config.js              ← satu-satunya file yang perlu diedit (GAS_URL)
├── js\api.js
├── js\sertifikat.js
├── js\app.js
└── assets\logo.png, harimau.png
```

---

## BAGIAN A — Backend (Google Apps Script)

1. Buka **https://script.google.com** → **Proyek baru**. Ganti nama proyek, misalnya `Cetak Sertifikat ASAD`.
2. Hapus isi `Code.gs`, lalu **tempel seluruh isi `Kode.gs`** → klik 💾 **Simpan**.
3. **Jalankan setup (sekali saja):**
   - Di dropdown fungsi (sebelah tombol ▶ Run) pilih **`setupAppEnvironment`** → klik **▶ Run**.
   - Muncul *Authorization required* → **Review permissions** → pilih akun → **Advanced** → **Go to … (unsafe)** → **Allow**. (Ini wajar untuk skrip buatan sendiri.)
   - Buka **Execution log**. Harus terlihat:
     ```
     ✅ Setup selesai!
        🔑 PIN PANITIA : 482915   ← catat & bagikan hanya ke panitia
        Spreadsheet    : https://docs.google.com/spreadsheets/d/...
     ```
   - **Catat PIN-nya.** Di Google Drive kini ada folder **📁 Cetak Sertifikat ASAD** berisi spreadsheet **🗃️ Database** (sheet: AppConfig, Kejuaraan, Peserta, TataLetak, Gambar, Log).
   - Kalau tidak sengaja dijalankan lagi: aman — data **tidak** ditimpa, hanya dicek.
4. **Deploy:** tombol biru **Deploy → New deployment** → ikon ⚙️ → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Klik **Deploy** → **salin URL** yang berakhiran **`/exec`**.
5. **Uji cepat:** buka URL tadi + `?w=pub` di browser, contoh `https://script.google.com/macros/s/AKfy…/exec?w=pub`.
   Harus muncul teks seperti `{"success":true,"data":{"warm":"ok"},"ms":…}`.

> 🔒 "Anyone" artinya alamat server bisa dipanggil siapa saja, **tetapi semua data dikunci PIN** — tanpa PIN, server hanya menjawab "Sesi berakhir".

---

## BAGIAN B — Frontend ke GitHub Pages

### B1. Isi alamat server
Ekstrak ZIP, buka `js\config.js` dengan Notepad, ganti baris ini dengan URL `/exec` dari Bagian A langkah 4:

```js
GAS_URL: 'https://script.google.com/macros/s/AKfy....../exec',
```
Simpan.

### B2. Pasang Git (sekali seumur komputer)
- Windows: unduh **https://git-scm.com/download/win**, install dengan pilihan bawaan. Buka **PowerShell**.
- Cek: `git --version` → muncul nomor versi.
- Isi identitas (bebas, hanya label):
  ```bash
  git config --global user.name "Nama Anda"
  git config --global user.email "email-akun-github@contoh.com"
  ```

### B3. Buat repository di GitHub
Masuk **https://github.com** → tombol **+** → **New repository** → nama misalnya `cetak-sertifikat-asad` → pilih **Public** → **JANGAN** centang README/.gitignore/license → **Create repository**.

### B4. Masuk ke folder yang BENAR (paling sering salah!)
Folder kerjanya adalah folder hasil ekstrak ZIP **yang langsung berisi `index.html`**:

```powershell
cd "C:\Users\NAMA\Downloads\cetak-sertifikat-asad"
dir
```
Di daftar `dir` **wajib** terlihat `index.html`, folder `css`, `js`, `assets`. Kalau yang terlihat justru satu folder lagi, masuk dulu ke folder itu. **Jangan lanjut sebelum `index.html` terlihat.**

> 💡 Cara cepat: buka folder di File Explorer, klik address bar, ketik `powershell`, Enter.

### B5. Kirim ke GitHub (satu per satu)
```bash
git init
git add .
git commit -m "Upload pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/cetak-sertifikat-asad.git
git push -u origin main
```
- `git add .` → ada **titik** di akhir.
- Saat diminta **Password**, yang dimasukkan adalah **Personal Access Token**, bukan password GitHub. Saat ditempel, layar **memang terlihat kosong** — itu normal, tekan Enter.
- Membuat token: **https://github.com/settings/tokens** → *Generate new token (classic)* → centang **repo** → *Generate* → salin `ghp_…` (hanya tampil sekali).
- Berhasil bila muncul `Writing objects: 100%` dan `* [new branch] main -> main`.

> ⚠️ Jangan memakai tombol "Upload files" di web GitHub — struktur folder `css/` `js/` `assets/` akan rusak.

### B6. Aktifkan GitHub Pages
Repository → **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: **main** / **(root)** → **Save** → centang **Enforce HTTPS**.
Tunggu 1–2 menit, alamat aplikasi muncul: **`https://USERNAME.github.io/cetak-sertifikat-asad/`**

---

## BAGIAN C — Pemakaian pertama

1. Buka alamat GitHub Pages → masukkan **PIN panitia** → Masuk.
2. Kejuaraan **KEJURKAB** dan **PASANGGIRI** sudah tersedia (masih kosong).
3. **Memindahkan data dari aplikasi lama (versi di Claude):**
   - Di aplikasi lama: halaman **Peserta** → **Ekspor daftar … ke Excel** (lakukan untuk KEJURKAB dan Pasanggiri).
   - Di aplikasi lama: halaman **Desain** → panel kanan **Simpan, buka, atau atur ulang tata letak** → **Simpan tata letak (file)** (untuk tiap kejuaraan).
   - Di aplikasi online: **Peserta** → pilih tab kejuaraan → **Unggah file Excel** → **Ganti daftar**. Lalu **Desain** → **Buka tata letak** → pilih file `.json` tadi.
   - Atau langsung unggah file **Rekap Atlit Perdesa** ke KEJURKAB.
4. Semua perubahan **tersimpan otomatis**. Lihat label di bilah atas:
   - **Menyimpan…** → sedang dikirim ke server
   - **Tersimpan** → aman di Google Sheets
   - **Offline · tersimpan di perangkat** → sinyal hilang; data disimpan di HP/laptop dan dikirim otomatis begitu online lagi
5. Bila dua orang mengubah daftar yang sama bersamaan, perubahan yang **lebih dulu tersimpan** dipertahankan; perangkat yang terlambat diberi pemberitahuan dan daftarnya dimuat ulang — **tidak ada data yang tertimpa diam-diam**.
6. Tombol **Segarkan** = ambil data terbaru dari server. **Keluar** = menghapus data dari perangkat itu (pakai di komputer umum).

---

## ⚡ Kenapa aplikasi ini cepat (sudah diuji)

| Momen | Hasil |
|---|---|
| Masuk dengan PIN | **1 panggilan** server (PIN + seluruh data sekaligus) |
| Membuka ulang aplikasi | Tampil **seketika** dari data di perangkat, lalu **1 panggilan** untuk menyegarkan |
| Buka ulang berikutnya | Dilayani dari **cache server** — 0 kali membaca Sheets |
| Mengetik di tabel / menggeser elemen | Perubahan **digabung** → 1 kali simpan, tidak tiap ketikan |
| Sinyal putus saat menyimpan | Dikirim ulang otomatis **tanpa data ganda** (nomor permintaan unik) |
| Pustaka PDF & Excel | Baru dimuat **saat dipakai**, halaman awal tetap ringan |
| Server | Kunci tulis singkat, data ditulis per blok, cache dipecah >100 KB, pemanas otomatis tiap 5 menit |

Cek sendiri: tekan **F12 → Console**, ketik `Perf.table()` (waktu tiap panggilan) atau `Perf.summary()`.
Di editor Apps Script, jalankan **`cekPerforma`** untuk melihat status cache & trigger.

---

## 🔄 Cara update

**Backend** (bila ada `Kode.gs` baru): tempel → Simpan → **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
> ❗ Jangan pilih "New deployment" — itu membuat URL baru dan aplikasi berhenti tersambung.

**Frontend**: salin file baru ke folder yang sama, lalu di PowerShell:
```bash
git add .
git commit -m "Update"
git push
```
Tunggu 1–2 menit, buka aplikasi dan tekan **Ctrl+Shift+R**.

---

## 🔑 PIN & keamanan

| Keperluan | Caranya (di editor Apps Script) |
|---|---|
| Ganti PIN | Isi `const PIN_BARU = '…';` di baris atas `Kode.gs` → Simpan → jalankan **`aturPIN`** → kosongkan lagi `PIN_BARU` → Simpan. Semua perangkat diminta PIN baru. |
| Keluarkan semua perangkat | Jalankan **`keluarkanSemuaPerangkat`** |
| PIN salah 8× | Dikunci otomatis 10 menit |
| Masa berlaku masuk | 30 hari per perangkat |

## ⏱️ Kuota Google

Pemanas otomatis (`keepWarm`) berjalan tiap 5 menit dan memakai sekitar 3–5 menit dari jatah ±90 menit/hari akun Gmail biasa. Bila tidak dibutuhkan (mis. di luar musim kejuaraan) jalankan **`matikanKeepWarm`**; nyalakan lagi dengan **`nyalakanKeepWarm`**.

---

## 🛠️ Kendala umum

| Yang terlihat | Penyebab | Solusi |
|---|---|---|
| Layar PIN bertuliskan "GAS_URL … belum diisi" | `js/config.js` belum diisi | Isi URL `/exec`, lalu `git add .` → `commit` → `push` |
| "Server membalas HTTP … (bukan JSON)" | URL salah / deployment bukan *Anyone* | Cek URL berakhiran `/exec`; Deploy → Manage deployments → akses **Anyone** |
| "Aplikasi belum di-setup" | `setupAppEnvironment` belum dijalankan | Jalankan sekali dari editor |
| Halaman 404 di GitHub Pages | Yang di-push folder induk, bukan folder berisi `index.html` | Lihat B4, push ulang dari folder yang benar (`git push -u origin main --force`) |
| Tampilan polos tanpa warna | Upload lewat web GitHub, folder `css/` hilang | Push ulang lewat terminal |
| Tetap tampil versi lama | Cache browser | **Ctrl+Shift+R** atau jendela Incognito |
| "Password authentication is not supported" | GitHub butuh token | Buat Personal Access Token (B5) |
| Label "Gagal menyimpan" | Server sibuk / terputus | Otomatis dicoba lagi; data tetap aman di perangkat. Klik **Segarkan** bila perlu |
| Lupa PIN | — | Isi `PIN_BARU` → jalankan `aturPIN` |

---

## ✅ Ringkasan uji sebelum diserahkan

Diuji dengan simulator Apps Script (Sheets, Cache 100 KB/nilai, Properties, Lock) + browser Chromium (laptop 1440 px & HP 390 px):

- Setup membuat 6 sheet + trigger; setup ulang tidak mengubah data.
- PIN salah ditolak, 8× salah dikunci; token palsu ditolak; logout & ganti PIN mencabut akses.
- Login = 1 panggilan; buka ulang = 1 panggilan; panggilan kedua dari cache (0 baca Sheets).
- Mengetik beberapa sel → 1 kali simpan; kirim ulang permintaan yang sama tidak menyimpan dua kali.
- Impor Rekap Atlit Perdesa (43 peserta, sel merge) tersimpan; "3-4" tetap teks, bukan tanggal; teks berawalan "=" tidak menjadi rumus.
- Gambar & tata letak (100 KB+) tersimpan berpotongan dan terbaca utuh di perangkat lain.
- Konflik dua perangkat terdeteksi tanpa menimpa data; mode offline tersimpan lalu terkirim saat online.
- PDF per SD kelas & template Excel terunduh; tidak ada error JavaScript.
