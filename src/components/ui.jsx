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

// Warna badge status per arti, sama di semua halaman:
// menunggu = kuning, proses = biru, sukses (disetujui/aktif/lolos) = hijau, bahaya (ditolak/terlambat) = merah,
// netral (draft/selesai/dibatalkan) = abu.
export const NADA = {
  menunggu: "bg-warning-container text-on-warning-container ring-warning/20",
  proses: "bg-info-container text-on-info-container ring-info/20",
  sukses: "bg-tertiary-fixed text-on-tertiary-fixed-variant ring-on-tertiary-container/20",
  bahaya: "bg-error-container text-on-error-container ring-error/20",
  netral: "bg-surface-container text-on-surface-variant ring-outline/20",
  gelap: "bg-inverse-surface text-inverse-on-surface ring-transparent",
};

export function Badge({ className = NADA.netral, children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ring-1 ring-inset font-label-sm text-label-sm whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}

export function Chip({ children, title }) {
  return (
    <span
      title={title}
      className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md whitespace-nowrap"
    >
      {children}
    </span>
  );
}

export function TagChip({ children }) {
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap">
      <span className="text-outline">#</span>
      {children}
    </span>
  );
}

// Kotak pesan: error backend ditampilkan apa adanya di dalam kotak ini; jenis lain untuk pesan sukses.
export function Pesan({ jenis = "error", children }) {
  const gaya =
    jenis === "error"
      ? "bg-error-container text-on-error-container ring-error/25"
      : "bg-tertiary-fixed text-on-tertiary-fixed-variant ring-on-tertiary-container/25";
  return (
    <div
      role={jenis === "error" ? "alert" : "status"}
      className={`flex items-start gap-space-sm px-space-md py-3 rounded-xl ring-1 ring-inset font-body-md text-body-md ${gaya}`}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0">{jenis === "error" ? "error" : "check_circle"}</span>
      <span className="min-w-0 break-words pt-px">{children}</span>
    </div>
  );
}

// Pesan field dari error 422 backend ({ errors: { field: [pesan] } }).
export const errorField = (error, field) => error?.errors?.[field]?.[0];

// Placeholder abu berdenyut untuk konten yang sedang dimuat.
export function Skeleton({ className = "" }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-md bg-surface-container ${className}`} />;
}

// Placeholder saat memuat (pengganti halaman kosong). `children` dibacakan pembaca layar.
export function Memuat({ children = "Memuat...", baris = 3 }) {
  return (
    <div data-memuat role="status" aria-busy="true" className="space-y-space-md py-space-md">
      <span className="sr-only">{children}</span>
      <div className="flex items-center gap-space-md">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      {Array.from({ length: baris }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className={`h-4 ${["w-full", "w-11/12", "w-4/5"][i % 3]}`} />
        </div>
      ))}
    </div>
  );
}

// Baris tabel placeholder selama data pertama dimuat.
export function BarisMemuat({ kolom, baris = 5 }) {
  return Array.from({ length: baris }, (_, i) => (
    <tr key={i} data-memuat aria-hidden="true">
      {Array.from({ length: kolom }, (_, k) => (
        <td key={k}>
          <Skeleton className={`h-4 ${k === 0 ? "w-3/4" : "w-1/2"}`} />
          {k === 0 && <Skeleton className="h-3 w-1/2 mt-2" />}
        </td>
      ))}
    </tr>
  ));
}

// Tampilan "belum ada data": ikon + satu kalimat (+ aksi opsional).
export function KeadaanKosong({ ikon = "inbox", children, aksi, ringkas = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-space-sm px-space-md ${ringkas ? "py-space-lg" : "py-space-xl"}`}>
      <span className={`flex items-center justify-center rounded-full bg-surface-container text-outline ${ringkas ? "w-10 h-10" : "w-14 h-14"}`}>
        <span className={`material-symbols-outlined ${ringkas ? "text-[22px]" : "text-[28px]"}`}>{ikon}</span>
      </span>
      <p className="max-w-sm font-body-md text-body-md text-on-surface-variant">{children}</p>
      {aksi}
    </div>
  );
}

// KeadaanKosong di dalam tabel (satu baris selebar semua kolom).
export function BarisKosong({ kolom, ikon, children }) {
  return (
    <tr>
      <td colSpan={kolom} className="!p-0">
        <KeadaanKosong ikon={ikon}>{children}</KeadaanKosong>
      </td>
    </tr>
  );
}

// Kepala halaman bergaya sama dengan Talent Pool.
export function KepalaHalaman({ ikon, kategori, judul, children, aksi }) {
  return (
    <div className="px-space-md sm:px-space-xl pt-space-lg pb-space-sm flex flex-col md:flex-row md:items-end justify-between gap-space-md">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm tracking-wider uppercase">
          <span className="material-symbols-outlined text-[16px]">{ikon}</span>
          <span>{kategori}</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight">{judul}</h1>
        {children && <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">{children}</p>}
      </div>
      {aksi && <div className="shrink-0 w-full md:w-auto">{aksi}</div>}
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
      className={`h-full flex flex-col text-left bg-surface-container-lowest p-space-md rounded-xl shadow-sm ring-inset transition-all ${onClick ? "hover:shadow-md" : ""} ${
        aktif ? "ring-2 ring-primary" : "ring-1 ring-surface-container-high"
      }`}
    >
      <div className="flex items-start justify-between gap-space-sm text-on-surface-variant">
        <span className="font-label-lg text-label-lg">{label}</span>
        <span className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-surface-container-low material-symbols-outlined text-[20px] ${warna}`}>{ikon}</span>
      </div>
      <div className="mt-auto pt-space-sm font-headline-lg text-headline-lg text-on-surface tabular-nums">{nilai ?? "–"}</div>
      {keterangan && <div className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{keterangan}</div>}
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
        className="input pl-9"
      />
    </div>
  );
}

export function PilihFilter({ ikon, label, value, onChange, opsi, semua }) {
  return (
    <div className="flex items-center gap-1.5 min-h-[40px] bg-surface-container-lowest ring-1 ring-inset ring-outline-variant focus-within:ring-2 focus-within:ring-primary/60 px-2 rounded-lg w-full sm:w-auto">
      <span className="material-symbols-outlined text-outline text-[18px] ml-1">{ikon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="flex-1 min-h-[38px] bg-transparent font-label-md text-label-md text-on-surface focus:outline-none pr-2 cursor-pointer"
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
  const tombol = "min-w-[2.5rem] h-10 px-2 rounded-lg font-label-md text-label-md tabular-nums transition-colors disabled:opacity-40";

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
