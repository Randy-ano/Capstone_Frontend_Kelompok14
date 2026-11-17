# Blackbox Testing — Uji Versi Online (Produksi)

**Lingkup:** pengujian aplikasi yang sudah di-deploy, **tanpa mengubah kode, database, atau pengaturan Railway/Vercel**:
- Frontend: https://intellisys-talent-hub.vercel.app (Vercel)
- Backend: https://capstonebackendkelompok14-production.up.railway.app/api/v1 (Railway)

Bagian A: umum (login/logout, menu, hak akses, tampilan 390 px, lupa password). Bagian B: fitur hasil perbaikan SUS (detail usulan kandidat, fitur talent, histori dokumen penempatan). Bagian C: cek cepat fitur inti.

## Prasyarat & cara uji

- Diuji **17 Nov 2026** dengan Microsoft Edge headless (Playwright) di lebar 1366 px dan 390 px (HP), ditambah pemanggilan endpoint langsung untuk hak akses dan validasi.
- Login lewat form di setiap role (5 kali, berjarak agar tidak kena batas 10 percobaan/menit). Untuk halaman lain dipakai token dari `POST /auth/login`; semua token uji dicabut (`POST /auth/logout`) setelah selesai.
- Akun (password `password`): `manager@`, `am@`, `ts@`, `hr@` (PT Maju Jaya), `talent@` (Budi), ditambah `talent01@` (Dimas, penempatan aktif), `talent02@` (Putri), `talent05@` (Wahyu), `talent09@` (Reza, lanjut interview), `talent16@` (Fajar, belum pernah diajukan), `hr03@` (PT Sinar Digital Nusantara), `hr06@` (PT Nusantara Retail Indonesia).
- Screenshot penting ada di [screenshot-online/](screenshot-online/).

## A. Umum

