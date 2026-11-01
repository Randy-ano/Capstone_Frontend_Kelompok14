import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { berandaFor } from "../data/navigation";
import { useJudulTab } from "../components/auth/AuthUi";

// Alamat yang tidak dikenal (route "*"): tombol kembali ke beranda sesuai role, atau halaman depan untuk tamu.
export default function TidakDitemukan() {
  const { user } = useAuth();
  useJudulTab("Halaman Tidak Ditemukan");

  return (
    <div className="w-full px-space-md sm:px-space-lg py-space-xl">
      <div className="kartu p-space-xl flex flex-col items-center text-center gap-space-md max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center text-primary">
          <span aria-hidden="true" className="material-symbols-outlined text-[32px]">travel_explore</span>
        </div>
        <div className="space-y-1">
          <h1 className="font-headline-sm text-headline-sm text-on-surface">Halaman tidak ditemukan</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Alamat yang Anda tuju tidak tersedia atau sudah dipindahkan.</p>
        </div>
        <Link to={user ? berandaFor(user.role) : "/"} className="tombol-utama">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">home</span>
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
