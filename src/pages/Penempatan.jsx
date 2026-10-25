import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { INTERNAL, ROLE } from "../auth/roles";
import { BarisKosong, BarisMemuat, KepalaHalaman, KotakCari, Memuat, Pagination, Pesan, PilihFilter, errorField, formatTanggal, useTunda } from "../components/ui";
import { PlacementBadge, STATUS_PLACEMENT, bolehAkhiriPlacement } from "../components/rekrutmen/shared";
import TabMonitoringTalent from "../components/operasional/TabMonitoringTalent";

const PER_PAGE = 10;

const TAB_TALENT = [
  { key: "penempatan", label: "Penempatan", ikon: "assignment_ind" },
  { key: "monitoring", label: "Monitoring", ikon: "monitoring" },
];

// Halaman Penugasan Penempatan (FR-17): placement sesuai scope; TS/Manager mengakhiri placement (R20).
// Talent ("Penempatan Saya") juga punya tab Monitoring berisi catatan kinerja tentang dirinya (FR-15).
export default function Penempatan() {
  const { user } = useAuth();
  const internal = INTERNAL.includes(user.role);
  const talent = user.role === ROLE.TALENT;
  const [params, setParams] = useSearchParams();
  const dipilih = params.get("placement");
  const tab = talent && params.get("tab") === "monitoring" ? "monitoring" : "penempatan";

  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [status, setStatus] = useState("");
  const [klien, setKlien] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [opsiKlien, setOpsiKlien] = useState([]);

  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    if (!internal) return;
    api("/klien?per_page=100")
      .then((res) => setOpsiKlien(res.data))
      .catch((err) => setError(err.message));
  }, [internal]);

  useEffect(() => {
    let batal = false;
    const q = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) q.set("search", search);
    if (status) q.set("status", status);
    if (klien) q.set("id_klien", klien);

    setMemuat(true);
    setError("");
    api(`/placement?${q}`)
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
  }, [search, status, klien, page, versi]);

  const buka = (id) => setParams({ placement: id });
  const tutup = useCallback(() => setParams({}), [setParams]);
  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);
  const adaFilter = Boolean(search || status || klien);

  const keterangan =
    talent
      ? "Penempatan Anda di klien PT Intellisys dan catatan monitoring kinerja Anda."
      : user.role === ROLE.HR_CLIENT
        ? "Talent PT Intellisys yang ditempatkan di perusahaan Anda."
        : "Talent yang sudah ditempatkan di klien. Placement dibuat dari evaluasi yang diterima di halaman Pengajuan Kandidat.";

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="assignment_ind" kategori="Talent Management" judul={talent ? "Penempatan Saya" : "Penugasan Penempatan"}>
        {keterangan}
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        {talent && (
          <div className="inline-flex self-start p-1 bg-surface-container rounded-full shadow-sm" role="tablist">
            {TAB_TALENT.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setParams(t.key === "penempatan" ? {} : { tab: t.key })}
                className={`px-4 sm:px-5 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 transition-all ${
                  tab === t.key ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{t.ikon}</span>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {tab === "monitoring" ? (
          <TabMonitoringTalent />
        ) : (
          <>
            <div className="kartu p-space-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
              <KotakCari value={cari} onChange={setCari} placeholder="Cari nama talent, posisi, atau klien..." />
              <PilihFilter
                ikon="filter_alt"
                label="Status placement"
                value={status}
                onChange={(n) => {
                  setStatus(n);
                  setPage(1);
                }}
                semua="Semua Status"
                opsi={Object.entries(STATUS_PLACEMENT).map(([v, s]) => [v, s.label])}
              />
              {internal && (
                <PilihFilter
                  ikon="business"
                  label="Klien"
                  value={klien}
                  onChange={(n) => {
                    setKlien(n);
                    setPage(1);
                  }}
                  semua="Semua Klien"
                  opsi={opsiKlien.map((k) => [String(k.id_klien), k.nama_perusahaan])}
                />
              )}
            </div>

            {error && <Pesan>{error}</Pesan>}

            <div className="kartu overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className={`tabel min-w-[780px] text-left border-collapse transition-opacity ${memuat && hasil ? "opacity-60" : ""}`}>
                  <thead>
                    <tr>
                      <th>Talent</th>
                      <th>Posisi</th>
                      <th>Klien</th>
                      <th>Periode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!hasil && memuat && <BarisMemuat kolom={5} />}
                    {hasil?.data.length === 0 && (
                      <BarisKosong kolom={5} ikon="assignment_ind">
                        {adaFilter ? "Tidak ada penempatan yang cocok dengan pencarian atau filter." : "Belum ada penempatan."}
                      </BarisKosong>
                    )}
                    {hasil?.data.map((pl) => (
                      <tr key={pl.id_placement} onClick={() => buka(pl.id_placement)} className="hover:bg-surface-container-low cursor-pointer transition-colors align-top">
                        <td>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              buka(pl.id_placement);
                            }}
                            className="text-left group"
                          >
                            <span className="block font-title-sm text-title-sm text-on-surface group-hover:text-primary">{pl.talent.nama_lengkap}</span>
                            <span className="block font-body-sm text-body-sm text-on-surface-variant">{pl.talent.email}</span>
                          </button>
                        </td>
                        <td className="text-on-surface">{pl.posisi_penempatan}</td>
                        <td className="text-on-surface-variant">{pl.klien.nama_perusahaan}</td>
                        <td className="whitespace-nowrap text-on-surface-variant">
                          {formatTanggal(pl.tanggal_mulai)} – {pl.tanggal_selesai ? formatTanggal(pl.tanggal_selesai) : "sekarang"}
                        </td>
                        <td>
                          <PlacementBadge status={pl.status_placement} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="penempatan" />}
            </div>
          </>
        )}
      </div>

      {dipilih && <PlacementDrawer id={dipilih} user={user} onClose={tutup} onChanged={muatUlang} />}
    </div>
  );
}

function PlacementDrawer({ id, user, onClose, onChanged }) {
  const [pl, setPl] = useState(null);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");

  useEffect(() => {
    let batal = false;
    setPl(null);
    setError("");
    api(`/placement/${id}`)
      .then((res) => !batal && setPl(res.data))
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [id]);

  useEffect(() => {
    const esc = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const ringkasan = pl?.ringkasan && [
    ["Cuti", pl.ringkasan.jumlah_cuti],
    ["Shift", pl.ringkasan.jumlah_shift],
    ["Monitoring", pl.ringkasan.jumlah_monitoring],
    ["Keluhan", pl.ringkasan.jumlah_laporan_keluhan],
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Detail penempatan">
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-surface flex flex-col shadow-xl">
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 bg-surface-container-lowest border-b border-surface-container-high shrink-0">
          <h2 className="font-title-md text-title-md text-on-surface">Detail Penempatan</h2>
          <button type="button" onClick={onClose} title="Tutup" className="tombol-ikon -mr-2">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">
          {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}
          {error && <Pesan>{error}</Pesan>}
          {!error && !pl && <Memuat>Memuat detail...</Memuat>}
          {pl && (
            <>
              <section className="kartu p-space-md space-y-space-sm">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="min-w-0">
                    <div className="font-title-md text-title-md text-on-surface">{pl.talent.nama_lengkap}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">{pl.talent.email}</div>
                  </div>
                  <PlacementBadge status={pl.status_placement} />
                </div>
                <dl className="grid grid-cols-2 gap-x-space-md gap-y-space-sm">
                  {[
                    ["Posisi", pl.posisi_penempatan],
                    ["Klien", pl.klien.nama_perusahaan],
                    ["Mulai", formatTanggal(pl.tanggal_mulai)],
                    ["Selesai", pl.tanggal_selesai ? formatTanggal(pl.tanggal_selesai) : "Belum ditentukan"],
                  ].map(([label, isi]) => (
                    <div key={label} className="min-w-0">
                      <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</dt>
                      <dd className="font-body-md text-body-md text-on-surface break-words">{isi}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              {ringkasan && (
                <section className="kartu p-space-md space-y-space-sm">
                  <h3 className="font-title-sm text-title-sm text-on-surface">Ringkasan Operasional</h3>
                  <div className="grid grid-cols-4 gap-space-sm">
                    {ringkasan.map(([label, nilai]) => (
                      <div key={label} className="bg-surface-container-low rounded-lg p-space-sm text-center">
                        <div className="font-title-md text-title-md text-on-surface">{nilai}</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">{label}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {bolehAkhiriPlacement(user) && pl.status_placement === "aktif" && (
                <AkhiriPlacement
                  pl={pl}
                  onBerhasil={(data, pesan) => {
                    setPl(data);
                    setSukses(pesan);
                    onChanged();
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// R20: akhiri placement aktif → talent kembali tersedia di talent pool.
function AkhiriPlacement({ pl, onBerhasil }) {
  const [status, setStatus] = useState("");
  const [tanggal, setTanggal] = useState(pl.tanggal_selesai ?? "");
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await api(`/placement/${pl.id_placement}/status`, { method: "PATCH", body: { status_placement: status, tanggal_selesai: tanggal || null } });
      onBerhasil(res.data, res.message);
    } catch (err) {
      setError(err);
    } finally {
      setKirim(false);
    }
  }

  return (
    <section className="kartu p-space-md space-y-space-sm">
      <h3 className="font-title-sm text-title-sm text-on-surface">Akhiri Penempatan</h3>
      {error && <Pesan>{errorField(error, "tanggal_selesai") ?? errorField(error, "status_placement") ?? error.message}</Pesan>}
      <div className="grid grid-cols-2 gap-1" role="radiogroup" aria-label="Status akhir">
        {[
          ["selesai", "Selesai (kontrak berakhir)"],
          ["dihentikan", "Dihentikan"],
        ].map(([nilai, label]) => (
          <button
            key={nilai}
            type="button"
            role="radio"
            aria-checked={status === nilai}
            onClick={() => setStatus(nilai)}
            className={`min-h-10 px-2 rounded-lg font-label-md text-label-md ${status === nilai ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="block space-y-1">
        <span className="font-label-md text-label-md text-on-surface">Tanggal selesai</span>
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container" />
        <span className="block font-body-sm text-body-sm text-on-surface-variant">Kosongkan untuk memakai tanggal hari ini.</span>
      </label>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Talent akan kembali tersedia di talent pool.</p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={simpan}
          disabled={!status || kirim}
          className="tombol-bahaya"
        >
          {kirim ? "Menyimpan..." : "Akhiri Penempatan"}
        </button>
      </div>
    </section>
  );
}