| ID | Role | Skenario | Langkah | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| UO-01 | Manager | Login, menu, akses, logout | Login form `manager@` → cek menu → buka `/rekomendasi-kandidat`, `/profil-saya` → Keluar → buka `/dashboard-rekapitulasi` | Masuk ke Dashboard; 14 menu internal termasuk Kelola Akun Pegawai; dua halaman lain "Akses Ditolak"; setelah keluar diarahkan ke `/login` | Sesuai: menu Dashboard, Pipeline, Talent Pool, Penugasan Penempatan, Permintaan, Pengajuan, Jadwal Interview, Monitoring, Cuti & Shift, Tiket Komplain, Dokumen, Master Data Skill, Pengaturan Akun, Kelola Akun Pegawai; kedua halaman "Akses Ditolak"; setelah keluar kembali ke `/login`. [A1-manager-beranda-390](screenshot-online/A1-manager-beranda-390.png) | Lulus |
| UO-02 | AM | Login, menu, akses, logout | Login `am@` → cek menu → buka `/kelola-pegawai`, `/rekomendasi-kandidat`, `/profil-saya`, `/master-data-skill` → Keluar | Menu tanpa Rekomendasi, Master Data, Kelola Pegawai; empat halaman "Akses Ditolak"; keluar ke `/login` | Sesuai | Lulus |
| UO-03 | TS | Login, menu, akses, logout | Login `ts@` → cek menu → buka `/kelola-pegawai`, `/tiket-komplain-klien`, `/profil-saya` → Keluar | Menu memuat Rekomendasi Kandidat & Master Data Skill, tanpa Tiket Komplain & Kelola Pegawai; tiga halaman "Akses Ditolak" | Sesuai. [A1-ts-akses-ditolak-390](screenshot-online/A1-ts-akses-ditolak-390.png) | Lulus |
| UO-04 | HR Client | Login, menu, akses, logout | Login `hr@` → cek menu → buka `/talent-pool`, `/rekomendasi-kandidat`, `/kelola-pegawai`, `/profil-saya`, `/pipeline-rekrutmen` → Keluar | Menu: Dashboard, Penempatan, Permintaan, Pengajuan, Jadwal Interview, Monitoring, Cuti & Shift, Tiket Komplain, Dokumen, Pengaturan; lima halaman "Akses Ditolak" | Sesuai | Lulus |
| UO-05 | Talent | Login, menu, akses, logout | Login `talent@` → cek menu → buka `/talent-pool`, `/kelola-pegawai`, `/permintaan-kebutuhan`, `/monitoring-kinerja`, `/rekomendasi-kandidat` → Keluar | Menu talent (Beranda, Profil & CV Saya, Penempatan Saya, Proses Seleksi, Jadwal Interview, Dokumen, Pengaturan); Cuti & Shift tidak tampil karena Budi tidak sedang ditempatkan; lima halaman "Akses Ditolak" | Sesuai. [A1-talent-akses-ditolak-390](screenshot-online/A1-talent-akses-ditolak-390.png) | Lulus |
| UO-06 | Semua | Hak akses backend | `GET` 20 endpoint (talent-pool, rekomendasi, screening, pegawai, dashboard/manager, laporan-keluhan, cuti, cuti/kuota, shift, monitoring, talent/profil, klien, progres, pengajuan, interview, placement, dokumen, notifikasi, dashboard/ringkasan) dengan token tiap role | Kode status sesuai tabel endpoint spec bagian 7 (403 "Anda tidak memiliki akses ke fitur ini." untuk role lain) | Sesuai seluruhnya, mis. talent-pool & screening 403 untuk HC/T, pegawai & dashboard/manager hanya M, shift 403 untuk AM/TS, talent/profil hanya T, `talent@` ke `/cuti` 403 "Fitur ini tersedia setelah Anda ditempatkan di perusahaan klien." | Lulus |
| UO-07 | Tamu | Endpoint tanpa token | `GET /placement` tanpa header Authorization | 401 "Anda belum login atau sesi telah berakhir." | 401 dengan pesan tersebut | Lulus |
| UO-08 | Manager | Tampilan 390 px | Buka ke-14 menu Manager di lebar 390 px, bandingkan `scrollWidth` dengan lebar layar | Tidak ada gulir ke samping | `scrollWidth` = 390 di semua halaman | Lulus |
| UO-09 | AM | Tampilan 390 px | Buka ke-12 menu AM di 390 px | Tidak ada gulir ke samping | 390 = 390 di semua halaman | Lulus |
| UO-10 | TS | Tampilan 390 px | Buka ke-13 menu TS di 390 px | Tidak ada gulir ke samping | 390 = 390 di semua halaman | Lulus |
| UO-11 | HR Client | Tampilan 390 px | Buka ke-10 menu HR Client di 390 px | Tidak ada gulir ke samping | 390 = 390 di semua halaman. [A2-hr-beranda-390](screenshot-online/A2-hr-beranda-390.png) | Lulus |
| UO-12 | Talent | Tampilan 390 px | Buka ke-7 menu talent di 390 px | Tidak ada gulir ke samping | 390 = 390 di semua halaman | Lulus |
| UO-13 | Tamu | Lupa password, email tidak terdaftar | `/lupa-password` (390 px) → isi email → Kirim | Pesan umum yang memuat "cek folder Spam"; tidak membocorkan apakah email terdaftar | Input `tidak-terdaftar-uji-online@example.com` (bukan akun @intellisys.test). API 200; UI: "Jika email terdaftar, tautan reset sudah dikirim. Jika tidak ada di Kotak Masuk, cek folder Spam." + "Kirim ulang atau ganti email". [A3](screenshot-online/A3-lupa-password-email-tidak-terdaftar-390.png) | Lulus |

## B. Fitur hasil perbaikan SUS

### B4. Detail usulan kandidat (Tinjau Detail)

