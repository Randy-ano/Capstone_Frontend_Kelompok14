# Blackbox Testing — Email lewat Brevo & Penyeragaman Nama Perusahaan

**Lingkup:** (1) backend mengirim email (lupa password & notifikasi email) lewat Brevo HTTP API bila `MAIL_MAILER=brevo`; (2) nama perusahaan di seluruh UI, pesan backend, email, dan PDF menjadi **"PT Intellisys IT Outsourcing"**. Nama aplikasi "Intellisys Talent Hub" tidak berubah. Tidak ada endpoint, halaman, maupun hak akses baru.

## Prasyarat

- Backend `php artisan migrate:fresh --seed`, lalu dijalankan dengan `MAIL_MAILER=brevo`, `BREVO_API_KEY=<key palsu>`, `MAIL_FROM_ADDRESS=uji@contoh.com` (sengaja palsu: menguji jalur gagal ke API Brevo sungguhan tanpa kredensial asli). Frontend `npm run dev` di `http://localhost:5173`.
- Akun demo (password `password`): `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test`.
- Diuji 2026-11-06 lewat curl ke API dan pemeriksaan teks hasil build frontend.

## Email lewat Brevo

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| EB-01 | Lupa password, email terdaftar, API key Brevo salah | `POST /auth/lupa-password` | `talent@intellisys.test` | 200 "Jika email terdaftar, tautan reset sudah dikirim."; tidak ada detail error ke pengguna; log berisi `Gagal mengirim email reset password.` dengan error dari Brevo | 200 pesan umum; log: `"mailer":"brevo","error":"Unable to send an email: Key not found (code 401)."` | Lulus |
| EB-02 | Lupa password, email tidak terdaftar | `POST /auth/lupa-password` | `tidakada@intellisys.test` | 200 dengan pesan yang sama persis seperti EB-01 | Sama persis | Lulus |
| EB-03 | Transport brevo terdaftar & terpilih | `php artisan test --filter="Transport email Brevo"` | `MAIL_MAILER=brevo` (config) | Mailer default memakai `BrevoApiTransport` (`brevo+api://api.brevo.com`) | 6 test lulus | Lulus |
| EB-04 | Email terkirim ke endpoint Brevo yang benar | Test dengan HTTP client palsu | Lupa password `budi@contoh.com` | `POST https://api.brevo.com/v3/smtp/email` dengan header `api-key`, isi memuat tautan reset | Sesuai | Lulus |
| EB-05 | Bawaan lokal & test | Cek `.env.example`, `phpunit.xml` | - | Lokal `MAIL_MAILER=log`, test `array` | Sesuai | Lulus |

## Nama perusahaan

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| NP-01 | Kaki halaman Masuk, Daftar, dan footer halaman depan | Buka `/login`, `/daftar`, `/` | - | "© PT Intellisys IT Outsourcing • Sistem Manajemen Talenta Terpadu" | Sesuai (komponen `KakiHalaman` dipakai ketiga halaman) | Lulus |
| NP-02 | Halaman depan publik | Buka `/` | - | Deskripsi "Sistem outsourcing talent PT Intellisys IT Outsourcing …" dan kartu "Tim PT Intellisys IT Outsourcing" | Sesuai | Lulus |
| NP-03 | Sidebar | Login role apa pun | - | "Intellisys Talent Hub" + "PT Intellisys IT Outsourcing" | Sesuai (tidak berubah) | Lulus |
| NP-04 | Teks keterangan halaman | Daftar, Profil Saya, Jadwal Interview, Penempatan, Pengajuan Kandidat, Tiket Komplain, Kelola Pegawai, Monitoring Talent | - | Semua memakai "PT Intellisys IT Outsourcing" | 12 teks diperbarui di 10 file | Lulus |
| NP-05 | Login akun nonaktif (pesan dari backend) | Nonaktifkan `ts@`, login | `ts@intellisys.test` / `password` | 403 "Akun Anda dinonaktifkan. Silakan hubungi Manager PT Intellisys IT Outsourcing." | Sesuai (akun diaktifkan kembali setelah uji) | Lulus |
| NP-06 | Login semua role tetap normal | Login 5 akun demo | password `password` | 200 | manager, am, ts, hr, talent: 200 | Lulus |
| NP-07 | Email & PDF buatan sistem | Cek template email reset/notifikasi, PDF dokumen, lembar pengesahan, PO contoh seeder | - | Kop/footer "PT Intellisys IT Outsourcing" | Sesuai; seeder berjalan tanpa error | Lulus |
| NP-08 | Tidak ada nama lama | Cari "Tri Pratama" di kedua repo (tanpa `node_modules`/`vendor`) dan di `dist/` | - | Tidak ada hasil | Kosong | Lulus |
| NP-09 | Build | `npm run build` | - | Tanpa error | Berhasil | Lulus |
