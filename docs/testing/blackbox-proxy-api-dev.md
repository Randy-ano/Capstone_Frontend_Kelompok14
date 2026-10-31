# Black Box — Proxy API Vite untuk Demo Tunnel

Diuji 2026-10-31 dengan memanggil server pengembangan Vite (`http://localhost:5173`) yang meneruskan ke backend. Uji tidak memakai browser. Akses tunnel disimulasikan dengan header `Host` dan `Origin` `contoh-demo.trycloudflare.com`, karena `cloudflared` belum terpasang.

| ID | Skenario | Langkah | Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|---|
| PX-01 | Build produksi | Jalankan `npm run build` | - | Build tanpa error | Build selesai tanpa error | Lulus |
| PX-02 | Login semua role lewat proxy | `POST /api/v1/auth/login`, lalu `GET /api/v1/auth/me` | Akun manager, am, ts, hr, talent | 200 dan role sesuai | Kelima role 200 dengan role sesuai | Lulus |
| PX-03 | Login dengan host tunnel | `POST /api/v1/auth/login` dengan `Host` dan `Origin` tunnel | Kelima akun | 200 | Kelima role 200 | Lulus |
| PX-04 | Halaman dengan host tunnel | Buka `/` dan `/login` dengan `Host` tunnel | - | 200 HTML | Keduanya 200 | Lulus |
| PX-05 | Hak akses tetap berlaku | `GET /api/v1/talent-pool` sebagai talent | Token talent | 403 | 403 | Lulus |
| PX-06 | Unduh dokumen (blob) | `GET /api/v1/dokumen/2/download` dengan host tunnel | Token manager | 200 berkas PDF | 200 `application/pdf`, diawali `%PDF-` | Lulus |
| PX-07 | Unduh CV yang belum ada | `GET /api/v1/talent/cv/download` dengan host tunnel | Token talent tanpa CV | 404 dengan pesan JSON | 404 JSON | Lulus |
| PX-08 | URL absolut pada data response | Pindai `localhost:8000` di `data` pada talent-pool, dokumen, interview, notifikasi, profil | Semua role yang berhak | Tidak ada | Tidak ada; hanya ada di `links` pagination yang tidak dipakai frontend | Lulus |
| PX-09 | Alamat absolut tetap bisa dipakai | Preflight CORS langsung ke `http://localhost:8000` dari origin `http://localhost:5173` | - | Origin diizinkan | 204, origin `http://localhost:5173` diizinkan | Lulus |
| PX-12 | Pesan error backend lewat proxy | `POST /api/v1/auth/login` dengan password salah | am@intellisys.test, `salah` | 422 dengan pesan backend | 422 "Email atau password salah." | Lulus |
| PX-13 | Batas percobaan login lewat proxy | Lebih dari 10 permintaan login dalam 1 menit | Kelima akun, dua kali | 429 dengan pesan backend | 429 "Terlalu banyak percobaan. Silakan coba lagi nanti." Semua pengguna tunnel berbagi batas ini | Lulus |
| PX-10 | Unduh CV yang sudah ada | Generate lalu unduh CV | - | 200 berkas PDF | Tidak diuji: data demo tidak punya CV dan generate akan mengubah data | Belum diuji |
| PX-11 | Link tunnel asli | `cloudflared tunnel --url http://localhost:5173` | - | Aplikasi terbuka dari link | Tidak diuji: `cloudflared` belum terpasang | Belum diuji |
