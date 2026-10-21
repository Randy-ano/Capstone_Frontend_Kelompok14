// Label & komponen khusus job requirement, screening, dan progres (FR-05, 07, 08, 09).
import { ROLE } from "../../auth/roles";
import { Badge } from "../ui";

export const STATUS_REQ = {
  draft: { label: "Draft", className: "bg-surface-container-high text-on-surface-variant" },
  diajukan: { label: "Diajukan", className: "bg-secondary-container text-on-secondary-fixed" },
  diproses: { label: "Diproses", className: "bg-primary-fixed text-on-primary-fixed-variant" },
  terpenuhi: { label: "Terpenuhi", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  dibatalkan: { label: "Dibatalkan", className: "bg-error-container text-on-error-container" },
};

export const INDIKATOR_SLA = {
  aman: { label: "Aman", ikon: "check_circle", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  mendekati: { label: "Mendekati", ikon: "schedule", className: "bg-secondary-fixed-dim text-on-secondary-fixed" },
  terlambat: { label: "Terlambat", ikon: "warning", className: "bg-error-container text-on-error-container" },
};

export const TAHAPAN = {
  kebutuhan_dibuat: { label: "Kebutuhan diajukan", ikon: "post_add" },
  screening: { label: "Screening", ikon: "fact_check" },
  diajukan: { label: "Diajukan ke klien", ikon: "send" },
  interview: { label: "Interview", ikon: "event_available" },
  evaluasi: { label: "Evaluasi", ikon: "rate_review" },
  placement: { label: "Placement", ikon: "assignment_ind" },
  ditolak: { label: "Kandidat ditolak", ikon: "person_remove" },
};

// Status yang masih bisa diubah isinya / dibatalkan / dicarikan kandidat (sama dengan aturan backend).
export const BISA_DIUBAH = ["draft", "diajukan"];
export const BISA_DIBATALKAN = ["draft", "diajukan", "diproses"];
export const TERBUKA = ["diajukan", "diproses"];

// HR Client hanya melihat job kliennya sendiri, jadi boleh mengelola semua yang ia lihat; AM boleh semua.
export const bolehKelola = (user) => [ROLE.HR_CLIENT, ROLE.ACCOUNT_MANAGER].includes(user.role);

export function StatusReqBadge({ status }) {
  const s = STATUS_REQ[status] ?? { label: status, className: "bg-surface-container" };
  return <Badge className={s.className}>{s.label}</Badge>;
}

export function SlaBadge({ indikator }) {
  const s = INDIKATOR_SLA[indikator] ?? { label: indikator, ikon: "help", className: "bg-surface-container" };
  return (
    <Badge className={`gap-1 ${s.className}`}>
      <span className="material-symbols-outlined text-[14px]">{s.ikon}</span>
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
