import { useEffect, useState } from "react";

// Komponen bersama halaman Masuk & Daftar (mockup Stitch "Masuk" dan "Daftar Akun Baru").

// Gambar logo sudah memuat tulisan "Intellisys Talent Hub"; margin negatif menutup ruang kosong di sekitar logo.
export function Merek() {
  return <img alt="Intellisys Talent Hub" className="self-start h-20 sm:h-24 w-auto -my-4 -ml-4 object-contain mix-blend-multiply" src="/logo.jpg" />;
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

export function InputSandi({ error, terlihat, onToggle, ...props }) {
  return (
    <div className="relative">
      <input className={`${kelasInput(error)} pr-12`} type={terlihat ? "text" : "password"} {...props} />
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

// Slide panel kanan halaman Masuk: ringkasan fitur sistem yang memang tersedia.
const SLIDE = [
  {
    judul: "Fitur Manajemen Terintegrasi",
    isi: "Memudahkan kolaborasi lintas divisi antara Account Manager, HR Klien, dan Manajemen dalam satu siklus operasional yang transparan dan akurat.",
  },
  {
    judul: "Rekomendasi Kandidat Berbasis Aturan",
    isi: "Talent Support mendapat daftar kandidat dengan skor kecocokan dari kompetensi dan pengalaman, lalu menyaring dan mengajukannya ke klien.",
  },
  {
    judul: "Pantau SLA & Operasional",
    isi: "Progres permintaan, indikator SLA, cuti, shift, keluhan, dan dokumen bertanda tangan tercatat rapi dalam satu dasbor.",
  },
];

export function PanelFitur() {
  const [aktif, setAktif] = useState(0);
  const geser = (arah) => setAktif((i) => (i + arah + SLIDE.length) % SLIDE.length);

  useEffect(() => {
    const t = setInterval(() => setAktif((i) => (i + 1) % SLIDE.length), 7000);
    return () => clearInterval(t);
  }, [aktif]);

  return (
    <aside className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-panel-gelap px-space-xl xl:px-16 py-space-xl">
      <div aria-hidden="true" className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-aksen/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-48 -left-40 w-[520px] h-[520px] rounded-full bg-aksen/10 blur-3xl" />

      <div />

      <div className="relative mx-auto w-full max-w-xl">
        <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl p-space-xl pr-space-xl xl:pr-64">
          <h2 className="font-headline-sm text-headline-sm text-on-surface max-w-[16rem]">Kelola & Pantau Talenta Lebih Cepat</h2>
          <p className="mt-space-md font-body-md text-body-md text-on-surface-variant max-w-xs">
            Satu platform terintegrasi untuk proses rekrutmen, penempatan, jadwal kerja, cuti, hingga monitoring kinerja talenta.
          </p>
          <div className="hidden xl:block absolute right-6 top-1/2 -translate-y-1/2 w-56 rotate-3 rounded-xl bg-panel-gelap text-white p-space-md shadow-xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-label-sm text-label-sm tracking-widest text-aksen">
                <span className="w-1.5 h-1.5 rounded-full bg-aksen" />
                INTELLISYS
              </span>
              <span className="material-symbols-outlined text-[18px] text-outline-variant">badge</span>
            </div>
            <div className="mt-space-md font-label-sm text-label-sm tracking-widest text-outline-variant">TALENT POOL</div>
            <div className="font-mono text-body-md tracking-[0.2em]">TERVERIFIKASI</div>
            <div className="mt-space-md pt-space-sm border-t border-white/10 flex items-center justify-between font-body-sm text-body-sm">
              <span>Placement Aktif</span>
              <span className="text-tertiary-fixed-dim">Terpantau</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative text-center max-w-xl mx-auto">
        <h3 className="font-headline-sm text-headline-sm text-white">{SLIDE[aktif].judul}</h3>
        <p className="mt-space-sm font-body-lg text-body-lg text-outline-variant min-h-[3rem]">{SLIDE[aktif].isi}</p>
        <div className="mt-space-lg flex items-center justify-center gap-space-md">
          <button type="button" onClick={() => geser(-1)} aria-label="Slide sebelumnya" className="text-outline-variant hover:text-white">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          {SLIDE.map((s, i) => (
            <button
              key={s.judul}
              type="button"
              onClick={() => setAktif(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === aktif ? "w-6 bg-aksen" : "w-1.5 bg-outline"}`}
            />
          ))}
          <button type="button" onClick={() => geser(1)} aria-label="Slide berikutnya" className="text-outline-variant hover:text-white">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
