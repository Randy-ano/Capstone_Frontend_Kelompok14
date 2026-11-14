# Blackbox Testing — Detail Kandidat sebelum Diajukan ke Klien

**Lingkup:** feedback SUS — Account Manager melihat detail kandidat usulan Talent Support **sebelum** memutuskan. Panel samping "Detail Usulan Kandidat" (`GET /screening/{id}`) berisi identitas & pendidikan terakhir, pengalaman kerja, skor kecocokan (skor tersimpan saat diusulkan + rincian kompetensi 80% / pengalaman 20% yang dihitung ulang dari profil saat ini), kompetensi + kategori, bahasa + tingkat, catatan screening TS, tautan CV PDF dan sertifikat. Tombol **Ajukan ke Klien** dan **Tidak Diteruskan** ada di bawah panel dan hanya untuk AM; TS & Manager membuka detail yang sama dalam mode baca. Tidak ada perubahan skema database.

## Prasyarat

- Backend `php artisan migrate:fresh --seed` (database uji terpisah), dijalankan di `http://localhost:8001`; frontend dev server di `http://localhost:5174` dengan `VITE_API_URL=http://localhost:8001/api/v1`.
- Akun demo (password `password`): `am@`, `ts@`, `manager@`, `hr03@` (HR Client PT Sinar Digital Nusantara, klien permintaan Data Analyst), `talent@intellisys.test`.
- Data demo: usulan menunggu AM **Farhan Maulana** (Data Analyst, skor 84, ada CV + 1 sertifikat PDF + bahasa) dan **Bagas Saputra** (Frontend Developer, tanpa CV/sertifikat). Satu usulan tambahan (Hafiz Akbar → Data Analyst) dibuat TS lewat API sebelum uji.
- Diuji 2026-11-14 dengan Chrome headless (puppeteer) di lebar 1366 px dan 390 px, ditambah pemanggilan API langsung untuk role yang ditolak. Test backend: `tests/Feature/Screening/DetailUsulanTest.php` (16 test), seluruh suite 834 test lulus.

## Account Manager

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| BB-01 | Daftar usulan tidak lagi punya aksi langsung | Login AM → Pengajuan Kandidat → tab "Usulan dari Talent Support" | - | Tiap baris punya tombol "Tinjau Detail"; tidak ada tombol "Teruskan/Ajukan ke Klien" di daftar | 3 tombol "Tinjau Detail" (Bagas, Farhan, Hafiz); tidak ada tombol ajukan di daftar | Lulus |
| BB-02 | Isi panel detail & posisi tombol | Klik "Tinjau Detail" Farhan Maulana | - | Nama, pendidikan terakhir, pengalaman kerja, skor 84 "saat diusulkan", keterangan "dihitung ulang dari profil saat ini", Kompetensi (80%) & Pengalaman (20%), kompetensi cocok/kurang, kompetensi + kategori, bahasa + tingkat, catatan TS, CV & sertifikat; tombol "Tidak Diteruskan" & "Ajukan ke Klien" di bawah panel | Semua data tampil ("S1 Sistem Informasi – Universitas Airlangga", "Junior Data Analyst", "4 dari 5 kompetensi permintaan dimiliki", "2,2 tahun dari minimal 2 tahun", ✗ Power BI, "Python · Backend", "Inggris – Fasih", catatan TS, sertifikat Google Data Analytics); urutan: Identitas → Pengalaman Kerja → Skor Kecocokan → Kompetensi & Bahasa → Catatan Screening → CV & Sertifikat → tombol | Lulus |
| BB-03 | Unduh CV PDF | Di panel detail klik "Lihat CV" | - | CV terbuka di tab baru sebagai PDF | `GET /talent-pool/14/cv` → 200 `application/pdf`, tab baru `blob:` | Lulus |
| BB-04 | Buka sertifikat | Klik "Lihat" pada sertifikat | - | Pratinjau file sertifikat terbuka di atas panel; Esc hanya menutup pratinjau | `GET /sertifikat/8/file` → 200 `application/pdf`; pratinjau terbuka, panel detail tetap terbuka setelah Esc | Lulus |
| BB-05 | Tidak Diteruskan tanpa alasan | Klik "Tidak Diteruskan" → langsung kirim | Alasan kosong | Pesan "Alasan tidak diteruskan wajib diisi."; batal kembali ke panel detail | Sesuai | Lulus |
| BB-06 | Kandidat tanpa CV/sertifikat & pesan error backend | Buka detail Bagas; usulan Bagas diputuskan "tidak diteruskan" dari sesi lain; klik "Ajukan ke Klien" | - | "Talent belum membuat CV." & "Belum ada sertifikat."; tombol Lihat CV nonaktif; pesan 422 backend tampil apa adanya di panel | Sesuai; pesan: "Usulan ini sudah tidak diteruskan sehingga tidak dapat diajukan ke klien." | Lulus |
| BB-07 | Ajukan ke Klien berhasil | Detail Farhan → "Ajukan ke Klien" | - | Toast sukses, panel usulan tertutup, Detail Pengajuan terbuka, status usulan "diteruskan" | Toast "Kandidat berhasil diajukan ke klien. (Farhan Maulana)", Detail Pengajuan terbuka, `status_usulan` = `diteruskan` | Lulus |
| BB-08 | Tidak Diteruskan berhasil & detail hanya baca | Detail Hafiz → "Tidak Diteruskan" → isi alasan → kirim; filter "Tidak diteruskan" → "Lihat Detail" | "Klien meminta pengalaman Power BI minimal 1 tahun." | Toast, usulan hilang dari daftar menunggu; detail di filter menampilkan alasan, keterangan "Usulan ini tidak diteruskan.", tanpa tombol aksi | Sesuai | Lulus |
| BB-09 | Tombol "Ajukan Kandidat" di kepala halaman | Klik "Ajukan Kandidat" → pilih Farhan | - | Modal hanya berisi "Tinjau Detail"; memilih kandidat membuka panel detail yang sama dengan tombol aksi | Sesuai (tidak ada jalan pintas "Teruskan ke Klien" lagi) | Lulus |
| BB-10 | Detail dari Detail Permintaan | Permintaan Kebutuhan → Data Analyst → Kandidat Diusulkan → klik Farhan | - | Panel detail hanya baca + tautan "Buka Usulan TS" ke tab usulan | Tanpa tombol aksi; tautan menuju `/pengajuan-kandidat?tab=usulan` | Lulus |
| BB-11 | Tampilan lebar HP | Lebar 390 px, buka detail Farhan, gulir sampai bawah | - | Tidak ada gulir horizontal; tombol menempel di bawah layar, bertumpuk selebar panel | Lebar dokumen 390 px, luapan 0 px; "Ajukan ke Klien" di atas "Tidak Diteruskan", masing-masing 342 px | Lulus |
| BB-11b | Daftar usulan di HP | Lebar 390 px, tab usulan | - | Baris menjadi kartu dengan tombol "Tinjau Detail" | 3 kartu, lebar dokumen 390 px | Lulus |

