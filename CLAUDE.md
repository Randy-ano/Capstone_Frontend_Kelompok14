# CLAUDE.md — Frontend Intellisys Talent Hub

Frontend React untuk sistem outsourcing talent PT Intellisys (proyek capstone Kelompok 14).
Backend (Laravel REST API) ada di repo terpisah `Randy-ano/Capstone_Kelompok14`. Di laptop Randy, letaknya di folder `..\backend`. Kontrak API, aturan bisnis, dan daftar endpoint per role ada di `BACKEND_SPEC.md` repo backend; baca bagian 7 (endpoint) dan 8 (contoh JSON) sebelum menyambungkan halaman ke API.

## Stack & perintah

React 18 + Vite 5 + Tailwind CSS 3 + React Router 6. Tidak ada library UI atau state global lain; tidak ada test runner.

```
npm install
npm run dev     # http://localhost:5173 (backend harus jalan di http://localhost:8000)
npm run build   # cek tidak ada error sebelum melapor selesai
```

Buka lewat `localhost:5173`, bukan `127.0.0.1`: CORS backend hanya mengizinkan origin `http://localhost:5173`.

## Struktur

- `src/lib/api.js`: **satu-satunya** cara memanggil backend. `api(path, { method, body })` menambahkan `Authorization: Bearer`, mengembalikan JSON, dan melempar `ApiError` (`status`, `message`, `errors` per field dari validasi 422). Status 401 otomatis menghapus token. Base URL dari `VITE_API_URL` (default `http://localhost:8000/api/v1`).
- `src/auth/AuthContext.jsx`: `useAuth()` → `{ user, loading, login, logout }`. Token disimpan di `localStorage`; saat reload, sesi dipulihkan via `GET /auth/me`.
- `src/auth/RequireAuth.jsx`: semua halaman di dalam `AppLayout` wajib login; tamu diarahkan ke `/login`.
- `src/auth/roles.js`: konstanta `ROLE`, `ROLE_LABEL`, `INTERNAL` (AM/TS/Manager), `displayUser()`.
- `src/data/navigation.js`: menu sidebar. Field `roles` mengikuti kolom Role di tabel endpoint spec (tanpa `roles` = semua role). `AppLayout` menampilkan `AksesDitolak` kalau role tidak berhak. Ini hanya kenyamanan tampilan; pengamanan sebenarnya di backend (403).
- `src/components/`: `AppLayout`, `Sidebar`, `Header` (berisi menu user + Keluar).
- `src/pages/`: halaman. `Login` dan `AksesDitolak` sudah memakai API/auth; `DashboardRekapitulasi`, `PermintaanKebutuhan`, `PenempatanMonitoring`, `AiMatchRecommendation` masih **data mockup statis** dari Stitch; menu lain memakai `ComingSoon`.

## Konvensi

- Desain mengikuti token Stitch di `tailwind.config.js`: warna (`primary`, `surface-container-*`, `on-surface`, `error-container`, …), spacing `space-xs/sm/md/lg/xl`, tipografi `font-*`/`text-*` (`headline-sm`, `body-md`, `label-lg`, …), ikon Material Symbols (`<span className="material-symbols-outlined">`). Pakai token ini, jangan warna/ukuran Tailwind mentah.
- Semua teks UI dalam **Bahasa Indonesia**. Tampilkan pesan error dari backend apa adanya (`err.message`, `err.errors[field][0]`); backend sudah mengirim pesan Bahasa Indonesia.
- Format response backend: `{ data, message }`; list ber-pagination berisi `data`, `links`, `meta`. Nilai role: `talent`, `hr_client`, `account_manager`, `talent_support`, `manager`.
- Menyambungkan halaman mockup ke API hanya setelah endpoint-nya ada di backend (cek `routes/api.php` di repo backend). Ganti data statis dengan pemanggilan `api()`, pertahankan tampilan.
- Istilah "AI": spec melarang kata "AI" di backend karena rekomendasi kandidat berbasis aturan. Halaman/menu `AiMatchRecommendation` ("AI Match Recommendation") masih memakai istilah itu; user belum memutuskan apakah diganti (mis. "Rekomendasi Kandidat"). Tanyakan sebelum mengubahnya, dan jangan menambah istilah "AI" baru.

## Akun demo (dari seeder backend, password `password`)

`manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test`. Saat `npm run dev`, daftarnya tampil di halaman login.

## Alur kerja

Jangan commit langsung ke `main`; kerja di branch sendiri lalu Pull Request. Format pesan commit: `SCRUM-<nomor issue Jira> deskripsi singkat` (belum ada issue → `SCRUM-0`).