| ID | Role | Skenario | Langkah | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| UO-14 | AM | Tab Usulan dari Talent Support | Pengajuan Kandidat → tab "Usulan dari Talent Support" | Daftar usulan menunggu tinjauan untuk permintaan diproses, tombol "Tinjau Detail" | Badge 2; Rizky Firmansyah (Fullstack Developer, skor 84, "Tanpa catatan") dan Farhan Maulana (Data Analyst, skor 84, catatan TS tampil). [B4-am-tab-usulan-ts](screenshot-online/B4-am-tab-usulan-ts.png) | Lulus |
| UO-15 | AM | Isi detail lengkap | Tinjau Detail Rizky (S21), lalu Farhan (S19) | Pendidikan, pengalaman, skor tersimpan + rincian 80/20, kompetensi, bahasa, catatan TS, CV, sertifikat | Rizky: S1 Teknik Informatika – Universitas Komputer Indonesia; pengalaman Fullstack Developer sejak Mei 2022; skor 84 "saat diusulkan", Kompetensi (80%) 80 "4 dari 5", Pengalaman (20%) 100 "4,5 tahun dari minimal 3 tahun", chip cocok/kurang (MySQL ✗); kompetensi + kategori; bahasa Indonesia – Penutur Asli, Inggris – Menengah; "Talent Support tidak menulis catatan."; tombol Lihat CV & sertifikat Oracle. Farhan: catatan TS tampil. [atas](screenshot-online/B4-am-detail-usulan-atas.png), [bawah](screenshot-online/B4-am-detail-usulan-bawah.png) | Lulus |
| UO-16 | AM | Tombol aksi khusus AM | Lihat kaki laci detail | "Tidak Diteruskan" dan "Ajukan ke Klien" tampil | Kedua tombol tampil (tidak ditekan agar data demo tetap) | Lulus |
| UO-17 | AM | Tidak Diteruskan tanpa alasan | Tidak Diteruskan → kosongkan alasan → Tidak Diteruskan; juga `PATCH /screening/21/tidak-diteruskan` `alasan: ""` | UI menolak dengan pesan wajib; API 422; status usulan tetap | UI: "Alasan tidak diteruskan wajib diisi."; API 422 "Kolom alasan tidak diteruskan wajib diisi."; status tetap `menunggu_am`. [B4-am-tidak-diteruskan-alasan-kosong](screenshot-online/B4-am-tidak-diteruskan-alasan-kosong.png) | Lulus |
| UO-18 | AM | Lihat CV & sertifikat | Klik "Lihat CV", lalu "Lihat" pada sertifikat | CV PDF terbuka; sertifikat tampil di pratinjau | CV: `GET /talent-pool/18/cv` 200, terbuka di tab baru; sertifikat: `GET /sertifikat/8/file` 200, modal pratinjau PDF + "Buka di tab baru". [B4-am-pratinjau-sertifikat](screenshot-online/B4-am-pratinjau-sertifikat.png) | Lulus |
| UO-19 | AM | Detail usulan di 390 px | Ulangi UO-15 s.d. UO-17 di lebar 390 px | Laci memenuhi layar, tanpa gulir samping, tombol aksi terjangkau | Laci 390 × 844, `scrollWidth` 390, tombol tampil; validasi alasan sama. [B4-am-detail-usulan-390](screenshot-online/B4-am-detail-usulan-390.png) | Lulus |
| UO-20 | TS | Detail hanya baca | Rekomendasi Kandidat → permintaan Fullstack Developer → "Sudah Diusulkan ke AM" → klik Rizky Firmansyah | Isi detail sama lengkap; tanpa tombol aksi | Isi lengkap; kaki: "Hanya Account Manager yang dapat mengajukan usulan ini ke klien."; tombol hanya Lihat CV/Lihat. [B4-ts-detail-usulan-baca-saja](screenshot-online/B4-ts-detail-usulan-baca-saja.png) | Lulus |
| UO-21 | Manager | Detail hanya baca | Permintaan Kebutuhan → Fullstack Developer → Kandidat Diusulkan → Rizky Firmansyah | Isi detail lengkap; tanpa tombol aksi | Sama dengan UO-20. [B4-manager-detail-usulan-baca-saja](screenshot-online/B4-manager-detail-usulan-baca-saja.png) | Lulus |
| UO-22 | TS, Manager | Aksi usulan ditolak backend | `POST /pengajuan` `{id_screening: 21}` dan `PATCH /screening/21/tidak-diteruskan` | 403 | Keduanya 403 "Anda tidak memiliki akses ke fitur ini." untuk TS dan Manager | Lulus |
| UO-23 | HR Client | Detail usulan ditolak | `GET /screening/21`, `POST /pengajuan`, `PATCH .../tidak-diteruskan` dengan `hr@`; buka Pengajuan Kandidat | 403; tidak ada tab Usulan TS | Semua 403; halaman HR tanpa tab Usulan (hanya daftar pengajuan) | Lulus |
| UO-24 | Talent | Detail usulan ditolak | `GET /screening/21`, `POST /pengajuan`, `PATCH .../tidak-diteruskan` dengan `talent@` | 403 | Semua 403 | Lulus |

