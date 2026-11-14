# Blackbox Testing — Surat Akhir Penempatan

**Lingkup:** feedback SUS — mengakhiri penempatan menghasilkan dokumen formal (R37). Status **Selesai** → "Surat Keterangan Selesai Penempatan" (PDF), **Dihentikan** → "Surat Pemberhentian Penempatan" (PDF, alasan wajib). Isi: kop PT Intellisys IT Outsourcing, nomor dokumen, nama talent, klien, posisi, periode penempatan, tanggal berakhir, alasan (dihentikan), dan tanda tangan Manager lewat mekanisme tanda tangan dokumen yang sudah ada. Surat masuk menu Dokumen dan Histori Dokumen di detail penempatan; dapat diunduh talent bersangkutan, AM, Manager, dan HR Client kliennya; Talent Support dan role/pihak lain ditolak. Talent menerima notifikasi (in-app; email bila mailer aktif). PDF memakai dompdf (library yang sama dengan CV). **Tanpa migration.**

## Prasyarat

- Backend `php artisan migrate:fresh --seed` (database uji terpisah) di `http://localhost:8001`; frontend dev server di `http://localhost:5174` dengan `VITE_API_URL=http://localhost:8001/api/v1`.
- Akun (password `password`): `manager@`, `ts@`, `am@`, `hr06@` (HR PT Nusantara Retail Indonesia, klien Wahyu), `hr@` (HR PT Maju Jaya), `talent05@` (Wahyu Nugroho), `talent04@` (Salsabila Putri).
- Data demo: penempatan Putri (Selesai) sudah punya Surat Keterangan Selesai Penempatan `001/SKSP/ITS/IV/2026` yang ditandatangani Manager.
- Diuji 2026-11-14 dengan Chrome headless (puppeteer) di lebar 1366 px dan 390 px + pemanggilan API; isi PDF dirender dan dibaca dengan PyMuPDF. Test backend: `tests/Feature/Rekrutmen/DokumenAkhirPenempatanTest.php` (18 test), seluruh suite 852 test lulus.

## Mengakhiri penempatan

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| AP-01 | Dihentikan tanpa alasan | Manager → Penugasan Penempatan → Wahyu → Akhiri Penempatan → "Dihentikan" → kirim | Alasan kosong | Kolom alasan muncul; keterangan surat yang akan dibuat; pesan "Alasan penghentian wajib diisi bila penempatan dihentikan." | Sesuai | Lulus |
| AP-02 | Dihentikan dengan alasan | Isi alasan → "Akhiri Penempatan" | "Klien menutup proyek retail lebih awal." | Toast "Penempatan dihentikan. Surat Pemberhentian Penempatan dibuat dan menunggu tanda tangan Manager."; Histori Dokumen memuat surat (Menunggu Tanda Tangan); alasan tampil di detail; form akhiri hilang | Sesuai | Lulus |
| AP-03 | Tautan histori → menu Dokumen | Klik surat di Histori Dokumen | - | Detail Dokumen terbuka; penandatangan Manager; tombol "Tanda Tangani" untuk Manager | Detail Dokumen #35, penandatangan Hendra Gunawan (Manager), tombol tersedia | Lulus |
| AP-04 | Manager menandatangani | `POST /dokumen/35/tanda-tangan` (gambar PNG) | keputusan ditandatangani | Status dokumen `ditandatangani`; PDF unduhan memuat gambar tanda tangan Manager | 200, `ditandatangani`; PDF: kop, nomor `001/SPHP/ITS/XI/2026`, data penempatan, kotak alasan, tanda tangan Hendra Gunawan | Lulus |
| AP-12 | Selesai oleh Talent Support | TS → Salsabila → "Selesai (kontrak berakhir)" → Akhiri | - | Tanpa kolom alasan; toast menyebut Surat Keterangan Selesai Penempatan dibuat; Histori Dokumen TS tidak memuat surat | Sesuai (histori TS hanya Kontrak Kerja) | Lulus |
| AP-14 | Notifikasi Selesai & permintaan tanda tangan | Cek notifikasi Salsabila & Manager | - | Talent menerima notifikasi surat dibuat; Manager menerima permintaan tanda tangan; surat `menunggu_ttd` | Pesan talent: "Surat Keterangan Selesai Penempatan untuk penempatan Anda sebagai Frontend Developer di PT Maju Jaya telah dibuat dan menunggu tanda tangan Manager. …" | Lulus |
| AP-16 | Unggah manual jenis surat | AM `POST /dokumen/upload` jenis `surat_selesai_penempatan` | PDF | 422 (jenis hanya dibuat sistem) | 422 "jenis dokumen yang dipilih tidak valid." | Lulus |
| AP-17 | Tanggal default penghentian | Manager → Dimas → pilih Dihentikan, lalu Selesai, lalu Dihentikan dan kirim | Alasan "Klien melakukan efisiensi tim." | Dihentikan → tanggal hari ini; Selesai → tanggal akhir kontrak; surat mencetak tanggal penghentian hari ini; nomor berurutan | 2027-05-12 → 2026-11-14 → 2027-05-12; surat `002/SPHP/ITS/XI/2026` "Dihentikan per tanggal 14 November 2026" | Lulus |

## Akses per role

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| AP-05 | Notifikasi talent | Login Wahyu → Notifikasi | - | 2 notifikasi: surat dibuat & ditandatangani | 2 notifikasi tampil | Lulus |
| AP-06 | Talent membuka menu Dokumen setelah penempatan berakhir | Klik notifikasi | - | Menuju menu Dokumen; surat tampil di daftar | Sesuai | Lulus |
| AP-07 | Talent mengunduh | `GET /dokumen/35/download` token Wahyu | - | 200 PDF | 200 `application/pdf` | Lulus |
| AP-08 | Penempatan Saya (talent) | Buka detail penempatan | - | Alasan penghentian + Histori Dokumen (surat Ditandatangani) | Sesuai | Lulus |
| AP-09 | HR Client klien & AM | Unduh + daftar Dokumen (`hr06@`), unduh + file asli (AM) | - | 200; surat ada di daftar HR | hr06@ 200 & tampil; AM 200, file asli 200 | Lulus |
| AP-10 | HR Client klien lain & Talent Support ditolak | `hr@` unduh/daftar; TS detail/unduh/detail penempatan | - | 403, tidak ada di daftar; TS 403 dan histori/alasan tidak tampil untuk TS | hr@ 403 "Anda tidak memiliki akses ke dokumen ini."; TS 403 (detail & unduh); detail penempatan TS tanpa surat, `alasan_penghentian` null | Lulus |
| AP-11 | HR Client melihat histori | `hr06@` → Penugasan Penempatan → Wahyu | - | Surat & alasan tampil; tanpa form akhiri | Sesuai | Lulus |
| AP-13 | Filter jenis untuk TS | TS → menu Dokumen → filter jenis | - | Tidak ada opsi surat akhir penempatan | Sesuai | Lulus |

## Tampilan

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| AP-15 | Lebar HP | Lebar 390 px, Manager → detail Budi → pilih Dihentikan, gulir ke bawah | - | Tidak ada gulir horizontal; histori & form alasan rapi | Lebar dokumen 390 px, luapan 0 px | Lulus |

**Ringkasan:** 17/17 skenario lulus.