## Talent Support & Manager (hanya baca)

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| BB-12 | TS membuka detail usulan | Login TS → Rekomendasi Kandidat (Data Analyst) → "Sudah Diusulkan ke AM" → klik Farhan | - | Detail lengkap, CV bisa dibuka, tanpa tombol aksi, keterangan "Hanya Account Manager yang dapat mengajukan usulan ini ke klien." | Sesuai | Lulus |
| BB-13 | Manager membuka detail usulan | Login Manager → Permintaan Kebutuhan → Data Analyst → Kandidat Diusulkan → klik Farhan | - | Detail hanya baca; Esc menutup detail usulan saja | Tanpa tombol aksi; detail permintaan tetap terbuka setelah Esc | Lulus |

## Role yang ditolak

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| BB-14 | HR Client klien permintaan tidak melihat usulan | Login `hr03@` → `/pengajuan-kandidat?tab=usulan` | - | Tidak ada tab usulan; Farhan (belum diajukan) tidak ada di daftar | Sesuai | Lulus |
| BB-15 | HR Client memanggil API langsung | `GET /screening/19`, `GET /talent-pool/14/cv`, `GET /sertifikat/8/file` dengan token `hr03@` | - | Semua 403 | 403 "Anda tidak memiliki akses ke fitur ini." / 403 / 403 "Anda tidak memiliki akses ke file sertifikat ini." | Lulus |
| BB-16 | Talent ditolak | `GET /screening/19` dengan token talent; buka `/pengajuan-kandidat?tab=usulan` | - | 403; halaman Proses Seleksi tanpa tab usulan | 403 "Anda tidak memiliki akses ke fitur ini."; tab tidak tampil | Lulus |
| BB-17 | HR Client setelah kandidat diajukan | Setelah BB-07, login `hr03@` → Pengajuan Kandidat; buka file sertifikat | - | Farhan tampil di daftar pengajuan; sertifikat bisa dibuka; detail usulan tetap 403 | Farhan tampil; sertifikat 200 `application/pdf`; `GET /screening/19` 403 | Lulus |

**Ringkasan:** 19/19 skenario lulus.
