# Blackbox Testing — Revisi Bimbingan: Rekomendasi, Master Skill, Kisaran Gaji

**Lingkup:** frontend & backend (branch `pembaruan/revisi-rekomendasi` di kedua repo).

## Prasyarat

- Diuji 2026-11-05 di Chrome headless lewat puppeteer, terhadap backend asli dengan database uji terpisah hasil `migrate:fresh --seed`.
- Akun demo (password `password`): `manager@`, `am@`, `ts@`, `hr@` (PT Maju Jaya), `talent@intellisys.test` (Budi).
- Lebar desktop 1366 px, HP 390 px.
- Skor minimum rekomendasi `RekomendasiService::SKOR_MINIMUM` = 70.

## Penyebab kompetensi tampil dobel

Relasi kompetensi tidak dobel (pivot `talent_kompetensi` dan `job_req_kompetensi` punya primary key gabungan). Yang dobel adalah isi data: seeder mengisi `talent_pool.tag_keahlian` dengan tiga nama kompetensi pertama talent (mis. "Laravel, MySQL, REST API"). Kartu Rekomendasi Kandidat dan detail Talent Pool menampilkan tag tersebut di bawah daftar kompetensi, sehingga Laravel, Git, dan MySQL terlihat dua kali.

Perbaikan:
- Seeder mengisi tag dengan bidang kerja (mis. "Pengembangan Backend, Integrasi API").
- Frontend menyembunyikan tag yang namanya sama dengan kompetensi yang sudah tampil, sehingga data lama yang sudah terlanjur dobel pun rapi.
- Kartu rekomendasi menampilkan setiap kompetensi permintaan sekali, dengan tanda cocok (centang) atau belum dimiliki (silang), ditambah ringkasan "x dari n cocok".

## Rekomendasi Kandidat (Talent Support)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| R-01 | Kompetensi tidak dobel | Buka Rekomendasi Kandidat, pilih Fullstack Developer | `ts@` | Setiap kompetensi muncul sekali per kartu, tanda cocok/belum | 2 kandidat; Laravel/React/Git/REST API/MySQL masing-masing sekali | Lulus |
| R-02 | Skor minimum | Lihat skor kandidat | Fullstack Developer | Semua skor ≥ 70 | 84 dan 74 | Lulus |
| R-03 | Ringkasan kecocokan | Lihat kartu | Fullstack Developer | "Kompetensi permintaan: x dari 5 cocok" | Tampil di setiap kartu | Lulus |
| R-04 | Tidak ada kandidat ≥ 70 | Pilih Frontend Developer | Skor tertinggi 60 | Keterangan "Menampilkan kandidat dengan skor minimal 70."; keadaan kosong menjelaskan alasannya | Sesuai | Lulus |
| R-05 | Tampilan HP | Buka rekomendasi | 390 px | Tidak ada geser horizontal | Sesuai | Lulus |
| R-06 | Batas skor (backend) | Test `RekomendasiTest` | Skor 70, 65, 60 | Hanya skor 70 yang tampil; `meta.skor_minimum` = 70 | Sesuai | Lulus |
| R-07 | Data demo (backend) | Test `SeederTest` | Hasil seed | Minimal 2 permintaan berjalan punya ≥ 2 kandidat ≥ 70 | QA Engineer (73,33; 73,33) dan Fullstack Developer (84; 74) | Lulus |
| P-01 | Detail Talent Pool | Buka detail talent | `ts@` | Tag keahlian tidak mengulang nama kompetensi | Kompetensi: SQL, Data Analysis, Power BI, Excel; tag: Analisis Data | Lulus |

## Master Data Skill & pemilih kompetensi

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| S-01 | Beberapa kata kunci | Ketik di kolom cari | `ts@`, "laravel, react, sql" | Kompetensi yang mengandung salah satu kata kunci | Laravel, MySQL, PostgreSQL, React, SQL | Lulus |
| S-02 | Beberapa kategori | Pilih kategori Database dan Frontend | `manager@` | Hanya kompetensi kedua kategori; tombol menampilkan "Kategori (2)"; chip kategori bisa dihapus | MongoDB, MySQL, PostgreSQL, React, SQL, Vue | Lulus |
| S-03 | Kata kunci + kategori | Tambahkan cari "sql, vue" | `manager@` | Irisan keduanya | MySQL, PostgreSQL, SQL, Vue | Lulus |
| S-04 | Tampilan HP | Master Data Skill di 390 px | `manager@` | Tidak ada geser horizontal | Sesuai | Lulus |
| S-05 | Filter di backend | Test `KelolaKompetensiTest` | `search` berkoma, `kategori[]`, `kategori` tunggal, kategori > 255 karakter | Hasil sesuai; 422 untuk kategori tidak valid | Sesuai | Lulus |
| M-01 | Pemilih di form permintaan | Buka pemilih kompetensi, cari | `hr@`, "git, sql" | Opsi Git, MySQL, PostgreSQL, SQL; tombol "Pilih semua hasil" | Sesuai | Lulus |
| K-01 | Pemilih di filter Talent Pool | Cari di filter kompetensi | `ts@`, "laravel, react" | Laravel dan React | Sesuai | Lulus |
| K-02 | Pemilih di Profil & CV Saya (HP) | Cari di pemilih kompetensi | `talent@`, 390 px, "laravel, react" | Laravel dan React; tanpa geser horizontal | Sesuai | Lulus |

## Kisaran gaji di permintaan kebutuhan

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| G-05 | Input berpemisah ribuan | Ketik gaji minimal | `hr@`, 12000000 | Tampil "12.000.000" | "12.000.000" | Lulus |
| G-06 | Gaji maksimal < minimal | Simpan Draft | Min 12.000.000, maks 8.000.000 | 422 "Gaji maksimal tidak boleh lebih kecil dari gaji minimal." tampil | Sesuai | Lulus |
| G-01 | HR membuat permintaan dengan gaji | Isi posisi, SLA, kompetensi, gaji, Simpan Draft | Min 8.000.000, maks 12.000.000 | Tersimpan; detail menampilkan "Rp8.000.000 – Rp12.000.000" | Sesuai | Lulus |
| G-02 | Manager melihat gaji | Buka detail QA Engineer | `manager@` | "Kisaran gaji: Rp8.000.000 – Rp12.000.000" | Sesuai | Lulus |
| G-03 | AM melihat gaji | Sama | `am@` | Sama | Sesuai | Lulus |
| G-04 | TS melihat gaji | Sama | `ts@` | Sama | Sesuai | Lulus |
| G-07 | Form di HP | Buka form permintaan | `hr@`, 390 px | Field gaji rapi, tanpa geser horizontal | Sesuai | Lulus |
| G-08 | Talent tidak melihat gaji | Buka Permintaan Kebutuhan lewat URL; buka detail Proses Seleksi; panggil API | `talent@` | Akses ditolak; detail tanpa gaji; `GET /job-requirements/{id}` 403; respons pengajuan tanpa `gaji_min`/`gaji_maks` | Sesuai | Lulus |
| G-09 | Ubah sebagian (backend) | Test `GajiJobRequirementTest` | Kirim `gaji_maks` saja, lebih kecil dari `gaji_min` tersimpan | 422; kirim keduanya → tersimpan; null → dikosongkan | Sesuai | Lulus |

## Ringkasan

- Uji browser: 21/21 lulus (TS, Manager, AM, HR Client, talent; desktop dan HP).
- Backend: `php artisan test` 683 lulus; `php artisan migrate:fresh --seed` di MySQL berjalan tanpa error.
- `npm run build` tanpa error.
