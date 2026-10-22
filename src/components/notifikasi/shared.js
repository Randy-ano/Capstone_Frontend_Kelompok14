// Pemetaan tipe notifikasi (backend `tipe_notifikasi`) ke ikon & halaman tujuan (FR-16).
import { INTERNAL } from "../../auth/roles";

const TIPE = {
  pengajuan_dibuat: { ikon: "send", path: "/pengajuan-kandidat" },
  pengajuan_diperbarui: { ikon: "rule", path: "/pengajuan-kandidat" },
  evaluasi_disimpan: { ikon: "rate_review", path: "/pengajuan-kandidat" },
  interview_dijadwalkan: { ikon: "event_available", path: "/jadwal-interview" },
  interview_diubah: { ikon: "edit_calendar", path: "/jadwal-interview" },
  pengingat_interview: { ikon: "alarm", path: "/jadwal-interview" },
  placement_dibuat: { ikon: "assignment_ind", path: "/penugasan-penempatan" },
  cuti_diajukan: { ikon: "event_upcoming", path: "/pengajuan-cuti-shift" },
  cuti_diputuskan: { ikon: "event_available", path: "/pengajuan-cuti-shift" },
  pengingat_cuti: { ikon: "alarm", path: "/pengajuan-cuti-shift" },
  keluhan_baru: { ikon: "support_agent", path: "/tiket-komplain-klien" },
  tanda_tangan_diminta: { ikon: "draw", path: "/dokumen-quotation-po" },
  pengingat_tanda_tangan: { ikon: "alarm", path: "/dokumen-quotation-po" },
  sla_mendekati: { ikon: "schedule", path: "/pipeline-rekrutmen" },
  sla_terlambat: { ikon: "warning", path: "/pipeline-rekrutmen" },
};

export function infoTipe(tipe, role) {
  const t = TIPE[tipe] ?? { ikon: "notifications", path: null };
  // Pengingat SLA untuk role non-internal diarahkan ke permintaan kebutuhan.
  if (t.path === "/pipeline-rekrutmen" && !INTERNAL.includes(role)) return { ...t, path: "/permintaan-kebutuhan" };
  return t;
}

// "2026-10-22T13:11:22+07:00" → "5 menit lalu" / "kemarin" / "3 hari lalu" / "22 Okt 2026".
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export function waktuRelatif(iso, sekarang = new Date()) {
  const t = new Date(iso);
  const detik = Math.max(0, Math.round((sekarang - t) / 1000));
  if (detik < 60) return "baru saja";
  if (detik < 3600) return `${Math.floor(detik / 60)} menit lalu`;
  if (detik < 86400) return `${Math.floor(detik / 3600)} jam lalu`;
  const hari = Math.floor(detik / 86400);
  if (hari === 1) return "kemarin";
  if (hari < 7) return `${hari} hari lalu`;
  return `${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
}
