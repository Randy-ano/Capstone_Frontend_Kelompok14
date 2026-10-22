# Blackbox Testing — Penyempurnaan Fitur Role Talent

**FR:** FR-03, FR-04 (sertifikat & bahasa di profil/CV), FR-15 (talent melihat monitoring), pengaturan akun (ubah password)
**Halaman:** menu talent (Beranda, Proses Seleksi, Penempatan Saya), `/penugasan-penempatan?tab=monitoring`, `/profil-saya`, `/pengaturan-akun`
**Endpoint:** `GET /monitoring` (kini juga talent, discope miliknya), `PUT /auth/password` (baru, semua role), `PUT /talent/profil` (kini menerima `sertifikat[]` & `bahasa[]`)

## Prasyarat

- Backend `php artisan migrate:fresh --seed && php artisan serve` (MySQL Laragon menyala).
- Frontend `npm run dev`, buka `http://localhost:5173`. Akun: `talent@` (Budi Santoso, placement aktif di PT Maju Jaya, 1 catatan monitoring), `manager@`, `hr@intellisys.test` (password `password`).
- Diuji 2026-10-22 di Chrome (headless, puppeteer) pada lebar 1440 px dan 390 px.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| T-01 | Nama menu talent | Login talent, lihat sidebar | `talent@` | Menu "Beranda", "Proses Seleksi", "Penempatan Saya", "Pengaturan Akun"; tidak ada "Dashboard Rekapitulasi", "Pengajuan Kandidat", "Penugasan Penempatan" | Sesuai; judul header di beranda "Beranda" | Lulus |
| T-02 | Judul halaman talent | Buka Proses Seleksi dan Penempatan Saya | - | Judul halaman "Proses Seleksi" dan "Penempatan Saya" | Sesuai | Lulus |
| T-03 | Menu role lain tidak berubah | Login Manager | `manager@` | Menu tetap "Dashboard Rekapitulasi", "Pengajuan Kandidat", "Penugasan Penempatan"; tidak ada "Beranda" | Sesuai | Lulus |
| T-04 | Tab Monitoring talent | Penempatan Saya → tab "Monitoring" | - | Kartu monitoring: tanggal, posisi & klien, hasil, catatan tindak lanjut, pencatat; tanpa tombol "Catat Monitoring"; URL `?tab=monitoring` | "19 Okt 2026, 10.00 · Adaptasi baik; tugas sprint pertama selesai tepat waktu. · Pantau kembali setelah 1 bulan. · Dicatat oleh Hendra Gunawan" | Lulus |
| T-05 | Monitoring hanya milik sendiri | `GET /monitoring` dengan token talent | - | Hanya catatan placement Budi | 1 catatan, semua milik Budi Santoso | Lulus |
| T-06 | Talent tidak bisa mencatat | `POST /monitoring` dengan token talent | `id_placement` 1 | 403 "Anda tidak memiliki akses ke fitur ini." | Sesuai | Lulus |
| T-07 | HR Client tetap ditolak | `GET /monitoring` dengan token HR | - | 403 | 403 | Lulus |
| T-08 | Role lain tanpa tab | Manager & HR buka Penugasan Penempatan | - | Tidak ada tab; judul "Penugasan Penempatan" (Manager) | Sesuai | Lulus |
| T-09 | Monitoring di HP | Tab Monitoring di lebar 390 px | - | Tanpa geser samping | Lebar 390 px | Lulus |
| T-10 | Sertifikat URL tidak valid | Profil → Sertifikat "Tambah", isi tautan salah, Simpan | `bukan url` | Pesan validasi backend tampil | "Kolom tautan sertifikat harus berupa URL yang valid." | Lulus |
| T-11 | Simpan sertifikat & bahasa | Isi sertifikat & bahasa yang benar, Simpan, muat ulang | "Laravel Certified Developer" / "Laravel LLC" / `https://laravel.com/sertifikat/123`; bahasa "Inggris" – Menengah | "Profil talent berhasil diperbarui."; data tetap ada setelah muat ulang | Sesuai | Lulus |
| T-12 | CV memuat sertifikat & bahasa | Generate CV setelah T-11 | - | CV berhasil dibuat; bagian Certifications & Languages berisi data baru | "CV berhasil dibuat."; isi CV diverifikasi test backend (`SertifikatBahasaTest`) | Lulus |
| T-13 | Profil di HP | Profil di lebar 390 px | - | Tanpa geser samping | Lebar 390 px | Lulus |
| T-14 | Password lama salah | Pengaturan Akun → isi password lama salah | `salah123` | "Password lama tidak sesuai." | Sesuai | Lulus |
| T-15 | Konfirmasi beda | Password baru & konfirmasi berbeda | `rahasiabaru123` / `beda12345` | "Konfirmasi password baru tidak cocok." | Sesuai | Lulus |
| T-16 | Ubah password berhasil | Isi benar, Simpan | `password` → `rahasiabaru123` | "Password berhasil diubah."; sesi saat ini tetap (muat ulang tetap di halaman) | Sesuai | Lulus |
| T-17 | Login dengan password baru | Login API dengan password lama & baru | - | Lama 422, baru 200 | 422 / 200 | Lulus |
| T-18 | Pengaturan Akun role lain | Manager membuka Pengaturan Akun & memanggil `PUT /auth/password` dengan password lama salah | `manager@` | Halaman tampil berisi email Manager; 422 "Password lama tidak sesuai." | Sesuai | Lulus |
| T-19 | Pengaturan di HP | Pengaturan Akun di lebar 390 px | - | Tanpa geser samping | Lebar 390 px | Lulus |
