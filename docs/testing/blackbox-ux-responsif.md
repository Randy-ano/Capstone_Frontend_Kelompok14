# Blackbox Testing — Pembaruan Tampilan & UX Responsif

**Lingkup:** hanya frontend. Tidak ada perubahan alur, hak akses, pemanggilan API, maupun backend.

## Prasyarat

- Diuji 2026-11-01 di Chrome headless lewat puppeteer, terhadap backend asli dengan database uji terpisah hasil `migrate:fresh --seed`.
- Akun demo (password `password`): `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test`.
- Toast dicatat satu per satu saat muncul, sehingga toast lama tidak terhitung sebagai hasil aksi berikutnya.

## Audit semua menu

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| AU-01 | Semua menu kelima role di HP dan desktop | Buka semua menu dan tab tiap role, lalu periksa otomatis | Lebar 390 px dan 1440 px | Tidak ada geser horizontal halaman, tabel terpotong, elemen keluar layar, Akses Ditolak pada menu sendiri, error konsol, atau teks kecil dengan kontras di bawah 4.5:1 | 124 kombinasi halaman × lebar, 0 bermasalah | Lulus |
| AU-02 | Halaman tamu | Buka /, /login, /daftar, /abc tanpa login | Lebar 390 px dan 1440 px | Sama dengan AU-01 | 8 kombinasi, 0 bermasalah | Lulus |
| AU-03 | Login form kelima akun di build produksi | Isi form masuk tiap akun, buka Dashboard, pindah ke Pengaturan Akun | Lima akun demo, lebar 390 px | Masuk berhasil, berkas halaman dimuat saat dibutuhkan, tanpa error JavaScript | Kelima akun masuk; /login mengunduh 1 berkas JS (193,9 kB); setelah masuk 6 berkas (40,4 kB); pindah menu 1 berkas (3,4 kB); 0 error | Lulus |
| AU-04 | Drawer di HP | Buka detail Talent Pool, Pengajuan, Dokumen | Lebar 390 px | Isi drawer tidak melebihi layar | Lebar isi 390 px pada ketiganya | Lulus |

## Ukuran bundle

| Berkas awal | Sebelum | Sesudah |
|---|---|---|
| JavaScript | 436,20 kB (gzip 114,55 kB) | 193,90 kB (gzip 63,09 kB) |

## Manager

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| A-01 | Manager: simpan kompetensi baru | Master Data Skill → Tambah Kompetensi → isi nama → Tambah | Nama kompetensi unik | toast | Kompetensi berhasil ditambahkan. (UjiKompetensi719956) | Lulus |
| A-02 | Manager: nama kompetensi kembar | Tambah kompetensi dengan nama yang sudah ada | Nama yang sama dengan A-01 | error backend di form, tanpa toast | Pesan di form: "Kompetensi UjiKompetensi719956 sudah ada."; toast: 0 | Lulus |
| A-03 | Manager: hapus kompetensi | Cari kompetensi → Hapus → Ya, Hapus | Kompetensi dari A-01 | konfirmasi lalu toast | Kompetensi berhasil dihapus. (UjiKompetensi719956) | Lulus |
| A-04 | Manager: catat monitoring | Monitoring Kinerja → Catat Monitoring → isi → Simpan | Penempatan pertama, hasil monitoring | toast | Monitoring berhasil dicatat. | Lulus |
| A-05 | Manager: ubah status pegawai | Kelola Akun Pegawai → Nonaktifkan → Ya, lalu aktifkan kembali | Akun AM | konfirmasi lalu toast | Akun berhasil dinonaktifkan (Andi Pratama) | Lulus |

## Account Manager

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| B-01 | AM: buat permintaan (draft) | Permintaan Kebutuhan → Buat Permintaan → isi → Simpan Draft | Posisi, klien, SLA 20 Jan 2027, kompetensi Laravel | toast & drawer terbuka | Job requirement berhasil dibuat. | Lulus |
| B-02 | AM: ajukan permintaan | Di drawer permintaan klik Ajukan | - | toast | Job requirement berhasil diajukan. | Lulus |
| B-03 | AM: buat dokumen dari template (generate) | Dokumen → Buat dari Template → isi → Buat Dokumen | Quotation, klien, 1 item | toast | Quotation berhasil dibuat. | Lulus |

