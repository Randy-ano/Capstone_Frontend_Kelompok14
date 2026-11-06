import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Di Vercel tidak ada proxy: VITE_API_URL wajib alamat absolut backend (https://xxx.up.railway.app/api/v1).
  // Tanpa ini permintaan /api/v1 jatuh ke index.html dan semua halaman gagal memuat data.
  if (process.env.VERCEL && !/^https?:\/\//.test(env.VITE_API_URL ?? "")) {
    throw new Error(
      "VITE_API_URL belum diisi alamat absolut backend (mis. https://xxx.up.railway.app/api/v1). " +
        "Isi di Vercel → Settings → Environment Variables lalu Redeploy.",
    );
  }

  return {
    plugins: [react()],
    // Hanya untuk pengembangan (npm run dev): /api diteruskan ke backend lokal.
    server: {
      host: true,
      allowedHosts: [".trycloudflare.com"],
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
        },
      },
    },
  };
});
