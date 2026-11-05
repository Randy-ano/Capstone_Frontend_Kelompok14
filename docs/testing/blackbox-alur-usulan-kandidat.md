# Blackbox Testing — Alur Usulan Kandidat oleh Talent Support

**Lingkup:** revisi alur dari tim. Langkah screening Lolos/Tidak Lolos diganti usulan Talent Support (TS) ke Account Manager (AM) dengan catatan. AM meneruskan usulan ke klien atau mencatatnya sebagai tidak diteruskan. Permintaan baru dikirim sebagai notifikasi ke TS & AM. CV dikeluarkan dari menu Dokumen.

## Prasyarat

- Diuji 2026-11-05 di Chrome headless lewat puppeteer, terhadap backend asli (`php -S localhost:8001`) dengan database uji terpisah hasil `migrate:fresh --seed`, dan frontend `vite` di port 5174.
- Akun demo (password `password`): `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test`.
- Data seed: usulan menunggu AM (Bagas – Frontend Developer, Intan & Farhan – Data Analyst), satu usulan tidak diteruskan (Citra – Data Analyst), permintaan Fullstack Developer dibuat HR Client (belum punya AM penanggung jawab).
- Backend: `php artisan test` 762 lulus; `migrate:fresh --seed` di MySQL tanpa error; `npm run build` tanpa error.

## Usulan oleh Talent Support

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| UK-01 | TS mengusulkan dari Rekomendasi Kandidat | Login `ts@` → Rekomendasi Kandidat → pilih Fullstack Developer → "Usulkan ke AM" di kandidat teratas → isi catatan → Usulkan ke AM | Catatan "Lulusan S1 Informatika, pernah membangun aplikasi internal ritel." | Toast sukses; kandidat pindah ke "Sudah Diusulkan ke AM" berstatus Menunggu Tinjauan AM beserta catatan | Toast "Kandidat berhasil diusulkan ke Account Manager."; Rizky Firmansyah (skor 84) tampil berstatus Menunggu Tinjauan AM dengan catatannya | Lulus |
| UK-02 | Usulan ganda untuk permintaan yang sama | Usulkan lagi talent yang sama ke Fullstack Developer | id talent & job yang sama | Ditolak 422 dengan pesan jelas | 422 "Talent ini sudah pernah diusulkan untuk permintaan kebutuhan ini." | Lulus |
| UK-03 | Catatan terlalu panjang | Kirim usulan dengan catatan 1001 karakter | 1001 × "a" | Ditolak 422 | 422 "Kolom catatan untuk AM tidak boleh berisi lebih dari 1000 karakter." (form membatasi input di 1000 karakter dengan penghitung) | Lulus |
| UK-04 | TS mengusulkan talent skor < 70 dari Talent Pool | Talent Pool → cari "Fajar" → buka detail → "Usulkan ke AM" → kirim tanpa memilih permintaan → pilih Data Analyst → isi catatan → kirim | Fajar Ramadhan (tidak muncul di rekomendasi), catatan "Di luar rekomendasi: lulusan Statistika UGM…" | Pilihan permintaan hanya yang diajukan/diproses; tanpa pilihan muncul pesan; usulan tersimpan dengan skor sebagai info; Riwayat Usulan diperbarui | 4 pilihan permintaan (tanpa draft/terpenuhi/dibatalkan); pesan "Pilih permintaan kebutuhan tujuan."; usulan tersimpan dengan skor 31; Riwayat Usulan menampilkan Menunggu Tinjauan AM; tombol berubah nonaktif dengan keterangan "Talent sedang dalam proses" | Lulus |

