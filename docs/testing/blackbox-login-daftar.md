# Blackbox Testing — Tampilan Baru Halaman Masuk & Daftar

**Cakupan:** `/login` dan `/daftar` mengikuti mockup Stitch "Masuk" dan "Daftar Akun Baru"; opsi "Ingat saya"
**Endpoint:** `POST /auth/login`, `POST /auth/register/talent`, `POST /auth/register/hr-client`, `POST /auth/logout` (tidak berubah)

## Prasyarat

- Backend `php artisan migrate:fresh --seed && php artisan serve` (MySQL Laragon menyala).
- Frontend `npm run dev`, buka `http://localhost:5173`.
- Diuji 2026-10-22 di Chrome (headless, puppeteer) pada lebar 1440/1600 px dan 390 px.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| L-01 | Tampilan desktop Masuk | Buka `/login` di lebar 1600 px | - | Form di kiri (logo, "Masuk ke Akun", tautan "Daftar sekarang", tombol merah "Masuk ke Platform"), panel gelap di kanan dengan kartu fitur & slide | Sesuai | Lulus |
| L-02 | Tampilan HP Masuk | Buka `/login` di lebar 390 px | - | Panel kanan disembunyikan, form penuh, tanpa geser samping | Lebar 390 px, panel `display: none` | Lulus |
| L-03 | Kata sandi salah | Isi email benar, sandi salah, klik Masuk | `manager@` / `salah123` | Pesan backend tampil | "Email atau password salah." | Lulus |
| L-04 | Ingat saya dicentang | Login dengan "Ingat saya" tercentang (bawaan) | `manager@` / `password` | Masuk ke Dashboard; token di `localStorage`; reload tetap masuk | Sesuai | Lulus |
| L-05 | Ingat saya tidak dicentang | Hilangkan centang lalu login | `talent@` / `password` | Token di `sessionStorage` saja; reload tetap masuk; tab baru diarahkan ke `/login` | Sesuai | Lulus |
| L-06 | Keluar | Menu user → Keluar | - | Kembali ke `/login`, token terhapus dari kedua penyimpanan | Sesuai | Lulus |
| L-07 | Slide panel | Klik panah kanan di panel | - | Judul slide berganti | "Fitur Manajemen Terintegrasi" → "Rekomendasi Kandidat Berbasis Aturan" | Lulus |
| D-01 | Tampilan Daftar | Buka `/daftar` di 1600 px dan 390 px | - | Kartu "Daftar Akun Baru", tab "Saya Talent / Saya HR Perusahaan", kotak info, tombol "Daftar Akun →"; rapi di HP | Sesuai, lebar 390 px | Lulus |
| D-02 | Validasi kosong | Klik Daftar Akun tanpa isian | - | "Periksa kembali isian yang ditandai." + pesan per kolom | Sesuai | Lulus |
| D-03 | Email sudah terdaftar | Isi data talent dengan email terpakai | `talent@intellisys.test` | Pesan validasi backend tampil | "email sudah digunakan." | Lulus |
| D-04 | Tab HR Perusahaan | Klik "Saya HR Perusahaan" | - | Muncul Data Anda + Data Perusahaan (nama, alamat, telepon, penanggung jawab) dan info klien baru | Sesuai | Lulus |
| D-05 | Daftar talent berhasil | Isi nama, email baru, sandi & konfirmasi sama | `uji…@contoh.com` / `rahasia123` | Akun dibuat, langsung masuk ke Dashboard | Sesuai | Lulus |
