# Blackbox Testing — Fase 10: Dokumentasi API & Handover

**Cakupan:** dokumentasi API Scribe (`/docs`), file OpenAPI & Postman, README handover backend & frontend
**Endpoint:** `GET /docs`, `GET /docs.openapi`, `GET /docs.postman` (dibuat `php artisan scribe:generate`, tidak perlu login)

## Prasyarat

- Backend: `php artisan migrate:fresh --seed && php artisan scribe:generate && php artisan serve` (MySQL Laragon menyala).
- Akun demo: `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test` (password `password`).
- Diuji 2026-10-22 dengan curl dan Chrome (headless, puppeteer) di lebar 1280 px dan 390 px.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| D-01 | Generate dokumentasi | Jalankan `php artisan scribe:generate` setelah seed bersih | - | Selesai tanpa error; HTML, OpenAPI, dan Postman dibuat | Selesai tanpa error, 76 endpoint | Lulus |
| D-02 | Buka dokumentasi | Buka `http://localhost:8000/docs` | - | Halaman 200, judul "Intellisys Talent Hub API", grup sesuai urutan modul | 200; 16 grup (Sistem … Dashboard) setelah "Pengantar" dan "Autentikasi request" | Lulus |
| D-03 | File OpenAPI | Buka `/docs.openapi` (atau `storage/app/private/scribe/openapi.yaml`) | - | File OpenAPI 3 berisi judul & server `http://localhost:8000` | 200, `openapi: 3.0.3`, ±447 KB | Lulus |
| D-04 | Koleksi Postman | Buka `/docs.postman` (atau `storage/app/private/scribe/collection.json`) | - | JSON koleksi Postman bisa diunduh/di-import | 200 `application/json`, ±251 KB | Lulus |
| D-05 | Contoh respons dari data asli | Lihat contoh `GET /talent/profil`, `GET /dokumen` | - | Contoh berisi data seed (Budi Santoso, quotation PT Maju Jaya), bukan 401/403 | Sesuai; endpoint berbatas role memakai akun demo yang berhak | Lulus |
| D-06 | Contoh registrasi | Lihat contoh `POST /auth/register/talent` dan `/register/hr-client` | `password` = `password_confirmation` = `rahasia123` | Contoh 201 beserta token & user | 201 (sebelumnya 422 "Konfirmasi password tidak cocok") | Lulus |
| D-07 | Contoh update profil talent | Lihat contoh `PUT /talent/profil` | contoh `tahun_lulus` 2021, URL sosial media valid | Contoh 200 | 200 | Lulus |
| D-08 | Endpoint file | Lihat unduh CV, unduh dokumen, unggah/generate dokumen, tanda tangan, logout | - | Ada contoh respons tertulis (JSON atau keterangan file biner) | Ada; logout "Logout berhasil" | Lulus |
| D-09 | Contoh 422 aturan bisnis | Lihat contoh `POST /screening`, `POST /placement`, dll. | - | Pesan aturan bisnis asli dalam Bahasa Indonesia (data demo sudah melewati tahap itu) | 12 endpoint menampilkan 422 bermakna, mis. "Talent sudah pernah di-screening untuk job requirement ini." | Lulus |
| D-10 | Data tidak berubah | Hitung user/screening/dokumen/token sebelum & sesudah `scribe:generate` | - | Jumlah sama (response call di dalam transaksi yang di-rollback) | 24/3/2/0 sebelum dan sesudah | Lulus |
| D-11 | Alur "Coba langsung" – login | `POST /auth/login` dengan akun talent, lalu pakai token sebagai `Authorization: Bearer` | `talent@intellisys.test` / `password` | Token diterima; endpoint butuh login bisa dipanggil | Sesuai; logout "Logout berhasil" | Lulus |
| D-12 | Role lain ditolak | Dengan token talent panggil `POST /dokumen/generate` (khusus AM) | token talent | 403 "Anda tidak memiliki akses ke fitur ini." | 403, pesan sesuai | Lulus |
| D-13 | Role berhak | Dengan token AM panggil `POST /dokumen/generate` tanpa body | token AM | Lolos otorisasi, 422 validasi | 422 | Lulus |
| D-14 | Tanpa token | `GET /auth/me` tanpa header Authorization | - | 401 | 401 | Lulus |
| D-15 | Bahasa | Periksa teks halaman `/docs` | - | Judul bagian, tombol "Coba langsung", contoh request/response dalam Bahasa Indonesia; tidak ada istilah "AI" | Sesuai; 0 kata "AI". Badge `requires authentication` masih bawaan Scribe (tidak dapat diterjemahkan lewat konfigurasi) | Lulus |
| D-16 | Tampilan HP | Buka `/docs` di lebar 390 px | - | Konten terbaca, menu bisa dibuka | Terbaca; lebar halaman 396 px (geser 6 px, bawaan tema Scribe) | Lulus (catatan) |
| D-17 | Hasil generate tidak di-commit | `git status` setelah generate | - | `.scribe/`, `resources/views/scribe/`, `public/vendor/scribe/` diabaikan git | Diabaikan | Lulus |
| D-18 | Handover README | Ikuti README backend (install, akun demo, queue & scheduler, dokumentasi) dan README frontend | - | Perintah benar, link repo benar, status halaman sesuai kondisi aktual | Sesuai; link repo diperbarui ke `Capstone_Backend_Kelompok14` / `Capstone_Frontend_Kelompok14` | Lulus |
| D-19 | Seed & test stabil | `php artisan migrate:fresh --seed`, lalu `php artisan test` 4× berturut-turut | - | Seed tanpa error; test lulus semua setiap kali | 566 passed ×4 (sebelum perbaikan seeder: gagal acak di DashboardTest) | Lulus |
