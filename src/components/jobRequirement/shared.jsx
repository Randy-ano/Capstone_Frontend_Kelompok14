// Label & komponen khusus job requirement, usulan kandidat, dan progres (FR-05, 07, 08, 09).
import { ROLE } from "../../auth/roles";
import { Badge, NADA } from "../ui";

export const STATUS_REQ = {
  draft: { label: "Draft", className: NADA.netral },
  diajukan: { label: "Diajukan", className: NADA.menunggu },
  diproses: { label: "Diproses", className: NADA.proses },
  terpenuhi: { label: "Terpenuhi", className: NADA.sukses },
  dibatalkan: { label: "Dibatalkan", className: NADA.netral },
};

export const INDIKATOR_SLA = {
  aman: { label: "Aman", ikon: "check_circle", className: NADA.sukses },
  mendekati: { label: "Mendekati", ikon: "schedule", className: NADA.menunggu },
  terlambat: { label: "Terlambat", ikon: "warning", className: NADA.bahaya },
};

export const TAHAPAN = {
  kebutuhan_dibuat: { label: "Kebutuhan diajukan", ikon: "post_add" },
  // Tahap `screening` di backend = usulan Talent Support ke Account Manager (revisi 2026-11-05).
  screening: { label: "Diusulkan ke AM", ikon: "forward_to_inbox" },
  diajukan: { label: "Diajukan ke klien", ikon: "send" },
  interview: { label: "Interview", ikon: "event_available" },
  evaluasi: { label: "Evaluasi", ikon: "rate_review" },
  placement: { label: "Penempatan", ikon: "assignment_ind" },
  ditolak: { label: "Kandidat ditolak", ikon: "person_remove" },
};

// Status yang masih bisa diubah isinya / dibatalkan / dicarikan kandidat (sama dengan aturan backend).
export const BISA_DIUBAH = ["draft", "diajukan"];
export const BISA_DIBATALKAN = ["draft", "diajukan", "diproses"];
export const TERBUKA = ["diajukan", "diproses"];

// HR Client hanya melihat job kliennya sendiri, jadi boleh mengelola semua yang ia lihat; AM boleh semua.
export const bolehKelola = (user) => [ROLE.HR_CLIENT, ROLE.ACCOUNT_MANAGER].includes(user.role);

export function StatusReqBadge({ status }) {
  const s = STATUS_REQ[status] ?? { label: status, className: NADA.netral };
  return <Badge className={s.className}>{s.label}</Badge>;
}

export function SlaBadge({ indikator }) {
  const s = INDIKATOR_SLA[indikator] ?? { label: indikator, ikon: "help", className: NADA.netral };
  return (
    <Badge className={`gap-1 ${s.className}`}>
      <span aria-hidden="true" className="material-symbols-outlined text-[14px]">{s.ikon}</span>
      {s.label}
    </Badge>
  );
}

// "1/2 terpenuhi" + bar kecil.
export function Pemenuhan({ terpenuhi, jumlah }) {
  const persen = jumlah ? Math.min(100, Math.round((terpenuhi / jumlah) * 100)) : 0;
  return (
    <div className="min-w-[90px]">
      <div className="font-label-md text-label-md text-on-surface">
        {terpenuhi}/{jumlah} <span className="text-on-surface-variant font-normal">terpenuhi</span>
      </div>
      <div className="w-full bg-surface-container h-1.5 rounded-full mt-1 overflow-hidden">
        <div className="bg-primary h-full rounded-full" style={{ width: `${persen}%` }} />
      </div>
    </div>
  );
}

// Bar skor 0–100.
export function BarSkor({ nilai, className = "bg-primary" }) {
  return (
    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.max(0, Math.min(100, nilai))}%` }} />
    </div>
  );
}

// Kisaran gaji permintaan kebutuhan: "Rp8.000.000 – Rp12.000.000"; salah satu kosong → "Mulai …"/"Hingga …"; keduanya kosong → null.
const rupiah = (n) => `Rp${Number(n).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
export function formatKisaranGaji(min, maks) {
  if (min == null && maks == null) return null;
  if (min != null && maks != null) return min === maks ? rupiah(min) : `${rupiah(min)} – ${rupiah(maks)}`;
  return min != null ? `Mulai ${rupiah(min)}` : `Hingga ${rupiah(maks)}`;
}

// Input rupiah dengan pemisah ribuan ("8.000.000"). `value` & `onChange` memakai string angka tanpa titik ("8000000").
export function InputRupiah({ value, onChange, className = "", ...props }) {
  const tampil = value === "" || value == null ? "" : Number(value).toLocaleString("id-ID");
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant pointer-events-none">Rp</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={tampil}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 13))}
        className={`${className} pl-10`}
        {...props}
      />
    </div>
  );
}
