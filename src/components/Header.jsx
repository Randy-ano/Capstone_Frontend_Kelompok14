import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABEL, displayUser, initials } from "../auth/roles";
import { bolehKelola } from "./jobRequirement/shared";
import Lonceng from "./notifikasi/Lonceng";

export default function Header({ grup, title, onMenu }) {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container-high z-40 px-space-md sm:px-space-lg flex items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-sm sm:gap-space-md min-w-0">
        <button
          type="button"
          onClick={onMenu}
          title="Buka menu"
          className="lg:hidden w-10 h-10 -ml-2 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <div className="flex items-center gap-2 min-w-0 font-body-sm text-body-sm text-on-surface-variant">
          {grup && (
            <>
              <span className="hidden sm:inline">{grup}</span>
              <span className="hidden sm:inline material-symbols-outlined text-[16px]">chevron_right</span>
            </>
          )}
          <span className="font-title-sm text-title-sm text-on-surface truncate">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-space-xs sm:gap-space-sm shrink-0">
        {/* Aksi cepat: HR Client & AM membuat permintaan kebutuhan (R7); form dibuka di halaman Permintaan Kebutuhan. */}
        {bolehKelola(user) && (
          <Link
            to="/permintaan-kebutuhan?buat=1"
            className="hidden lg:inline-flex tombol-utama"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Buat Permintaan</span>
          </Link>
        )}
        <Lonceng />
        <div className="h-6 w-px bg-surface-container-high mx-1 hidden sm:block"></div>
        <UserMenu />
      </div>
    </header>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [keluar, setKeluar] = useState(false);
  const ref = useRef(null);
  const { nama, keterangan } = displayUser(user);

  useEffect(() => {
    if (!open) return;
    const tutup = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", tutup);
    return () => document.removeEventListener("mousedown", tutup);
  }, [open]);

  async function handleLogout() {
    setKeluar(true);
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex items-center gap-space-sm min-h-[40px] pl-1 pr-1 rounded-lg hover:bg-surface-container-low group">
        <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-semibold">
          {initials(nama)}
        </span>
        <span className="hidden md:flex flex-col text-left">
          <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors leading-tight">{nama}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{keterangan}</span>
        </span>
        <span className="material-symbols-outlined text-outline text-[18px] group-hover:text-on-surface transition-colors">expand_more</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-surface-container-lowest rounded-xl shadow-lg ring-1 ring-surface-container-high py-space-xs z-50">
          <div className="px-space-md py-space-sm border-b border-surface-container-high">
            <div className="font-label-md text-label-md text-on-surface truncate">{nama}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</div>
            <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-primary-fixed font-label-sm text-label-sm text-primary">
              {ROLE_LABEL[user.role]}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={keluar}
            className="w-full flex items-center gap-space-sm min-h-[40px] px-space-md py-2 font-body-md text-body-md text-error hover:bg-error-container transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {keluar ? "Keluar..." : "Keluar"}
          </button>
        </div>
      )}
    </div>
  );
}
