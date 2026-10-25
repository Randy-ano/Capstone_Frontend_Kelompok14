// Komponen bersama halaman Masuk & Daftar (mockup Stitch "Masuk" dan "Daftar Akun Baru").
import { useEffect } from "react";
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
      <img alt="Intellisys" className="h-10 sm:h-12 w-auto object-contain" src={logo} />
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
      <span className="material-symbols-outlined text-[20px]">{ikon}</span>
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
        <span className="material-symbols-outlined text-[20px]">{terlihat ? "visibility_off" : "visibility"}</span>
      </button>
    </div>
  );
}

export function PesanError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-space-sm p-space-sm rounded-lg bg-error-container text-on-error-container font-body-md text-body-md">
      <span className="material-symbols-outlined text-[20px]">error</span>
      <span>{children}</span>
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
      {memproses && <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>}
      {memproses ? "Memproses..." : children}
    </button>
  );
}
