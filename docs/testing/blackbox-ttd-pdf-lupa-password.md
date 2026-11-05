# Blackbox Testing — Tanda Tangan di PDF & Lupa Password via Email

**Lingkup:** frontend & backend (branch `fitur/ttd-pdf-lupa-password` di kedua repo).

## Prasyarat

- Diuji 2026-11-05 di Chrome headless lewat puppeteer, terhadap backend asli dengan database uji terpisah hasil `migrate:fresh --seed`. `MAIL_MAILER=log`: isi email dibaca dari `storage/logs/laravel.log`.
- Akun demo (password `password`): `manager@`, `am@`, `hr@` (PT Maju Jaya), `talent@intellisys.test` (Budi), `talent03@intellisys.test` (untuk reset password).
- Lebar desktop 1366 px, HP 390 px.
- Isi PDF diperiksa dengan merender setiap halaman menjadi gambar dan menghitung halaman/gambar di dalamnya.

## Tanda tangan tercetak di PDF

Dokumen buatan sistem (quotation, PO, PKS) dirender ulang dari templatenya dengan blok tanda tangan per penandatangan. PDF unggahan diberi halaman **Lembar Pengesahan** di akhir. PDF dibuat saat diunduh; file asli tidak berubah.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| D-01 | Manager unduh dokumen buatan sistem yang sudah ditandatangani semua | Dokumen → PKS PT Maju Jaya → Unduh Dokumen | `manager@` | PDF 1 halaman, blok tanda tangan AM, Manager, HR berisi gambar, nama, peran, "Ditandatangani · tanggal, jam WIB" | 1 halaman, 3 gambar tanda tangan; peran "Senior Account Manager", "Manager", "HR Manager, PT Maju Jaya" | Lulus |
| D-02 | HR Client unduh dokumen buatan sistem yang belum lengkap | Dokumen → Quotation QUO/…/012 → Unduh | `hr@` | Tanda tangan AM tercetak; kotak Manager & HR bertuliskan "Belum ditandatangani" | Sesuai (1 gambar, 2 kotak "Belum ditandatangani") | Lulus |
| D-03 | Talent unduh PDF unggahan, lalu menandatangani di canvas | Dokumen → Perpanjangan kontrak Budi → Unduh; gambar tanda tangan → Tanda Tangani → Unduh lagi | `talent@` | Sebelum: halaman asli + Lembar Pengesahan (Budi "Belum ditandatangani"). Sesudah: gambar tanda tangan Budi dari canvas, tanggal & jam, status "Ditandatangani"; Manager tetap "Belum ditandatangani" | 2 halaman (1 asli + 1 lembar); sesudah tanda tangan gambar canvas tampil di baris Budi | Lulus |
| D-04 | Dokumen draft tanpa penandatangan | Dokumen → PO draft → Unduh | `am@` | File asli dikirim apa adanya | Isi unduhan identik dengan file di disk | Lulus |
| D-05 | Keterangan di panel dokumen (HP) | Buka detail dokumen yang punya penandatangan | `talent@`, 390 px | Keterangan "PDF yang diunduh memuat tanda tangan…"; tanpa geser horizontal | Sesuai | Lulus |
| D-06 | Akses tetap dibatasi | Unduh quotation klien lain lewat API | `hr@` (PT Maju Jaya) | 403 | 403 "Anda tidak memiliki akses ke dokumen ini." | Lulus |
| D-07 | File asli tidak diubah (backend) | Test `PdfTandaTanganTest` | Unduh sebelum & sesudah tanda tangan | Isi file di disk sama persis; PDF unduhan valid; halaman unggahan bertambah 1 | Sesuai | Lulus |
| D-08 | PDF tidak dapat dibaca / bukan PDF (backend) | Test `PdfTandaTanganTest` | PDF rusak, file PNG | File asli dikirim apa adanya (tidak error) | Sesuai | Lulus |

## Lupa password via email

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| L-01 | Tautan di halaman Masuk | Klik "Lupa password?" | — | Halaman Lupa Password | Sesuai | Lulus |
| L-02 | Email kosong | Klik Kirim Tautan Reset | (kosong) | Pesan 422 backend tampil | "Kolom email wajib diisi." | Lulus |
| L-03 | Email tidak terdaftar | Kirim | `tidakada@intellisys.test` | "Jika email terdaftar, tautan reset sudah dikirim." (tidak membocorkan akun) | Sesuai, tidak ada email terkirim | Lulus |
| L-04 | Email terdaftar | Kirim | `talent03@intellisys.test` | Pesan sama dengan L-03; email Bahasa Indonesia di `laravel.log` berisi tautan `…/reset-password?token=…&email=…` | Sesuai (subjek "[Intellisys Talent Hub] Reset password", berlaku 60 menit) | Lulus |
| L-05 | Konfirmasi tidak sama | Buka tautan, isi password & konfirmasi berbeda | `sandibaru123` / `berbeda123` | Pesan 422 backend | "Konfirmasi password baru tidak cocok." | Lulus |
| L-06 | Token salah | Buka tautan dengan token diubah | `token=salah123` | "Tautan reset password tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru." + tombol Minta tautan baru | Sesuai | Lulus |
| L-07 | Tautan tidak lengkap | Buka `/reset-password` tanpa token | — | Pesan tautan tidak lengkap + Minta tautan baru | Sesuai | Lulus |
| L-08 | Reset berhasil | Isi password baru & konfirmasi sama | `sandibaru123` | Diarahkan ke Masuk dengan pesan "Password berhasil direset. Silakan masuk dengan password baru." dan email terisi | Sesuai | Lulus |
| L-09 | Password lama tidak berlaku | Masuk dengan password lama | `password` | "Email atau password salah." | Sesuai | Lulus |
| L-11 | Masuk dengan password baru | Masuk | `sandibaru123` | Berhasil masuk ke dashboard | Ke `/dashboard-rekapitulasi` | Lulus |
| L-12 | Tautan sekali pakai | Buka tautan yang sama lagi, isi password | `lagilagi123` | Ditolak dengan pesan token tidak valid | Sesuai | Lulus |
| L-10 | Tampilan HP | Lupa Password & Reset Password di 390 px | — | Rapi, tanpa geser horizontal | Sesuai | Lulus |
| L-13 | Batas permintaan | Kirim lupa/reset lebih dari 5 kali dalam 1 menit (curl; test `LupaPasswordTest`) | — | Ke-6 ditolak 429 "Terlalu banyak percobaan. Silakan coba lagi nanti."; batas login tidak ikut terpakai | Sesuai | Lulus |
| L-14 | Token lama dicabut (backend) | Test `LupaPasswordTest` | Token login sebelum reset | 401 setelah reset; token kedaluwarsa > 60 menit ditolak | Sesuai | Lulus |

## Ringkasan

- Uji browser: 18/18 skenario lulus (Manager, AM, HR Client, talent; desktop dan HP). Isi PDF diverifikasi dengan merender halaman unduhan. D-06 dan L-13 diuji lewat API.
- Backend: `php artisan test` 705 lulus; `php artisan migrate:fresh --seed` di MySQL berjalan tanpa error.
- `npm run build` tanpa error.
