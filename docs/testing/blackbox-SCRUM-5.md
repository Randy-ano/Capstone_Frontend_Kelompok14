# Blackbox Testing — SCRUM-5 Daftar Akun (FR-01)

**Halaman:** `/daftar` (publik)
**Endpoint:** `POST /api/v1/auth/register/talent`, `POST /api/v1/auth/register/hr-client`

## Prasyarat

- Backend berjalan di `http://localhost:8000` (MySQL Laragon menyala, `php artisan migrate --seed` sudah dijalankan).
- Frontend berjalan lewat `npm run dev`, dibuka di `http://localhost:5173/daftar`.
- Belum login (kalau sudah, klik **Keluar** dulu atau hapus `intellisys_token` dari localStorage).
- Email `talent@intellisys.test` dan `hr@intellisys.test` sudah ada dari seeder (dipakai untuk kasus email terdaftar).
- Untuk kasus sukses, gunakan email baru yang belum pernah didaftarkan (mis. `budi.uji1@example.com`).

## A. Navigasi

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil | Status |
|----|----------|---------|-----------------------|-------|--------|
| NAV-01 | Dari login ke daftar | Buka `/login`, klik **Daftar** pada teks "Belum punya akun? Daftar" | Pindah ke `/daftar`, tab "Saya Talent" aktif | | |
| NAV-02 | Dari daftar ke login | Di `/daftar`, klik **Masuk** pada teks "Sudah punya akun? Masuk" | Pindah ke `/login` | | |
| NAV-03 | Ganti jenis akun | Klik tab "Saya HR Perusahaan", lalu "Saya Talent" | Form berganti; HR menampilkan bagian "Data Anda" dan "Data Perusahaan"; pesan error sebelumnya hilang | | |
| NAV-04 | Sudah login membuka `/daftar` | Login sebagai talent, buka `/daftar` | Langsung diarahkan ke beranda (Dashboard Rekapitulasi) | | |

## B. Daftar Talent

| ID | Skenario | Data uji | Hasil yang diharapkan | Hasil | Status |
|----|----------|----------|-----------------------|-------|--------|
| TAL-01 | Daftar sukses | Nama: Budi Santoso; Email: email baru; Password & konfirmasi: `rahasia123` | Tombol menampilkan "Memproses..." dan nonaktif; setelah sukses langsung masuk ke Dashboard Rekapitulasi; header menampilkan "Budi Santoso" · Talent | | |
| TAL-02 | Semua field wajib kosong | Semua kosong, klik **Daftar** | Request tidak dikirim; pesan umum "Periksa kembali isian yang ditandai."; di bawah field: "Nama lengkap wajib diisi.", "Email wajib diisi.", "Password wajib diisi.", "Konfirmasi password wajib diisi." | | |
| TAL-03 | Email tidak valid | Email: `budi@` (field lain valid) | Request tidak dikirim; di bawah email: "Format email tidak valid." | | |
| TAL-04 | Email sudah terdaftar | Email: `talent@intellisys.test` (field lain valid) | Request dikirim, backend 422; pesan umum dari backend di atas form; di bawah email pesan backend ("email sudah digunakan."); tetap di `/daftar` | | |
| TAL-05 | Password < 8 karakter | Password & konfirmasi: `abc123` | Request tidak dikirim; di bawah password: "Password minimal 8 karakter." | | |
| TAL-06 | Konfirmasi password beda | Password: `rahasia123`; konfirmasi: `rahasia124` | Request tidak dikirim; di bawah konfirmasi: "Konfirmasi password tidak sama." | | |
| TAL-07 | Tampilkan/sembunyikan password | Isi password, klik ikon mata | Isi password terlihat sebagai teks; klik lagi kembali tersembunyi | | |
| TAL-08 | Setelah sukses langsung masuk | Setelah TAL-01, muat ulang halaman (F5) | Tetap login (sesi dipulihkan via `/auth/me`), tidak dilempar ke `/login` | | |

## C. Daftar HR Perusahaan

| ID | Skenario | Data uji | Hasil yang diharapkan | Hasil | Status |
|----|----------|----------|-----------------------|-------|--------|
| HR-01 | Daftar sukses (lengkap) | Nama HR: Sari Wulandari; Jabatan: HR Manager; Email: email baru; Password & konfirmasi: `rahasia123`; Perusahaan: PT Maju Jaya; Alamat, No. Telepon, Penanggung Jawab diisi | Tombol loading & nonaktif; setelah sukses langsung masuk ke Dashboard Rekapitulasi; header menampilkan "Sari Wulandari" · "HR Manager · PT Maju Jaya" | | |
| HR-02 | Daftar sukses (hanya field wajib) | Nama HR, Email, Password, Konfirmasi, Nama Perusahaan saja | Sukses dan langsung masuk; field opsional boleh kosong | | |
| HR-03 | Semua field wajib kosong | Semua kosong, klik **Daftar** | Request tidak dikirim; pesan umum di atas form; error di bawah Nama HR, Email, Password, Konfirmasi Password, Nama Perusahaan | | |
| HR-04 | Email tidak valid | Email: `sari.example.com` | Request tidak dikirim; "Format email tidak valid." | | |
| HR-05 | Email sudah terdaftar | Email: `hr@intellisys.test` | Backend 422; pesan umum dari backend dan error di bawah email; tetap di `/daftar` | | |
| HR-06 | Password < 8 karakter | Password & konfirmasi: `1234567` | Request tidak dikirim; "Password minimal 8 karakter." | | |
| HR-07 | Konfirmasi password beda | Password: `rahasia123`; konfirmasi: `rahasia321` | Request tidak dikirim; "Konfirmasi password tidak sama." | | |
| HR-08 | Setelah sukses langsung masuk | Setelah HR-01, buka menu **Permintaan Kebutuhan** | Halaman terbuka (bukan Akses Ditolak) karena role `hr_client`; F5 tetap login | | |

## D. Lain-lain

| ID | Skenario | Langkah | Hasil yang diharapkan | Hasil | Status |
|----|----------|---------|-----------------------|-------|--------|
| ETC-01 | Backend mati | Matikan `php artisan serve`, isi form valid, klik **Daftar** | Pesan "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan."; tombol aktif kembali | | |
| ETC-02 | Tampilan HP | DevTools → mode perangkat 375px, buka kedua tab | Tidak ada scroll horizontal; field tersusun satu kolom; tab jenis akun tetap terbaca | | |
| ETC-03 | Error hilang saat diperbaiki | Picu error di field email, lalu ketik ulang email | Pesan error di bawah email hilang saat diketik | | |
