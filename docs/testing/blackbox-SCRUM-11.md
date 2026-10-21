# Blackbox Testing — SCRUM-11 Talent Pool (FR-06)

**Halaman:** `/talent-pool` (menu "Talent Pool", role Account Manager, Talent Support, Manager)
**Endpoint:** `GET /api/v1/talent-pool`, `GET /api/v1/talent-pool/{id}`, `GET /api/v1/talent-pool/{id}/cv`, `PATCH /api/v1/talent-pool/{id}` (TS), `GET /api/v1/kompetensi`

## Prasyarat

- Backend berjalan di `http://localhost:8000` setelah `php artisan migrate:fresh --seed` (14 talent di pool, semua `tersedia`).
- Frontend `npm run dev`, dibuka di `http://localhost:5173`.
- Untuk kasus CV: login `talent@intellisys.test` lalu `POST /api/v1/talent/cv/generate` agar Budi Santoso punya CV.
- Untuk kasus riwayat screening: tambahkan screening untuk talent Budi Santoso (mis. lewat `php artisan tinker` dengan `ScreeningTalent::factory()`), karena seeder belum membuat data screening.
- Diuji 2026-10-21 di Chrome (headless, lewat puppeteer) dengan data seeder.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| MENU-TS | Menu tampil untuk role internal | Login TS, lihat sidebar | `ts@intellisys.test` | Menu "Talent Pool" ada di grup Talent Management dan membuka `/talent-pool` | Menu tampil, halaman terbuka | Lulus |
| RING-01 | Kartu ringkasan | Buka `/talent-pool` | - | 3 kartu: Total Talent 14, Tersedia 14, Tidak Tersedia 0 (dari `meta.ringkasan`) | 14 / 14 / 0 | Lulus |
| RING-02 | Ringkasan tidak terpengaruh filter | Ketik kata cari | `budi` | Tabel tersaring, angka kartu tetap 14 / 14 / 0 | Kartu tetap 14 / 14 / 0 | Lulus |
| TAB-01 | Tabel & kolom | Buka halaman | - | 10 baris; kolom Nama (+email), Pendidikan, Kompetensi (maks 3 chip + "+N"), Tag Keahlian, Tanggal Masuk, Status | 10 baris, kolom sesuai, chip "+1" muncul untuk talent dengan 4 kompetensi | Lulus |
| CARI-01 | Cari nama | Ketik di kotak cari | `budi` | Hanya talent yang cocok tampil (pencarian dikirim setelah berhenti mengetik) | 2 baris, termasuk Budi Santoso | Lulus |
| CARI-02 | Cari tanpa hasil | Ketik di kotak cari | `zzzz-tidak-ada` | Pesan "Tidak ada talent yang cocok dengan pencarian atau filter." | Pesan tampil | Lulus |
| KOMP-01 | Filter kompetensi (DAN) | Klik **Kompetensi**, centang Laravel dan MySQL | Laravel, MySQL | Hanya talent yang punya kedua kompetensi; chip "Harus memiliki:" tampil dan bisa dihapus | 2 talent (Budi Santoso, Gamblang Winarno), sama dengan API | Lulus |
| STAT-01 | Filter status | Pilih status "Tidak Tersedia" | `tidak_tersedia` | Tabel kosong dengan pesan filter (seed semua tersedia) | Pesan tampil | Lulus |
| PAGE-01 | Pagination | Klik halaman **2** | - | 4 baris; teks "Menampilkan 11–14 dari 14 talent" | Sesuai | Lulus |
| DET-01 | Drawer detail | Klik baris Budi Santoso | - | Drawer kanan: profil, kompetensi, tag, riwayat pendidikan, pengalaman kerja + "Total 3,1 tahun", riwayat screening (badge Lolos / Tidak Lolos + skor), tombol Lihat CV | Semua bagian tampil | Lulus |
| CV-01 | Lihat CV (TS) | Di drawer, klik **Lihat CV** | Talent sudah generate CV | PDF terbuka di tab baru | Tab baru berisi PDF (blob) | Lulus |
| CV-02 | Talent belum punya CV | Buka detail Anggabaya Agus Budiman | - | Tombol **Lihat CV** nonaktif, teks "Talent belum membuat CV." | Sesuai | Lulus |
| UBAH-01 | TS ubah status & tag | Di "Kelola Talent Pool" pilih Tidak Tersedia, isi tag, klik **Simpan Perubahan** | `Laravel, Vue, Docker` | Pesan backend "Data talent pool berhasil diperbarui."; tag tampil sebagai chip | Sesuai | Lulus |
| UBAH-02 | Ringkasan ikut berubah | Setelah UBAH-01 | - | Kartu menjadi 14 / 13 / 1 | 14 / 13 / 1 | Lulus |
| UBAH-03 | Tabel ikut berubah | Tutup drawer | - | Baris Budi berstatus "Tidak Tersedia" dengan tag baru | Sesuai | Lulus |
| UBAH-04 | Kembalikan status | Pilih Tersedia, tag semula, simpan | `Laravel, MySQL, REST API, Git` | Kartu kembali 14 / 14 / 0 | Sesuai | Lulus |
| ERR-01 | Pesan error backend tampil | Isi tag lebih dari 255 karakter (batas input dihapus lewat DevTools), simpan | 260 karakter | Backend 422; pesan "Kolom tag keahlian tidak boleh berisi lebih dari 255 karakter." tampil di form | Pesan tampil apa adanya | Lulus |
| RO-am | AM hanya melihat | Login AM, buka detail | `am@intellisys.test` | Daftar, ringkasan, detail, Lihat CV bisa; bagian "Kelola Talent Pool" tidak ada | Sesuai; CV terbuka | Lulus |
| RO-manager | Manager hanya melihat | Login Manager, buka detail | `manager@intellisys.test` | Sama seperti AM | Sesuai; CV terbuka | Lulus |
| API-403 | Backend menolak ubah selain TS | `PATCH /talent-pool/1` dengan token AM / Manager | `{"tag_keahlian":"x"}` | 403 "Anda tidak memiliki akses ke fitur ini." | 403, pesan sesuai | Lulus |
| TOLAK-hr | HR Client ditolak | Login HR, buka `/talent-pool` | `hr@intellisys.test` | Menu tidak tampil; halaman "Akses Ditolak"; API `GET /talent-pool` 403 | Sesuai | Lulus |
| TOLAK-talent | Talent ditolak | Login Talent, buka `/talent-pool` | `talent@intellisys.test` | Menu tidak tampil; halaman "Akses Ditolak"; API 403 | Sesuai | Lulus |
| HP-01 | Tampilan HP | Lebar 375px | - | Tidak ada scroll horizontal halaman; kartu & filter satu kolom; tabel bergeser di dalam kartunya; sidebar jadi menu (ikon ☰) | `scrollWidth` 375, menu ☰ membuka sidebar | Lulus |
| HP-02 | Drawer di HP | Lebar 375px, buka detail | - | Drawer selebar layar, tombol Lihat CV tetap terlihat di bawah | Drawer 375px | Lulus |
