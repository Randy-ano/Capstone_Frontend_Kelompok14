// Label & badge pengajuan, interview, evaluasi, dan placement (FR-10, 11, 12, 17).
import { ROLE } from "../../auth/roles";
import { Badge, NADA } from "../ui";

// Nilai status_tampil dari backend (juga nilai filter status GET /pengajuan); label sama dengan label_status_tampil.
export const STATUS_TAMPIL = {
  diajukan: { label: "Menunggu Tinjauan", className: NADA.menunggu },
  lanjut_interview: { label: "Lanjut Interview", className: NADA.proses },
  diterima: { label: "Diterima", className: NADA.sukses },
  ditempatkan: { label: "Ditempatkan", className: NADA.sukses },
  ditolak: { label: "Ditolak", className: NADA.bahaya },
};

export const STATUS_INTERVIEW = {
  dijadwalkan: { label: "Dijadwalkan", className: NADA.proses },
  dijadwal_ulang: { label: "Dijadwal Ulang", className: NADA.menunggu },
  selesai: { label: "Selesai", className: NADA.netral },
  dibatalkan: { label: "Dibatalkan", className: NADA.netral },
};

export const STATUS_EVALUASI = {
  diterima: { label: "Diterima", className: NADA.sukses },
  ditolak: { label: "Ditolak", className: NADA.bahaya },
};

export const STATUS_PLACEMENT = {
  aktif: { label: "Aktif", className: NADA.sukses },
  selesai: { label: "Selesai", className: NADA.netral },
  dihentikan: { label: "Dihentikan", className: NADA.bahaya },
};

function BadgeDari({ peta, nilai }) {
  const s = peta[nilai] ?? { label: nilai, className: NADA.netral };
  return <Badge className={s.className}>{s.label}</Badge>;
}

export const InterviewBadge = ({ status }) => <BadgeDari peta={STATUS_INTERVIEW} nilai={status} />;
export const EvaluasiBadge = ({ status }) => <BadgeDari peta={STATUS_EVALUASI} nilai={status} />;
export const PlacementBadge = ({ status }) => <BadgeDari peta={STATUS_PLACEMENT} nilai={status} />;

// Penjelasan singkat status untuk talent (halaman Proses Seleksi), per status_tampil.
export const PENJELASAN_STATUS_TALENT = {
  diajukan: "Diajukan ke klien: profil Anda sedang ditinjau oleh HR klien.",
  lanjut_interview: "Klien ingin mengenal Anda lebih jauh. Ikuti jadwal interview yang diatur Account Manager.",
  diterima: "Selamat, klien menerima Anda. Tim kami sedang menyiapkan kontrak dan penempatan Anda.",
  ditempatkan: "Anda sudah ditempatkan di klien ini. Detailnya ada di menu Penempatan Saya.",
  ditolak: "Klien tidak melanjutkan proses ini. Profil Anda tetap di talent pool untuk kesempatan lain.",
};

// Tahapan seleksi untuk stepper talent: Diajukan → Interview → Evaluasi → Penempatan.
// status: selesai | aktif | gagal | nanti. Dihitung dari data pengajuan (status_pengajuan, evaluasi, id_placement).
export function langkahSeleksi(p) {
  const nama = ["Diajukan ke Klien", "Interview", "Evaluasi", "Penempatan"];
  let posisi;
  let gagal = false;
  if (p.id_placement) posisi = 4;
  else if (p.status_pengajuan === "ditolak") [posisi, gagal] = [0, true];
  else if (p.evaluasi?.status_evaluasi === "ditolak") [posisi, gagal] = [2, true];
  else if (p.evaluasi?.status_evaluasi === "diterima") posisi = 3;
  else if (p.status_pengajuan === "lanjut_interview") posisi = 1;
  else posisi = 0;
  return nama.map((label, i) => ({
    label,
    status: i < posisi ? "selesai" : i === posisi ? (gagal ? "gagal" : "aktif") : "nanti",
  }));
}

const GAYA_LANGKAH = {
  selesai: { ikon: "check", bulat: "bg-primary text-on-primary", teks: "text-on-surface", sr: "selesai" },
  aktif: { ikon: null, bulat: "bg-primary-fixed text-on-primary-fixed-variant ring-2 ring-primary", teks: "text-primary font-semibold", sr: "tahap saat ini" },
  gagal: { ikon: "close", bulat: "bg-error-container text-on-error-container ring-2 ring-error", teks: "text-error font-semibold", sr: "berhenti di tahap ini" },
  nanti: { ikon: null, bulat: "bg-surface-container text-outline", teks: "text-on-surface-variant", sr: "belum" },
};

// Stepper horizontal 4 langkah; muat di lebar HP (label kecil di bawah lingkaran).
export function StepperSeleksi({ pengajuan, className = "" }) {
  const langkah = langkahSeleksi(pengajuan);
  return (
    <ol className={`flex items-start w-full max-w-md ${className}`} aria-label="Tahapan seleksi">
      {langkah.map((l, i) => {
        const g = GAYA_LANGKAH[l.status];
        return (
          <li key={l.label} className="relative flex-1 flex flex-col items-center text-center min-w-0" aria-current={l.status === "aktif" || l.status === "gagal" ? "step" : undefined}>
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2 -z-0 ${l.status === "nanti" ? "bg-surface-container-high" : "bg-primary"}`}
              />
            )}
            <span className={`relative z-[1] w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-label-sm ${g.bulat}`}>
              {g.ikon ? <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{g.ikon}</span> : i + 1}
            </span>
            <span className={`mt-1 px-0.5 font-label-sm text-label-sm leading-tight ${g.teks}`}>
              {l.label}
              <span className="sr-only"> ({g.sr})</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// Status & label dihitung backend (status_tampil), sama dengan yang dipakai filter.
export function BadgeTahapPengajuan({ pengajuan: p }) {
  return <Badge className={STATUS_TAMPIL[p.status_tampil]?.className ?? NADA.netral}>{p.label_status_tampil}</Badge>;
}

// Tahap terkini pengajuan untuk kolom tabel: menggabungkan status pengajuan, evaluasi, dan placement.
export function tahapPengajuan(p) {
  if (p.id_placement) return { label: "Ditempatkan", ikon: "assignment_ind" };
  if (p.status_pengajuan === "ditolak") return { label: "Ditolak klien", ikon: "person_remove" };
  if (p.evaluasi?.status_evaluasi === "ditolak") return { label: "Tidak lolos evaluasi", ikon: "person_remove" };
  if (p.evaluasi?.status_evaluasi === "diterima") return { label: "Diterima, menunggu penempatan", ikon: "how_to_reg" };
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
