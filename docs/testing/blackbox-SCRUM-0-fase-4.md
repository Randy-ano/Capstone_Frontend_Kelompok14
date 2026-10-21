# Blackbox Testing — Fase 4: Permintaan Kebutuhan, Rekomendasi Kandidat, Screening, Pipeline Rekrutmen

**FR:** FR-05 (job requirement), FR-07 (rekomendasi), FR-08 (screening), FR-09 (progres & SLA)
**Halaman:** `/permintaan-kebutuhan` (HR Client, AM, TS, Manager), `/rekomendasi-kandidat` (TS), `/pipeline-rekrutmen` (AM, TS, Manager)
**Endpoint:** `GET/POST /job-requirements`, `GET/PUT /job-requirements/{id}`, `PATCH /job-requirements/{id}/status`, `GET /job-requirements/{id}/rekomendasi`, `GET /job-requirements/{id}/progres`, `GET /progres`, `GET/POST /screening`, `PUT /screening/{id}`, `GET /klien`, `GET /kompetensi`

## Prasyarat

- Backend di `http://localhost:8000` setelah `php artisan migrate:fresh --seed`. Data seed: 5 job (Backend Developer **diproses** dengan 3 screening: Budi Santoso lolos, Gamblang Winarno pending, Jefri Putra tidak lolos; Frontend Developer SLA mendekati; QA Engineer SLA terlambat; Mobile Developer diajukan; Data Analyst draft).
- Frontend `npm run dev`, dibuka di `http://localhost:5173`. Akun: `hr@`, `am@`, `ts@`, `manager@`, `talent@intellisys.test` (password `password`). HR demo bekerja di PT Maju Jaya.
- Diuji 2026-10-21 di Chrome (headless, lewat puppeteer), berurutan dari data seed bersih (skenario selanjutnya memakai data hasil skenario sebelumnya).

## A. HR Client — Permintaan Kebutuhan

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| HR-01 | Hanya job klien sendiri | Login HR, buka **Permintaan Kebutuhan** | - | 2 job PT Maju Jaya; filter klien tidak tampil | 2 baris PT Maju Jaya, tanpa filter klien | Lulus |
| HR-02 | Kartu ringkasan | Lihat 4 kartu | - | Total 2, Diproses 1, SLA Terlambat 0, Mendekati 1 | 2 / 1 / 0 / 1 | Lulus |
| HR-MENU | Menu internal tersembunyi | Lihat sidebar | - | Tidak ada Pipeline Rekrutmen & Rekomendasi Kandidat | Tidak tampil | Lulus |
| HR-03 | Validasi dari backend | **Buat Permintaan** → kosongkan → **Simpan Draft** | Semua kosong | Pesan per field: "Kolom posisi wajib diisi.", "Kolom SLA deadline wajib diisi.", "Pilih minimal 1 kompetensi." | Ketiga pesan tampil di bawah field | Lulus |
| HR-03b | Error hilang saat diperbaiki | Setelah HR-03 ketik posisi | `DevOps Engineer` | Error posisi hilang; pesan umum backend tetap tampil | Sesuai | Lulus |
| ESC-01 | Escape di dropdown kompetensi | Buka pilihan kompetensi, tekan Escape | - | Hanya dropdown yang tertutup, form tetap terbuka | Form tetap terbuka | Lulus |
| HR-04 | Buat & ajukan | Isi posisi, jumlah 1, SLA +20 hari, kompetensi Docker & AWS → **Simpan & Ajukan** | `DevOps Engineer` | Drawer detail terbuka, "Job requirement berhasil dibuat.", status Diajukan, log "Kebutuhan diajukan" (R8) | Sesuai | Lulus |
| HR-05 | Data milik HR | Lihat drawer | - | AM "Belum ditentukan"; bagian "Kandidat di-screening" tidak tampil untuk HR | Sesuai | Lulus |
| HR-06 | Ubah | **Ubah** → jumlah 2 → **Simpan Perubahan** | `2` | "Job requirement berhasil diperbarui.", kebutuhan 0/2 | Sesuai | Lulus |
| HR-07 | Batalkan | **Batalkan** → **Ya, Batalkan** | - | "Job requirement berhasil dibatalkan.", status Dibatalkan, tombol aksi hilang | Sesuai | Lulus |
| HR-08 | Daftar diperbarui | Tutup drawer (Escape) | - | Tabel 3 baris, kartu Total 3 | Sesuai | Lulus |
| HR-09 | Job klien lain | `GET /job-requirements/3` dengan token HR | - | 403 "Anda tidak memiliki akses ke job requirement ini." | 403, pesan sesuai | Lulus |
| HR-10 | Halaman internal | Buka `/pipeline-rekrutmen` | - | Halaman "Akses Ditolak" | Sesuai | Lulus |

