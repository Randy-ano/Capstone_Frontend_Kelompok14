# Blackbox Testing — Kelola Akun Pegawai (FR-02)

**Halaman:** `/kelola-pegawai` (menu "Kelola Akun Pegawai" di grup Pengaturan, khusus Manager)
**Endpoint:** `GET /api/v1/pegawai`, `POST /api/v1/pegawai`, `PUT /api/v1/pegawai/{id}`, `PATCH /api/v1/users/{id}/status`, `POST /api/v1/auth/login` (cek akun)

## Prasyarat

- Backend di `http://localhost:8000` setelah `php artisan migrate:fresh --seed` (3 pegawai: Andi Pratama/AM, Rina Kartika/TS, Hendra Gunawan/Manager).
- Frontend `npm run dev`, dibuka di `http://localhost:5173`. Akun `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test` (password `password`).
- Login dibatasi 10 kali per menit per IP; beri jeda jika menguji berulang.
- Diuji 2026-10-21 di Chrome (headless, lewat puppeteer), berurutan dari data seed bersih.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| P-01 | Daftar pegawai | Login Manager, buka **Kelola Akun Pegawai** | - | 3 pegawai berstatus Aktif; baris sendiri bertanda "(Anda)" tanpa tombol Nonaktifkan | Sesuai | Lulus |
| P-02 | Validasi | **Tambah Pegawai** → **Tambah Pegawai** tanpa isian | (kosong) | Pesan backend per field: nama pegawai, jabatan, email, password, role wajib diisi | Sesuai | Lulus |
| P-03 | Email terdaftar | Isi semua, email milik akun lain | `ts@intellisys.test` | "email sudah digunakan." | Sesuai | Lulus |
| P-03b | Error hilang saat diperbaiki | Ganti email | `dewi@intellisys.test` | Pesan error hilang | Sesuai | Lulus |
| P-04 | Tambah pegawai | **Tambah Pegawai** | Dewi Lestari, Talent Support, `rahasia123` | "Pegawai berhasil ditambahkan. (Dewi Lestari)"; 4 pegawai; akun baru bisa login sebagai Talent Support | Sesuai (login 200) | Lulus |
| P-05 | Ubah tanpa ganti password | **Ubah** Dewi → jabatan → **Simpan Perubahan** (password dibiarkan kosong) | `Senior Talent Support` | "Pegawai berhasil diperbarui. (Dewi Lestari)"; password lama tetap berlaku | Sesuai | Lulus |
| P-06 | Nonaktifkan | **Nonaktifkan** → **Ya** pada Dewi | - | "Akun berhasil dinonaktifkan (Dewi Lestari)"; status Nonaktif; login Dewi ditolak 403 "Akun Anda dinonaktifkan. Silakan hubungi Manager PT Intellisys." | Sesuai | Lulus |
| P-07 | Aktifkan kembali | **Aktifkan** → **Ya** | - | "Akun berhasil diaktifkan (Dewi Lestari)"; status Aktif; tombol kembali normal | Sesuai | Lulus |
| P-08 | Filter role | Pilih role | Talent Support | 2 baris (Dewi, Rina) | Sesuai | Lulus |
| P-09 | Nonaktifkan diri sendiri (API) | `PATCH /users/{id_user manager}/status` | `{"status_aktif": false}` | 403 "Anda tidak dapat mengubah status akun Anda sendiri." | Sesuai | Lulus |
| P-am | AM ditolak | Login AM, buka `/kelola-pegawai`; `GET /pegawai` | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| P-ts | TS ditolak | Sama, akun TS | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| P-hr | HR Client ditolak | Sama, akun HR | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| P-talent | Talent ditolak | Sama, akun Talent | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| P-HP | Tampilan HP | Lebar 375px, buka halaman & form tambah | - | Tanpa scroll horizontal halaman; form satu kolom muncul dari bawah | `scrollWidth` 375, form 375px | Lulus |
