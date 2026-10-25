import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE, displayUser } from "../auth/roles";
import { Memuat, Pesan, Skeleton } from "../components/ui";

const IKON = {
  job_aktif: "receipt_long",
  sla_terlambat: "warning",
  placement_aktif: "assignment_ind",
  cuti_menunggu: "event_upcoming",
  keluhan_terbuka: "support_agent",
  ttd_menunggu: "draw",
  siap_diajukan: "send",
  menunggu_klien: "hourglass_top",
  interview_mendatang: "event_available",
  talent_tersedia: "group",
  job_terbuka: "person_search",
  screening_pending: "fact_check",
  menunggu_placement: "how_to_reg",
  perlu_ditinjau: "rule",
  status_profil: "badge",
  status_kandidat: "work",
};

const STATUS_REQ = { draft: "Draft", diajukan: "Diajukan", diproses: "Diproses", terpenuhi: "Terpenuhi", dibatalkan: "Dibatalkan" };

function sapaan() {
  const jam = new Date().getHours();
  return jam < 11 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam";
}

// Dashboard Rekapitulasi (FR-20): ringkasan per role untuk semua; analitik R32 untuk Manager.
export default function DashboardRekapitulasi() {
  const { user } = useAuth();
  const manager = user.role === ROLE.MANAGER;
  const [ringkasan, setRingkasan] = useState(null);
  const [analitik, setAnalitik] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/dashboard/ringkasan")
      .then((res) => setRingkasan(res.data))
      .catch((err) => setError(err.message));
    if (manager) {
      api("/dashboard/manager")
        .then((res) => setAnalitik(res.data))
        .catch((err) => setError(err.message));
    }
  }, [manager]);

  const tanggal = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <div className="px-space-md sm:px-space-xl pt-space-lg pb-space-sm space-y-1">
        <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-primary uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">today</span>
          {tanggal}
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight">
          {sapaan()}, {displayUser(user).nama}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {ringkasan?.notifikasi_belum_dibaca
            ? `Anda punya ${ringkasan.notifikasi_belum_dibaca} notifikasi belum dibaca.`
            : "Berikut ringkasan pekerjaan Anda hari ini."}
          {ringkasan?.notifikasi_belum_dibaca > 0 && (
            <Link to="/notifikasi" className="ml-1 text-primary hover:underline">
              Lihat notifikasi
            </Link>
          )}
        </p>
      </div>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        {error && <Pesan>{error}</Pesan>}
        {!ringkasan && !error && (
          <div data-memuat role="status" aria-busy="true" className="grid grid-cols-2 xl:grid-cols-3 gap-space-sm sm:gap-space-md">
            <span className="sr-only">Memuat ringkasan...</span>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="kartu p-space-md space-y-space-sm">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {ringkasan && (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-space-sm sm:gap-space-md">
            {ringkasan.kartu.map((k) => (
              <KartuTujuan key={k.kunci} kartu={k} />
            ))}
          </div>
        )}

        {manager && analitik && <AnalitikManager data={analitik} />}
        {manager && !analitik && !error && (
          <div className="kartu p-space-lg">
            <Memuat>Memuat analitik...</Memuat>
          </div>
        )}
      </div>
    </div>
  );
}