## Talent Support

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| C-01 | TS: kolom Tag Keahlian tidak ada di tabel, ada di detail; ubah tag | Buka Talent Pool, buka detail, ubah tag → Simpan Perubahan | Tag: Laravel, REST API, E2E | toast | Kolom: NAMA, PENDIDIKAN, KOMPETENSI, TANGGAL MASUK, STATUS; toast: Data talent pool berhasil diperbarui. | Lulus |
| C-02 | TS: Dashboard menjelaskan definisi angka tersedia | Buka Dashboard dan Talent Pool sebagai TS | - | Dashboard menjelaskan definisi angka tersedia | Dashboard: "Tersedia, belum diproses"; Talent Pool: "Termasuk yang sedang diproses" | Lulus |

## HR Client dan konsistensi badge

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| D-01 | HR: buat laporan keluhan | Tiket Komplain → Buat Laporan → isi → Kirim Laporan | Talent, judul, deskripsi | toast | Laporan keluhan berhasil dikirim. | Lulus |
| D-02 | HR: unggah dokumen | Dokumen → Unggah Dokumen → pilih file → Unggah | uji.pdf, jenis Lainnya | toast | Dokumen berhasil diunggah. | Lulus |
| D-03 | HR: setujui cuti | Pengajuan Cuti & Shift → Setujui → Ya | Cuti menunggu dari data seed | toast | Keputusan disimpan. Menunggu keputusan pihak lain. | Lulus |
| D-04 | HR: tanda tangan dokumen | Dokumen → Perlu Tanda Tangan Saya → buka → gambar tanda tangan → Tanda Tangani | Goresan di canvas | toast | Tanda tangan tersimpan. Menunggu penandatangan lain. | Lulus |
| D-05 | HR Pengajuan: badge tidak bertentangan dengan tahap | Buka Pengajuan Kandidat, bandingkan kolom Tahap dan Status | - | badge tidak bertentangan dengan tahap | assignment_ind Ditempatkan → Ditempatkan | Lulus |
| D-06-manager | manager: badge pengajuan konsisten | Buka Pengajuan Kandidat, bandingkan kolom Tahap dan Status | - | badge pengajuan konsisten | 1 baris konsisten | Lulus |
| D-06-am | am: badge pengajuan konsisten | Buka Pengajuan Kandidat, bandingkan kolom Tahap dan Status | - | badge pengajuan konsisten | 1 baris konsisten | Lulus |
| D-06-ts | ts: badge pengajuan konsisten | Buka Pengajuan Kandidat, bandingkan kolom Tahap dan Status | - | badge pengajuan konsisten | 1 baris konsisten | Lulus |
| D-06-talent | talent: badge pengajuan konsisten | Buka Pengajuan Kandidat, bandingkan kolom Tahap dan Status | - | badge pengajuan konsisten | 1 baris konsisten | Lulus |

