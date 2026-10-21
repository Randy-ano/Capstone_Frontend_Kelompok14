# Blackbox Testing — Fase 5: Pengajuan Kandidat, Jadwal Interview, Evaluasi, Penugasan Penempatan

**FR:** FR-10 (pengajuan), FR-11 (interview), FR-12 (evaluasi), FR-17 (placement)
**Halaman:** `/pengajuan-kandidat`, `/jadwal-interview`, `/penugasan-penempatan` (semua role, data sesuai scope)
**Endpoint:** `GET/POST /pengajuan`, `GET /pengajuan/{id}`, `PATCH /pengajuan/{id}/status`, `GET/POST /interview`, `PUT /interview/{id}`, `POST /evaluasi`, `GET/POST /placement`, `GET /placement/{id}`, `PATCH /placement/{id}/status`, `GET /screening?hasil=lolos&belum_diajukan=1`

## Prasyarat

- Backend di `http://localhost:8000` setelah `php artisan migrate:fresh --seed`. Data demo job **Backend Developer** (PT Maju Jaya, butuh 2): Budi Santoso sudah diajukan → interview kemarin selesai → evaluasi diterima (belum placement); Gamblang Winarno screening `pending`; Jefri Putra tidak lolos.
- Persiapan uji: TS menyatakan screening Gamblang `lolos`.
- Frontend `npm run dev`, dibuka di `http://localhost:5173`. Akun `am@`, `hr@` (PT Maju Jaya), `ts@`, `manager@`, `talent@` (Budi), password `password`.
- Diuji 2026-10-21 di Chrome (headless, lewat puppeteer), berurutan dari data seed bersih.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| F-01 | Daftar pengajuan (AM) | Login AM, buka **Pengajuan Kandidat** | - | 1 baris: Budi Santoso, tahap "Diterima, menunggu placement" | Sesuai | Lulus |
| F-02 | Ajukan kandidat (R14) | **Ajukan Kandidat** → pilih Gamblang → **Ajukan** | - | Modal hanya berisi kandidat lolos yang belum diajukan; "Kandidat berhasil diajukan ke klien."; drawer terbuka berstatus "Menunggu Tinjauan"; AM tidak punya tombol tinjau | Sesuai | Lulus |
| F-03 | Scope HR Client | Login HR, buka **Pengajuan Kandidat** | - | 2 pengajuan ke job kliennya | Sesuai | Lulus |
| F-04 | Tinjau (R15) | Buka Gamblang → **Lanjut Interview** | - | "Kandidat dilanjutkan ke tahap interview."; status Lanjut Interview | Sesuai | Lulus |
| F-05 | Validasi jadwal | **Jadwalkan** → **Simpan Jadwal** tanpa isian | - | "Kolom tanggal interview wajib diisi.", "Kolom waktu interview wajib diisi." | Sesuai | Lulus |
| F-06 | Jadwalkan interview (R16) | Isi tanggal hari ini, 09:00, link → **Simpan Jadwal** | `https://meet.google.com/uji-e2e` | "Interview berhasil dijadwalkan."; Ronde 1 tampil | Sesuai | Lulus |
| F-07 | Jadwal ulang | **Jadwal Ulang** → waktu 13:00 → **Simpan Jadwal** | `13:00` | Status menjadi "Dijadwal Ulang", jam 13.00 | Sesuai | Lulus |
| F-08 | Selesai + validasi evaluasi | **Tandai Selesai** → **Simpan Evaluasi** kosong | - | Form "Beri Evaluasi" muncul; "Kolom nilai wajib diisi.", "Kolom hasil evaluasi wajib diisi." | Sesuai | Lulus |
| F-08b | Error hilang saat diperbaiki | Isi nilai & pilih hasil | `85`, Diterima | Pesan error lama hilang | Sesuai | Lulus |
| F-09 | Evaluasi (R17) | **Simpan Evaluasi** | Catatan "Cocok untuk tim." | "Evaluasi berhasil disimpan."; tampil "Nilai 85"; tombol jadwal interview hilang | Sesuai | Lulus |
| F-10 | Halaman Jadwal Interview | Buka **Jadwal Interview** | - | Jadwal Gamblang hari ini (label "Hari ini") berstatus Selesai | Sesuai | Lulus |
| F-11 | Placement pertama (R18) | Login TS, buka Budi → isi tanggal mulai → **Buat Placement** | hari ini | "Placement berhasil dibuat."; "Kandidat sudah ditempatkan." | Sesuai | Lulus |
| F-12 | Placement kedua | Sama untuk Gamblang | hari ini | Placement dibuat | Sesuai | Lulus |
| F-13 | R19: job terpenuhi | Cek `GET /job-requirements/1` | - | `status_req` terpenuhi, terpenuhi 2/2 | Sesuai | Lulus |
| F-14 | Tautan ke placement | Buka Budi → **Lihat Placement** | - | Pindah ke `/penugasan-penempatan?placement=…`, detail Budi terbuka, 2 placement | Sesuai | Lulus |
| F-15 | R20: akhiri placement (TS) | Pilih "Selesai (kontrak berakhir)" → **Akhiri Penempatan** | tanggal kosong | "Placement ditandai selesai."; Budi kembali tersedia di talent pool | Sesuai | Lulus |
| F-16 | Talent hanya melihat | Login Talent (Budi), buka pengajuan miliknya | - | 1 baris; tanpa tombol Ajukan; drawer menampilkan hasil "Diterima" tanpa nilai, tanpa skor kecocokan, tanpa tombol aksi | Sesuai | Lulus |
| F-17 | Scope talent & API | Buka **Penugasan Penempatan**; `PATCH /pengajuan/1/status` | - | Hanya placement miliknya; API 403 | Sesuai | Lulus |
| F-18 | Manager menghentikan | Login Manager, buka Gamblang → "Dihentikan" → **Akhiri Penempatan** | - | "Placement dihentikan."; form akhiri hilang | Sesuai | Lulus |
| F-19 | HR tidak bisa mengakhiri | Login HR, buka placement; `PATCH /placement/1/status` | - | Tanpa form akhiri; API 403 | Sesuai | Lulus |
| F-HP/pengajuan-kandidat | Tampilan HP | 375px, buka drawer | - | Tanpa scroll horizontal; drawer selebar layar | `scrollWidth` 375, drawer 375px | Lulus |
| F-HP/jadwal-interview | Tampilan HP | 375px, buka drawer | - | Sama | `scrollWidth` 375, drawer 375px | Lulus |
| F-HP/penugasan-penempatan | Tampilan HP | 375px, buka drawer | - | Sama | `scrollWidth` 375, drawer 375px | Lulus |

Catatan: notifikasi ke talent/HR Client saat interview dijadwalkan (R16, R30) dibuat di Fase 8.
