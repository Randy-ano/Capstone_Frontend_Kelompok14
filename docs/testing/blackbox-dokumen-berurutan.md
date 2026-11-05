# Blackbox Testing — Dokumen Kerja Sama Berurutan & Penempatan Setelah Kontrak

**Lingkup:** revisi alur dari tim. Per permintaan kebutuhan: kandidat diterima di evaluasi → Quotation (AM ke HR Client) → Purchase Order (HR Client) → PKS (AM/Manager dengan HR Client) → Kontrak Kerja (per kandidat) → Talent Support membuat penempatan. Satu dokumen dianggap selesai jika berstatus ditandatangani (semua penandatangan sudah tanda tangan).

## Prasyarat

- Diuji 2026-11-06 di Chrome headless lewat puppeteer, terhadap backend asli (`php -S localhost:8001`) dengan database uji terpisah hasil `migrate:fresh --seed` (MySQL), dan frontend `vite` di port 5174.
- Akun (password `password`): `am@`, `hr@` (+ `hr02@`, HR Client kedua PT Maju Jaya), `manager@`, `ts@`, `talent@intellisys.test`, serta akun talent kandidat uji.
- Kandidat uji dibuat lewat API: `hr@` membuat permintaan "Mobile Developer" (diajukan) → `ts@` mengusulkan talent tersedia (Citra Dewi) → `am@` meneruskan → `hr@` lanjut interview → `am@` interview hari ini lalu ditandai selesai → `hr@` evaluasi **diterima**. Langkah dokumen sesudahnya diuji lewat UI.
- Sebagian tanda tangan dilakukan lewat API (kecuali yang disebut "canvas") agar pengujian fokus pada urutan.
- Backend: `php artisan test` 787 lulus; `migrate:fresh --seed` tanpa error; `npm run build` tanpa error.

## Alur satu kandidat

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| DB-01 | PO sebelum Quotation selesai | `hr@` mengunggah PO untuk Mobile Developer (API) | jenis purchase_order | Ditolak 422 dengan pesan yang menyebut dokumen yang kurang | 422 "Purchase Order belum bisa diunggah: Quotation untuk permintaan ini belum selesai ditandatangani." | Lulus |
| DB-02 | Penempatan terkunci sebelum dokumen lengkap | `ts@` → Pengajuan Kandidat → buka Citra Dewi | – | Daftar periksa tampil, tombol Buat Penempatan nonaktif dengan daftar yang kurang | Kelengkapan Dokumen: 4× "Belum ada"; pesan "Penempatan belum bisa dibuat. Dokumen yang belum selesai ditandatangani: Quotation, Purchase Order, PKS, Kontrak Kerja."; tombol nonaktif | Lulus |
| DB-03 | Quotation oleh AM | `am@` → Dokumen → Unggah Dokumen → jenis Quotation → pilih permintaan → file → Unggah → Minta Tanda Tangan | contoh.pdf | Jenis hanya yang boleh untuk AM; permintaan hanya yang memenuhi urutan; HR Client dicentang otomatis | Jenis AM: Quotation, PKS, Kontrak Kerja, Surat Peringatan, Lainnya (tanpa PO); pilihan: "Mobile Developer — PT Maju Jaya"; tercentang otomatis Sari Wulandari (hr@) & Bambang Sutrisno (hr02@) | Lulus |
| DB-04 | HR Client menandatangani Quotation | `hr@` membuka `/dokumen-quotation-po?dokumen=ID` → gambar di canvas → Tanda Tangani; `hr02@` menandatangani | goresan canvas | Drawer dokumen terbuka dari tautan; setelah semua tanda tangan status ditandatangani | Drawer terbuka langsung; status Quotation "ditandatangani" | Lulus |
| DB-05 | PO oleh HR Client | `hr@` → Unggah Dokumen → Purchase Order → Mobile Developer → Minta Tanda Tangan; Manager menandatangani | contoh.pdf | Jenis untuk HR: PO, Surat Peringatan, Lainnya; Manager dicentang otomatis | Sesuai; tercentang otomatis Hendra Gunawan (Manager) | Lulus |
| DB-06 | PKS oleh Manager | `manager@` → Unggah Dokumen → PKS → Mobile Developer → Minta Tanda Tangan; Manager & HR menandatangani | contoh.pdf | Jenis untuk Manager: PKS, Surat Peringatan, Lainnya; Manager + HR Client dicentang otomatis | Sesuai; tercentang otomatis Sari Wulandari, Bambang Sutrisno, Hendra Gunawan | Lulus |
| DB-07 | Daftar periksa di Detail Permintaan | `hr@` → Permintaan Kebutuhan → Mobile Developer | – | Quotation, PO, PKS "Selesai" (teks + tautan file), Kontrak Kerja kandidat "Belum ada" | 3 langkah "Selesai" dengan nama file bertaut; Citra Dewi "Belum ada"; "Tahap saat ini: Kontrak Kerja: 0 dari 1 selesai." | Lulus |
| DB-08 | Kontrak Kerja oleh AM | `am@` → Unggah Dokumen → Kontrak Kerja → pilih kandidat → Minta Tanda Tangan | contoh.pdf | Pilihan hanya kandidat diterima yang PKS-nya selesai & belum ditempatkan; talent + Manager dicentang otomatis | Pilihan: Maya Sari (Frontend, data demo) dan Citra Dewi (Mobile Developer); tercentang otomatis Citra Dewi & Hendra Gunawan | Lulus |
| DB-09 | Kolom Dokumen di Pipeline | `am@` → Pipeline Rekrutmen | – | Tahap dokumen tampil sebagai teks | Mobile Developer: "Kontrak Kerja: 0 dari 1 selesai · 3 dari 4 langkah selesai" | Lulus |
| DB-10 | Talent belum ditempatkan menandatangani kontrak (HP) | Login talent Citra Dewi di lebar 390 px → Dokumen → buka kontrak → gambar di canvas → Tanda Tangani | goresan canvas | Menu Dokumen terbuka walau belum ditempatkan; tanda tangan tersimpan; tanpa geser horizontal | "Menunggu tanda tangan Anda" tampil; `akses_dokumen` true, `sudah_ditempatkan` false; tanda tangan tersimpan; tanpa geser horizontal | Lulus |
| DB-11 | TS membuat penempatan | Setelah Manager menandatangani kontrak: `ts@` buka Citra Dewi → isi tanggal mulai → Buat Penempatan | tanggal mulai +7 hari | Daftar periksa lengkap; penempatan berhasil; Kontrak Kerja ditautkan ke penempatan | "Semua dokumen selesai ditandatangani…"; toast "Penempatan berhasil dibuat."; kontrak berisi `id_placement` penempatan baru | Lulus |
| DB-12 | Detail Pengajuan di HP (HR Client) | `hr@` lebar 390 px → Pengajuan Kandidat → Citra Dewi | – | Keempat langkah "Selesai" dengan teks; tanpa geser horizontal | 4× "Selesai"; tanpa geser horizontal | Lulus |