## Alur rekrutmen lintas role

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| M-01 | TS: screening kandidat rekomendasi | Rekomendasi Kandidat → pilih permintaan → Screening → Konfirmasi | Permintaan dari B-01 | toast | Screening berhasil dibuat. Titin Eka Novitasari M.Kom. masuk tahap screening. | Lulus |
| M-02 | TS: ubah hasil screening jadi Lolos | Ubah hasil → Lolos → Simpan | Hasil: Lolos | toast | Screening berhasil diperbarui. (Titin Eka Novitasari M.Kom.) | Lulus |
| M-03 | AM: ajukan kandidat ke klien | Pengajuan Kandidat → Ajukan Kandidat → Ajukan, Esc, lihat daftar | Kandidat dari M-02 | toast, drawer terbuka, badge Menunggu Tinjauan | Kandidat berhasil diajukan ke klien. (Titin Eka Novitasari M.Kom.) / Menunggu tinjauan klien → Menunggu Tinjauan | Lulus |
| M-04 | HR: lanjut interview | Buka pengajuan → Lanjut Interview | - | toast | Kandidat dilanjutkan ke tahap interview. | Lulus |
| M-05 | AM: jadwalkan interview | Buka pengajuan → Jadwalkan → isi → Simpan Jadwal | Hari ini, 23.30 | toast | Interview berhasil dijadwalkan. | Lulus |
| M-06 | AM: tandai interview selesai | Di drawer klik Tandai Selesai | - | toast | Jadwal interview berhasil diperbarui. | Lulus |
| M-07 | HR: evaluasi diterima | Buka pengajuan → isi evaluasi → Simpan Evaluasi | Nilai 85, Diterima | toast; badge jadi Diterima | Evaluasi berhasil disimpan. / Diterima, menunggu placement → Diterima | Lulus |
| M-08 | TS: buat placement | Buka pengajuan → isi tanggal mulai → Buat Placement | 1 Nov 2026 | toast; badge jadi Ditempatkan | Placement berhasil dibuat. / Ditempatkan → Ditempatkan | Lulus |
| M-09 | Manager: akhiri penempatan | Penugasan Penempatan → buka → Selesai → Akhiri Penempatan | Penempatan dari M-08 | toast | Placement ditandai selesai. | Lulus |
| M-10 | Talent: ajukan cuti | Pengajuan Cuti & Shift → Ajukan Cuti → isi → Kirim | 1–2 Mar 2027, alasan | toast | Pengajuan cuti berhasil dikirim. | Lulus |
| M-11 | Manager: tolak cuti | Pengajuan Cuti & Shift → Tolak → Ya | Cuti dari M-10 | toast | Cuti ditolak. | Lulus |
| M-12 | HR: atur shift | Tab Jadwal Shift → Atur Shift → simpan; Ubah → simpan; Hapus → Ya | Satu tanggal hari ini | toast; ubah → toast; hapus → toast | 1 shift diperbarui. / Shift berhasil diperbarui. / Shift berhasil dihapus. | Lulus |

## Talent

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| E-01 | Talent: buat CV | Profil & CV Saya → Buat (Ulang) CV | - | toast | CV berhasil dibuat. | Lulus |
| E-02 | Talent: password lama salah | Pengaturan Akun → isi password lama yang salah → Simpan | Password lama salah | pesan backend di field, tanpa toast | Pesan: "Password lama tidak sesuai." | Lulus |
| E-03 | Talent: ubah password | Perbaiki password lama → Simpan Password | Password benar | toast | Password berhasil diubah. | Lulus |

## Perilaku toast

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| F-01 | Toast desktop: pojok kanan bawah, hilang ±4 detik | Lebar 1440 px: Notifikasi → Tandai Semua Dibaca, ukur posisi & durasi | - | pojok kanan bawah, hilang ±4 detik | jarak kanan 24px, bawah 24px, hilang setelah ±4.0 dtk | Lulus |
| F-02 | Toast HP: bawah tengah, bisa ditutup manual | Lebar 390 px: Tandai Semua Dibaca, ukur posisi, klik tutup | - | bawah tengah, bisa ditutup manual | kiri 16px = kanan 16px, bawah 16px; ditutup manual | Lulus |

## Tombol memproses

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| G-01 | Tombol proses: nonaktif + spinner + "Memproses..." | Tahan respons API 1,5 detik, kirim form, tekan Esc selama proses | Kompetensi baru | nonaktif + spinner + "Memproses..." | disabled=true, spinner ada, teks Memproses..., Esc diabaikan selama proses | Lulus |

