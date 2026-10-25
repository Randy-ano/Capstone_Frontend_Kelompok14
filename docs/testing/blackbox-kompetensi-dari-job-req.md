# Blackbox Testing — Kompetensi Baru dari Form Job Requirement

**Aturan bisnis:** R33 (BACKEND_SPEC), bersama R7 (minimal 1 kompetensi)
**Halaman:** `/permintaan-kebutuhan` & `/pipeline-rekrutmen` (form buat/ubah permintaan), `/master-data-skill` (TS, Manager), `/profil-saya` (Talent)
**Endpoint:** `POST /job-requirements`, `PUT /job-requirements/{id}` (field baru `kompetensi_baru`), `GET /kompetensi`, `PUT/DELETE /kompetensi/{id}`, `PUT /talent/profil/kompetensi`

## Prasyarat

- Backend di `http://localhost:8000` setelah `php artisan migrate:fresh --seed` (30 kompetensi master, termasuk Laravel, Docker, Node.js, React).
- Frontend `npm run dev`, dibuka di `http://localhost:5173`. Akun: `hr@`, `am@`, `ts@`, `talent@intellisys.test` (password `password`).
- Diuji 2026-10-25 di Chrome (headless, lewat puppeteer), berurutan dari data seed bersih (skenario selanjutnya memakai data hasil skenario sebelumnya).
- Aturan pencocokan nama: huruf kecil, tanpa spasi, titik, tanda hubung, dan garis bawah. "React.js", "reactjs", dan "React JS" dianggap sama.

## A. HR Client

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| KJ-07 | Tanpa kompetensi | **Buat Permintaan**, isi posisi & SLA, langsung **Simpan Draft** | Kompetensi kosong | Pesan backend "Pilih minimal 1 kompetensi." tampil | Pesan tampil di atas form dan di bawah pilihan kompetensi | Lulus |
| KJ-08 | Nama kompetensi baru terlalu pendek | Ketik "a" di pencarian kompetensi, tekan Enter, **Simpan Draft** | `a` | Pesan backend "Kolom kompetensi baru harus berisi minimal 2 karakter." tampil | Pesan tampil apa adanya | Lulus |
| KJ-05 | Hapus kompetensi baru sebelum disimpan | Tutup dropdown, klik ✕ pada chip "a" | - | Chip hilang, tidak ikut dikirim | Chip hilang | Lulus |
| KJ-06 | Ketik nama yang mirip master | Ketik "node js" di pencarian | `node js` | Node.js tampil di daftar; opsi "Tambah … sebagai kompetensi baru" tidak muncul | Node.js tampil, tanpa opsi tambah | Lulus |
| KJ-04 | Tambah kompetensi baru | Centang **Laravel**, ketik "Tailwind   CSS", klik **Tambah "Tailwind CSS" sebagai kompetensi baru** | `Tailwind   CSS` | Opsi tambah muncul; chip "Tailwind CSS" berlabel kecil **baru** (spasi ganda dirapikan) | Sesuai | Lulus |
| KJ-17 | Tampilan HP | Form yang sama di lebar 375 px | - | Form rapi, tanpa scroll horizontal | Tanpa scroll horizontal; tombol aksi tetap di bawah | Lulus |
| KJ-01 | Simpan job dengan 1 kompetensi baru + 1 master | **Simpan Draft** | Laravel + Tailwind CSS | "Job requirement berhasil dibuat."; detail memuat Laravel dan Tailwind CSS; Tailwind CSS masuk master dengan kategori kosong | Detail memuat kedua kompetensi; `GET /kompetensi` berisi Tailwind CSS, `kategori: null` | Lulus |

## B. Account Manager

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| KJ-03 | Nama mirip kompetensi buatan HR | **Buat Permintaan**, pilih klien PT Maju Jaya, ketik "TAILWIND-css" | `TAILWIND-css` | Tailwind CSS tampil di daftar, tanpa opsi tambah (tidak dobel di master) | Sesuai | Lulus |
| KJ-09 | Nama dobel di kompetensi baru | Centang **Docker**, ketik "Golang" + Enter, lalu "golang" + Enter | `Golang`, `golang` | Hanya 1 chip "Golang" | 1 chip "Golang" | Lulus |
| KJ-02 | Simpan & ajukan | **Simpan & Ajukan** | Docker + Golang | Tersimpan berstatus diajukan; detail memuat Docker dan Golang; master bertambah tepat 1 (Golang) | Detail sesuai; master 31 → 32 | Lulus |
| KJ-10 | Tambah kompetensi baru saat mengubah job | Di detail job tadi klik **Ubah**, ketik "gRPC" + Enter, **Simpan Perubahan** | `gRPC` | "Job requirement berhasil diperbarui."; detail memuat gRPC | Sesuai | Lulus |

## C. Talent Support (pengelola master)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| KJ-11 | Kompetensi dari job req muncul di master | Buka **Master Data Skill**, cari "Tailwind" | `Tailwind` | Baris Tailwind CSS dengan kategori "-" | `Tailwind CSS \| -` | Lulus |
| KJ-12 | Ubah nama & kategori | **Ubah** → nama "Tailwind", kategori "Frontend" → **Simpan Perubahan** | `Tailwind`, `Frontend` | Tersimpan; tabel menampilkan nama & kategori baru | Sesuai | Lulus |
| KJ-13a | Hapus kompetensi yang masih dipakai job | Lihat tombol **Hapus** pada baris Tailwind | - | Tombol nonaktif (masih dipakai permintaan kebutuhan) | Tombol nonaktif | Lulus |
| KJ-13b | Hapus kompetensi buatan job req yang sudah tidak dipakai | (HR membuat job dengan kompetensi baru "Hapus Coba", lalu menggantinya dengan Laravel lewat API.) Cari "Hapus Coba" → **Hapus** → **Ya, Hapus** | `Hapus Coba` | Baris hilang dari master | Terhapus | Lulus |
| KJ-15 | TS tidak bisa membuat job | Buka `/permintaan-kebutuhan?buat=1`; panggil `POST /job-requirements` dengan token TS | `kompetensi_baru: ["Rust"]` | Form tidak terbuka; API 403 "Anda tidak memiliki akses ke fitur ini." | Form tidak terbuka; 403 dengan pesan tersebut | Lulus |

## D. Talent

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| KJ-14 | Kompetensi baru langsung bisa dipilih di profil | Buka **Profil & CV Saya** (lebar 375 px), buka pilihan kompetensi, cari "Golang", centang, **Simpan** | `Golang` | Golang ada di daftar (tanpa opsi tambah kompetensi baru); tersimpan di profil | Golang tampil & tersimpan (`GET /talent/profil`) | Lulus |
| KJ-16 | Talent tidak bisa membuat job | Buka `/permintaan-kebutuhan`; panggil `POST /job-requirements` dengan token talent | - | Halaman "Akses Ditolak"; API 403 | Sesuai | Lulus |

## E. Hak akses master tidak berubah

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| KJ-18 | HR Client menambah master langsung | `POST /kompetensi` dengan token HR | `nama_kompetensi: "Rust"` | 403 | 403 | Lulus |

## Ringkasan

23 pemeriksaan otomatis (18 skenario di atas, sebagian terdiri dari beberapa pemeriksaan): **23/23 lulus**. Backend: `php artisan test` 623 test lulus (29 test baru di `tests/Feature/JobRequirement/KompetensiBaruTest.php`).
