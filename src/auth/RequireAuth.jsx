import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import logo from "../assets/logo-intellisys.png";

// Membungkus semua halaman yang wajib login; tamu diarahkan ke /login.
export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-space-lg bg-surface">
        <img alt="Intellisys" className="h-10 w-auto object-contain" src={logo} />
        <div role="status" className="flex items-center gap-space-sm font-body-md text-body-md text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
          Memuat sesi...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
