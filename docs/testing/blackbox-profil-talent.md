# Blackbox Testing — Profil & CV Talent (FR-03, FR-04)

**Halaman:** `/profil-saya` (menu "Profil & CV Saya" di grup Talent Management, khusus Talent)
**Endpoint:** `GET /api/v1/talent/profil`, `PUT /api/v1/talent/profil`, `PUT /api/v1/talent/profil/kompetensi`, `POST /api/v1/talent/cv/generate`, `GET /api/v1/talent/cv/download`, `GET /api/v1/kompetensi`

## Prasyarat

- Backend di `http://localhost:8000` setelah `php artisan migrate:fresh --seed`. `talent@intellisys.test` (Budi Santoso) berprofil lengkap: 1 riwayat pendidikan, 1 pengalaman (masih bekerja), 4 kompetensi, belum punya CV. `talent19@intellisys.test` belum lengkap (punya pendidikan, belum ada kompetensi). Talent pool berisi 14.
- Frontend `npm run dev`, dibuka di `http://localhost:5173`. Password semua akun `password`.
- Diuji 2026-10-21 di Chrome (headless, lewat puppeteer), berurutan dari data seed bersih.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| T-01 | Data tampil | Login `talent@`, buka **Profil & CV Saya** | - | Status "Profil lengkap" dengan 3 syarat tercentang; form terisi (institusi Universitas Gunadarma); pengalaman masih bekerja → tanggal selesai nonaktif; 4 chip kompetensi; "Anda belum membuat CV.", Lihat CV nonaktif | Sesuai | Lulus |
| T-02 | Penanda perubahan | Ubah domisili | `Bekasi` | Bar "Ada perubahan yang belum disimpan." muncul; Buat CV nonaktif dengan keterangan "Simpan perubahan terlebih dahulu" | Sesuai | Lulus |
| T-03 | Validasi backend | Kosongkan nama, LinkedIn tidak valid, tambah pengalaman hanya berisi perusahaan → **Simpan Perubahan** | `bukan-url`, `PT Lama` | Pesan per field: "Nama lengkap wajib diisi.", "Format URL LinkedIn tidak valid.", "Kolom posisi wajib diisi.", "Kolom tanggal mulai wajib diisi.", "Tanggal selesai wajib diisi jika tidak sedang bekerja di sana." | Sesuai | Lulus |
| T-04 | Simpan profil + kompetensi | Perbaiki isian, lengkapi pengalaman 2, tambah kompetensi Docker → **Simpan Perubahan** | Nama `Budi Santoso Putra`, `https://linkedin.com/in/budi`, Junior Developer 2021-01-01 s.d. 2023-06-30 | "Profil talent berhasil diperbarui. Kompetensi talent berhasil diperbarui."; nama di header ikut berubah; API: 2 pengalaman, 5 kompetensi, domisili Bekasi | Sesuai | Lulus |
| T-05 | Buat & lihat CV | **Buat CV** → **Lihat CV** | - | "CV berhasil dibuat."; tombol menjadi "Buat Ulang CV"; PDF terbuka di tab baru | Sesuai | Lulus |
| T-06 | Batalkan perubahan | Ubah domisili → **Batalkan Perubahan** | `Depok` | Kembali ke `Bekasi`, bar perubahan hilang | Sesuai | Lulus |
| T-07 | Profil belum lengkap | Login `talent19@` | - | "Profil belum lengkap", syarat kompetensi belum tercentang; "CV dapat dibuat setelah profil lengkap.", Buat CV nonaktif | Sesuai | Lulus |
| T-08 | R4 → R5 | Tambah kompetensi → **Simpan Perubahan** | `Excel` | Status menjadi "Profil lengkap … sudah masuk talent pool"; talent pool bertambah 1 | Talent pool 14 → 15 | Lulus |
| T-am | AM ditolak | Login AM, buka `/profil-saya`; `GET /talent/profil` | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| T-ts | TS ditolak | Sama, akun TS | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| T-hr | HR Client ditolak | Sama, akun HR | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| T-manager | Manager ditolak | Sama, akun Manager | - | Menu tidak tampil, "Akses Ditolak"; API 403 | Sesuai | Lulus |
| T-HP | Tampilan HP | Lebar 375px, ubah satu isian | - | Semua bagian satu kolom tanpa scroll horizontal; bar simpan menempel di bawah layar | `scrollWidth` 375 | Lulus |

Catatan: sertifikat dan bahasa belum punya endpoint isi di backend, jadi belum tampil di halaman ini.
