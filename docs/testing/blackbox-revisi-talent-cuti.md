# Blackbox Testing — Revisi Bimbingan: Role Talent & Cuti

**Lingkup:** frontend & backend (branch `pembaruan/revisi-talent-cuti` di kedua repo).

## Prasyarat

- Diuji 2026-11-05 (Kamis) di Chrome headless lewat puppeteer, terhadap backend asli dengan database uji terpisah hasil `migrate:fresh --seed`.
- Akun demo (password `password`): `manager@`, `am@`, `ts@`, `hr@` (PT Maju Jaya), `talent@intellisys.test` (Budi, sudah ditempatkan). Talent belum ditempatkan dibuat lewat halaman Daftar saat pengujian.
- Lebar desktop 1366 px, HP 390 px.
- Kuota cuti 12 hari kerja per tahun (`CutiService::KUOTA_HARI_KERJA_PER_TAHUN`); data demo Budi memakai 4 hari kerja di 2026 (sisa awal 8).

## Tampilan talent tanpa kolom nama sendiri

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| T-01 | Penempatan Saya tanpa kolom Talent | Login talent, buka Penempatan Saya | `talent@` | Kolom Posisi, Klien, Periode, Status; nama talent tidak tampil; badge status tampil "Aktif" | Kolom Posisi/Klien/Periode/Status, tanpa nama, badge Aktif | Lulus |
| T-02 | Menu talent yang sudah ditempatkan | Lihat sidebar | `talent@` | Menu "Pengajuan Cuti & Shift" dan "Dokumen" tampil | Keduanya tampil | Lulus |
| T-03 | Tab Monitoring Penempatan Saya | Buka tab Monitoring | `talent@` | Tanpa nama talent, badge memakai `label_status_tampil` | Tanpa nama, badge Aktif | Lulus |
| T-04 | Proses Seleksi tanpa kolom Kandidat | Buka Proses Seleksi | `talent@` | Kolom pertama "Posisi & Klien", tanpa kolom Kandidat | Kolom Posisi & Klien/Diajukan/Tahap Saat Ini/Status | Lulus |
| T-05 | Jadwal Interview tanpa kolom Kandidat | Buka Jadwal Interview | `talent@` | Tanpa kolom Kandidat | Kolom Jadwal/Posisi & Klien/Link / Lokasi/Status | Lulus |
| M-01 | Kartu HP Penempatan Saya | Buka Penempatan Saya di HP | `talent@`, 390 px | Kartu tanpa nama, tidak ada geser horizontal | Sesuai | Lulus |
| M-03 | Kartu HP Proses Seleksi | Buka Proses Seleksi di HP | `talent@`, 390 px | Kartu tanpa nama, tidak ada geser horizontal | Sesuai | Lulus |

## Status tampil penempatan (Belum Aktif / Aktif / Selesai)

Diuji di backend (`tests/Feature/Rekrutmen/StatusTampilPlacementTest.php`) dengan tanggal tetap, karena data demo hanya berisi penempatan yang sedang berjalan.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| ST-01 | Penempatan belum mulai | `GET /placement`, `/placement/{id}`, `/monitoring` | status `aktif`, `tanggal_mulai` besok | `status_tampil` `belum_aktif`, label "Belum Aktif" | Sesuai | Lulus |
| ST-02 | Penempatan berjalan | Sama | status `aktif`, mulai hari ini / sudah lewat, selesai hari ini / nanti | `aktif`, "Aktif" | Sesuai | Lulus |
| ST-03 | Penempatan selesai | Sama | status `selesai`/`dihentikan`, atau `tanggal_selesai` kemarin | `selesai`, "Selesai" | Sesuai | Lulus |

## Talent belum ditempatkan

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| B-01 | Menu tersembunyi | Daftar akun talent baru, lihat sidebar | Nama, email baru, password | Menu "Pengajuan Cuti & Shift" dan "Dokumen" tidak tampil; "Profil & CV Saya" tampil | Sesuai | Lulus |
| B-02 | Akses cuti lewat URL | Buka `/pengajuan-cuti-shift` langsung | Talent baru | Halaman Akses Ditolak: "Fitur ini tersedia setelah Anda ditempatkan di perusahaan klien." | Sesuai | Lulus |
| B-03 | Akses dokumen lewat URL | Buka `/dokumen-quotation-po` langsung | Talent baru | Sama dengan B-02 | Sesuai | Lulus |
| B-04 | Backend menolak | `GET /cuti`, `/shift`, `/dokumen`, `/auth/me` dengan token talent baru | Talent baru | Tiga endpoint 403 dengan pesan di atas; `/auth/me` `sudah_ditempatkan: false` | 403/403/403, `sudah_ditempatkan: false` | Lulus |
| B-08 | Penempatan berakhir menutup akses | Test backend | Penempatan selesai, dihentikan, atau lewat tanggal selesai | 403; penempatan belum mulai tetap membuka akses | Sesuai (`CutiTest`) | Lulus |

