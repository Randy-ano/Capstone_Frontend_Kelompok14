# Blackbox Testing — Rapikan Header

**Cakupan:** header atas di semua halaman (`src/components/Header.jsx`, `AppLayout.jsx`) dan pembukaan form dari header di `/permintaan-kebutuhan`
**Endpoint:** tidak ada endpoint baru; form memakai `POST /job-requirements` yang sudah ada (HR Client & Account Manager, R7)

## Prasyarat

- Backend `php artisan migrate:fresh --seed && php artisan serve` (MySQL Laragon menyala).
- Frontend `npm run dev`, buka `http://localhost:5173`. Akun: `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test` (password `password`).
- Diuji 2026-10-22 di Chrome (headless, puppeteer) pada lebar 1440 px dan 390 px.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| H-01 | Elemen mockup hilang | Login tiap role, buka Dashboard | 5 akun demo | Tidak ada kotak pencarian, badge "Sistem Aktif - Sinkronisasi Cloud", tombol bantuan, tulisan "Platform", tombol "Buat Requisisi / Tambah Talent" | Kelimanya tidak muncul di semua role | Lulus |
| H-02 | Breadcrumb sesuai menu | Buka Dashboard | - | "Utama › Dashboard Rekapitulasi" | Sesuai di semua role | Lulus |
| H-03 | Breadcrumb grup lain | Buka Permintaan Kebutuhan (HR/AM) | - | "Klien & Rekuisisi › Permintaan Kebutuhan" | Sesuai | Lulus |
| H-04 | Halaman di luar menu | HR buka `/notifikasi` | - | Hanya judul "Notifikasi" tanpa grup | Sesuai | Lulus |
| H-05 | Tombol Buat Permintaan – HR Client | Login HR, klik "Buat Permintaan" di header | - | Pindah ke Permintaan Kebutuhan, form "Buat Permintaan Kebutuhan" langsung terbuka, URL tanpa `?buat=1` | Sesuai | Lulus |
| H-06 | Tombol Buat Permintaan – Account Manager | Login AM, klik "Buat Permintaan" | - | Sama seperti H-05 (form dengan pilihan klien) | Sesuai | Lulus |
| H-07 | Role lain tidak melihat tombol | Login Manager, Talent Support, Talent | - | Tombol "Buat Permintaan" tidak tampil | Tidak tampil | Lulus |
| H-08 | Role tidak berhak membuka lewat URL | Talent Support buka `/permintaan-kebutuhan?buat=1` | - | Form tidak terbuka | Form tidak terbuka (TS hanya melihat daftar) | Lulus |
| H-09 | Tampilan HP | Buka Dashboard di lebar 390 px untuk tiap role | - | Header muat tanpa geser samping: tombol menu, judul, lonceng, avatar | Lebar halaman 390 px di semua role | Lulus |
