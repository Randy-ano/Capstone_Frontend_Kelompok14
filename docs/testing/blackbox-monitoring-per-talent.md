# Blackbox Testing — Monitoring Kinerja per Talent

**Lingkup:** revisi alur dari tim. Monitoring dilakukan utamanya oleh HR Client (catatan absensi, shift, kinerja harian); Manager menambah catatan atau memberi Surat Peringatan (SP) dengan dokumen; AM & TS hanya melihat; talent melihat riwayat miliknya. Tampilan daftar log diganti grid kartu per talent + panel linimasa.

## Prasyarat

- Diuji 2026-11-06 di Chrome headless lewat puppeteer, terhadap backend asli (`php -S localhost:8001`) dengan database uji terpisah hasil `migrate:fresh --seed` (MySQL), dan frontend `vite` di port 5174.
- Akun (password `password`): `hr@` (PT Maju Jaya), `manager@`, `am@`, `ts@`, `talent@` (Budi), serta akun talent Wahyu untuk notifikasi SP.
- Data seed: catatan HR Client untuk Budi, Dimas, Salsabila, Yoga, Wahyu, Putri; satu catatan kunjungan Manager (Wahyu); SP 1 untuk Yoga dengan dokumen Surat Peringatan; Nadia berstatus Belum Aktif (mulai minggu depan), Putri berstatus Selesai.
- Backend: `php artisan test` 802 lulus; `migrate:fresh --seed` tanpa error; `npm run build` tanpa error.

## HR Client

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| MP-01 | Grid kartu talent di perusahaannya | `hr@` → Monitoring Kinerja | – | Default status Aktif; hanya talent PT Maju Jaya; kartu berisi nama, posisi, klien, status kontrak, periode, sisa hari, jumlah catatan & SP; tanpa filter klien | Kartu Budi, Dimas, Salsabila "Aktif" dengan periode, "Sisa … hari", jumlah catatan, "Tanpa SP"; Yoga (klien lain) tidak tampil; filter klien tidak ada | Lulus |
| MP-02 | Tambah catatan | Klik kartu Salsabila → Tambah Catatan → Simpan kosong → isi → Simpan | "Absensi lengkap minggu ini; shift malam berjalan lancar." | Kosong ditolak; tersimpan dan tampil paling atas linimasa dengan nama & peran pencatat; tombol Beri SP tidak ada | Pesan wajib diisi; toast "Catatan monitoring berhasil disimpan."; entri teratas "Dicatat oleh Sari Wulandari (HR Client)"; hanya tombol Tambah Catatan | Lulus |
| MP-03 | Tampilan HP | Grid & panel Budi di lebar 390 px | – | Tanpa geser horizontal | Kartu selebar layar (358 px), panel tanpa geser horizontal | Lulus |
| MP-04 | Batas hak HR Client (API) | POST catatan untuk Yoga (klien lain); POST SP untuk Salsabila | – | 403 dengan pesan jelas | 403 "Anda hanya dapat mencatat monitoring untuk talent yang ditempatkan di perusahaan Anda." · 403 "Surat Peringatan hanya dapat diberikan oleh Manager." | Lulus |

## Manager

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| MP-05 | Badge SP di kartu | `manager@` → Monitoring Kinerja | – | Kartu Yoga menampilkan "SP 1" (teks) | "2 catatan · SP 1" | Lulus |
| MP-06 | Filter status kontrak | Pilih Belum Aktif, lalu Selesai; buka Putri | – | Nadia "Belum Aktif" dengan hari menuju mulai; Putri "Selesai"; penempatan tidak aktif tanpa tombol tambah | Nadia "Mulai dalam 7 hari"; Putri tampil, panel berisi "Catatan baru hanya dapat ditambahkan saat penempatan berstatus Aktif." | Lulus |
| MP-07 | Linimasa dengan SP | Kembali ke Aktif → buka Yoga | – | Terbaru di atas; SP berbeda ikon & label, tautan dokumen SP, pencatat Manager; catatan HR Client di bawahnya; filter klien tersedia untuk internal | "Surat Peringatan · SP 1" (ikon palu, bingkai merah), tautan surat-peringatan-1-yoga-pratama.pdf, "Dicatat oleh Hendra Gunawan (Manager)"; dua catatan "(HR Client)"; filter 4 klien | Lulus |
| MP-08 | Beri SP dengan dokumen | Buka Wahyu → Beri SP → isi alasan → kirim tanpa dokumen → Unggah baru → pilih PDF → Beri SP | contoh.pdf | Tanpa dokumen ditolak; dokumen SP diunggah lewat fitur Dokumen, SP tercatat, talent dinotifikasi | Pesan "Surat Peringatan wajib melampirkan dokumen Surat Peringatan."; toast "Surat Peringatan berhasil dicatat."; jumlah SP Wahyu 1; notifikasi talent "Surat Peringatan 1 diberikan kepada Wahyu Nugroho …" | Lulus |
| MP-09 | Dashboard | `GET /dashboard/ringkasan` Manager & HR Client | – | Kartu talent ditempatkan menyesuaikan monitoring dan menuju Monitoring Kinerja | Manager: "2 talent dengan SP" → /monitoring-kinerja; HR Client: "1 catatan monitoring bulan ini" → /monitoring-kinerja | Lulus |

## AM, TS, Talent

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| MP-10 | AM & TS hanya melihat | `am@`, `ts@` → Monitoring Kinerja → buka Yoga; POST catatan lewat API | – | Linimasa tampil tanpa tombol Tambah Catatan / Beri SP; POST 403 | Keduanya melihat linimasa (termasuk SP 1), tanpa tombol; POST 403 | Lulus |
| MP-11 | Talent melihat riwayatnya (HP) | `talent@` lebar 390 px → Penempatan Saya → tab Monitoring; POST lewat API | – | Ringkasan penempatan + linimasa miliknya, read-only; tanpa geser horizontal | 1 penempatan; catatan hr@ tampil; tanpa tombol tambah; POST 403; tanpa geser horizontal | Lulus |
| MP-12 | Hak akses & aturan (test backend) | `MonitoringKeluhanTest`, `RelasiModelTest`, `SeederTest` | HR klien lain, SP oleh HR, SP tanpa dokumen / dokumen jenis lain / milik talent lain / ditolak / sudah dipakai, penempatan Belum Aktif & Selesai, AM/TS/talent mencatat, scope lihat per role, kartu per talent & filter | 403/422 sesuai aturan; nomor SP berurutan; notifikasi SP ke talent & HR Client | Semua lulus | Lulus |

**Ringkasan:** 12/12 lulus.
