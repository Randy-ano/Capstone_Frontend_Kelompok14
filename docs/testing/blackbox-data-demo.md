# Blackbox Testing — Data Demo, Pesan, dan Status Pengajuan

**Lingkup:** data demo seeder, istilah pesan backend, `status_tampil` pengajuan beserta filternya, dan label Dashboard.

## Prasyarat

- Diuji 2026-11-01 di Chrome headless lewat puppeteer, terhadap backend asli dengan database uji terpisah hasil `migrate:fresh --seed`.
- Akun demo (password `password`): `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test`.

## Seeder dan backend

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| S-01 | Test backend | `php artisan test` | - | Semua lulus | 643 lulus (3226 assertion) | Lulus |
| S-02 | Seed tanpa error | `php artisan migrate:fresh --seed` di MySQL | - | Selesai tanpa error | Selesai tanpa error | Lulus |
| S-03 | Seed dua kali sama | Seed dua kali, bandingkan sidik jari SHA-256 semua tabel data, kecuali hash password | - | Sidik jari sama | Sidik jari kedua seed sama: ff8ffa9b29cc…2b61b | Lulus |
| S-04 | Konsistensi data | Periksa aturan pada isi database | R4, R5, R14, R16, R18, R19, R20, urutan log progres, nama tanpa gelar | Tidak ada pelanggaran | Semua aturan terpenuhi | Lulus |

## Tampilan semua menu

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| T-01 | Semua menu kelima role dan halaman tamu | Buka semua menu dan tab, periksa otomatis | Lebar 390 px dan 1440 px | Tanpa geser horizontal, tabel terpotong, kontras kurang, atau error konsol | 132 kombinasi menu, role, dan lebar diperiksa; 0 masalah | Lulus |

