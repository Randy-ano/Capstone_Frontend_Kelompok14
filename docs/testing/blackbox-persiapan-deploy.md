# Blackbox Testing — Persiapan Deploy Produksi (Railway + Vercel)

**Lingkup:** konfigurasi produksi. Backend di Railway (Laravel + MySQL + Volume `/app/storage/app` + service cron per jam), frontend di Vercel. Tidak ada fitur atau halaman baru; yang diuji adalah perilaku aplikasi dalam mode produksi.

## Prasyarat

- Diuji 2026-11-06 dengan **simulasi produksi lokal**, bukan di Railway/Vercel sungguhan:
  - Backend: salinan repo, `composer install --no-dev` (seperti server tanpa paket dev), **tanpa file `.env`**. Semua nilai dari variabel lingkungan sesuai `.env.production.example`: `APP_ENV=production`, `APP_DEBUG=false`, `DB_URL=mysql://…/intellisys_prod_sim` (database terpisah, MySQL 8.4), `QUEUE_CONNECTION=sync`, `LOG_CHANNEL=stderr`, `MAIL_MAILER=log`, `FRONTEND_URL="http://localhost:4173, https://intellisys.vercel.app"`, `SEED_DEMO=true`, `RAILWAY_DEPLOYMENT_ID=sim-1`. Disiapkan dengan `sh railway/init-app.sh`, lalu `php artisan serve --port=8001` (config/route/view/event ter-cache).
  - Frontend: build produksi dengan `VERCEL=1 VITE_API_URL=http://localhost:8001/api/v1`, disajikan `vite preview` di port 4173 (origin terdaftar) dan 4174 (origin **tidak** terdaftar). Diuji di Chrome headless (puppeteer) dengan lebar layar HP 390 px; endpoint juga dicek dengan curl.
- Akun demo (password `password`): `am@`, `manager@`, `hr@`, `ts@`, `talent@intellisys.test`.
- `php artisan test`: 812 lulus. `php artisan migrate:fresh --seed` (lokal): tanpa error. `npm run build`: tanpa error.
- Yang **tidak** bisa diuji lokal: platform Railway/Vercel itu sendiri (volume, Railpack, `/start-container.sh`, jadwal cron UTC, domain https asli). Bagian itu diikuti dari `DEPLOY.md` saat deploy pertama.

## Backend: persiapan & data demo

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| DP-01 | Deploy pertama dengan data demo | Jalankan `sh railway/init-app.sh` | `SEED_DEMO=true`, `RAILWAY_DEPLOYMENT_ID=sim-1` | Muncul peringatan penghapusan data, `migrate:fresh --seed --force` berjalan, lalu storage:link dan cache config/route/view/event | Semua seeder DONE (± 20 detik), lalu "Configuration/Routes/Blade/Events cached successfully" | Lulus |
| DP-02 | Seed tanpa paket dev | Seperti DP-01 pada instalasi `--no-dev` | — | Seeder tidak bergantung pada Faker/Scribe; `config:cache` tidak gagal | Berhasil; `config/scribe.php` kosong saat Scribe tidak terpasang | Lulus |
| DP-03 | File contoh seeder ada di storage/app | Bandingkan setiap path file di database dengan isi `storage/app/private` | — | Semua file yang dirujuk database ada di disk | dokumen 32/32, CV 5/5, sertifikat 6/6, tanda tangan 37/37; tidak ada yang hilang | Lulus |
| DP-04 | Restart container di deployment yang sama | Jalankan `init-app.sh` lagi | `SEED_DEMO=true`, deployment sama | Data tidak direset lagi, hanya migrate | "data demo sudah dibuat untuk deployment ini. Hanya migrate." | Lulus |
| DP-05 | Koneksi lewat `DB_URL` | Jalankan aplikasi hanya dengan `DB_URL` (tanpa DB_HOST/DB_DATABASE) | `mysql://root:@127.0.0.1:3306/intellisys_prod_sim` | Migrasi, seed, dan request API memakai database itu | Berhasil | Lulus |
| DP-06 | Health check | `GET /up` | — | 200 | 200 | Lulus |

