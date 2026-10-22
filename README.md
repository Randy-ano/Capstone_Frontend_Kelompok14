# Intellisys Talent Hub — Frontend

Frontend sistem outsourcing talent PT Intellisys: React (Vite), Tailwind CSS, React Router.
Desain mengikuti mockup Stitch "Intellisys Talent Hub Design System".

Backend (Laravel REST API) ada di repo terpisah: [Capstone_Backend_Kelompok14](https://github.com/Randy-ano/Capstone_Backend_Kelompok14). Ikuti `README.md`/`SETUP.md` di sana untuk menyiapkan backend, database, queue, dan scheduler.

Dokumentasi API (semua endpoint beserta contoh request/response): jalankan `php artisan scribe:generate` di repo backend lalu buka http://localhost:8000/docs. File OpenAPI ada di http://localhost:8000/docs.openapi dan koleksi Postman di http://localhost:8000/docs.postman.

## Cara Menjalankan

Prasyarat: Node.js ≥ 18, dan backend sudah berjalan (`php artisan serve` → `http://localhost:8000`).

```
npm install
npm run dev
```

Buka http://localhost:5173 (pakai `localhost`, bukan `127.0.0.1`, agar sesuai pengaturan CORS backend).

Alamat API default `http://localhost:8000/api/v1`. Untuk mengubahnya, salin `.env.example` menjadi `.env` lalu isi `VITE_API_URL`.

## Akun demo

Dari seeder backend, password semuanya `password`. Saat `npm run dev`, daftar akun ini juga tampil di halaman login.

| Email | Role |
|---|---|
| manager@intellisys.test | Manager |
| am@intellisys.test | Account Manager |
| ts@intellisys.test | Talent Support |
| hr@intellisys.test | HR Client |
| talent@intellisys.test | Talent |

## Status

Semua halaman memakai API backend asli (tanpa data mockup). Menu & halaman yang tampil mengikuti role; hak akses tetap ditegakkan backend.

| Halaman | Role |
|---|---|
| Login, daftar akun talent / HR Client, lonceng & halaman notifikasi | Semua |
| Dashboard Rekapitulasi (kartu ringkasan per role; analitik R32 untuk Manager) | Semua |
| Pipeline Rekrutmen (progres & SLA) | Internal |
| Profil & CV Saya | Talent |
| Talent Pool | Internal |
| Rekomendasi Kandidat & screening | Talent Support |
| Permintaan Kebutuhan (job requirement) | HR Client, internal |
| Pengajuan Kandidat, Jadwal Interview, Penugasan Penempatan | Semua (data sesuai role) |
| Monitoring Kinerja | Account Manager, Manager |
| Pengajuan Cuti & Shift | Talent, HR Client, Manager |
| Tiket Komplain Klien | HR Client, Account Manager, Manager |
| Dokumen (Quotation & PO) + tanda tangan | Semua (data sesuai role) |
| Master Data Skill | Talent Support, Manager |
| Kelola Akun Pegawai | Manager |
| Pengaturan Akun | Belum dibuat (di luar spec backend) |

Hasil uji black box per fitur ada di [`docs/testing/`](docs/testing/).

## Struktur

```
src/
  lib/api.js         # client REST API (token Bearer, pesan error dari backend)
  auth/              # sesi login (AuthContext), proteksi halaman, label role
  data/navigation.js # menu sidebar + role yang boleh mengakses
  components/        # layout: Sidebar, Header
  pages/             # halaman
```

## Alur kerja tim

Buat branch sendiri dari `main`, jangan commit langsung ke `main`. Nama branch `<jenis>/<nama-singkat>` dan format pesan commit `<jenis>: <deskripsi singkat>`, dengan jenis `fitur`, `perbaikan`, `pembaruan`, `test`, atau `dokumen` (contoh branch `fitur/talent-pool`, commit `fitur: halaman talent pool`). Jangan pakai kode Jira (`SCRUM-xx`). Selesai → push branch lalu buat Pull Request ke `main`.