function KartuTujuan({ kartu: k }) {
  const isi = (
    <>
      <div className="flex items-start justify-between gap-space-sm text-on-surface-variant">
        <span className="font-label-lg text-label-lg">{k.label}</span>
        <span
          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-lg material-symbols-outlined text-[20px] ${
            k.kunci === "sla_terlambat" && k.nilai > 0 ? "bg-error-container text-error" : "bg-primary-fixed text-primary"
          }`}
        >
          {IKON[k.kunci] ?? "insights"}
        </span>
      </div>
      <div className={`mt-auto pt-space-sm text-on-surface tabular-nums ${typeof k.nilai === "number" ? "font-headline-xl text-headline-xl" : "font-headline-sm text-headline-sm"}`}>{k.nilai}</div>
      {k.keterangan && <div className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{k.keterangan}</div>}
    </>
  );
  const kelas = "kartu h-full flex flex-col p-space-md transition-shadow";
  return k.tujuan ? (
    <Link to={k.tujuan} className={`${kelas} hover:shadow-md hover:ring-primary/40`}>
      {isi}
    </Link>
  ) : (
    <div className={kelas}>{isi}</div>
  );
}

function Panel({ judul, ikon, keterangan, children }) {
  return (
    <section className="kartu p-space-md sm:p-space-lg space-y-space-md min-w-0">
      <div>
        <h2 className="flex items-center gap-space-sm font-title-md text-title-md text-on-surface">
          <span className="material-symbols-outlined text-primary text-[20px]">{ikon}</span>
          {judul}
        </h2>
        {keterangan && <p className="font-body-sm text-body-sm text-on-surface-variant">{keterangan}</p>}
      </div>
      {children}
    </section>
  );
}

function AnalitikManager({ data }) {
  const totalKandidat = data.kandidat_per_tahapan.reduce((t, x) => t + x.jumlah, 0);
  return (
    <>
      <Panel judul="Tren Placement" ikon="trending_up" keterangan="Jumlah talent yang mulai ditempatkan per bulan, 12 bulan terakhir.">
        <GrafikBulanan data={data.tren_placement} />
      </Panel>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
        <Panel judul="Kandidat per Tahapan" ikon="filter_alt" keterangan={`Posisi ${totalKandidat} kandidat saat ini di alur rekrutmen.`}>
          <DaftarBatang data={data.kandidat_per_tahapan.map((t) => ({ label: t.label, jumlah: t.jumlah }))} satuan="kandidat" />
        </Panel>
        <Panel judul="Permintaan per Status" ikon="receipt_long" keterangan={`${data.job_requirement.total} permintaan kebutuhan; ${data.placement_aktif} placement aktif.`}>
          <DaftarBatang data={Object.entries(data.job_requirement.per_status).map(([s, j]) => ({ label: STATUS_REQ[s] ?? s, jumlah: j }))} satuan="permintaan" />
        </Panel>
      </div>
    </>
  );
}

// Batang horizontal satu seri dengan label nilai langsung.
function DaftarBatang({ data, satuan }) {
  const maks = Math.max(1, ...data.map((d) => d.jumlah));
  return (
    <ul className="space-y-space-sm">
      {data.map((d) => (
        <li key={d.label} title={`${d.label}: ${d.jumlah} ${satuan}`}>
          <div className="flex items-baseline justify-between gap-space-sm font-body-sm text-body-sm">
            <span className="text-on-surface-variant">{d.label}</span>
            <span className="font-label-md text-label-md text-on-surface tabular-nums">{d.jumlah}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(d.jumlah / maks) * 100}%`, minWidth: d.jumlah ? "4px" : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Kolom per bulan (satu seri) dengan tooltip saat hover/fokus dan tabel tersembunyi untuk pembaca layar.
function GrafikBulanan({ data }) {
  const [aktif, setAktif] = useState(null);
  const maks = Math.max(1, ...data.map((d) => d.jumlah));
  const garis = Array.from(new Set([maks, Math.ceil(maks / 2), 0]));

  return (
    <div className="relative">
      <div className="flex gap-space-sm">
        <div className="flex flex-col justify-between h-48 pb-6 font-label-sm text-label-sm text-outline text-right w-6 shrink-0" aria-hidden="true">
          {garis.map((g) => (
            <span key={g}>{g}</span>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative h-48">
            <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none" aria-hidden="true">
              {garis.map((g) => (
                <div key={g} className="border-t border-surface-container-high" />
              ))}
            </div>
            <div className="absolute inset-x-0 top-0 bottom-0 flex items-end gap-1 sm:gap-2" role="img" aria-label="Tren placement per bulan">
              {data.map((d, i) => (
                <button
                  key={d.bulan}
                  type="button"
                  onMouseEnter={() => setAktif(i)}
                  onMouseLeave={() => setAktif(null)}
                  onFocus={() => setAktif(i)}
                  onBlur={() => setAktif(null)}
                  aria-label={`${d.label}: ${d.jumlah} placement`}
                  className="relative flex-1 h-full flex flex-col justify-end items-center group focus:outline-none"
                >
                  <span className="w-full flex-1 flex items-end justify-center pb-0">
                    <span
                      className={`w-full max-w-[28px] rounded-t-[4px] transition-colors ${aktif === i ? "bg-primary-container" : "bg-primary"}`}
                      style={{ height: `${(d.jumlah / maks) * 100}%`, minHeight: d.jumlah ? "4px" : "2px", opacity: d.jumlah ? 1 : 0.25 }}
                    />
                  </span>
                  <span className="h-6 pt-1 font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{d.label.split(" ")[0]}</span>
                  {aktif === i && (
                    <span className="absolute bottom-full mb-1 z-10 px-2 py-1 rounded-lg bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm whitespace-nowrap shadow">
                      {d.label}: {d.jumlah} placement
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <table className="sr-only">
        <caption>Jumlah placement per bulan</caption>
        <thead>
          <tr>
            <th>Bulan</th>
            <th>Placement</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.bulan}>
              <td>{d.label}</td>
              <td>{d.jumlah}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
