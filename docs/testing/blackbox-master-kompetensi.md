# Blackbox Testing — Master Data Skill (kelola master kompetensi)

**Halaman:** `/master-data-skill` (menu "Master Data Skill", role Talent Support & Manager)
**Endpoint:** `GET /api/v1/kompetensi?dengan_pemakaian=1`, `POST /api/v1/kompetensi`, `PUT /api/v1/kompetensi/{id}`, `DELETE /api/v1/kompetensi/{id}`

## Prasyarat

- Backend di `http://localhost:8000` setelah `php artisan migrate:fresh --seed` (30 kompetensi, 13 kategori).
- Frontend `npm run dev`, dibuka di `http://localhost:5173`. Akun `ts@`, `manager@`, `am@`, `hr@`, `talent@intellisys.test` (password `password`).
- Diuji 2026-10-21 di Chrome (headless, lewat puppeteer), berurutan dari data seed bersih.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| K-01 | Daftar & pemakaian | Login TS, buka **Master Data Skill** | - | 30 kompetensi; kolom Dipakai Talent / Dipakai Permintaan; tombol Hapus nonaktif untuk kompetensi yang dipakai (Laravel: 4 talent, 1 permintaan) | Sesuai | Lulus |
| K-02 | Nama kosong | **Tambah Kompetensi** → **Tambah** | (kosong) | Pesan backend "Kolom nama kompetensi wajib diisi." | Sesuai | Lulus |
| K-03 | Nama ganda beda huruf | Isi nama → **Tambah** | `laravel` | "Kompetensi laravel sudah ada." | Sesuai | Lulus |
| K-03b | Error hilang saat diperbaiki | Ketik ulang nama | `Golang` | Pesan error lama hilang | Sesuai | Lulus |
| K-04 | Tambah | Nama + kategori (pilihan kategori dari daftar yang ada) → **Tambah** | `Golang`, `Backend` | "Kompetensi berhasil ditambahkan. (Golang)"; total 31; saran kategori berisi 13 kategori | Sesuai | Lulus |
| K-05 | Cari | Ketik di kotak cari | `golang` | 1 baris Golang, Backend, 0 / 0 | Sesuai | Lulus |
| K-06 | Ubah | **Ubah** → nama → **Simpan Perubahan** | `Go` | "Kompetensi berhasil diperbarui. (Go)" | Sesuai | Lulus |
| K-07 | Hapus | **Hapus** → **Ya, Hapus** pada Go | - | "Kompetensi berhasil dihapus. (Go)"; baris hilang | Sesuai | Lulus |
| K-08 | Filter kategori | Pilih kategori | `Database` | Hanya 4 kompetensi kategori Database | Sesuai | Lulus |
| K-09 | Hapus yang dipakai (API) | `DELETE /kompetensi/1` dengan token TS | - | 422 "Kompetensi Laravel masih dipakai oleh 4 talent dan 1 job requirement, sehingga tidak dapat dihapus." | Sesuai | Lulus |
| K-10 | Manager menambah | Login Manager, tambah tanpa kategori | `Rust` | Berhasil; kategori tersimpan kosong (null) | Sesuai | Lulus |
| K-am | AM ditolak | Login AM, buka `/master-data-skill`; `POST /kompetensi` | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| K-hr | HR Client ditolak | Sama dengan K-am, akun HR | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| K-talent | Talent ditolak | Sama dengan K-am, akun Talent | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| K-HP | Tampilan HP | Lebar 375px, buka halaman & form tambah | - | Tanpa scroll horizontal halaman; tabel bergeser di dalam kartunya; form muncul dari bawah selebar layar | `scrollWidth` 375, form 375px | Lulus |
