import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE } from "../auth/roles";
import { KepalaHalaman } from "../components/ui";
import TabCuti from "../components/operasional/TabCuti";
import TabShift from "../components/operasional/TabShift";

const TAB = [
  { key: "cuti", label: "Cuti", ikon: "event_busy" },
  { key: "shift", label: "Jadwal Shift", ikon: "calendar_month" },
];

const KETERANGAN = {
  [ROLE.TALENT]: "Ajukan cuti untuk penempatan Anda dan lihat jadwal shift kerja.",
  [ROLE.HR_CLIENT]: "Setujui cuti talent yang ditempatkan di perusahaan Anda dan atur jadwal shift mereka.",
  [ROLE.MANAGER]: "Beri persetujuan cuti talent dan atur jadwal shift di semua klien.",
};

// Halaman Pengajuan Cuti & Shift (FR-14, FR-15): Talent, HR Client, Manager.
export default function CutiShift() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "shift" ? "shift" : "cuti";

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="calendar_clock" kategori="Operasional & HR" judul="Pengajuan Cuti & Shift">
        {KETERANGAN[user.role]} Cuti disetujui setelah HR klien dan Manager sama-sama menyetujui.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-md">
        <div className="inline-flex self-start p-1 bg-surface-container rounded-full shadow-sm" role="tablist">
          {TAB.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setParams(t.key === "cuti" ? {} : { tab: t.key })}
              className={`px-4 sm:px-5 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 transition-all ${
                tab === t.key ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.ikon}</span>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "cuti" ? <TabCuti user={user} /> : <TabShift user={user} />}
      </div>
    </div>
  );
}
