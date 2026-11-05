# Blackbox Testing — Unduhan Dokumen Bertanda Tangan (Gambar, File Asli, Thumbnail)

**Lingkup:** frontend & backend (branch `pembaruan/unduh-dokumen-ttd` di kedua repo).

## Prasyarat

- Diuji 2026-11-05 di Chrome headless lewat puppeteer, terhadap backend asli dengan database uji terpisah hasil `migrate:fresh --seed`.
- Akun demo (password `password`):
  - `talent@` (Budi Santoso, ditempatkan di PT Maju Jaya);
  - `hr@` (PT Maju Jaya), `manager@`;
  - `hr03@` (PT Sinar Digital Nusantara) dan `talent01@` (talent lain) untuk uji akses.
- Lebar desktop 1366 px dan 768 px, HP 390 px.
- File uji:
  - `surat-keterangan.png`: 1240×1754 px, potret, mirip hasil pindai;
  - `kartu-pelatihan.jpg`: 1000×630 px, lanskap.
- Isi PDF hasil unduhan diperiksa dengan PyMuPDF (jumlah halaman, ukuran halaman, gambar, teks) dan dirender ke gambar untuk dilihat.

## Talent: unggah gambar, tanda tangan, unduh

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| T-01 | Unggah dokumen gambar | Dokumen → Unggah Dokumen → pilih file, jenis Lainnya, penempatan PT Maju Jaya → Unggah | `surat-keterangan.png` | Dokumen tersimpan, status Menunggu Tanda Tangan dengan penandatangan Budi; nama file unduhan `surat-keterangan.pdf` | Sesuai; detail dokumen langsung terbuka | Lulus |
| T-02 | Tombol sebelum ditandatangani | Lihat detail dokumen | — | Tombol "Unduh Dokumen" dan "Unduh File Asli"; belum ada thumbnail tanda tangan | Sesuai | Lulus |
| T-03 | Tanda tangan & thumbnail | Gambar tanda tangan di canvas → Tanda Tangani | Goresan | Di bagian Penandatangan muncul thumbnail tanda tangan di samping nama, peran, status, dan waktu; tombol berubah menjadi "Unduh Dokumen (dengan tanda tangan)" | Thumbnail "Tanda tangan Budi Santoso" tampil; label tombol berubah | Lulus |
| T-04 | Unduh versi bertanda tangan | Klik "Unduh Dokumen (dengan tanda tangan)" | — | File `surat-keterangan.pdf`: halaman 1 gambar dokumen utuh & proporsional (A4 potret), halaman 2 Lembar Pengesahan dengan tanda tangan Budi Santoso | `surat-keterangan.pdf` 2 halaman A4 (595×842 pt): gambar surat utuh; Lembar Pengesahan memuat Budi Santoso, gambar tanda tangan, "Ditandatangani", dan waktunya | Lulus |
| T-05 | Unduh file asli | Klik "Unduh File Asli" | — | `surat-keterangan.png` identik dengan file yang diunggah | Identik (byte sama) | Lulus |
| T-06 | Tampilan HP | Detail dokumen di 390 px | — | Tombol unduh dan thumbnail rapi, tanpa geser horizontal | Sesuai | Lulus |
| T-07 | Gambar JPG lanskap | Unggah lalu unduh (lewat API) | `kartu-pelatihan.jpg` | Unduhan `kartu-pelatihan.pdf`; halaman 1 A4 lanskap berisi gambar, halaman 2 Lembar Pengesahan ("Belum ditandatangani") | Halaman 1 842×595 pt (lanskap), halaman 2 Lembar Pengesahan | Lulus |

## Role lain

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| H-01 | HR Client klien penempatan | Dokumen → `surat-keterangan.png` | `hr@` | Thumbnail tampil; tombol "Unduh Dokumen (dengan tanda tangan)" ada, "Unduh File Asli" tidak ada; `GET /dokumen/{id}/file-asli` → 403 "File asli hanya dapat diunduh oleh pengunggah dokumen dan tim internal." | Sesuai | Lulus |
| M-01 | Manager (internal) | Dokumen → `surat-keterangan.png` | `manager@` | Thumbnail, "Unduh Dokumen (dengan tanda tangan)", dan "Unduh File Asli" | Sesuai | Lulus |
| M-02 | Dokumen seeder dengan beberapa penandatangan | Dokumen → `kontrak-kerja-dimas-prasetyo.pdf` | `manager@` | Thumbnail untuk setiap penandatangan yang sudah menandatangani | 3/3 thumbnail: Dimas Prasetyo, Andi Pratama, Hendra Gunawan | Lulus |
| M-03 | Tata letak drawer | Detail dokumen di 1366, 768, dan 390 px | `manager@` | Semua tombol berada di dalam drawer, tanpa geser horizontal | Sesuai (ditemukan dan diperbaiki: "Unduh File Asli" sempat keluar dari drawer di desktop) | Lulus |

## Hak akses

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| A-01 | Gambar tanda tangan | `GET /dokumen/{id}/tanda-tangan/{id_ttd}/gambar` | `talent@`, `hr@`, `manager@`, `hr03@`, `talent01@` | Yang boleh melihat dokumen: 200 `image/png` inline; lainnya 403 | talent/hr/manager 200 inline; hr03 & talent01 403 | Lulus |
| A-02 | File asli per role (backend) | Test `PdfTandaTanganTest` | AM, TS, Manager, pengunggah; HR Client | Internal & pengunggah 200; HR Client 403 | Sesuai | Lulus |
| A-03 | DOCX & gambar rusak (backend) | Test `PdfTandaTanganTest` | `kontrak.docx`, PNG tidak valid | Dikirim apa adanya dengan nama aslinya; `unduhan.diolah` = false untuk DOCX | Sesuai | Lulus |

## Penanganan tipe file unggahan

| Tipe | Saat diunduh (sudah ada penandatangan) |
|------|----------------------------------------|
| PDF buatan sistem | Dirender ulang dengan blok tanda tangan |
| PDF unggahan | PDF asli + Lembar Pengesahan |
| PNG/JPG | PDF: halaman gambar + Lembar Pengesahan, nama `.pdf` |
| DOC/DOCX | File asli apa adanya; di detail tertulis bahwa tanda tangan tidak dapat dicetak ke file Word, status tanda tangan tetap terlihat di bagian Penandatangan |

## Ringkasan

- Uji browser: 12/12 skenario lulus (talent, HR Client, Manager; desktop & HP), ditambah 1 cek akses API (5 akun).
- Backend: `php artisan test` 733 lulus; `php artisan migrate:fresh --seed` berjalan tanpa error.
- `npm run build` tanpa error.
