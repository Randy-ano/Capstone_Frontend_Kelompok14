import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { KartuRingkasan, KepalaHalaman, KotakCari, Pagination, Pesan, PilihFilter, formatTanggalWaktu, useTunda } from "../components/ui";
import { INDIKATOR_SLA, Pemenuhan, STATUS_REQ, SlaBadge, StatusReqBadge, TAHAPAN } from "../components/jobRequirement/shared";
import FormJob, { tambahOpsiKompetensi } from "../components/jobRequirement/FormJob";
import JobDrawer from "../components/jobRequirement/JobDrawer";

const PER_PAGE = 10;

// Halaman Pipeline Rekrutmen (FR-09): monitoring progres & SLA semua job — khusus internal (AM, TS, Manager).
export default function PipelineRekrutmen() {
  const { user } = useAuth();

  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [status, setStatus] = useState("");
  const [sla, setSla] = useState("");
  const [klien, setKlien] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);

  const [hasil, setHasil] = useState(null);
  const [ringkasan, setRingkasan] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");

  const [opsiKlien, setOpsiKlien] = useState([]);
  const [opsiKompetensi, setOpsiKompetensi] = useState([]);
  const [dipilih, setDipilih] = useState(null);
  const [form, setForm] = useState(null);
  const [sukses, setSukses] = useState("");

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    api("/klien?per_page=100")
      .then((res) => setOpsiKlien(res.data))
      .catch((err) => setError(err.message));
    api("/kompetensi?per_page=100")
      .then((res) => setOpsiKompetensi(res.data))
      .catch((err) => setError(err.message));
  }, []);

  // Ringkasan dari meta daftar job requirement (tidak terpengaruh filter).
  useEffect(() => {
    api("/job-requirements?per_page=1")
      .then((res) => setRingkasan(res.meta.ringkasan))
      .catch((err) => setError(err.message));
  }, [versi]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (sla) params.set("indikator_sla", sla);
    if (klien) params.set("id_klien", klien);

    setMemuat(true);
    setError("");
    api(`/progres?${params}`)
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

  const r = ringkasan;
  const adaFilter = Boolean(search || status || sla || klien);
  const pilihSla = (nilai) => () => {
    setStatus("");
    setSla(nilai);
    setPage(1);
  };
  const kartu = [
    { label: "Sedang Berjalan", nilai: r && r.diajukan + r.diproses, ikon: "pending_actions", keterangan: `${r?.diajukan ?? "–"} diajukan · ${r?.diproses ?? "–"} diproses` },
    { label: "SLA Terlambat", nilai: r?.sla_terlambat, ikon: "warning", warna: "text-error", keterangan: "Klik untuk menyaring", aktif: sla === "terlambat", onClick: pilihSla("terlambat") },
    { label: "Mendekati SLA", nilai: r?.sla_mendekati, ikon: "schedule", warna: "text-secondary", keterangan: "Sisa ≤ 3 hari", aktif: sla === "mendekati", onClick: pilihSla("mendekati") },
    { label: "Terpenuhi", nilai: r?.terpenuhi, ikon: "task_alt", warna: "text-on-tertiary-container", keterangan: `dari ${r?.total ?? "–"} permintaan` },
  ];

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="view_kanban" kategori="Utama" judul="Pipeline Rekrutmen">
        Pantau progres pemenuhan dan indikator SLA semua permintaan kebutuhan. Permintaan dengan deadline terdekat tampil paling atas.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {kartu.map((k) => (
            <KartuRingkasan key={k.label} {...k} />
          ))}
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <KotakCari value={cari} onChange={setCari} placeholder="Cari posisi atau nama klien..." />
          <PilihFilter ikon="filter_alt" label="Status" value={status} onChange={ubahFilter(setStatus)} semua="Semua Status" opsi={Object.entries(STATUS_REQ).map(([v, s]) => [v, s.label])} />
          <PilihFilter ikon="timer" label="Indikator SLA" value={sla} onChange={ubahFilter(setSla)} semua="Semua SLA" opsi={Object.entries(INDIKATOR_SLA).map(([v, s]) => [v, s.label])} />
          <PilihFilter ikon="business" label="Klien" value={klien} onChange={ubahFilter(setKlien)} semua="Semua Klien" opsi={opsiKlien.map((k) => [String(k.id_klien), k.nama_perusahaan])} />
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
            <table className={`w-full min-w-[960px] text-left border-collapse transition-opacity ${memuat && hasil ? "opacity-60" : ""}`}>
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                  <th className="py-3 px-4">Permintaan</th>
                  <th className="py-3 px-4">SLA</th>
                  <th className="py-3 px-4">Pemenuhan</th>
                  <th className="py-3 px-4 text-center">Screening</th>
                  <th className="py-3 px-4">Progres Terakhir</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-surface-container-low">
                {!hasil && memuat && (
                  <tr>
                    <td colSpan={6} className="py-space-xl text-center text-on-surface-variant">
                      Memuat pipeline...
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
                  <BarisPipeline key={job.id_job_req} job={job} onOpen={() => setDipilih(job.id_job_req)} />
                ))}
              </tbody>
            </table>
          </div>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="permintaan" />}
        </div>
      </div>

      {dipilih && <JobDrawer id={dipilih} user={user} versi={versi} pesan={sukses} onClose={tutupDetail} onChanged={muatUlang} onEdit={(job) => setForm({ job })} />}
      {form && (
        <FormJob
          job={form.job}
          user={user}
          opsiKompetensi={opsiKompetensi}
          onClose={tutupForm}
          onSaved={(job, pesan) => {
            setForm(null);
            setOpsiKompetensi((opsi) => tambahOpsiKompetensi(opsi, job.kompetensi));
            setSukses(pesan);
            setDipilih(job.id_job_req);
            muatUlang();
          }}
        />
      )}
    </div>
  );
}

function BarisPipeline({ job, onOpen }) {
  const log = job.progres_terakhir;
  const tahapan = log && (TAHAPAN[log.status_tahapan] ?? { label: log.status_tahapan, ikon: "radio_button_checked" });

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
          <span className="block font-body-sm text-body-sm text-on-surface-variant">{job.klien.nama_perusahaan}</span>
        </button>
      </td>
      <td className="py-3 px-4 whitespace-nowrap">
        <span className="block">
          <SlaBadge indikator={job.indikator_sla} />
        </span>
        <span className="block mt-1 font-body-sm text-body-sm text-on-surface-variant">{formatTanggalWaktu(job.sla_deadline)}</span>
      </td>
      <td className="py-3 px-4">
        <Pemenuhan terpenuhi={job.terpenuhi} jumlah={job.jumlah_kebutuhan} />
      </td>
      <td className="py-3 px-4 text-center font-title-sm text-title-sm text-on-surface">{job.jumlah_screening}</td>
      <td className="py-3 px-4">
        {log ? (
          <div className="flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">{tahapan.ikon}</span>
            <div>
              <span className="block font-label-md text-label-md text-on-surface">{tahapan.label}</span>
              <span className="block font-body-sm text-body-sm text-on-surface-variant">
                {formatTanggalWaktu(log.log_waktu_pembaruan)}
                {log.talent && ` · ${log.talent.nama_lengkap}`}
              </span>
            </div>
          </div>
        ) : (
          <span className="font-body-sm text-body-sm text-outline">Belum diajukan</span>
        )}
      </td>
      <td className="py-3 px-4">
        <StatusReqBadge status={job.status_req} />
      </td>
    </tr>
  );
}