## Navigasi keyboard

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| H-01 | Keyboard form (modal Tambah Kompetensi): Tab berputar di dalam modal, Esc menutup, fokus kembali | Fokus tombol Tambah → Enter → Tab 7× → Shift+Tab → Esc | Keyboard | Tab berputar di dalam modal, Esc menutup, fokus kembali | Urutan Tab: Tutup → Contoh: Golang → Pilih atau ketik → Batal → Tambah → Tutup → Contoh: Golang; garis 2px solid; fokus kembali ke "add_circle Tambah Kompetensi" | Lulus |
| H-02 | Keyboard drawer: buka dgn Enter, Tab tetap di dalam, Esc menutup, fokus kembali ke baris pemicu | Fokus nama talent → Enter → Tab 12× → Esc | Keyboard | buka dgn Enter, Tab tetap di dalam, Esc menutup, fokus kembali ke baris pemicu | Fokus kembali ke "Budi Santoso" | Lulus |
| H-03 | Esc pada modal di atas drawer hanya menutup modal | Buka drawer → Ubah → Esc → Esc | Keyboard | Esc pada modal di atas drawer hanya menutup modal | Esc pertama menutup form, Esc kedua menutup drawer | Lulus |
| H-04 | HP: menu samping tidak terkena Tab saat tertutup; Esc menutup & fokus ke tombol menu | Lebar 390 px: Enter pada tombol menu → Esc | Keyboard | menu samping tidak terkena Tab saat tertutup; Esc menutup & fokus ke tombol menu | visibility hidden saat tertutup; Esc menutup; fokus kembali ke Buka menu | Lulus |

## Aksesibilitas & gerakan

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| I-01 | Semua tombol punya nama aksesibel, semua img punya alt, ikon aria-hidden (semua role, satu halaman tiap jenis) | Periksa DOM enam halaman lintas role | - | Semua tombol punya nama aksesibel, semua img punya alt, ikon aria-hidden (semua role, satu halaman tiap jenis) | 0 tombol tanpa nama, 0 img tanpa alt, 0 ikon terbaca | Lulus |
| I-02 | prefers-reduced-motion: animasi dimatikan | Emulasi prefers-reduced-motion reduce dan no-preference, buka drawer | - | animasi dimatikan | reduce: animasi 1e-05s, transisi 1e-05s; normal: animasi 0.2s | Lulus |

## 404, halaman depan, hak akses

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| J-01 | Login: /abc | Buka /abc sebagai manager, AM, TS, HR | /abc | 404 di dalam layout, tombol ke beranda | manager:/dashboard-rekapitulasi, am:/dashboard-rekapitulasi, ts:/dashboard-rekapitulasi, hr:/dashboard-rekapitulasi | Lulus |
| J-02 | Tamu: /abc | Tanpa login buka /abc, /, klik Daftar sebagai HR, buka /talent-pool | Lebar 390 px | 404 tanpa layout; / → halaman depan; /talent-pool → /login | 404 tampil; halaman depan rapi di 390px tanpa geser; tombol HR membuka tab HR; rute terlindungi tetap ke /login | Lulus |
| J-03 | Sudah login: / diarahkan ke beranda | Sudah login, buka / | / | / diarahkan ke beranda | /dashboard-rekapitulasi | Lulus |
| J-04 | Login lewat form masih berfungsi | Isi form masuk → Enter | am@intellisys.test | Login lewat form masih berfungsi | masuk ke /dashboard-rekapitulasi | Lulus |
| J-05 | Hak akses tidak berubah: HR ke /talent-pool | HR membuka /talent-pool dan memanggil API-nya | - | Akses Ditolak, API tetap 403 | Akses Ditolak; API 403 | Lulus |

## Pemenggalan kata

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| K-01 | Kata berhubung di deskripsi tidak terpotong ("CV-nya", "sama-sama") | Ukur baris kata berhubung pada 7 lebar layar | 320–430 px | Kata berhubung di deskripsi tidak terpotong ("CV-nya", "sama-sama") | utuh satu baris pada lebar 320, 340, 360, 375, 390, 412, 430 px | Lulus |

## Stabilitas

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| L-01 | Tidak ada error JavaScript/console selama pengujian | Pantau konsol selama seluruh pengujian | - | Tidak ada error JavaScript/console selama pengujian | 0 error | Lulus |

## Ringkasan

Skenario aksi: 50/50 lulus. Audit: 4/4 lulus.

Catatan: filter "Status pengajuan" masih menyaring berdasarkan status pengajuan di backend, sehingga filter "Lanjut Interview" juga menampilkan baris yang badge-nya sudah "Diterima" atau "Ditempatkan".

Screenshot sebelum dan sesudah di HP: `docs/screenshots/ux-responsif/`.
