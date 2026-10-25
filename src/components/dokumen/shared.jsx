// Label & helper dokumen (FR-13).
import { api } from "../../lib/api";
import { Badge, NADA } from "../ui";

export const JENIS_DOKUMEN = {
  quotation: { label: "Quotation", ikon: "request_quote" },
  purchase_order: { label: "Purchase Order", ikon: "shopping_cart" },
  pks: { label: "Perjanjian Kerja Sama", ikon: "handshake" },
  kontrak_kerja: { label: "Kontrak Kerja", ikon: "contract" },
  surat_peringatan: { label: "Surat Peringatan", ikon: "warning" },
  cv: { label: "CV", ikon: "badge" },
  lainnya: { label: "Lainnya", ikon: "description" },
};

// Siapa yang boleh menandatangani per jenis dokumen (R27, sama dengan DokumenService::calonPenandatangan di backend).
export const ATURAN_PENANDATANGAN = {
  quotation: "Account Manager, Manager, dan HR Client dari klien dokumen.",
  purchase_order: "Account Manager, Manager, dan HR Client dari klien dokumen.",
  pks: "Account Manager, Manager, dan HR Client dari klien dokumen.",
  kontrak_kerja: "Talent terkait, Account Manager, dan Manager.",
  surat_peringatan: "Talent terkait, Account Manager, dan Manager.",
  lainnya: "Account Manager, Manager, HR Client dari klien dokumen, dan talent terkait.",
};

export const STATUS_DOKUMEN = {
  draft: { label: "Draft", className: NADA.netral },
  menunggu_ttd: { label: "Menunggu Tanda Tangan", className: NADA.menunggu },
  ditandatangani: { label: "Ditandatangani", className: NADA.sukses },
  ditolak: { label: "Ditolak", className: NADA.bahaya },
};

export const STATUS_TTD = {
  menunggu: { label: "Menunggu", ikon: "hourglass_top", className: "text-warning" },
  ditandatangani: { label: "Ditandatangani", ikon: "draw", className: "text-on-tertiary-container" },
  ditolak: { label: "Menolak", ikon: "cancel", className: "text-error" },
};

export const ROLE_SINGKAT = {
  talent: "Talent",
  hr_client: "HR Client",
  account_manager: "Account Manager",
  talent_support: "Talent Support",
  manager: "Manager",
};

export function StatusDokumenBadge({ status }) {
  const s = STATUS_DOKUMEN[status] ?? { label: status, className: NADA.netral };
  return <Badge className={s.className}>{s.label}</Badge>;
}

// Unduh file terproteksi (Bearer token) lalu simpan dengan nama aslinya.
export async function unduhDokumen(dokumen) {
  const blob = await api(`/dokumen/${dokumen.id_dokumen}/download`, { blob: true });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = dokumen.nama_file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export const formatRupiahInput = (n) => (Number.isFinite(n) ? `Rp${n.toLocaleString("id-ID")}` : "Rp0");