### B5. Fitur talent

| ID | Role | Skenario | Langkah | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| UO-25 | Talent | Checklist kelengkapan profil | `talent@` → Profil & CV Saya | Kartu checklist di atas form sesuai `kelengkapan_profil` | "Profil lengkap · 3/3 syarat", "Profil lengkap, Anda sudah masuk talent pool. Status kandidat: Tersedia.", tiga syarat tercentang. [B5-talent-checklist-profil](screenshot-online/B5-talent-checklist-profil.png) | Lulus |
| UO-26 | Talent | Stepper seleksi, semua tahap selesai | `talent@` → Proses Seleksi | Penjelasan status + stepper 4 tahap | Backend Developer · PT Maju Jaya: Diajukan ke Klien ✓, Interview ✓, Evaluasi ✓, Penempatan ✓; "Anda sudah ditempatkan di klien ini. Detailnya ada di menu Penempatan Saya." (lihat catatan C-2) | Lulus |
| UO-27 | Talent | Stepper seleksi, tahap interview | `talent09@` → Proses Seleksi | Tahap saat ini = Interview, penjelasan status | Diajukan ✓, "2 Interview (tahap saat ini)", Evaluasi & Penempatan belum; "Klien ingin mengenal Anda lebih jauh. Ikuti jadwal interview yang diatur Account Manager." [B5-talent09-stepper-seleksi-390](screenshot-online/B5-talent09-stepper-seleksi-390.png) | Lulus |
| UO-28 | Talent | Belum pernah diajukan | `talent16@` → Proses Seleksi | Keadaan kosong | "Belum ada pengajuan kandidat." | Lulus |
| UO-29 | Talent | Kartu sisa kuota cuti | `talent01@` → Pengajuan Cuti & Shift | Kartu sisa kuota sama dengan `GET /cuti/kuota` | "Sisa kuota cuti 2026 · 9 hari kerja", "Terpakai 3 dari 12 hari kerja"; API `{tahun 2026, kuota 12, terpakai 3, sisa 9}`. [B5-talent01-kartu-kuota-cuti](screenshot-online/B5-talent01-kartu-kuota-cuti.png) | Lulus |
| UO-30 | Talent | Cuti melebihi kuota (UI) | Ajukan Cuti → 1–31 Des 2026 → Kirim Pengajuan (390 px) | Peringatan di form + pesan backend tampil; tidak ada data baru | Form: "Lama cuti: 23 hari kerja — melebihi sisa kuota."; API 422 ditampilkan apa adanya: "Sisa kuota cuti tahun 2026 adalah 9 hari kerja, sedangkan pengajuan ini 23 hari kerja."; kuota tetap terpakai 3. [B5-talent01-cuti-lewat-kuota-390](screenshot-online/B5-talent01-cuti-lewat-kuota-390.png) | Lulus |
| UO-31 | Talent | Validasi cuti (API) | `POST /cuti` dengan: mulai hari ini; hanya Sabtu–Minggu; penempatan milik talent lain | 422 dengan pesan Bahasa Indonesia | "Tanggal mulai cuti paling cepat besok." · "Rentang tanggal cuti hanya berisi hari Sabtu/Minggu. Pilih minimal satu hari kerja." · "Cuti hanya dapat diajukan untuk penempatan milik Anda." | Lulus |
| UO-32 | Talent | Cuti untuk talent yang tidak ditempatkan | `talent@` buka `/pengajuan-cuti-shift` langsung | Akses Ditolak dengan alasan | "Akses Ditolak — Fitur ini tersedia setelah Anda ditempatkan di perusahaan klien." [B5-talent-cuti-belum-ditempatkan-390](screenshot-online/B5-talent-cuti-belum-ditempatkan-390.png) | Lulus |
| UO-33 | Talent | Tampilan 390 px | Profil, Proses Seleksi, Cuti di 390 px | Tidak ada gulir samping | `scrollWidth` 390 di semua halaman | Lulus |

### B6. Histori dokumen & surat akhir penempatan