## Backend: CORS, HTTPS, antrean, email, scheduler

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| DP-07 | Preflight dari origin di `FRONTEND_URL` | `OPTIONS /api/v1/auth/login` | Origin `http://localhost:4173`, `https://intellisys.vercel.app` | `Access-Control-Allow-Origin` sama dengan origin | Sesuai untuk keduanya (spasi setelah koma diabaikan) | Lulus |
| DP-08 | localhost:5173 selalu diizinkan | Preflight | Origin `http://localhost:5173` (tidak ditulis di `FRONTEND_URL`) | Diizinkan | Diizinkan | Lulus |
| DP-09 | Origin lain ditolak | Preflight | Origin `https://situs-lain.example` | Tanpa header `Access-Control-Allow-Origin` | Tanpa header | Lulus |
| DP-10 | URL https di balik proxy | `GET /api/v1/notifikasi` dengan header proxy | `X-Forwarded-Proto: https`, `X-Forwarded-Host: intellisys-api.up.railway.app` | `links.first` memakai https dan host publik | `https://intellisys-api.up.railway.app/api/v1/notifikasi?page=1` | Lulus |
| DP-11 | Unggah & unduh dokumen (AM) | `POST /dokumen/upload`, lalu `GET /dokumen/{id}/download` | PDF 303 byte, jenis `lainnya` | 201, file tersimpan di `storage/app/private/dokumen/{uuid}/`, unduhan identik | "Dokumen berhasil diunggah.", unduhan 200 `application/pdf` dan isinya sama persis | Lulus |
| DP-12 | Unggah tanpa file | `POST /dokumen/upload` | tanpa `file` | 422 dengan pesan Bahasa Indonesia | "Kolom file wajib diisi." | Lulus |
| DP-13 | Role lain mengunduh dokumen AM | `GET /dokumen/{id}/download` sebagai talent | token `talent@` | 403 | 403 | Lulus |
| DP-14 | Generate & unduh CV (talent) | `POST /talent/cv/generate`, `GET /talent/cv/download` | token `talent@` | CV dibuat, unduhan PDF | "CV berhasil dibuat.", 200 `application/pdf` 2.848 byte | Lulus |
| DP-15 | HR Client generate CV talent | `POST /talent/cv/generate` | token `hr@` | 403 | 403 | Lulus |
| DP-16 | Unduh dokumen bertanda tangan (Manager) | `GET /dokumen/{id}/download` untuk 3 dokumen ditandatangani | Kontrak Kerja Nadia, PO Data Analyst, Quotation | PDF hasil olahan (lebih besar dari file asli) berisi gambar tanda tangan | 6.694/5.209/4.621 byte vs asli 1.417/1.401/2.867 byte; 4/2/2 gambar di PDF | Lulus |
| DP-17 | Lupa password dengan mailer log | `POST /auth/lupa-password` (HTTP) dan `Password::sendResetLink` (CLI, agar stderr bisa dibaca) | `talent@` (HTTP), `ts@` & `manager@` (CLI) | Respons generik; email (subjek & tautan) tertulis di stderr; tautan memakai origin pertama `FRONTEND_URL` | Dengan `LOG_LEVEL=debug`: `production.DEBUG … Subject: [Intellisys Talent Hub] Reset password`, tautan `http://localhost:4173/reset-password?token=…`. Dengan `LOG_LEVEL=info` email **tidak** tampil, sehingga contoh env memakai `debug` | Lulus |
| DP-18 | Pengingat dengan antrean sync | `php artisan notifikasi:pengingat` | `QUEUE_CONNECTION=sync` | Email langsung diproses, tidak ada job tertinggal | 10 notifikasi email berstatus `terkirim`, tabel `jobs` kosong, 10 email di stderr | Lulus |
| DP-19 | SMTP gagal dengan antrean sync | Test `ProduksiTest` (mailer dibuat gagal) | 2 penerima | Proses tidak berhenti; kedua notifikasi `gagal` | Sesuai | Lulus |
| DP-20 | Skrip cron | `sh railway/run-cron.sh` di luar jam 07 WIB | — | `schedule:run` sekali lalu selesai (exit 0) | "No scheduled commands are ready to run.", exit 0 | Lulus |
| DP-21 | Pengingat jatuh tempo dengan cron per jam | Test jadwal: waktu 00.00 & 00.04 UTC (07.00 & 07.04 WIB), 23.59 UTC, 01.00 UTC | — | Jalan pada 07.00 dan 07.04 WIB, sekali per hari; tidak jalan 06.59 dan 08.00 WIB | Sesuai | Lulus |

## Frontend (build produksi)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| DP-22 | Build Vercel tanpa URL absolut | `VERCEL=1 vite build` | `VITE_API_URL=/api/v1` | Build gagal dengan pesan jelas | "VITE_API_URL belum diisi alamat absolut backend … lalu Redeploy." | Lulus |
| DP-23 | Build dengan URL absolut | `VERCEL=1 vite build` | `VITE_API_URL=http://localhost:8001/api/v1` | Build sukses, alamat tertanam di bundle | Sukses; alamat ada di `index-*.js` | Lulus |
| DP-24 | Login dari origin terdaftar (AM, lebar HP) | Buka `:4173/login`, isi form, Masuk | `am@` / `password` | Masuk ke dashboard, tanpa error CORS di konsol | Ke `/dashboard-rekapitulasi`, konsol bersih | Lulus |
| DP-25 | Deep link halaman SPA | Buka langsung `:4173/dokumen-quotation-po` | — | Halaman Dokumen tampil dengan data (di Vercel lewat rewrite `vercel.json`) | Daftar dokumen tampil (termasuk `uji-deploy.pdf`), tanpa scroll horizontal | Lulus |
| DP-26 | Password salah | Login | `am@` / `salah123` | Pesan backend tampil apa adanya | "Email atau password salah." | Lulus |
| DP-27 | Talent membuka Profil & CV | Login talent, buka `/profil-saya` | `talent@` | Profil & bagian CV termuat, rapi di lebar HP | Termuat, tanpa scroll horizontal | Lulus |
| DP-28 | Lupa password dari UI | `/lupa-password`, kirim | `hr@intellisys.test` | Pesan sukses generik | "Jika email terdaftar, tautan reset sudah dikirim." | Lulus |
| DP-29 | Origin tidak terdaftar | Bundle yang sama di `:4174`, login | `am@` / `password` | Browser memblokir (CORS), UI menampilkan pesan tidak dapat terhubung, tetap di halaman login | "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan."; konsol mencatat error CORS | Lulus |

## Catatan

- `railway/init-app.sh` dipasang di **Custom Start Command** (`sh railway/init-app.sh && /start-container.sh`), bukan Pre-Deploy Command, karena pre-deploy Railway tidak memasang volume dan tidak menyimpan perubahan file. Detail di `DEPLOY.md` dan `DECISIONS.md` backend.
- Setelah deploy pertama atau reset demo, `SEED_DEMO` wajib dikembalikan ke `false`.
