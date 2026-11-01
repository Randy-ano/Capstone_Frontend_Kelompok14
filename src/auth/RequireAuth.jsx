import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import logo from "../assets/logo-intellisys.png";

export function MemuatSesi() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-space-lg bg-surface">
      <img alt="Logo Intellisys" className="h-10 w-auto object-contain" src={logo} />
      <div role="status" className="flex items-center gap-space-sm font-body-md text-body-md text-on-surface-variant">
        <span aria-hidden="true" className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        Memuat sesi...
      </div>
    </div>
  );
}

// Membungkus semua halaman yang wajib login; tamu diarahkan ke /login.
export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <MemuatSesi />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
