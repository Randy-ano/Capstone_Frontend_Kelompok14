# Blackbox Testing — Fase 6: Cuti, Shift, Monitoring, Tiket Komplain

**FR:** FR-14 (cuti), FR-15 (shift), FR-18 (monitoring), FR-19 (laporan keluhan)
**Halaman:** `/pengajuan-cuti-shift` (Talent, HR Client, Manager), `/monitoring-kinerja` (Account Manager, Manager), `/tiket-komplain-klien` (HR Client, Account Manager, Manager)
**Endpoint:** `GET/POST /cuti`, `PATCH /cuti/{id}/approval`, `PATCH /cuti/{id}/batal`, `GET/POST /shift`, `PUT/DELETE /shift/{id}`, `GET/POST /monitoring`, `GET/POST /laporan-keluhan`, `PATCH /laporan-keluhan/{id}/tindak-lanjut`, `GET /placement`

## Prasyarat

- Backend `php artisan migrate:fresh --seed && php artisan serve` (MySQL Laragon menyala). Data seed: Budi Santoso (`talent@`) ditempatkan di PT Maju Jaya dengan shift minggu ini & minggu depan (Sen–Jum pagi, Sab–Min libur), 1 cuti menunggu (H+10 s.d. H+11), 1 catatan monitoring, 1 tiket "Dokumentasi kode kurang lengkap" berstatus baru.
- Frontend `npm run dev`, buka `http://localhost:5173`. Akun: `talent@`, `hr@`, `manager@`, `am@`, `ts@intellisys.test` (password `password`).
- Diuji 2026-10-22 di Chrome (headless, puppeteer), berurutan dari data seed bersih.

## A. Talent — Cuti & Shift

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| O-01 | Daftar cuti sendiri | Login talent, buka **Pengajuan Cuti & Shift** | - | 1 cuti menunggu, persetujuan Klien & Manager "Menunggu", hanya tombol **Batalkan** | Sesuai | Lulus |
| O-02 | Tanggal tumpang tindih | **Ajukan Cuti** → tanggal H+11 s.d. H+12 → **Kirim** | Alasan "Uji tumpang tindih." | Penempatan terpilih otomatis; pesan backend "Tanggal cuti bertumpang tindih dengan cuti lain yang masih menunggu atau sudah disetujui." | Sesuai | Lulus |
| O-03 | Ajukan cuti | Ubah tanggal → **Kirim** | H+20 s.d. H+21 | "Pengajuan cuti berhasil dikirim."; daftar menjadi 2 | Sesuai | Lulus |
| O-04 | Batalkan cuti | **Batalkan** → **Ya** pada cuti baru | - | "Pengajuan cuti dibatalkan."; status Dibatalkan | Sesuai | Lulus |
| O-05 | Lihat shift | Tab **Jadwal Shift** | - | Shift bulan ini (tanggal, jenis, keterangan, diatur oleh), "Hari ini" ditandai; tanpa tombol Atur/Ubah/Hapus; API `POST /shift` 403 | 13 baris; API 403 | Lulus |
| O-06 | Halaman lain | Buka `/monitoring-kinerja`, `/tiket-komplain-klien` | - | "Akses Ditolak", menu tidak tampil | Sesuai | Lulus |

## B. HR Client

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| O-07 | Setujui sisi klien | Cuti "pernikahan" → **Setujui** → **Ya** | - | "Keputusan disimpan. Menunggu keputusan pihak lain."; "Klien: Disetujui (Sari Wulandari)", Manager masih Menunggu, tombol hilang | Sesuai | Lulus |
| O-08 | Validasi atur shift | Tab Shift → **Atur Shift** → **Simpan** tanpa isian | - | "Kolom placement wajib diisi.", "Pilih minimal 1 tanggal shift." | Sesuai | Lulus |
| O-09 | Input massal | Talent Budi, Senin–Minggu dua minggu lagi, hari Sen–Jum, Siang → **Simpan 5 Shift** | - | Pratinjau "5 tanggal akan diatur."; "5 shift dibuat." | Sesuai | Lulus |
| O-10 | Di luar periode | `POST /shift` tanggal 2020-01-01 | - | 422 "Tanggal shift harus dalam periode placement (…)." | Sesuai | Lulus |
| O-11 | Ubah & hapus shift | Baris pertama → **Ubah** → Malam → **Simpan**; lalu **Hapus** → **Ya, Hapus** | - | "Shift berhasil diperbarui.", "Shift berhasil dihapus." | Sesuai | Lulus |
| O-12 | Buat tiket | **Tiket Komplain Klien** → **Buat Laporan** kosong → isi → kirim | "Sering terlambat hadir" | Ringkasan awal 1/1/0/0; validasi talent, judul, deskripsi; "Laporan keluhan berhasil dikirim."; tabel 2 tiket | Sesuai | Lulus |
| O-13 | Monitoring | Buka `/monitoring-kinerja` | - | "Akses Ditolak" | Sesuai | Lulus |

## C. Manager

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| O-14 | Cuti disetujui (R21) | Cuti "pernikahan" → **Setujui** → **Ya** | - | "Cuti disetujui."; badge Disetujui; "Manager: Disetujui (Hendra Gunawan)" | Sesuai | Lulus |
| O-15 | Catat monitoring | **Monitoring Kinerja** → **Catat Monitoring** dengan waktu H+2 & kosong → perbaiki → simpan | "Komunikasi dengan tim klien membaik." | Validasi: penempatan, hasil, "Tanggal monitoring tidak boleh di masa depan."; lalu "Monitoring berhasil dicatat.", catatan baru di atas | Sesuai | Lulus |
| O-16 | Selesaikan tiket | Tiket "Sering terlambat hadir" → Selesai tanpa hasil → isi hasil → simpan | - | "Hasil tindak lanjut wajib diisi saat laporan diselesaikan."; lalu "Laporan ditandai selesai.", form hilang (final) | Sesuai | Lulus |

## D. Account Manager & Talent Support

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| O-17 | AM melihat & memproses | Monitoring (tanpa tombol catat); tiket "Dokumentasi kode" → **Simpan Tindak Lanjut** (Diproses) | - | "Laporan sedang diproses.", penindak lanjut Andi Pratama; API `GET /cuti` 403 | Sesuai | Lulus |
| O-18 | AM cuti & shift | Buka `/pengajuan-cuti-shift` | - | "Akses Ditolak" | Sesuai | Lulus |
| O-19 | TS | Buka ketiga halaman | - | Semua "Akses Ditolak", menu tidak tampil; API `GET /monitoring` 403 | Sesuai | Lulus |

## E. Tampilan HP (375px)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| O-HP1 | Cuti (talent) | Buka halaman, **Ajukan Cuti** | - | Tanpa scroll horizontal; modal selebar layar | `scrollWidth` 375, form 375 | Lulus |
| O-HP2 | Shift (HR) | Tab shift, **Atur Shift** | - | Tabel bergeser di dalam kartunya; modal selebar layar | 375 / 375 | Lulus |
| O-HP3 | Tiket (HR) | **Buat Laporan** | - | Kartu ringkasan 2 kolom; modal selebar layar | 375 / 375 | Lulus |
| O-HP4 | Monitoring (Manager) | **Catat Monitoring** | - | Kartu catatan satu kolom; modal selebar layar | 375 / 375 | Lulus |
