# Blackbox Testing — Unggah File Sertifikat

**Lingkup:** frontend & backend (branch `fitur/file-sertifikat` di kedua repo).

## Prasyarat

- Diuji 2026-11-05 di Chrome headless lewat puppeteer, terhadap backend asli dengan database uji terpisah hasil `migrate:fresh --seed`.
- Akun demo (password `password`): `talent@` (Budi, sertifikat Laravel berfile), `ts@`, `am@`, `manager@`, `hr@` (PT Maju Jaya, menerima pengajuan Budi), `hr03@` (PT Sinar Digital Nusantara, tidak pernah menerima pengajuan Budi), `talent01@` (talent lain).
- Lebar desktop 1366 px, HP 390 px.
- File disimpan di disk private (`storage/app/private/sertifikat/{id_talent}/{id_sertifikat}/`), hanya dapat dibuka lewat API.
- Catatan pratinjau PDF: Chrome headless tidak punya penampil PDF, sehingga iframe tampak gelap pada tangkapan layar uji. Yang diverifikasi adalah file PDF termuat ke iframe sebagai blob. Pratinjau gambar terverifikasi tampil.

## Profil & CV Saya (talent)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| P-01 | Sertifikat berfile | Buka Profil & CV Saya | `talent@` | Baris sertifikat menampilkan ikon + nama file, tombol Lihat, dan Ganti file | "sertifikat-laravel-certified-developer.pdf", Lihat, Ganti file | Lulus |
| P-02 | Pratinjau PDF | Klik Lihat | — | Modal pratinjau terbuka tanpa mengunduh; ada tombol "Buka di tab baru" | PDF dimuat ke iframe (blob) di modal | Lulus |
| P-03 | Tipe salah | Ganti file | `catatan.txt` | "File sertifikat harus berformat PDF, JPG, atau PNG." | Sesuai | Lulus |
| P-04 | Terlalu besar | Ganti file | PDF 2,1 MB | "Ukuran file sertifikat maksimal 2 MB." | Sesuai | Lulus |
| P-05 | Ganti file | Ganti file | `sertifikat-baru.png` | Toast "File sertifikat berhasil diunggah."; nama baru tampil; Lihat menampilkan gambar; file lama terhapus dari storage | Sesuai | Lulus |
| P-06 | File tetap ada setelah profil disimpan | Ubah penerbit → Simpan Perubahan | "Laravel LLC" | Penerbit berubah, file sertifikat tetap ada (di API dan di storage) | Sesuai | Lulus |
| P-07 | Sertifikat baru | Tambah → isi nama → Simpan → Unggah file | "Docker Certified Associate", PDF | Sebelum disimpan: "Simpan profil terlebih dahulu untuk mengunggah file sertifikat ini."; sesudah disimpan bisa unggah | Sesuai | Lulus |
| P-08 | Tampilan HP | Profil dan modal pratinjau di 390 px | — | Rapi, tanpa geser horizontal | Sesuai | Lulus |
| P-09 | Hapus sertifikat | Hapus baris Docker → Simpan Perubahan | — | Baris terhapus dan filenya ikut terhapus dari storage | Sesuai | Lulus |

## Detail talent (role lain)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| V-01 | Talent Pool | Talent Pool → cari Budi → detail → Lihat | `ts@` | Bagian Sertifikat dengan ikon jenis file, nama file, tombol Lihat → pratinjau | Gambar tampil di modal | Lulus |
| V-02 | Rekomendasi Kandidat | Rekomendasi → Fullstack Developer → Lihat di kartu Rizky | `ts@` | Sertifikat kandidat tampil di kartu; Lihat membuka pratinjau PDF | Sesuai | Lulus |
| V-03 | Pengajuan Kandidat | Pengajuan Kandidat → Budi → Lihat | `hr@` | Bagian Sertifikat di detail pengajuan; Lihat membuka pratinjau | Sesuai | Lulus |

## Hak akses `GET /sertifikat/{id}/file` (sertifikat Budi)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| A-01 | Pemilik | Panggil API | `talent@` | 200, `Content-Disposition: inline` | 200 inline | Lulus |
| A-02 | Internal | Panggil API | `ts@`, `am@`, `manager@` | 200 | 200 inline (ketiganya) | Lulus |
| A-03 | HR Client yang menerima pengajuan | Panggil API | `hr@` (PT Maju Jaya) | 200 | 200 inline | Lulus |
| A-04 | HR Client klien lain | Panggil API | `hr03@` | 403 "Anda tidak memiliki akses ke file sertifikat ini." | 403 | Lulus |
| A-05 | Talent lain | Panggil API | `talent01@` | 403 | 403 | Lulus |
| A-06 | Unggah ke sertifikat orang lain (backend) | Test `FileSertifikatTest` | Semua role selain pemilik | 403 | Sesuai | Lulus |
| A-07 | Belum ada file / tanpa login (backend) | Test `FileSertifikatTest` | — | 404 "File sertifikat belum diunggah." / 401 | Sesuai | Lulus |

## Ringkasan

- Uji browser: 12/12 skenario UI lulus (talent, TS, HR Client; desktop dan HP). Hak akses per role diuji lewat API: 7/7 akun sesuai.
- Backend: `php artisan test` 727 lulus; `php artisan migrate:fresh --seed` di MySQL berjalan tanpa error (6 sertifikat demo berfile).
- `npm run build` tanpa error.
