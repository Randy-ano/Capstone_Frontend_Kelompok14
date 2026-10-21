import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { INTERNAL, ROLE } from "../auth/roles";
import {
  Chip,
  KartuRingkasan,
  KepalaHalaman,
  KotakCari,
  Pagination,
  Pesan,
  PilihFilter,
  formatTanggalWaktu,
  useTunda,
} from "../components/ui";
import { INDIKATOR_SLA, Pemenuhan, STATUS_REQ, SlaBadge, StatusReqBadge, bolehKelola } from "../components/jobRequirement/shared";
import FormJob from "../components/jobRequirement/FormJob";
import JobDrawer from "../components/jobRequirement/JobDrawer";

const PER_PAGE = 10;
const MAKS_CHIP = 3;

// Halaman Permintaan Kebutuhan (FR-05): HR Client (job kliennya) dan internal (semua).
// HR Client & AM membuat/mengubah/mengajukan/membatalkan; TS mencari kandidat dari detail.
export default function PermintaanKebutuhan() {
  const { user } = useAuth();
  const internal = INTERNAL.includes(user.role);
  const kelola = bolehKelola(user);

  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [status, setStatus] = useState("");
  const [sla, setSla] = useState("");
  const [klien, setKlien] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);

  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");

  const [opsiKlien, setOpsiKlien] = useState([]);
  const [opsiKompetensi, setOpsiKompetensi] = useState([]);
  const [dipilih, setDipilih] = useState(null);
  const [form, setForm] = useState(null); // null | { job: null } (buat) | { job } (ubah)

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    api("/kompetensi?per_page=100")
      .then((res) => setOpsiKompetensi(res.data))
      .catch((err) => setError(err.message));
    if (internal) {
      api("/klien?per_page=100")
        .then((res) => setOpsiKlien(res.data))
        .catch((err) => setError(err.message));
    }
  }, [internal]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (sla) params.set("indikator_sla", sla);
    if (klien) params.set("id_klien", klien);

    setMemuat(true);
    setError("");
    api(`/job-requirements?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message))
      .finally(() => !batal && setMemuat(false));
    return () => {
      batal = true;
    };
  }, [search, status, sla, klien, page, versi]);

  const ubahFilter = (setter) => (nilai) => {
    setter(nilai);
    setPage(1);
  };

  function resetFilter() {
    setCari("");
    setStatus("");
    setSla("");
    setKlien("");
    setPage(1);
  }

  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);
  const tutupDetail = useCallback(() => {
    setDipilih(null);
    setSukses("");
  }, []);
  const tutupForm = useCallback(() => setForm(null), []);

  function tersimpan(job, pesan) {
    setForm(null);
    setSukses(pesan);
    setDipilih(job.id_job_req);
    muatUlang();
  }

  const r = hasil?.meta.ringkasan;
  const adaFilter = Boolean(search || status || sla || klien);
  const kartu = [
    { label: "Total Permintaan", nilai: r?.total, ikon: "assignment", keterangan: "Seluruh permintaan", aktif: !status && !sla, onClick: () => (setStatus(""), setSla(""), setPage(1)) },
    {
      label: "Diproses",
      nilai: r?.diproses,
      ikon: "pending_actions",
      keterangan: `${r?.diajukan ?? "–"} lainnya diajukan, menunggu screening`,
      aktif: status === "diproses",
      onClick: () => (setStatus("diproses"), setSla(""), setPage(1)),
    },
    { label: "SLA Terlambat", nilai: r?.sla_terlambat, ikon: "warning", warna: "text-error", keterangan: "Lewat deadline, belum terpenuhi", aktif: sla === "terlambat", onClick: () => (setStatus(""), setSla("terlambat"), setPage(1)) },
    { label: "Mendekati SLA", nilai: r?.sla_mendekati, ikon: "schedule", warna: "text-secondary", keterangan: "Sisa ≤ 3 hari", aktif: sla === "mendekati", onClick: () => (setStatus(""), setSla("mendekati"), setPage(1)) },
  ];

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman
        ikon="receipt_long"
        kategori="Klien & Rekuisisi"
        judul="Permintaan Kebutuhan"
        aksi={
          kelola && (
            <button
              type="button"
              onClick={() => setForm({ job: null })}
              className="w-full md:w-auto flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Buat Permintaan
            </button>
          )
        }
      >
        {user.role === ROLE.HR_CLIENT
          ? "Ajukan kebutuhan talent perusahaan Anda dan pantau progres pemenuhannya."
          : "Kebutuhan talent dari klien beserta status, SLA, dan progres pemenuhannya."}
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {kartu.map((k) => (
            <KartuRingkasan key={k.label} {...k} />
          ))}
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <KotakCari value={cari} onChange={setCari} placeholder={internal ? "Cari posisi atau nama klien..." : "Cari posisi..."} />
          <PilihFilter ikon="filter_alt" label="Status" value={status} onChange={ubahFilter(setStatus)} semua="Semua Status" opsi={Object.entries(STATUS_REQ).map(([v, s]) => [v, s.label])} />
          <PilihFilter ikon="timer" label="Indikator SLA" value={sla} onChange={ubahFilter(setSla)} semua="Semua SLA" opsi={Object.entries(INDIKATOR_SLA).map(([v, s]) => [v, s.label])} />
          {internal && (
            <PilihFilter ikon="business" label="Klien" value={klien} onChange={ubahFilter(setKlien)} semua="Semua Klien" opsi={opsiKlien.map((k) => [String(k.id_klien), k.nama_perusahaan])} />
          )}
          {adaFilter && (
            <button type="button" onClick={resetFilter} className="h-10 px-3 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Reset
            </button>
          )}
        </div>

        {error && <Pesan>{error}</Pesan>}

        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className={`w-full min-w-[900px] text-left border-collapse transition-opacity ${memuat && hasil ? "opacity-60" : ""}`}>
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                  <th className="py-3 px-4">Posisi</th>
                  <th className="py-3 px-4">Klien</th>
                  <th className="py-3 px-4">Kebutuhan</th>
                  <th className="py-3 px-4">Kompetensi</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-surface-container-low">
                {!hasil && memuat && (
                  <tr>
                    <td colSpan={6} className="py-space-xl text-center text-on-surface-variant">
                      Memuat permintaan kebutuhan...
                    </td>
                  </tr>
                )}
                {hasil?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-space-xl text-center text-on-surface-variant">
                      {adaFilter ? "Tidak ada permintaan yang cocok dengan pencarian atau filter." : "Belum ada permintaan kebutuhan."}
                    </td>
                  </tr>
                )}
                {hasil?.data.map((job) => (
                  <BarisJob key={job.id_job_req} job={job} onOpen={() => setDipilih(job.id_job_req)} />
                ))}
              </tbody>
            </table>
          </div>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="permintaan" />}
        </div>
      </div>

      {dipilih && <JobDrawer id={dipilih} user={user} versi={versi} pesan={sukses} onClose={tutupDetail} onChanged={muatUlang} onEdit={(job) => setForm({ job })} />}
      {form && <FormJob job={form.job} user={user} opsiKompetensi={opsiKompetensi} onClose={tutupForm} onSaved={tersimpan} />}
    </div>
  );
}

function BarisJob({ job, onOpen }) {
  const sisa = job.kompetensi.length - MAKS_CHIP;
  return (
    <tr onClick={onOpen} className="hover:bg-surface-container-low cursor-pointer transition-colors align-top">
      <td className="py-3 px-4">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="text-left group"
        >
          <span className="block font-title-sm text-title-sm text-on-surface group-hover:text-primary">{job.posisi}</span>
          <span className="block font-body-sm text-body-sm text-on-surface-variant">
            {job.pengalaman_min ? `Min. ${job.pengalaman_min} tahun pengalaman` : "Tanpa minimal pengalaman"}
          </span>
        </button>
      </td>
      <td className="py-3 px-4 text-on-surface-variant">
        <span className="block">{job.klien.nama_perusahaan}</span>
        {job.account_manager && <span className="block font-body-sm text-body-sm text-outline">AM: {job.account_manager.nama_pegawai}</span>}
      </td>
      <td className="py-3 px-4">
        <Pemenuhan terpenuhi={job.terpenuhi} jumlah={job.jumlah_kebutuhan} />
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1 max-w-[240px]">
          {job.kompetensi.slice(0, MAKS_CHIP).map((k) => (
            <Chip key={k.id_kompetensi} title={k.kategori}>
              {k.nama_kompetensi}
            </Chip>
          ))}
          {sisa > 0 && (
            <span
              title={job.kompetensi.slice(MAKS_CHIP).map((k) => k.nama_kompetensi).join(", ")}
              className="inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md"
            >
              +{sisa}
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="block text-on-surface-variant">{formatTanggalWaktu(job.sla_deadline)}</span>
        <span className="block mt-1">
          <SlaBadge indikator={job.indikator_sla} />
        </span>
      </td>
      <td className="py-3 px-4">
        <StatusReqBadge status={job.status_req} />
      </td>
    </tr>
  );
}
