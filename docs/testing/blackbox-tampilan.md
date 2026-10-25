# Blackbox Testing — Pembaruan Tampilan (Logo, Konsistensi, HP)

**Lingkup:** perubahan tampilan saja; tidak ada perubahan fitur, pemanggilan API, hak akses, maupun nama menu/label/path.
**Halaman:** semua menu kelima role, halaman Masuk dan Daftar.

## Prasyarat

- Backend `php artisan migrate:fresh --seed` lalu `php artisan serve`; frontend `npm run dev`, dibuka di `http://localhost:5173`.
- Akun demo (password `password`): `manager@`, `am@`, `ts@`, `hr@`, `talent@intellisys.test`.
- Diuji 2026-10-25 di Chrome (headless, lewat puppeteer) pada lebar 1280 px (desktop) dan 390 px (HP). Untuk setiap role, semua menu di sidebar ditambah `/notifikasi` dibuka satu per satu (58 kombinasi halaman × lebar).
- Pemeriksaan otomatis per halaman: tidak ada luberan horizontal (`scrollWidth <= innerWidth`), tidak ada error konsol/JavaScript, tidak muncul "Akses Ditolak" untuk menu milik role tersebut, dan (di 390 px) tombol/input di area konten setinggi minimal ~36 px.

## A. Logo & identitas

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| TP-01 | Logo halaman Masuk | Buka `/login` | - | Logo resmi IntelliSys (proporsi asli) di tengah kartu, tombol utama berwarna marun | Sesuai (`docs/screenshots/tampilan/sesudah/masuk-*.jpg`) | Lulus |
| TP-02 | Logo halaman Daftar | Buka `/daftar` | - | Logo resmi di atas form | Sesuai | Lulus |
| TP-03 | Logo sidebar | Login role apa pun | - | Logo resmi di kepala sidebar beserta "Intellisys Talent Hub" & "PT Intellisys IT Outsourcing" | Sesuai | Lulus |
| TP-04 | Favicon & judul tab | Lihat tab browser di `/login` dan `/talent-pool` | - | Ikon lengkung marun; judul "Masuk · Intellisys Talent Hub" / "Talent Pool · Intellisys Talent Hub" | Judul sesuai (dicek via `document.title`); favicon `favicon-32.png` | Lulus |

## B. Sidebar & header

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| TP-05 | Kotak "Konteks Peran" dihapus | Login manager, lihat sidebar | - | Tidak ada kotak Konteks Peran maupun teks "Intellisys Core v2.4 / Online" | Tidak ada | Lulus |
| TP-06 | Nama & role user | Lihat bagian bawah sidebar dan header | - | Nama + role tampil (sidebar bawah; header di layar ≥ md) | "Hendra Gunawan · Manager" | Lulus |
| TP-07 | Menu aktif | Buka Permintaan Kebutuhan | - | Menu aktif berlatar marun muda, teks marun tebal, garis penanda di kiri; judul kelompok menu kecil | Sesuai | Lulus |
| TP-08 | Menu geser di HP | Lebar 390 px, tekan tombol menu | - | Sidebar meluncur dari kiri dengan latar gelap dan tombol tutup | Sesuai | Lulus |

## C. Konsistensi, keadaan kosong, memuat, error

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|----|----------|---------|-------|-----------------------|--------------|--------|
| TP-09 | Badge status | Bandingkan Permintaan Kebutuhan, Pengajuan, Cuti, Dokumen | - | Menunggu = kuning, diproses = biru, disetujui/aktif/lolos = hijau, ditolak/terlambat = merah, draft/selesai/dibatalkan = abu | Sesuai di semua halaman (peta status memakai `NADA` di `ui.jsx`) | Lulus |
| TP-10 | Tombol | Bandingkan tombol di semua halaman | - | Satu gaya aksi utama (marun), aksi kedua (putih bergaris), aksi berbahaya (merah); tinggi 40 px | Sesuai | Lulus |
| TP-11 | Tabel | Buka Talent Pool, Master Data Skill | - | Header huruf kapital kecil berlatar abu, garis tipis antar baris, angka rata kanan, aksi di kolom terakhir | Sesuai | Lulus |
| TP-12 | Keadaan kosong | Talent Pool, cari "zzzz" | `zzzz` | Ikon + "Tidak ada talent yang cocok dengan pencarian atau filter." | Sesuai | Lulus |
| TP-13 | Memuat | Buka halaman berdaftar | - | Skeleton abu berdenyut, bukan halaman kosong | Sesuai | Lulus |
| TP-14 | Pesan error backend | Login TS → Pengaturan Akun, isi password lama salah + password baru, Simpan Password | `salah123` / `passwordbaru1` | Pesan backend tampil apa adanya di bawah isian berwarna merah, isian bergaris merah (pesan umum non-field tampil dalam kotak merah) | "Password lama tidak sesuai." di bawah isian, garis isian merah 2px | Lulus |

## D. Pemeriksaan otomatis semua menu

| ID | Role | Lebar | Halaman diperiksa | Luber horizontal | Error konsol | Akses ditolak | Catatan | Status |
|----|------|-------|-------------------|------------------|--------------|---------------|---------|--------|
| TP-15 | Manager | 1280 / 390 | 15 / 15 | 0 | 0 | 0 | Tautan teks "Lihat notifikasi" di dalam kalimat (sengaja tetap tautan teks) | Lulus |
| TP-16 | Account Manager | 1280 / 390 | 12 / 12 | 0 | 0 | 0 | Sama seperti di atas | Lulus |
| TP-17 | Talent Support | 1280 / 390 | 12 / 12 | 0 | 0 | 0 | - | Lulus |
| TP-18 | HR Client | 1280 / 390 | 10 / 10 | 0 | 0 | 0 | Tab pil Cuti/Shift 34 px → diperbaiki jadi 40 px | Lulus |
| TP-19 | Talent | 1280 / 390 | 9 / 9 | 0 | 0 | 0 | Tab pil Penempatan, Cuti/Shift, Notifikasi → diperbaiki jadi 40 px | Lulus |

Tabel lebar (mis. Talent Pool, Permintaan Kebutuhan) di HP digeser di dalam wadahnya sendiri; halaman tidak ikut melebar.

## Ringkasan

Semua skenario lulus. `npm run build` tanpa error. Screenshot sebelum & sesudah: `docs/screenshots/tampilan/sebelum/` dan `docs/screenshots/tampilan/sesudah/` (Masuk, Beranda tiap role, Talent Pool, Permintaan Kebutuhan, Profil Saya, Dokumen; desktop & HP).
