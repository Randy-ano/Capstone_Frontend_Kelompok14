import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { INTERNAL, ROLE } from "../auth/roles";
import { KepalaHalaman } from "../components/ui";
import TabCuti from "../components/operasional/TabCuti";
import TabShift from "../components/operasional/TabShift";

const TAB = [
  { key: "cuti", label: "Cuti", ikon: "event_busy" },
  { key: "shift", label: "Jadwal Shift", ikon: "calendar_month" },
];

const KETERANGAN = {
  [ROLE.TALENT]: "Ajukan cuti untuk penempatan Anda dan lihat jadwal shift kerja. Kuota cuti 12 hari kerja per tahun; Sabtu dan Minggu tidak dihitung.",
  [ROLE.HR_CLIENT]: "Setujui atau tolak cuti talent yang ditempatkan di perusahaan Anda dan atur jadwal shift mereka.",
  [ROLE.MANAGER]: "Pantau pengajuan cuti talent dan atur jadwal shift di semua klien. Keputusan cuti oleh HR Client.",
  [ROLE.ACCOUNT_MANAGER]: "Pantau pengajuan cuti talent di semua klien. Keputusan cuti oleh HR Client.",
  [ROLE.TALENT_SUPPORT]: "Pantau pengajuan cuti talent di semua klien. Keputusan cuti oleh HR Client.",
};

// Halaman Pengajuan Cuti & Shift (FR-14, FR-15). Cuti: semua role (internal hanya melihat).
// Shift: Talent, HR Client, Manager (AM & TS tidak punya akses shift di backend).
export default function CutiShift() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const adaShift = !INTERNAL.includes(user.role) || user.role === ROLE.MANAGER;
  const tab = adaShift && params.get("tab") === "shift" ? "shift" : "cuti";

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="calendar_clock" kategori="Operasional & HR" judul="Pengajuan Cuti & Shift">
        {KETERANGAN[user.role]}
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-md">
        <div className="inline-flex self-start p-1 bg-surface-container rounded-full shadow-sm" role="tablist">
          {TAB.filter((t) => adaShift || t.key !== "shift").map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setParams(t.key === "cuti" ? {} : { tab: t.key })}
              className={`min-h-[40px] px-4 sm:px-5 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 transition-all ${
                tab === t.key ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{t.ikon}</span>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "cuti" ? <TabCuti user={user} /> : <TabShift user={user} />}
      </div>
    </div>
  );
}
