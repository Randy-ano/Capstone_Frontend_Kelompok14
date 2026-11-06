# Intellisys Talent Hub — Frontend

Frontend sistem outsourcing talent PT Intellisys IT Outsourcing: React (Vite), Tailwind CSS, React Router.
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

Alamat API default `/api/v1`, diteruskan proxy Vite ke `http://localhost:8000` (hanya saat pengembangan). Untuk mengubahnya, salin `.env.example` menjadi `.env` lalu isi `VITE_API_URL`. Untuk produksi lihat [Deploy ke Vercel](#deploy-ke-vercel).

## Membagikan demo lewat Cloudflare Tunnel

1. Jalankan backend dan frontend seperti biasa.
2. Install `cloudflared`, lalu jalankan:

   ```
   cloudflared tunnel --url http://localhost:5173
   ```

3. Bagikan link `https://....trycloudflare.com` yang muncul.

Jika memakai file `.env`, `VITE_API_URL` harus `/api/v1`; alamat absolut ke `localhost:8000` tidak berfungsi lewat link tunnel. Link hanya aktif selama laptop, kedua server, dan `cloudflared` menyala.

## Deploy ke Vercel

Backend dideploy lebih dulu di Railway (lihat `DEPLOY.md` di repo backend). Setelah itu:

1. Vercel → **Add New… → Project** → **Import** repo `Capstone_Frontend_Kelompok14`.
2. **Framework Preset: Vite**. Build command (`npm run build`) dan output (`dist`) sudah diatur di `vercel.json`, jadi tidak perlu diubah.
3. **Environment Variables**: tambahkan `VITE_API_URL` = alamat absolut backend, mis. `https://intellisys-api.up.railway.app/api/v1` (https, diakhiri `/api/v1`). Proxy Vite hanya ada saat `npm run dev`, sehingga alamat relatif `/api/v1` tidak berfungsi di Vercel. Build sengaja gagal dengan pesan jelas jika variabel ini kosong atau relatif.
4. **Deploy**. Salin domain yang diberikan (mis. `https://intellisys-talent-hub.vercel.app`) ke variabel `FRONTEND_URL` backend di Railway (tanpa `/` di akhir), lalu deploy ulang backend. Tanpa langkah ini browser menolak permintaan karena CORS.
5. Setiap kali `VITE_API_URL` diubah, lakukan **Redeploy** (Deployments → ⋯ → Redeploy). Nilai `VITE_*` ditanam ke kode saat build, jadi perubahan baru berlaku setelah build ulang.

`vercel.json` mengarahkan semua rute ke `index.html` (aplikasi satu halaman, sehingga membuka atau me-refresh `/dokumen` tetap berfungsi). File di `/assets/` diberi cache satu tahun karena namanya sudah memuat hash dari Vite; `index.html` tidak di-cache lama sehingga versi baru langsung terpakai.

## Akun demo

Dari seeder backend, password semuanya `password`. Daftar ini tidak ditampilkan di halaman Masuk; ketik email dan password secara manual.

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
| Dokumen + tanda tangan | Semua (data sesuai role) |
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
