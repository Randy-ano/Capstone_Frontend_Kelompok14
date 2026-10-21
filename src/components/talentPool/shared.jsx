// Label & komponen kecil yang dipakai halaman Talent Pool dan drawer detailnya.

export const STATUS_KETERSEDIAAN = {
  tersedia: { label: "Tersedia", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  tidak_tersedia: { label: "Tidak Tersedia", className: "bg-surface-container-high text-on-surface-variant" },
};

export const STATUS_KANDIDAT = {
  tersedia: "Tersedia",
  dalam_proses: "Dalam Proses",
  ditempatkan: "Ditempatkan",
  tidak_aktif: "Tidak Aktif",
};

export const HASIL_SCREENING = {
  pending: { label: "Menunggu", className: "bg-secondary-container text-on-secondary-fixed" },
  lolos: { label: "Lolos", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  tidak_lolos: { label: "Tidak Lolos", className: "bg-error-container text-on-error-container" },
};

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// "2026-10-21T18:25:07+07:00" atau "2026-10-21" → "21 Okt 2026". Diurai manual agar tidak bergeser zona waktu.
export function formatTanggal(nilai) {
  if (!nilai) return "-";
  const [tahun, bulan, hari] = nilai.slice(0, 10).split("-").map(Number);
  return `${hari} ${BULAN[bulan - 1]} ${tahun}`;
}

// "2023-10-01" → "Okt 2023".
export function formatBulan(nilai) {
  if (!nilai) return "-";
  const [tahun, bulan] = nilai.split("-").map(Number);
  return `${BULAN[bulan - 1]} ${tahun}`;
}

export const formatRupiah = (nilai) =>
  nilai == null ? "-" : `Rp${Number(nilai).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

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

export function StatusBadge({ status }) {
  const s = STATUS_KETERSEDIAAN[status] ?? { label: status, className: "bg-surface-container text-on-surface-variant" };
  return <Badge className={s.className}>{s.label}</Badge>;
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