Data online belum punya surat akhir penempatan sama sekali (lihat catatan C-1), jadi **satu** penempatan diakhiri: **#7 Wahyu Nugroho — DevOps Engineer, PT Nusantara Retail Indonesia** (tidak dipakai akun demo utama `hr@`/`talent@`/`am@`/`ts@`).

| ID | Role | Skenario | Langkah | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| UO-34 | TS | Histori Dokumen sebelum diakhiri | Penugasan Penempatan → klik Wahyu Nugroho | Bagian Histori Dokumen tampil | Histori: Kontrak Kerja `kontrak-kerja-wahyu-nugroho.pdf`, 18 Sep 2026, Ditandatangani; ringkasan 1 cuti, 28 shift, 2 monitoring, 0 keluhan. [B6-ts-akhiri-penempatan-sebelum](screenshot-online/B6-ts-akhiri-penempatan-sebelum.png) | Lulus |
| UO-35 | AM, HR Client, Talent | Mengakhiri penempatan ditolak | `PATCH /placement/7/status` dengan `am@`, `hr06@`, `talent05@` | 403 | Ketiganya 403 "Anda tidak memiliki akses ke fitur ini." | Lulus |
| UO-36 | TS | Dihentikan tanpa alasan | UI: pilih Dihentikan → Akhiri Penempatan tanpa alasan; API: `PATCH` `{status_placement: dihentikan}` | UI menolak; API 422; penempatan tetap aktif | UI menampilkan pesan wajib; API 422 "Alasan penghentian wajib diisi bila penempatan dihentikan."; status tetap `aktif` | Lulus |
| UO-37 | TS | Hentikan penempatan | Pilih Dihentikan → isi alasan → Akhiri Penempatan | 200; status Dihentikan; tanggal selesai = hari ini; surat dibuat | 200 "Penempatan dihentikan. Surat Pemberhentian Penempatan dibuat dan menunggu tanda tangan Manager."; status Dihentikan, selesai 17 Nov 2026 | Lulus |
| UO-38 | TS | TS tidak melihat surat akhir | Lihat detail sesudahnya; `GET /dokumen`, `GET /dokumen/35`, `GET /dokumen/35/download` | Surat tidak tampil; alasan tidak tampil; akses langsung 403 | Histori hanya Kontrak Kerja; `alasan_penghentian` null; surat tidak ada di daftar dokumen; `GET` & unduh 403 "Anda tidak memiliki akses ke dokumen ini." [B6-ts-histori-dokumen-tanpa-surat-390](screenshot-online/B6-ts-histori-dokumen-tanpa-surat-390.png) | Lulus |
| UO-39 | Manager | Melihat & mengunduh surat | Penugasan Penempatan → Wahyu → Histori Dokumen; unduh dokumen 35 | Surat + alasan tampil; Manager diminta tanda tangan; PDF terunduh | Alasan penghentian tampil; "Surat Pemberhentian Penempatan · `surat-pemberhentian-penempatan-wahyu-nugroho-001-sphp-its-xi-2026.pdf` · Menunggu Tanda Tangan"; penandatangan Hendra Gunawan, `perlu_tanda_tangan_saya: true`; notifikasi `tanda_tangan_diminta`; unduhan 200 `application/pdf`. [B6-manager-histori-dokumen](screenshot-online/B6-manager-histori-dokumen.png) | Lulus |
| UO-40 | AM | Melihat surat | `GET /placement/7`, `GET /dokumen/35` | Surat & alasan tampil | Keduanya 200, surat dan alasan tampil | Lulus |
| UO-41 | HR Client | HR klien penempatan melihat surat | `hr06@` → Penugasan Penempatan → Wahyu (390 px) | Surat & alasan tampil | Sesuai; tanpa gulir samping | Lulus |
| UO-42 | HR Client | HR klien lain ditolak | `hr@`, `hr03@` → `GET /placement/7`; `hr@` → `GET /dokumen/35` | 403 | 403 "Anda tidak memiliki akses ke penempatan ini." / "...ke dokumen ini." | Lulus |
| UO-43 | Talent | Talent melihat surat & notifikasi | `talent05@` → Penempatan Saya → detail (390 px); notifikasi; unduh surat | Surat & alasan tampil; notifikasi surat (kanal email); menu Dokumen tetap terbuka | Histori memuat surat + Kontrak Kerja; notifikasi `surat_akhir_penempatan` kanal `email` status `terkirim`; `akses_dokumen: true`; unduhan PDF 200. [B6-talent05-histori-dokumen-390](screenshot-online/B6-talent05-histori-dokumen-390.png) | Lulus |
| UO-44 | TS | Talent kembali ke pool (R20) | `GET /talent-pool?search=Wahyu` | `tersedia` | `status_ketersediaan` tersedia, `status_kandidat` tersedia | Lulus |

