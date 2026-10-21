// Label & komponen khusus Talent Pool. Komponen umum ada di ../ui.jsx.
import { Badge } from "../ui";

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

export function StatusBadge({ status }) {
  const s = STATUS_KETERSEDIAAN[status] ?? { label: status, className: "bg-surface-container text-on-surface-variant" };
  return <Badge className={s.className}>{s.label}</Badge>;
}

export function HasilBadge({ hasil }) {
  const h = HASIL_SCREENING[hasil] ?? { label: hasil, className: "bg-surface-container" };
  return <Badge className={h.className}>{h.label}</Badge>;
}
