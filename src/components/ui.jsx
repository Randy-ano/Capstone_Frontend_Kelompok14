// Komponen & format kecil yang dipakai banyak halaman.
import { useEffect, useState } from "react";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// "2026-10-21T18:25:07+07:00" atau "2026-10-21" → "21 Okt 2026". Diurai manual agar tidak bergeser zona waktu.
export function formatTanggal(nilai) {
  if (!nilai) return "-";
  const [tahun, bulan, hari] = nilai.slice(0, 10).split("-").map(Number);
  return `${hari} ${BULAN[bulan - 1]} ${tahun}`;
}

// "2026-10-21T18:25:07+07:00" → "21 Okt 2026, 18.25" (jam sesuai zona waktu backend, Asia/Jakarta).
export function formatTanggalWaktu(nilai) {
  if (!nilai) return "-";
  return `${formatTanggal(nilai)}, ${nilai.slice(11, 16).replace(":", ".")}`;
}

// "2023-10-01" → "Okt 2023".
export function formatBulan(nilai) {
  if (!nilai) return "-";
  const [tahun, bulan] = nilai.split("-").map(Number);
  return `${BULAN[bulan - 1]} ${tahun}`;
}

export const formatRupiah = (nilai) =>
  nilai == null ? "-" : `Rp${Number(nilai).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

export const formatAngka = (nilai, desimal = 1) =>
  nilai == null ? "-" : Number(nilai).toLocaleString("id-ID", { maximumFractionDigits: desimal });

export const pecahTag = (tag) =>
  (tag ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export function Badge({ className, children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}

export function Chip({ children, title }) {
  return (
    <span
      title={title}
      className="inline-flex items-center px-2 py-0.5 rounded-lg bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md whitespace-nowrap"
    >
      {children}
    </span>
  );
}

export function TagChip({ children }) {
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap">
      <span className="text-outline">#</span>
      {children}
    </span>
  );
}

export function Pesan({ jenis = "error", children }) {
  const gaya =
    jenis === "error" ? "bg-error-container text-on-error-container" : "bg-tertiary-fixed text-on-tertiary-fixed-variant";
  return (
    <div role={jenis === "error" ? "alert" : "status"} className={`flex items-start gap-space-sm px-space-md py-space-sm rounded-lg font-body-md text-body-md ${gaya}`}>
      <span className="material-symbols-outlined text-[20px]">{jenis === "error" ? "error" : "check_circle"}</span>
      <span>{children}</span>
    </div>
  );
}

// Pesan field dari error 422 backend ({ errors: { field: [pesan] } }).
export const errorField = (error, field) => error?.errors?.[field]?.[0];

export function Memuat({ children = "Memuat..." }) {
  return (
    <div className="flex items-center justify-center gap-space-sm py-space-xl font-body-md text-body-md text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
      {children}
    </div>
  );
}

// Kepala halaman bergaya sama dengan Talent Pool.
export function KepalaHalaman({ ikon, kategori, judul, children, aksi }) {
  return (
    <div className="bg-surface-container-low px-space-md sm:px-space-xl py-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md">
      <div className="min-w-0">
        <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm tracking-wider uppercase">
          <span className="material-symbols-outlined text-[16px]">{ikon}</span>
          <span>{kategori}</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight">{judul}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">{children}</p>
      </div>
      {aksi && <div className="shrink-0">{aksi}</div>}
    </div>
  );
}

// Kartu angka ringkasan; bisa diklik untuk menyaring.
export function KartuRingkasan({ label, nilai, ikon, warna = "text-primary", keterangan, aktif, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? !!aktif : undefined}
      className={`text-left bg-surface-container-lowest p-space-md rounded-xl shadow-sm transition-all ${onClick ? "hover:shadow-md" : ""} ${
        aktif ? "ring-2 ring-primary-container" : ""
      }`}
    >
      <div className="flex items-center justify-between text-on-surface-variant">
        <span className="font-label-md text-label-md">{label}</span>
        <span className={`material-symbols-outlined text-[20px] ${warna}`}>{ikon}</span>
      </div>
      <div className="mt-space-sm font-headline-lg text-headline-lg text-on-surface">{nilai ?? "–"}</div>
      {keterangan && <div className="font-label-sm text-label-sm text-on-surface-variant">{keterangan}</div>}
    </Tag>
  );
}

// Kotak pencarian & select filter dengan gaya yang sama di semua halaman.
export function KotakCari({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={255}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all"
      />
    </div>
  );
}

export function PilihFilter({ ikon, label, value, onChange, opsi, semua }) {
  return (
    <div className="flex items-center gap-1.5 h-10 bg-surface-container-low px-2 rounded-lg w-full sm:w-auto">
      <span className="material-symbols-outlined text-outline text-[18px] ml-1">{ikon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="flex-1 bg-transparent font-label-md text-label-md text-on-surface focus:outline-none pr-2 cursor-pointer"
      >
        <option value="">{semua}</option>
        {opsi.map(([nilai, teks]) => (
          <option key={nilai} value={nilai}>
            {teks}
          </option>
        ))}
      </select>
    </div>
  );
}

// Teks pencarian yang dikirim setelah berhenti mengetik.

export function useTunda(nilai, ms = 400) {
  const [tertunda, setTertunda] = useState(nilai);
  useEffect(() => {
    const t = setTimeout(() => setTertunda(nilai), ms);
    return () => clearTimeout(t);
  }, [nilai, ms]);
  return tertunda;
}

// Nomor halaman ringkas: 1 … 4 5 6 … 10.
function nomorHalaman(sekarang, terakhir) {
  const nomor = new Set([1, terakhir, sekarang - 1, sekarang, sekarang + 1].filter((n) => n >= 1 && n <= terakhir));
  const urut = [...nomor].sort((a, b) => a - b);
  return urut.flatMap((n, i) => (i > 0 && n - urut[i - 1] > 1 ? ["…", n] : [n]));
}

// Pagination dari `meta` list Laravel. `satuan` mis. "talent" → "Menampilkan 1–10 dari 14 talent".
export function Pagination({ meta, onPage, satuan = "data" }) {
  const { current_page: sekarang, last_page: terakhir } = meta;
  const tombol = "min-w-[2.25rem] h-9 px-2 rounded-lg font-label-md text-label-md transition-colors disabled:opacity-40";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm px-space-md py-space-sm border-t border-surface-container-high">
      <span className="font-body-sm text-body-sm text-on-surface-variant">
        Menampilkan <strong>{meta.from}</strong>–<strong>{meta.to}</strong> dari <strong>{meta.total}</strong> {satuan}
      </span>
      <nav className="flex items-center gap-1" aria-label="Halaman">
        <button type="button" className={`${tombol} hover:bg-surface-container`} disabled={sekarang <= 1} onClick={() => onPage(sekarang - 1)} title="Sebelumnya">
          <span className="material-symbols-outlined text-[18px] align-middle">chevron_left</span>
        </button>
        {nomorHalaman(sekarang, terakhir).map((n, i) =>
          n === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-outline">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPage(n)}
              aria-current={n === sekarang ? "page" : undefined}
              className={`${tombol} ${n === sekarang ? "bg-primary text-on-primary" : "hover:bg-surface-container text-on-surface"}`}
            >
              {n}
            </button>
          ),
        )}
        <button type="button" className={`${tombol} hover:bg-surface-container`} disabled={sekarang >= terakhir} onClick={() => onPage(sekarang + 1)} title="Berikutnya">
          <span className="material-symbols-outlined text-[18px] align-middle">chevron_right</span>
        </button>
      </nav>
    </div>
  );
}