## B. Account Manager

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| AM-01 | Semua job | Login AM, buka **Permintaan Kebutuhan** | - | Semua job (6), filter klien tampil | 6 baris, filter klien ada | Lulus |
| AM-02 | Filter dari kartu | Klik kartu **SLA Terlambat** | - | Hanya QA Engineer dengan badge Terlambat | Sesuai | Lulus |
| AM-03 | Klien wajib untuk AM | **Buat Permintaan** tanpa memilih klien → **Simpan Draft** | `Tes Klien` | "Kolom klien wajib diisi." | Sesuai | Lulus |
| AM-04 | Simpan draft | Pilih klien PT Sinar Digital Nusantara → **Simpan Draft** | - | Drawer: status Draft, klien sesuai, "Belum ada progres" | Sesuai | Lulus |
| AM-05 | Ajukan draft | **Ajukan** | - | "Job requirement berhasil diajukan.", log "Kebutuhan diajukan" dengan PJ Andi Pratama | Sesuai | Lulus |
| AM-06 | Pipeline | Buka **Pipeline Rekrutmen** | - | Urut deadline terdekat (QA Engineer terlambat paling atas); Backend Developer progres terakhir "Kandidat ditolak" | Sesuai | Lulus |
| AM-07 | Detail di pipeline | Klik Backend Developer | - | 3 kandidat di-screening (Lolos, Menunggu, Tidak Lolos); job diproses tidak bisa diubah (tanpa tombol Ubah) | Sesuai | Lulus |
| AM-08 | Rekomendasi khusus TS | Buka `/rekomendasi-kandidat` | - | "Akses Ditolak", menu tidak tampil | Sesuai | Lulus |

## C. Talent Support — Rekomendasi & Screening

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| TS-01 | TS tidak membuat job | Buka **Permintaan Kebutuhan** | - | Tanpa tombol Buat Permintaan | Sesuai | Lulus |
| TS-02 | Dari detail ke rekomendasi | Buka Backend Developer → **Cari Kandidat** | - | Pindah ke `/rekomendasi-kandidat?job=1` | Sesuai | Lulus |
| TS-03 | Daftar kandidat (R9) | Lihat daftar | - | Jumlah kartu = API ("5 kandidat direkomendasikan"); skor, rincian kompetensi 80% & pengalaman 20%, kompetensi cocok ✓ / kurang ✗ | 5 kartu, sama dengan API | Lulus |
| TS-04 | Sudah di-screening | Panel kanan | - | 3 kandidat (Budi, Gamblang, Jefri) dan tidak muncul di daftar rekomendasi | Sesuai | Lulus |
| TS-05 | Screening (R10) | Kandidat teratas → **Screening** → catatan → **Konfirmasi Screening** | `Uji E2E.` | "Screening berhasil dibuat. … masuk tahap screening."; kandidat pindah ke panel (4 kandidat) | Sesuai | Lulus |
| TS-06 | Peringatan hasil final | **Ubah hasil** → pilih Tidak Lolos | - | Peringatan hasil final tampil | Sesuai | Lulus |
| TS-07 | Simpan tidak lolos | **Simpan** | - | "Screening berhasil diperbarui."; tombol berubah menjadi "Ubah catatan" | Sesuai | Lulus |
| TS-08 | R11 | Cek API screening | - | Talent tersebut kembali `tersedia` | `tersedia` | Lulus |
| TS-09 | Pending → lolos | Gamblang Winarno → **Ubah hasil** → Lolos → **Simpan** | - | Pesan sukses | Sesuai | Lulus |
| TS-10 | Job belum diajukan | Buka `/rekomendasi-kandidat?job=5` (draft) | - | "Permintaan tidak ditemukan atau sudah tidak terbuka…" | Sesuai | Lulus |
| TS-11 | API job draft | `GET /job-requirements/5/rekomendasi` | - | 422 "Kandidat hanya dapat dicari untuk job requirement berstatus diajukan atau diproses." | 422, pesan sesuai | Lulus |
| TS-12 | Log progres (R12) | Pipeline → Backend Developer | - | 4 log screening + "Kandidat ditolak" terbaru paling atas | Sesuai | Lulus |

## D. Manager & Talent

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| M-01 | Pipeline Manager | Login Manager, buka **Pipeline Rekrutmen** | - | Semua job (7) | 7 baris | Lulus |
| M-02 | Hanya melihat | Buka detail Frontend Developer | - | Tanpa Cari Kandidat, Ajukan, Batalkan | Sesuai | Lulus |
| M-03 | Tanpa tombol buat | Buka **Permintaan Kebutuhan** | - | Tanpa tombol Buat Permintaan | Sesuai | Lulus |
| M-04 | Rekomendasi | Buka `/rekomendasi-kandidat` | - | "Akses Ditolak" | Sesuai | Lulus |
| T-01 | Talent ditolak | Login Talent, buka `/permintaan-kebutuhan` dan `/pipeline-rekrutmen`; `GET /job-requirements` | - | Kedua halaman "Akses Ditolak"; API 403 | Sesuai | Lulus |

## E. Tampilan HP (lebar 375px)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| HP-hr | Permintaan Kebutuhan + form | HR, buka halaman lalu **Buat Permintaan** | - | Tanpa scroll horizontal; form tampil penuh dari bawah, tombol tersusun vertikal | `scrollWidth` 375, form 375px | Lulus |
| HP-ts | Rekomendasi Kandidat | TS, buka `?job=1` | - | Kartu kandidat & panel screening tersusun satu kolom | `scrollWidth` 375 | Lulus |
| HP-am | Pipeline Rekrutmen | AM | - | Tabel bergeser di dalam kartunya, halaman tidak | `scrollWidth` 375 | Lulus |

## Regresi

E2E Talent Pool (SCRUM-11, 27 skenario) dijalankan ulang setelah komponen bersama dipindah ke `src/components/ui.jsx`: 27/27 lulus.
