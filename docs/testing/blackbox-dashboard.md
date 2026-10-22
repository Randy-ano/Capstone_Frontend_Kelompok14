# Blackbox Testing — Fase 9: Dashboard Rekapitulasi

**FR:** FR-20 (R32)
**Halaman:** `/dashboard-rekapitulasi` (semua role; beranda setelah login)
**Endpoint:** `GET /dashboard/ringkasan` (semua role), `GET /dashboard/manager` (Manager)

## Prasyarat

- Backend `php artisan migrate:fresh --seed && php artisan serve` (MySQL Laragon menyala). Angka yang diharapkan di bawah berasal dari data seed bersih.
- Frontend `npm run dev`, buka `http://localhost:5173`. Akun: `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test` (password `password`).
- Diuji 2026-10-22 di Chrome (headless, puppeteer).

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| R-manager | Kartu Manager | Login Manager, buka Dashboard | - | Sapaan & nama asli (bukan mockup "Bambang"); 6 kartu: Permintaan berjalan 4, SLA terlambat 1 (1 mendekati), Talent ditempatkan 1, Cuti menunggu 1, Keluhan terbuka 1, Perlu tanda tangan 1 | Sesuai | Lulus |
| R-analitik | Analitik R32 | Gulir ke bawah, hover batang bulan ini | - | Grafik tren placement 12 bulan (tooltip "Okt 2026: 1 placement"); panel Kandidat per Tahapan (tersedia 12, screening 1, ditempatkan 1) dan Permintaan per Status (draft 1, diajukan 3, diproses 1) | Sesuai | Lulus |
| R-am | Kartu AM | Login AM | - | 6 kartu: Permintaan berjalan 4, Siap diajukan 0, Menunggu tinjauan 0, Interview 7 hari 0, Keluhan terbuka 1, Perlu tanda tangan 0; tanpa analitik Manager | Sesuai | Lulus |
| R-ts | Kartu TS | Login TS | - | 4 kartu: Talent tersedia 12, Permintaan perlu kandidat 4, Screening belum diputuskan 1, Menunggu placement 0 | Sesuai | Lulus |
| R-hr | Kartu HR Client | Login HR | - | 6 kartu data PT Maju Jaya: Permintaan berjalan 2, Kandidat perlu ditinjau 0, Interview 0, Talent ditempatkan 1, Cuti menunggu 1, Perlu tanda tangan 1 | Sesuai | Lulus |
| R-tujuan | Kartu sebagai tautan | HR klik "Perlu tanda tangan Anda" | - | Pindah ke Dokumen (Quotation & PO) | Sesuai | Lulus |
| R-talent | Kartu Talent | Login talent | - | Status profil "Lengkap", Status kandidat "Ditempatkan" (Backend Developer di PT Maju Jaya), Interview 0, Cuti menunggu 1 | Sesuai | Lulus |
| R-*-tanpa-analitik | Analitik khusus Manager | AM, TS, HR, Talent | - | Panel Tren Placement tidak tampil | Sesuai | Lulus |
| R-403 | API Manager | `GET /dashboard/manager` dengan token AM | - | 403 "Anda tidak memiliki akses ke fitur ini." | 403 | Lulus |
| R-HP | Tampilan HP | Lebar 375px (Manager & Talent) | - | Kartu satu kolom, grafik menyesuaikan lebar, tanpa scroll horizontal | `scrollWidth` 375 | Lulus |
