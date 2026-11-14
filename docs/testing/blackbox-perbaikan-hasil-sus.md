# Blackbox Testing — Perbaikan Hasil SUS

**Lingkup:** lima perbaikan dari feedback SUS, **tanpa perubahan skema database**:
1. Checklist kelengkapan profil (R4) di atas halaman Profil & CV dengan progres dan kalimat ajakan/konfirmasi talent pool (`kelengkapan_profil` dari backend).
2. Penjelasan singkat setiap status + stepper tahapan di halaman Proses Seleksi talent.
3. Sisa kuota cuti tampil di halaman Cuti sebelum talent mengajukan (`GET /cuti/kuota`, endpoint yang sudah ada).
4. Tabel utama di lebar < 640 px tampil sebagai kartu bertumpuk (sudah dipenuhi `TabelKartu`; diverifikasi).
5. Pesan sukses lupa password menambahkan "Jika tidak ada di Kotak Masuk, cek folder Spam."

## Prasyarat

- Backend `php artisan migrate:fresh --seed` (database uji terpisah) di `http://localhost:8001`; frontend dev server `http://localhost:5174` dengan `VITE_API_URL=http://localhost:8001/api/v1`.
- Akun (password `password`): `talent20@` (belum ada kompetensi), `talent21@` (belum ada pendidikan), `talent@` (Budi, ditempatkan), `talent07@` (Kevin, menunggu tinjauan), `talent08@` (Anisa, lanjut interview), `talent18@` (Galih, evaluasi ditolak), `talent19@` (Hafiz, ditolak klien), `talent12@` (Intan, diterima), `am@`, `hr@`.
- Diuji 2026-11-14 dengan Chrome headless (puppeteer) di 1366, 639, 600, dan 390 px. Test backend: `tests/Feature/Talent/KelengkapanProfilTest.php` (8 test) + test lupa password diperbarui; seluruh suite 860 test lulus.

## 1. Checklist kelengkapan profil

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| SUS-01 | Profil belum lengkap | Login `talent20@` → Profil & CV Saya | - | Kartu di atas form: "2/3 syarat", progres, "Lengkapi profil agar masuk talent pool.", kompetensi belum tercentang | ✓ Nama lengkap · ✓ Riwayat pendidikan (min. 1) · ○ Kompetensi (min. 1); kartu di atas Data Pribadi | Lulus |
| SUS-02 | Profil menjadi lengkap | Tambah kompetensi & simpan, muat ulang | Kompetensi Laravel | "3/3 syarat", "Profil lengkap, kamu sudah masuk talent pool." | Sesuai (+ "Status kandidat: Tersedia.") | Lulus |
| SUS-03 | Syarat lain belum terpenuhi, lebar HP | Login `talent21@`, lebar 390 px | - | Pendidikan belum tercentang; tidak meluap | ○ Riwayat pendidikan; lebar dokumen 390 px | Lulus |

## 2. Status seleksi talent

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| SUS-04 | Menunggu tinjauan klien | `talent07@` → Proses Seleksi | - | Stepper: langkah 1 aktif; teks & tooltip badge "Diajukan ke klien: profilmu sedang ditinjau oleh HR klien." | Sesuai | Lulus |
| SUS-05 | Lanjut interview + detail | `talent08@` → Proses Seleksi → buka detail | - | Langkah 1 selesai, Interview aktif; penjelasan interview; stepper sama di Detail Pengajuan | Sesuai | Lulus |
| SUS-06 | Evaluasi ditolak | `talent18@` | - | Diajukan & Interview selesai, Evaluasi berhenti (silang); "Klien tidak melanjutkan proses ini. …" | Sesuai | Lulus |
| SUS-07a | Ditolak saat tinjauan | `talent19@` | - | Langkah 1 berhenti (silang) | Sesuai | Lulus |
| SUS-07b | Diterima | `talent12@` | - | Tiga langkah selesai, Penempatan aktif; "Selamat, klien menerimamu. …" | Sesuai | Lulus |
| SUS-07c | Ditempatkan | `talent@` | - | Semua langkah selesai; "Kamu sudah ditempatkan di klien ini. …" | Sesuai | Lulus |
| SUS-08 | Role internal tidak berubah | `am@` → Pengajuan Kandidat | - | Kolom "Tahap Saat Ini" tetap, tanpa stepper talent | Sesuai | Lulus |

## 3. Sisa kuota cuti

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| SUS-09 | Kuota tampil sebelum mengajukan | `talent@` → Pengajuan Cuti & Shift | - | Kartu sisa kuota di atas tombol "Ajukan Cuti", sesuai `GET /cuti/kuota` | "Sisa kuota cuti 2026: 8 hari kerja · Terpakai 4 dari 12 hari kerja (cuti menunggu & disetujui)" | Lulus |
| SUS-10 | Kuota diperbarui setelah mengajukan | Ajukan Cuti 1 hari kerja lewat form | 7 Des 2026, alasan diisi | Kartu langsung berkurang 1 | Menjadi 7 hari kerja, terpakai 5 | Lulus |
| SUS-11 | Bukan talent | `hr@` → Pengajuan Cuti & Shift | - | Tanpa kartu kuota | Sesuai | Lulus |

## 4. Tabel di HP

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| SUS-13 | Lebar 390, 600, 639 px | Buka Talent Pool, Pengajuan Kandidat, Penempatan, Dokumen (AM); Cuti (HR Client); Proses Seleksi, Penempatan Saya, Cuti, Dokumen (talent) | - | Tidak ada gulir horizontal; tabel tampil sebagai kartu bertumpuk | 9 halaman × 3 lebar: lebar dokumen = lebar layar, tidak ada area geser, `thead` tersembunyi & baris berupa kartu | Lulus |

## 5. Lupa password

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| SUS-12 | Pesan sukses | `/lupa-password` → kirim | `tidakada@intellisys.test` | "Jika email terdaftar, tautan reset sudah dikirim. Jika tidak ada di Kotak Masuk, cek folder Spam." | Sesuai (pesan dari backend) | Lulus |

**Ringkasan:** 17/17 skenario lulus (SUS-13 di tiga lebar layar).
