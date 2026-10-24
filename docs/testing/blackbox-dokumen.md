# Blackbox Testing — Fase 7: Dokumen & Tanda Tangan Digital

**FR:** FR-13 (R25–R28)
**Halaman:** `/dokumen-quotation-po` (semua role, sesuai scope)
**Endpoint:** `GET /dokumen`, `POST /dokumen/upload`, `POST /dokumen/generate`, `GET /dokumen/{id}/download`, `GET /dokumen/{id}/calon-penandatangan`, `POST /dokumen/{id}/penandatangan`, `POST /dokumen/{id}/tanda-tangan`

## Prasyarat

- Backend `php artisan migrate:fresh --seed && php artisan serve` (MySQL Laragon menyala). Data seed: quotation `QUO/…/001` PT Maju Jaya menunggu tanda tangan Manager & HR (`hr@`), PO `PO/…/014` PT Sinar Digital Nusantara draft; Budi (`talent@`) ditempatkan di PT Maju Jaya.
- Frontend `npm run dev`, buka `http://localhost:5173`. Akun: `am@`, `hr@`, `manager@`, `talent@`, `ts@intellisys.test` (password `password`).
- File uji: `Kontrak Kerja Budi.pdf`, `PO Klien.png`, `catatan.txt`.
- Diuji 2026-10-22 di Chrome (headless, puppeteer), berurutan dari data seed bersih.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| D-01 | Daftar (AM) | Login AM, buka **Dokumen (Quotation & PO)** | - | 2 dokumen seed; tombol **Buat dari Template** & **Unggah Dokumen** | Sesuai | Lulus |
| D-02 | Validasi template | **Buat dari Template** → **Buat Dokumen** tanpa isian | - | Pesan backend: klien, nomor dokumen, perihal, deskripsi item, harga satuan wajib diisi | Sesuai | Lulus |
| D-03 | Buat quotation (R26) | Klien PT Maju Jaya, nomor `QUO/2026/10/777`, perihal, 1 item Rp18.000.000 → **Buat Dokumen** | - | Total Rp18.000.000 tampil; "Quotation berhasil dibuat."; drawer `quotation-quo-2026-10-777.pdf` dengan calon penandatangan (internal + HR PT Maju Jaya) | Sesuai | Lulus |
| D-04 | Atur penandatangan (R27) | Centang Hendra Gunawan & Sari Wulandari → **Minta Tanda Tangan (2)** | - | "Penandatangan berhasil ditentukan. Dokumen menunggu tanda tangan."; status Menunggu Tanda Tangan; form atur hilang | Sesuai | Lulus |
| D-05 | Unduh terproteksi | **Unduh Dokumen** | - | Request ber-token 200 `application/pdf`, nama `quotation-quo-2026-10-777.pdf` | 200, nama sesuai | Lulus |
| D-06 | Unggah (R25) | **Unggah Dokumen** → `catatan.txt` → Unggah; lalu `Kontrak Kerja Budi.pdf`, Kontrak Kerja, penempatan Budi | - | `.txt` ditolak "File harus berformat PDF, DOC, DOCX, PNG, atau JPG."; PDF terunggah sebagai `kontrak-kerja-budi.pdf` dengan klien PT Maju Jaya & talent Budi | Sesuai | Lulus |
| D-07 | Scope HR Client | Login HR | - | 3 dokumen PT Maju Jaya (PO klien lain tidak tampil); tombol "Perlu Tanda Tangan Saya" menunjukkan 2 | Sesuai | Lulus |
| D-08 | Tanda tangan (R28) | Filter perlu tanda tangan → quotation 001 → **Tanda Tangani** tanpa gambar; lalu gambar di canvas → **Tanda Tangani** | - | "Gambar tanda tangan wajib diunggah untuk menandatangani."; lalu "Tanda tangan tersimpan. Menunggu penandatangan lain.", status HR Ditandatangani | Sesuai | Lulus |
| D-09 | Tolak (R28) | Quotation 777 → **Tolak** → **Ya, Tolak** | - | "Dokumen ditolak."; HR tercatat Menolak | Sesuai | Lulus |
| D-10 | HR unggah | Unggah `PO Klien.png` jenis Purchase Order | - | Klien otomatis PT Maju Jaya; tanpa tombol template; API generate 403 | Sesuai | Lulus |
| D-11 | Semua menandatangani | Login Manager → quotation 001 → gambar tanda tangan → **Tanda Tangani** | - | "Dokumen telah ditandatangani semua pihak."; status Ditandatangani; bagian tanda tangan hilang | Sesuai | Lulus |
| D-12 | Scope talent | Login talent; unggah `Kontrak Kerja Budi.pdf` jenis Lainnya | - | Hanya kontrak miliknya tampil; dokumen baru otomatis atas nama Budi; unduh quotation klien 403 | Sesuai | Lulus |
| D-13 | Talent Support | Login TS | - | Melihat semua dokumen tanpa tombol unggah/template; API generate 403 | Sesuai | Lulus |
| D-HP | Tampilan HP | Lebar 375px: daftar, modal template, drawer | - | Tanpa scroll horizontal; modal & drawer selebar layar | 375 / 375 / 375 | Lulus |