## C. Fitur inti (cek cepat)

Setiap halaman dibuka di 1366 px; dianggap lulus bila data tampil dan tidak ada respons API ≥ 400 maupun error JavaScript.

| ID | Role | Skenario | Langkah | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| UO-45 | TS | Talent pool + detail | Talent Pool → klik baris pertama | Ringkasan + daftar + laci detail | Total 21, Tersedia 17; laci Detail Talent terbuka | Lulus |
| UO-46 | TS | Rekomendasi kandidat | Rekomendasi Kandidat → Fullstack Developer | Kandidat skor ≥ 70 dengan rincian | "2 kandidat direkomendasikan": Budi 84, Fajar 74; rincian 80/20 dan "Sudah Diusulkan ke AM". [C7-ts-rekomendasi-kandidat](screenshot-online/C7-ts-rekomendasi-kandidat.png) | Lulus |
| UO-47 | TS | Pipeline rekrutmen | Pipeline Rekrutmen | Ringkasan & SLA tampil | 4 berjalan (4 diproses), SLA terlambat 2 | Lulus |
| UO-48 | HR Client | Permintaan kebutuhan + detail | Permintaan Kebutuhan → klik baris | Hanya permintaan klien sendiri | 2 permintaan PT Maju Jaya; detail Frontend Developer (1/2 terpenuhi, Terlambat). [C7-hr-permintaan-kebutuhan](screenshot-online/C7-hr-permintaan-kebutuhan.png) | Lulus |
| UO-49 | HR Client | Pengajuan kandidat + detail | Pengajuan Kandidat → klik baris | Daftar & detail | Detail Bagas Saputra (Menunggu Tinjauan) terbuka | Lulus |
| UO-50 | AM | Pengajuan kandidat + detail | Pengajuan Kandidat → klik baris | Daftar & detail | Sesuai | Lulus |
| UO-51 | AM | Jadwal interview | Jadwal Interview | Daftar + filter status | 15 jadwal (API), daftar tampil | Lulus |
| UO-52 | Manager | Dokumen & tanda tangan | Dokumen | Daftar dokumen + filter jenis | 29 dokumen (termasuk surat UO-37), filter jenis lengkap. [C7-manager-dokumen](screenshot-online/C7-manager-dokumen.png) | Lulus |
| UO-53 | Manager | Dashboard | Dashboard Rekapitulasi; `GET /dashboard/manager` | Kartu & agregasi | 8 permintaan (4 diproses), SLA terlambat 2 | Lulus |
| UO-54 | HR Client | Cuti & shift | Pengajuan Cuti & Shift | Daftar cuti + tab shift | 4 cuti, tab Jadwal Shift tersedia | Lulus |
| UO-55 | Manager | Monitoring kinerja | Monitoring Kinerja | Kartu per talent + filter | Aktif 4, Belum Aktif 0, Selesai 3 (setelah UO-37) | Lulus |
| UO-56 | HR Client | Keluhan | Tiket Komplain Klien | Ringkasan + tombol Buat Laporan | Total 3 tiket | Lulus |
| UO-57 | AM | Keluhan | Tiket Komplain Klien | Semua tiket | Total 4 tiket | Lulus |
| UO-58 | Talent | Notifikasi | Notifikasi | Daftar + Tandai Semua Dibaca | 10 belum dibaca, sama dengan `GET /notifikasi/belum-dibaca/jumlah` | Lulus |
| UO-59 | Talent | Penempatan Saya + detail | `talent01@` → Penempatan Saya → klik baris | Detail penempatan sendiri | Backend Developer · PT Maju Jaya, Aktif; ringkasan operasional | Lulus |
| UO-60 | Talent | Dokumen talent | `talent@` → Dokumen | Halaman terbuka (punya kontrak untuk ditandatangani) | Terbuka tanpa error | Lulus |
| UO-61 | Semua | Tanpa istilah "AI" | Pindai 36 berkas JS produksi Vercel | Tidak ada teks "AI" | Tidak ditemukan | Lulus |