## Uji per role

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| A-manager | manager: semua menu berisi, tanpa kosong/kata terlarang/error | Buka semua menu role tersebut, periksa isi, kata terlarang, dan konsol | Lebar 1440 px | semua menu berisi, tanpa kosong/kata terlarang/error | 16 menu, 181 baris/item; pesan kosong: tidak ada | Lulus |
| A-am | am: semua menu berisi, tanpa kosong/kata terlarang/error | Buka semua menu role tersebut, periksa isi, kata terlarang, dan konsol | Lebar 1440 px | semua menu berisi, tanpa kosong/kata terlarang/error | 12 menu, 82 baris/item; pesan kosong: tidak ada | Lulus |
| A-ts | ts: semua menu berisi, tanpa kosong/kata terlarang/error | Buka semua menu role tersebut, periksa isi, kata terlarang, dan konsol | Lebar 1440 px | semua menu berisi, tanpa kosong/kata terlarang/error | 12 menu, 77 baris/item; pesan kosong: tidak ada | Lulus |
| A-hr | hr: semua menu berisi, tanpa kosong/kata terlarang/error | Buka semua menu role tersebut, periksa isi, kata terlarang, dan konsol | Lebar 1440 px | semua menu berisi, tanpa kosong/kata terlarang/error | 11 menu, 85 baris/item; pesan kosong: tidak ada | Lulus |
| A-talent | talent: semua menu berisi, tanpa kosong/kata terlarang/error | Buka semua menu role tersebut, periksa isi, kata terlarang, dan konsol | Lebar 1440 px | semua menu berisi, tanpa kosong/kata terlarang/error | 11 menu, 33 baris/item; pesan kosong: /penugasan-penempatan?tab=monitoring: Tidak ada catatan tindak lanjut. / /jadwal-interview: Tidak ada jadwal interview mendatang. | Lulus |
| B-01 | Manager: grafik Dashboard terisi | Login Manager, buka Dashboard, baca grafik Tren Penempatan | - | grafik Dashboard terisi | 6 bulan terisi: Des 2025: 1 penempatan; Feb 2026: 1 penempatan; Mar 2026: 1 penempatan; Mei 2026: 1 penempatan; Agt 2026: 1 penempatan; Okt 2026: 1 penempatan | Lulus |
| B-02-manager | manager: badge Perlu Tanda Tangan Saya | Buka menu Dokumen, baca tombol Perlu Tanda Tangan Saya | - | badge Perlu Tanda Tangan Saya | Perlu Tanda Tangan Saya 2 | Lulus |
| B-02-hr | hr: badge Perlu Tanda Tangan Saya | Buka menu Dokumen, baca tombol Perlu Tanda Tangan Saya | - | badge Perlu Tanda Tangan Saya | Perlu Tanda Tangan Saya 1 | Lulus |
| B-02-talent | talent: badge Perlu Tanda Tangan Saya | Buka menu Dokumen, baca tombol Perlu Tanda Tangan Saya | - | badge Perlu Tanda Tangan Saya | Perlu Tanda Tangan Saya 1 | Lulus |
| B-03-manager | manager: notifikasi belum dibaca 3–6 | Buka Dashboard, baca jumlah pada lonceng | - | notifikasi belum dibaca 3–6 | Notifikasi, 6 belum dibaca | Lulus |
| B-03-am | am: notifikasi belum dibaca 3–6 | Buka Dashboard, baca jumlah pada lonceng | - | notifikasi belum dibaca 3–6 | Notifikasi, 5 belum dibaca | Lulus |
| B-03-ts | ts: notifikasi belum dibaca 3–6 | Buka Dashboard, baca jumlah pada lonceng | - | notifikasi belum dibaca 3–6 | Notifikasi, 4 belum dibaca | Lulus |
| B-03-hr | hr: notifikasi belum dibaca 3–6 | Buka Dashboard, baca jumlah pada lonceng | - | notifikasi belum dibaca 3–6 | Notifikasi, 5 belum dibaca | Lulus |
| B-03-talent | talent: notifikasi belum dibaca 3–6 | Buka Dashboard, baca jumlah pada lonceng | - | notifikasi belum dibaca 3–6 | Notifikasi, 3 belum dibaca | Lulus |
| C-manager | manager: filter status pengajuan sesuai badge | Pengajuan Kandidat → pilih tiap opsi filter Status → bandingkan semua badge | Semua opsi filter | filter status pengajuan sesuai badge | Menunggu Tinjauan 1, Lanjut Interview 3, Diterima 2, Ditempatkan 6, Ditolak 3 | Lulus |
| C-am | am: filter status pengajuan sesuai badge | Pengajuan Kandidat → pilih tiap opsi filter Status → bandingkan semua badge | Semua opsi filter | filter status pengajuan sesuai badge | Menunggu Tinjauan 1, Lanjut Interview 3, Diterima 2, Ditempatkan 6, Ditolak 3 | Lulus |
| C-ts | ts: filter status pengajuan sesuai badge | Pengajuan Kandidat → pilih tiap opsi filter Status → bandingkan semua badge | Semua opsi filter | filter status pengajuan sesuai badge | Menunggu Tinjauan 1, Lanjut Interview 3, Diterima 2, Ditempatkan 6, Ditolak 3 | Lulus |
| C-hr | hr: filter status pengajuan sesuai badge | Pengajuan Kandidat → pilih tiap opsi filter Status → bandingkan semua badge | Semua opsi filter | filter status pengajuan sesuai badge | Menunggu Tinjauan 1, Lanjut Interview 2, Diterima 1, Ditempatkan 3, Ditolak 1 | Lulus |
| C-talent | talent: filter status pengajuan sesuai badge | Pengajuan Kandidat → pilih tiap opsi filter Status → bandingkan semua badge | Semua opsi filter | filter status pengajuan sesuai badge | Menunggu Tinjauan 0, Lanjut Interview 0, Diterima 0, Ditempatkan 1, Ditolak 0 | Lulus |
| D-01 | TS: Rekomendasi 2+ permintaan menampilkan 5+ kandidat dengan skor bervariasi | Rekomendasi Kandidat → buka tiap permintaan berjalan | Permintaan diajukan & diproses | Rekomendasi 2+ permintaan menampilkan 5+ kandidat dengan skor bervariasi | Fullstack Developer: 84/58/36/34/32,67; Data Analyst: 52/36/36/36/31; Frontend Developer: 60/40/40/40/40; QA Engineer: 46,67/46,67/46,67 | Lulus |
| D-02 | SLA: Pipeline menampilkan Terlambat, Mendekati, dan Aman; semua status ada | Buka Pipeline Rekrutmen, baca kolom SLA dan Status | - | Pipeline menampilkan Terlambat, Mendekati, dan Aman; semua status ada | Semua indikator SLA dan status tampil | Lulus |
| D-03 | TS: label Dashboard dari backend | Login TS, buka Dashboard | - | label Dashboard dari backend | "Tersedia, belum diproses" / "di talent pool" | Lulus |
| D-04 | Talent belum lengkap tidak masuk pool; Budi di PT Maju Jaya | Cari talent belum lengkap di Talent Pool; buka Beranda talent@ | Lina Marlina, Tegar Aditya | Talent belum lengkap tidak masuk pool; Budi di PT Maju Jaya | Lina & Tegar tidak di pool; dashboard Budi: Ditempatkan, Backend Developer di PT Maju Jaya | Lulus |
| D-05 | Hak akses: HR ke /talent-pool ditolak, API 403 | HR Client membuka /talent-pool dan memanggil API-nya | - | HR ke /talent-pool ditolak, API 403 | Akses Ditolak; API 403 | Lulus |
| D-06 | Unduh dokumen seed: semua dokumen talent@ terunduh sebagai PDF | Talent mengunduh semua dokumennya, periksa isi berkas | - | semua dokumen talent@ terunduh sebagai PDF | perpanjangan-kontrak-budi-santoso.pdf, talent-1.pdf | Lulus |
| D-07 | Tanda tangan dokumen seed: manager@, hr@, talent@ dapat menandatangani dokumen yang menunggu | Panggil API tanda tangan untuk tiap dokumen yang menunggu, lalu unduh dokumennya | Gambar PNG tanda tangan | manager@, hr@, talent@ dapat menandatangani dokumen yang menunggu | manager: quotation-quo-2026-10-012.pdf → menunggu_ttd; perpanjangan-kontrak-budi-santoso.pdf → menunggu_ttd; sisa 0 / hr: quotation-quo-2026-10-012.pdf → ditandatangani; sisa 0 / talent: perpanjangan-kontrak-budi-santoso.pdf → ditandatangani; sisa 0 | Lulus |

## Ringkasan

Uji per role: 26/26 lulus. Dua pesan kosong di akun talent@ memang benar: "Tidak ada jadwal interview mendatang" karena talent@ sudah ditempatkan, dan "Tidak ada catatan tindak lanjut" karena satu dari tiga catatan monitoring Budi memang tanpa tindak lanjut. D-07 diuji lewat API, bukan lewat tombol di browser.
