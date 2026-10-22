# Blackbox Testing — Fase 8: Notifikasi & Pengingat

**FR:** FR-16 (R29–R31)
**Komponen/halaman:** lonceng di header (semua halaman), `/notifikasi` (semua role)
**Endpoint:** `GET /notifikasi`, `GET /notifikasi/belum-dibaca/jumlah`, `PATCH /notifikasi/{id}/baca`, `PATCH /notifikasi/baca-semua`; command `php artisan notifikasi:pengingat`

## Prasyarat

- Backend `php artisan migrate:fresh --seed && php artisan serve` (MySQL Laragon menyala). Seeder menjalankan alur Fase 4–7 lewat service asli sehingga setiap akun demo sudah punya notifikasi (mis. `hr@` 6 belum dibaca).
- Untuk email pengingat: `php artisan queue:work` (mail driver `log`, email tercatat di `storage/logs/laravel.log`).
- Frontend `npm run dev`, buka `http://localhost:5173`.
- Diuji 2026-10-22 di Chrome (headless, puppeteer), berurutan dari data seed bersih.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| N-01 | Badge lonceng | Login HR | - | Badge merah menunjukkan jumlah belum dibaca (6), bukan angka statis | 6 | Lulus |
| N-02 | Dropdown | Klik lonceng | - | 6 notifikasi terbaru dulu (permintaan tanda tangan paling atas), ikon sesuai jenis, waktu relatif, titik biru untuk belum dibaca | Sesuai | Lulus |
| N-03 | Buka dari dropdown | Klik "Anda diminta menandatangani dokumen …" | - | Pindah ke Dokumen (Quotation & PO); badge berkurang menjadi 5 | Sesuai | Lulus |
| N-04 | Tandai semua | Lonceng → **Tandai semua dibaca** | - | Badge hilang | Sesuai | Lulus |
| N-05 | Event baru (R30) | Talent mengajukan cuti; HR membuka **Lihat semua notifikasi** → tab **Belum dibaca** | Cuti H+20 | Badge 1; satu notifikasi "Budi Santoso mengajukan cuti … Mohon beri keputusan." | Sesuai | Lulus |
| N-06 | Buka dari halaman | Klik notifikasi cuti | - | Pindah ke Pengajuan Cuti & Shift; notifikasi ditandai dibaca, badge hilang | Sesuai | Lulus |
| N-07 | Pengingat harian (R31) | Jalankan `php artisan notifikasi:pengingat`; login AM → Notifikasi | - | Keluaran "SLA: 4" (2 job × AM & Manager); AM menerima "SLA … sudah terlambat" & "… jatuh tempo", bertanda "dikirim juga lewat email" | Sesuai | Lulus |
| N-08 | Tujuan pengingat SLA | Klik pengingat terlambat | - | Pindah ke Pipeline Rekrutmen | Sesuai | Lulus |
| N-09 | Idempoten | Jalankan command lagi di hari yang sama | - | "SLA: 0" (tidak ada duplikat) | Sesuai | Lulus |
| N-talent / N-ts / N-manager | Semua role | Buka `/notifikasi` | - | Halaman tersedia (bukan Akses Ditolak), judul header "Notifikasi", berisi notifikasi miliknya | Sesuai | Lulus |
| N-10 | Hak akses | Talent `PATCH /notifikasi/1/baca` (milik HR); `GET /notifikasi` | - | 403 "Anda tidak memiliki akses ke notifikasi ini."; daftar hanya milik talent | Sesuai | Lulus |
| N-HP | Tampilan HP | Lebar 375px, buka lonceng | - | Tanpa scroll horizontal; dropdown selebar layar (margin 8px) dan dapat digulir | `scrollWidth` 375, dropdown 8–367px | Lulus |