## Revisi 2026-10-24 — calon penandatangan per jenis dokumen & unggahan talent

Baris D-03 (calon "internal + HR") dan D-12 (unggahan talent berstatus draft) di atas diuji 2026-10-22 dengan aturan lama. Aturan baru (R27): quotation/PO/PKS → AM, Manager, HR Client klien dokumen; kontrak kerja/surat peringatan → talent terkait, AM, Manager; lainnya → AM, Manager, HR Client klien, talent terkait; Talent Support tidak pernah menjadi penandatangan; dokumen unggahan talent otomatis ditandatangani talent itu sendiri. Diuji 2026-10-24 di Chrome (headless).

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| R-01 | Calon kontrak kerja | AM unggah kontrak kerja untuk penempatan Budi, buka drawer | `kontrak-budi.pdf` | Pilihan: Andi Pratama (AM), Hendra Gunawan (Manager), Budi Santoso (talent); tanpa Sari Wulandari (HR) & Rina Kartika (TS); keterangan "Untuk dokumen ini: Talent terkait, Account Manager, dan Manager." | Sesuai | Lulus |
| R-02 | Calon quotation | AM buat quotation PT Maju Jaya, buka drawer | `QUO/UJI/001` | Pilihan: Andi Pratama, Sari Wulandari, Hendra Gunawan; tanpa Budi (talent) & Rina (TS) | Sesuai | Lulus |
| R-03 | Penandatangan di luar aturan | `POST /dokumen/{quotation}/penandatangan` berisi talent | `id_user` Budi | 422 "Penandatangan tidak sesuai jenis dokumen. Pilih dari daftar calon penandatangan." | Sesuai | Lulus |
| R-04 | Catatan unggah talent | Login talent → **Unggah Dokumen** | - | Catatan "Dokumen yang Anda unggah langsung menunggu tanda tangan Anda sendiri; penandatangan tidak perlu dipilih." | Sesuai | Lulus |
| R-05 | Talent langsung tanda tangan | Unggah `uji.pdf` jenis Lainnya | - | Drawer: status Menunggu Tanda Tangan, penandatangan Budi; bagian "Tanda Tangan Anda" dengan tombol **Tanda Tangani**; tanpa "Pilih penandatangan" | Sesuai | Lulus |
| R-06 | Talent menandatangani | Unggah gambar tanda tangan → **Tanda Tangani** | `ttd.png` | "Dokumen telah ditandatangani semua pihak." | Sesuai | Lulus |
| R-07 | Talent tidak bisa mengatur | `GET /dokumen/{id}/calon-penandatangan` token talent | - | 403 "Penandatangan dokumen yang diunggah talent ditentukan otomatis (talent itu sendiri)." | Sesuai | Lulus |
| R-08 | Tampilan HP (talent) | Drawer di lebar 390 px | - | Tanpa geser samping | Lebar 390 px | Lulus |
