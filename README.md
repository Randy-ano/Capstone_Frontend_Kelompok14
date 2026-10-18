# Intellisys Talent Hub — Frontend

Frontend sistem outsourcing talent PT Intellisys: React (Vite), Tailwind CSS, React Router.
Desain mengikuti mockup Stitch "Intellisys Talent Hub Design System".

Backend (Laravel REST API) ada di repo terpisah: [Capstone_Kelompok14](https://github.com/Randy-ano/Capstone_Kelompok14). Ikuti `SETUP.md` di sana untuk menyiapkan backend dan database.

## Menjalankan

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

| Bagian | Kondisi |
|---|---|
| Login, sesi, logout, menu sesuai role | Tersambung ke API backend |
| Halaman lain (dashboard, permintaan kebutuhan, dst.) | Masih data mockup; disambungkan ke API setelah endpoint-nya tersedia di backend |

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

Buat branch sendiri dari `main`, jangan commit langsung ke `main`. Format pesan commit: `SCRUM-<nomor issue Jira> deskripsi singkat`. Selesai → push branch lalu buat Pull Request ke `main`.