## Pengalaman kerja

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| B-05 | Opsi "Skripsi" | Profil & CV Saya → Pengalaman Kerja → Tambah, buka pilihan Jenis pekerjaan | Talent baru | Opsi berisi Skripsi | Full-time, Part-time, Kontrak, Magang, Freelance, Skripsi | Lulus |
| B-06 | Field Deskripsi pekerjaan | Lihat baris pengalaman baru | Talent baru | Textarea "Deskripsi pekerjaan" tampil | Tampil | Lulus |
| B-07 | Form profil di HP | Lihat form di 390 px | Talent baru | Tidak ada geser horizontal | Sesuai | Lulus |
| P-01 | Detail Talent Pool | Buka detail talent di Talent Pool | `ts@` | Pengalaman kerja menampilkan jenis pekerjaan dan deskripsi | Sesuai | Lulus |
| H-03 | Detail Pengajuan Kandidat | Buka detail pengajuan | `hr@` | Bagian "Pengalaman Kerja" berisi deskripsi pekerjaan | Sesuai | Lulus |
| CV-01 | CV PDF | Test backend: render `pdf.talent-cv` | Pengalaman jenis Skripsi + deskripsi | Jenis pekerjaan dan deskripsi tercetak | Sesuai (`CvTalentTest`) | Lulus |

## Cuti: hanya HR Client, hari kerja, dan kuota

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| C-01 | Daftar cuti talent | Buka Pengajuan Cuti & Shift | `talent@` | Tanpa tombol Setujui/Tolak; status persetujuan hanya "HR Client"; lama dalam hari kerja | Sesuai | Lulus |
| C-02 | Form ajukan cuti | Klik Ajukan Cuti | `talent@` | "Sisa kuota 2026: 8 hari kerja"; tanggal mulai minimal besok | Sisa 8, `min` = 2026-11-06 | Lulus |
| C-03 | Lama cuti melewati akhir pekan | Pilih tanggal | 20–24 Nov 2026 (Jumat–Selasa) | "Lama cuti: 3 hari kerja" | Sesuai | Lulus |
| C-04 | Hanya Sabtu/Minggu | Pilih tanggal, kirim | 21–22 Nov 2026 | Peringatan di form; backend 422 "Rentang tanggal cuti hanya berisi hari Sabtu/Minggu. Pilih minimal satu hari kerja." tampil | Sesuai | Lulus |
| C-05 | Melebihi kuota | Pilih tanggal, kirim | 30 Nov–18 Des 2026 (15 hari kerja) | Peringatan "melebihi sisa kuota"; backend 422 "Sisa kuota cuti tahun 2026 adalah 8 hari kerja, sedangkan pengajuan ini 15 hari kerja." | Sesuai | Lulus |
| C-06 | Pengajuan sah | Kirim | 20–24 Nov 2026, alasan diisi | Tersimpan; daftar menampilkan "3 hari kerja (5 hari kalender)" | Sesuai | Lulus |
| C-07 | Sisa kuota berkurang | Buka form lagi | - | Sisa kuota 8 → 5 | 8 → 5 | Lulus |
| M-02 | Form cuti di HP | Buka form di 390 px | `talent@` | Tidak ada geser horizontal | Sesuai | Lulus |
| H-01 | HR Client menyetujui | Klik Setujui → Ya pada cuti menunggu | `hr@` | Toast "Cuti disetujui."; status langsung Disetujui | Sesuai | Lulus |
| R-01 | Manager hanya melihat | Buka Pengajuan Cuti & Shift | `manager@` | Daftar tampil tanpa tombol Setujui/Tolak; keterangan "Keputusan cuti oleh HR Client" | Sesuai | Lulus |
| R-02 | Manager memanggil API approval | `PATCH /cuti/2/approval` | `manager@`, `keputusan: disetujui` | 403 "Anda tidak memiliki akses ke fitur ini." | 403, pesan sesuai | Lulus |
| R-04 | AM hanya melihat | Buka menu | `am@` | Menu tampil, hanya tab Cuti, tanpa tombol keputusan | Sesuai | Lulus |
| R-05 | TS hanya melihat | Buka menu | `ts@` | Sama dengan R-04 | Sesuai | Lulus |
| C-08 | Validasi lain (backend) | Test backend | Mulai hari ini; di luar periode penempatan; tumpang tindih; lintas tahun | 422 dengan pesan masing-masing; kuota lintas tahun dihitung per tahun | Sesuai (`CutiTest`) | Lulus |

## Shift dibatalkan, bukan dihapus

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| H-02 | HR membatalkan shift | Tab Jadwal Shift → Batalkan → Ya, Batalkan | `hr@` | Toast "Shift berhasil dibatalkan."; baris tetap tampil dengan badge Dibatalkan; tidak ada tombol Hapus | Sesuai | Lulus |
| R-03 | Manager | Tab Jadwal Shift | `manager@` | Tombol Ubah & Batalkan, tanpa Hapus | Sesuai | Lulus |
| S-01 | Talent melihat shift dibatalkan | Tab Jadwal Shift | `talent@` | Shift 11 Nov tampil dengan badge Dibatalkan, tanpa tombol aksi | Sesuai | Lulus |
| S-02 | Route hapus tidak ada | Test backend `DELETE /shift/{id}` | Manager | 405; data tetap | Sesuai (`ShiftTest`) | Lulus |
| S-03 | Aktif lagi lewat Atur Shift | Test backend: input massal pada tanggal yang dibatalkan | Manager | Shift diperbarui dan kembali aktif; shift dibatalkan tidak bisa diubah lewat PUT (422) | Sesuai (`ShiftTest`) | Lulus |

## Ringkasan

- Uji browser: 32/32 lulus (talent sudah ditempatkan, talent baru, HR Client, Manager, AM, TS; desktop dan HP).
- Backend: `php artisan test` 673 lulus; `php artisan migrate:fresh --seed` di MySQL berjalan tanpa error.
- `npm run build` tanpa error.
