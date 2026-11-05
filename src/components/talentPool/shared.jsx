// Label & komponen khusus Talent Pool. Komponen umum ada di ../ui.jsx.
import { Badge, NADA } from "../ui";

export const STATUS_KETERSEDIAAN = {
  tersedia: { label: "Tersedia", className: NADA.sukses },
  tidak_tersedia: { label: "Tidak Tersedia", className: NADA.netral },
};

export const STATUS_KANDIDAT = {
  tersedia: "Tersedia",
  dalam_proses: "Dalam Proses",
  ditempatkan: "Ditempatkan",
  tidak_aktif: "Tidak Aktif",
};

export function StatusBadge({ status }) {
  const s = STATUS_KETERSEDIAAN[status] ?? { label: status, className: NADA.netral };
  return <Badge className={s.className}>{s.label}</Badge>;
}