## Tinjauan oleh Account Manager

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| UK-05 | Notifikasi usulan baru ke AM | Login `am@` → Notifikasi | Usulan UK-01 (job buatan HR, tanpa AM) dan UK-04 (job milik `am@`) | AM penanggung jawab (atau semua AM bila job belum punya AM) menerima notifikasi | "Rina Kartika mengusulkan Fajar Ramadhan untuk posisi Data Analyst (PT Sinar Digital Nusantara). Silakan tinjau." dan notifikasi serupa untuk Rizky (Fullstack) | Lulus |
| UK-06 | Daftar usulan dari TS | Pengajuan Kandidat → tab "Usulan dari Talent Support" | – | Usulan menunggu tampil dengan nama, permintaan, skor, catatan TS, tanggal & pengusul, serta tombol Teruskan ke Klien / Tidak Diteruskan; jumlahnya tampil di tab | 5 usulan tampil lengkap dengan badge jumlah 5; usulan di permintaan yang dibatalkan (Hafiz – Network Engineer) tidak tampil | Lulus |
| UK-07 | AM tidak meneruskan usulan | Di baris Fajar klik "Tidak Diteruskan" → kirim tanpa alasan → isi alasan → kirim | Alasan "Klien mensyaratkan pengalaman BI minimal 2 tahun." | Alasan wajib; setelah dikirim, usulan hilang dari daftar menunggu, talent kembali tersedia, TS pengusul menerima notifikasi berisi alasan | Pesan "Alasan tidak diteruskan wajib diisi."; toast "Usulan tidak diteruskan ke klien."; status talent Fajar kembali tersedia; notifikasi TS "Usulan Fajar Ramadhan untuk posisi Data Analyst tidak diteruskan ke klien. Alasan: …" | Lulus |
| UK-08 | Usulan tidak diteruskan tercatat | Ubah filter ke "Tidak diteruskan" | – | Usulan yang tidak diteruskan tampil beserta catatan TS dan alasan AM | Fajar dan Citra (data seed) tampil berstatus Tidak Diteruskan dengan alasannya | Lulus |
| UK-09 | Talent yang tidak diteruskan diusulkan untuk permintaan lain | TS mengusulkan Fajar ke Fullstack Developer | – | Berhasil (201) | 201 "Kandidat berhasil diusulkan ke Account Manager." | Lulus |
| UK-10 | AM meneruskan usulan ke klien | Tab usulan → "Teruskan ke Klien" di baris Bagas | – | Pengajuan dibuat, drawer pengajuan terbuka, status usulan menjadi Diteruskan ke Klien | Toast "Kandidat berhasil diajukan ke klien."; drawer terbuka; status usulan Bagas "Diteruskan ke Klien" | Lulus |
| UK-11 | Modal "Ajukan Kandidat" lama tetap dipakai | Klik "Ajukan Kandidat" di kepala halaman | – | Sumber daftar = usulan TS yang menunggu (dengan catatan TS); yang sudah diteruskan atau tidak diteruskan tidak muncul | Daftar berisi Farhan, Intan, Rizky, Fajar (Fullstack) dengan catatan TS dan tombol "Teruskan ke Klien"; Bagas dan Fajar–Data Analyst tidak muncul | Lulus |
| UK-12 | Tampilan HP – AM | Tab usulan dan modal Tidak Diteruskan di lebar HP | Lebar 390 px | Tidak ada geser horizontal; tabel menjadi kartu | Tidak ada geser horizontal; tab berlabel pendek "Pengajuan" / "Usulan TS"; tiap usulan tampil sebagai kartu dengan tombol selebar layar | Lulus |
| UK-13 | Tampilan HP – TS | Rekomendasi Kandidat (Data Analyst) di lebar HP | Lebar 390 px | Tidak ada geser horizontal | Tidak ada geser horizontal | Lulus |

## HR Client & notifikasi permintaan

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| UK-14 | HR Client menerima kandidat yang diteruskan | Login `hr@` → Pengajuan Kandidat & Notifikasi | Bagas (UK-10) | Kandidat tampil berstatus Diajukan; notifikasi masuk; HR tidak melihat tab usulan | Bagas tampil; notifikasi "Kandidat baru diajukan untuk posisi Frontend Developer: Bagas Saputra. Silakan tinjau."; tab usulan tidak ada | Lulus |
| UK-15 | HR Client membuka Rekomendasi Kandidat | Buka /rekomendasi-kandidat | – | Akses Ditolak | Halaman Akses Ditolak | Lulus |
| UK-16 | Permintaan diajukan HR Client | `hr@` membuat permintaan berstatus diajukan, lalu `ts@` membuka Notifikasi | Mobile Developer, 1 orang | Semua TS + AM (job belum punya AM → semua AM aktif) menerima notifikasi; Manager tidak | TS: "Permintaan kebutuhan baru dari PT Maju Jaya: Mobile Developer (1 orang). Silakan cari kandidat yang sesuai."; AM menerima; Manager tidak | Lulus |
| UK-17 | Permintaan diajukan AM dari draft | `am@` membuat draft lalu mengajukannya | Scrum Master | Draft tidak memicu notifikasi; saat diajukan TS menerima notifikasi; AM pelaku tidak | Draft: tidak ada notifikasi; diajukan: TS menerima, AM tidak | Lulus |

## Hak akses

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| UK-18 | Akses endpoint usulan | PATCH `/screening/{id}/tidak-diteruskan` oleh TS, HR, Manager, Talent; POST `/screening` oleh AM, HR, Manager, Talent; GET `/screening` oleh HR | – | Semua ditolak 403 | Semua 403 | Lulus |
| UK-19 | Tab usulan untuk TS | Login `ts@` → /pengajuan-kandidat?tab=usulan | – | Tab usulan dan tombol Teruskan tidak tampil | TS melihat daftar pengajuan biasa tanpa tab | Lulus |

## CV keluar dari menu Dokumen

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| UK-20 | Dokumen tanpa CV (Manager) | Login `manager@` → Dokumen: lihat daftar, pilihan filter jenis, dan form Unggah; panggil `/dokumen?jenis=cv` | – | Tidak ada CV di daftar, filter, maupun unggah; filter cv ditolak | 7 dokumen, 0 CV; opsi filter: Quotation, Purchase Order, Perjanjian Kerja Sama, Kontrak Kerja, Surat Peringatan, Lainnya; `jenis=cv` → 422 | Lulus |
| UK-21 | CV tetap ada di profil talent | Login `talent@` → Dokumen (API) dan Profil & CV Saya; AM → Dokumen (API) | – | Dokumen talent & AM tanpa CV; tombol CV tetap ada di Profil & CV Saya | Dokumen talent 1 (0 CV), AM 7 (0 CV); Profil & CV Saya tetap menampilkan bagian CV dengan tombol "Buat Ulang CV" (dan "Lihat CV") | Lulus |
| UK-22 | Hitungan "Perlu tanda tangan" tanpa CV | Test backend `DokumenTanpaCvTest` | Dokumen CV & PKS yang sama-sama menunggu tanda tangan Manager | Kartu & filter `perlu_ttd` hanya menghitung PKS | 1 (test lulus) | Lulus |

**Ringkasan:** 22/22 lulus.