## Rekap

| Role | Lulus | Gagal |
|---|---|---|
| Manager | 7 (UO-01, 08, 21, 39, 52, 53, 55) | 0 |
| Account Manager | 12 (UO-02, 09, 14–19, 40, 50, 51, 57) | 0 |
| Talent Support | 11 (UO-03, 10, 20, 34, 36–38, 44–47) | 0 |
| HR Client | 9 (UO-04, 11, 23, 41, 42, 48, 49, 54, 56) | 0 |
| Talent | 16 (UO-05, 12, 24–33, 43, 58–60) | 0 |
| Lintas role / tamu | 6 (UO-06, 07, 13, 22, 35, 61) | 0 |
| **Total** | **61** | **0** |

UO-22 (TS & Manager) dan UO-35 (AM, HR Client, Talent) menguji beberapa role sekaligus dan dihitung di baris lintas role.

## Catatan (bukan kegagalan)

- **C-1 — Data online berbeda dari seeder saat ini.** Penempatan #1 Budi Santoso (`talent@`) sudah berstatus `selesai` (seeder: aktif s.d. 6 Apr 2027) dan tidak punya surat akhir; penempatan #3 Putri juga tanpa surat, padahal seeder sekarang membuatnya. Kemungkinan database online di-seed sebelum fitur surat akhir penempatan (R37). Akibatnya `talent@` tidak bisa dipakai untuk demo menu Cuti & Shift atau kartu kuota cuti; gunakan `talent01@` (Dimas).
- **C-2 — Status seleksi Budi.** Proses Seleksi menampilkan "Anda sudah ditempatkan di klien ini" walau penempatannya sudah Selesai. Ini sesuai aturan `status_tampil` di spec (evaluasi punya placement → Ditempatkan), tetapi kalimatnya bisa membingungkan talent yang penempatannya sudah berakhir.
- **C-3 — Label status untuk talent.** Penempatan yang dihentikan tampil "Selesai" bagi talent dan "Dihentikan" bagi internal/HR Client. Sesuai spec (`status_tampil`), dicatat agar tidak dianggap bug saat demo.
- **C-4 — Permintaan DevOps.** Setelah UO-37, permintaan #4 DevOps Engineer tetap `terpenuhi` dengan 0/1 penempatan aktif. Spec R20 memang tidak mengubah status permintaan.
- **C-5 — Data pengguna nyata.** Talent pool online memuat pendaftar "Jane" (`jane@gmail.com`) dari registrasi publik.

## Data yang berubah selama uji

1. **Penempatan #7 Wahyu Nugroho dihentikan** oleh `ts@` (17 Nov 2026 ±19.15 WIB), tanggal selesai 17 Nov 2026, alasan "Uji sistem online: penghentian penempatan untuk pengujian black box (data uji)."
2. Dokumen baru **#35 Surat Pemberhentian Penempatan** `001/SPHP/ITS/XI/2026`, status Menunggu Tanda Tangan Manager (Hendra Gunawan). Belum ditandatangani.
3. Notifikasi baru: `talent05@` (surat akhir penempatan, **email terkirim lewat Brevo** ke `talent05@intellisys.test`) dan `manager@` (permintaan tanda tangan).
4. Wahyu kembali `tersedia` di talent pool; permintaan #4 tetap `terpenuhi` (C-4).
5. Token login: 5 login lewat form (sudah keluar) dan 12 token API untuk uji (sudah dicabut dengan `POST /auth/logout`).
6. Lupa password untuk `tidak-terdaftar-uji-online@example.com`: tidak ada akun, tidak ada email terkirim.

Tidak ada usulan, pengajuan, cuti, shift, monitoring, keluhan, atau notifikasi lain yang diubah (aksi "Ajukan ke Klien" dan "Tidak Diteruskan" tidak dijalankan; percobaan yang ditolak 403/422 tidak menyimpan data).