## Data demo, tampilan, dan hak akses

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| DB-13 | Kandidat diterima dengan dokumen belum lengkap | `am@` → detail pengajuan Intan Permata (Data Analyst) | data seed | Quotation & PO selesai, PKS menunggu tanda tangan | "Quotation: Selesai · Purchase Order: Selesai · PKS: Menunggu tanda tangan · Kontrak Kerja: Belum ada" (Quotation pertama ditolak HR tercatat di Dokumen) | Lulus |
| DB-14 | talent@ dan perpanjangan kontrak | `talent@` → Dokumen, filter perlu tanda tangan | data seed | Perpanjangan kontrak Budi menunggu tanda tangan talent@ | perpanjangan-kontrak-budi-santoso.pdf | Lulus |
| DB-15 | Pipeline di HP | `manager@` lebar 390 px → Pipeline Rekrutmen | – | Indikator dokumen per permintaan; tanpa geser horizontal | Terlihat "PKS: Menunggu tanda tangan", "Dokumen lengkap", dan "Belum dimulai" (belum ada kandidat diterima); tanpa geser horizontal | Lulus |
| DB-16 | Hak unggah per role | `GET /dokumen/tujuan`: HR → quotation, AM → purchase_order, TS → quotation, Manager → kontrak_kerja | – | Ditolak 403 | Semua 403 | Lulus |
| DB-17 | Urutan, hak unggah, dan penempatan (test backend) | `DokumenBerurutanTest` (25 test) | Quotation tanpa kandidat diterima; PO/PKS/Kontrak saat dokumen sebelumnya menunggu; dokumen ganda yang masih berjalan; role tidak berhak; PO untuk klien lain; penempatan sebelum kontrak | 422 / 403 dengan pesan yang menyebut dokumen yang kurang; penempatan ditolak sampai Kontrak Kerja selesai | Semua lulus | Lulus |

**Ringkasan:** 17/17 lulus.

**Catatan:** Quotation PT Maju Jaya menyarankan kedua HR Client klien (hr@ dan hr02@), sehingga dokumen baru selesai setelah keduanya menandatangani. Penandatangan yang disarankan tetap bisa diubah sebelum dikirim.
