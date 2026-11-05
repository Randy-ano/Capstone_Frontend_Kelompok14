// Komponen bersama halaman Masuk & Daftar (mockup Stitch "Masuk" dan "Daftar Akun Baru").
import { useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo-intellisys.png";

// Judul tab browser halaman di luar AppLayout.
export function useJudulTab(judul) {
  useEffect(() => {
    document.title = `${judul} · Intellisys Talent Hub`;
  }, [judul]);
}

// Logo resmi (rasio asli dijaga dengan h tetap + w-auto) dan nama aplikasi di bawahnya.
export function Merek({ tengah = false }) {
  return (
    <div className={`flex flex-col gap-2 ${tengah ? "items-center" : "items-start"}`}>
      <Link to="/" aria-label="Ke halaman depan" className="rounded-lg">
        <img alt="Logo Intellisys" className="h-10 sm:h-12 w-auto object-contain" src={logo} />
      </Link>
      <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface-variant">Talent Hub</span>
    </div>
  );
}

export function KakiHalaman({ className = "" }) {
  return (
    <p className={`font-body-sm text-body-sm text-on-surface-variant ${className}`}>
      © PT Intellisys Tri Pratama • Sistem Manajemen Talenta Terpadu
    </p>
  );
}

export const kelasInput = (error) =>
  `w-full h-12 px-4 rounded-lg border bg-surface font-body-lg text-body-lg text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 transition-all ${
    error ? "border-error ring-1 ring-error focus:ring-error" : "border-outline-variant focus:border-aksen focus:ring-aksen/20"
  }`;

export function Isian({ label, wajib, error, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-label-lg text-label-lg text-on-surface tracking-wide">
        {label}
        {wajib && <span className="text-aksen"> *</span>}
      </span>
      {children}
      {error && <span className="block font-body-sm text-body-sm text-error">{error[0]}</span>}
    </label>
  );
}

// Ikon di sisi kiri kolom isian (mis. "mail", "lock").
export function IkonKiri({ ikon }) {
  return (
    <span className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none text-outline">
      <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{ikon}</span>
    </span>
  );
}

export function InputSandi({ error, terlihat, onToggle, ikon, ...props }) {
  return (
    <div className="relative">
      {ikon && <IkonKiri ikon={ikon} />}
      <input className={`${kelasInput(error)} pr-12 ${ikon ? "pl-11" : ""}`} type={terlihat ? "text" : "password"} {...props} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={terlihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-outline hover:text-on-surface"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">{terlihat ? "visibility_off" : "visibility"}</span>
      </button>
    </div>
  );
}

export function PesanError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-space-sm p-space-sm rounded-lg bg-error-container text-on-error-container font-body-md text-body-md">
      <span aria-hidden="true" className="material-symbols-outlined text-[20px]">error</span>
      <span>{children}</span>
    </div>
  );
}

export function PesanSukses({ children }) {
  if (!children) return null;
  return (
    <div role="status" className="flex items-start gap-space-sm p-space-sm rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-body-md text-body-md">
      <span aria-hidden="true" className="material-symbols-outlined text-[20px]">check_circle</span>
      <span>{children}</span>
    </div>
  );
}

// Kerangka halaman tamu berbentuk kartu di tengah (sama dengan halaman Masuk): Lupa Password, Reset Password.
export function KartuTamu({ judul, keterangan, children, bawah }) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-b from-surface to-surface-container-low">
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{ backgroundImage: "radial-gradient(rgba(148, 163, 184, 0.28) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <main className="relative flex-1 flex flex-col items-center justify-center px-space-md py-space-xl">
        <div className="w-full max-w-[460px] bg-surface-container-lowest rounded-2xl border border-outline-variant/50 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] p-space-lg sm:p-9">
          <div className="text-center mb-space-xl">
            <Merek tengah />
            <h1 className="mt-space-lg font-headline-md text-headline-md text-on-surface">{judul}</h1>
            {keterangan && <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">{keterangan}</p>}
          </div>
          {children}
          {bawah && <div className="mt-space-lg pt-space-md border-t border-surface-container text-center">{bawah}</div>}
        </div>
      </main>
      <footer className="relative w-full px-space-lg py-space-lg text-center border-t border-outline-variant/40 bg-surface-container-lowest/40 backdrop-blur-sm">
        <KakiHalaman />
      </footer>
    </div>
  );
}

export function TombolUtama({ memproses, children }) {
  return (
    <button
      type="submit"
      disabled={memproses}
      className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-aksen text-on-primary hover:bg-aksen-hover font-title-md text-title-md transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {memproses && <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>}
      {memproses ? "Memproses..." : children}
    </button>
  );
}
