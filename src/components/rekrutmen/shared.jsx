// Label & badge pengajuan, interview, evaluasi, dan placement (FR-10, 11, 12, 17).
import { ROLE } from "../../auth/roles";
import { Badge } from "../ui";

export const STATUS_PENGAJUAN = {
  diajukan: { label: "Menunggu Tinjauan", className: "bg-secondary-container text-on-secondary-fixed" },
  lanjut_interview: { label: "Lanjut Interview", className: "bg-primary-fixed text-on-primary-fixed-variant" },
  ditolak: { label: "Ditolak Klien", className: "bg-error-container text-on-error-container" },
};

export const STATUS_INTERVIEW = {
  dijadwalkan: { label: "Dijadwalkan", className: "bg-primary-fixed text-on-primary-fixed-variant" },
  dijadwal_ulang: { label: "Dijadwal Ulang", className: "bg-secondary-fixed-dim text-on-secondary-fixed" },
  selesai: { label: "Selesai", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  dibatalkan: { label: "Dibatalkan", className: "bg-error-container text-on-error-container" },
};

export const STATUS_EVALUASI = {
  diterima: { label: "Diterima", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  ditolak: { label: "Ditolak", className: "bg-error-container text-on-error-container" },
};

export const STATUS_PLACEMENT = {
  aktif: { label: "Aktif", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  selesai: { label: "Selesai", className: "bg-surface-container-high text-on-surface-variant" },
  dihentikan: { label: "Dihentikan", className: "bg-error-container text-on-error-container" },
};

function BadgeDari({ peta, nilai }) {
  const s = peta[nilai] ?? { label: nilai, className: "bg-surface-container" };
  return <Badge className={s.className}>{s.label}</Badge>;
}

export const PengajuanBadge = ({ status }) => <BadgeDari peta={STATUS_PENGAJUAN} nilai={status} />;
export const InterviewBadge = ({ status }) => <BadgeDari peta={STATUS_INTERVIEW} nilai={status} />;
export const EvaluasiBadge = ({ status }) => <BadgeDari peta={STATUS_EVALUASI} nilai={status} />;
export const PlacementBadge = ({ status }) => <BadgeDari peta={STATUS_PLACEMENT} nilai={status} />;

// Tahap terkini pengajuan untuk kolom tabel: menggabungkan status pengajuan, evaluasi, dan placement.
export function tahapPengajuan(p) {
  if (p.id_placement) return { label: "Ditempatkan", ikon: "assignment_ind" };
  if (p.status_pengajuan === "ditolak") return { label: "Ditolak klien", ikon: "person_remove" };
  if (p.evaluasi?.status_evaluasi === "ditolak") return { label: "Tidak lolos evaluasi", ikon: "person_remove" };
  if (p.evaluasi?.status_evaluasi === "diterima") return { label: "Diterima, menunggu placement", ikon: "how_to_reg" };
  if (p.status_pengajuan === "lanjut_interview") return { label: `Interview (${p.jumlah_interview ?? 0} jadwal)`, ikon: "event_available" };
  return { label: "Menunggu tinjauan klien", ikon: "hourglass_top" };
}

// Status interview yang sudah final (tidak bisa diubah lagi).
export const INTERVIEW_FINAL = ["selesai", "dibatalkan"];

// Siapa boleh melakukan apa (sama dengan aturan backend; backend tetap memeriksa).
// R16: interview dibuat, dijadwal ulang, dan ditandai selesai/dibatalkan hanya oleh Account Manager; HR Client & talent hanya melihat.
export const bolehAturInterview = (user) => user.role === ROLE.ACCOUNT_MANAGER;
export const bolehTinjau = (user) => user.role === ROLE.HR_CLIENT;
export const bolehPlacement = (user) => user.role === ROLE.TALENT_SUPPORT;
export const bolehAkhiriPlacement = (user) => [ROLE.TALENT_SUPPORT, ROLE.MANAGER].includes(user.role);

// "2026-10-20" + "10:00" → "20 Okt 2026, 10.00".
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export function formatJadwal(tanggal, waktu) {
  if (!tanggal) return "-";
  const [t, b, h] = tanggal.split("-").map(Number);
  return `${h} ${BULAN[b - 1]} ${t}${waktu ? `, ${waktu.replace(":", ".")}` : ""}`;
}

export const hariIni = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
