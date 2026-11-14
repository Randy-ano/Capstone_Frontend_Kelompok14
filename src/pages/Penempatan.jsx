import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { INTERNAL, ROLE } from "../auth/roles";
import { BarisKosong, BarisMemuat, KepalaHalaman, KotakCari, Memuat, Pagination, Pesan, PilihFilter, Sel, TabelKartu, errorField, formatTanggal, useTunda, Proses } from "../components/ui";
import { PlacementBadge, STATUS_PLACEMENT, bolehAkhiriPlacement, hariIni } from "../components/rekrutmen/shared";
import { useToast } from "../components/toast";
import { Laci } from "../components/dialog";
import TabMonitoringTalent from "../components/operasional/TabMonitoringTalent";
import { PenempatanBadge } from "../components/operasional/shared";
import { JENIS_DOKUMEN, StatusDokumenBadge } from "../components/dokumen/shared";

const PER_PAGE = 10;

const TAB_TALENT = [
  { key: "penempatan", label: "Penempatan", ikon: "assignment_ind" },
  { key: "monitoring", label: "Monitoring", ikon: "monitoring" },
];

// Halaman Penugasan Penempatan (FR-17): placement sesuai scope; TS/Manager mengakhiri placement (R20).
// Talent ("Penempatan Saya") juga punya tab Monitoring berisi catatan kinerja tentang dirinya (FR-15).
// Untuk talent: tanpa kolom nama (akunnya sendiri) dan status memakai status tampil backend
// (Belum Aktif / Aktif / Selesai). Role lain tetap seperti sebelumnya.
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
      ? "Penempatan Anda di klien PT Intellisys IT Outsourcing dan catatan monitoring kinerja Anda."
      : user.role === ROLE.HR_CLIENT
        ? "Talent PT Intellisys IT Outsourcing yang ditempatkan di perusahaan Anda."
        : "Talent yang sudah ditempatkan di klien. Penempatan dibuat dari evaluasi yang diterima di halaman Pengajuan Kandidat.";

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
                className={`min-h-[40px] px-4 sm:px-5 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 transition-all ${
                  tab === t.key ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{t.ikon}</span>
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
              <KotakCari value={cari} onChange={setCari} placeholder={talent ? "Cari posisi atau klien..." : "Cari nama talent, posisi, atau klien..."} />
              {/* Talent: status tampil (Belum Aktif/Aktif/Selesai) tidak sama dengan nilai filter status_placement, jadi filter disembunyikan. */}
              {!talent && <PilihFilter
                ikon="filter_alt"
                label="Status penempatan"
                value={status}
                onChange={(n) => {
                  setStatus(n);
                  setPage(1);
                }}
                semua="Semua Status"
                opsi={Object.entries(STATUS_PLACEMENT).map(([v, s]) => [v, s.label])}
              />}
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
              <TabelKartu
                kolom={talent ? ["Posisi", "Klien", "Periode", "Status"] : ["Talent", "Posisi", "Klien", "Periode", "Status"]}
                className={talent ? "md:min-w-[640px]" : "md:min-w-[780px]"}
                redup={memuat && hasil}
              >
                {!hasil && memuat && <BarisMemuat kolom={talent ? 4 : 5} />}
                {hasil?.data.length === 0 && (
                  <BarisKosong kolom={talent ? 4 : 5} ikon="assignment_ind">
                    {adaFilter ? "Tidak ada penempatan yang cocok dengan pencarian atau filter." : "Belum ada penempatan."}
                  </BarisKosong>
                )}
                {hasil?.data.map((pl) => (
                  <tr key={pl.id_placement} onClick={() => buka(pl.id_placement)} className="hover:bg-surface-container-low cursor-pointer transition-colors align-top">
                    <Sel peran="judul">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          buka(pl.id_placement);
                        }}
                        className="text-left group max-w-full"
                      >
                        <span className="block font-title-sm text-title-sm text-on-surface group-hover:text-primary">
                          {talent ? pl.posisi_penempatan : pl.talent.nama_lengkap}
                        </span>
                        {!talent && <span className="block font-body-sm text-body-sm text-on-surface-variant break-all">{pl.talent.email}</span>}
                      </button>
                    </Sel>
                    {!talent && <Sel peran="setengah" label="Posisi" className="text-on-surface">{pl.posisi_penempatan}</Sel>}
                    <Sel peran="setengah" label="Klien" className="text-on-surface-variant">{pl.klien.nama_perusahaan}</Sel>
                    <Sel label="Periode" className="whitespace-nowrap text-on-surface-variant">
                      {formatTanggal(pl.tanggal_mulai)} – {pl.tanggal_selesai ? formatTanggal(pl.tanggal_selesai) : "sekarang"}
                    </Sel>
                    <Sel peran="status">
                      {talent ? <PenempatanBadge placement={pl} /> : <PlacementBadge status={pl.status_placement} />}
                    </Sel>
                  </tr>
                ))}
              </TabelKartu>
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
  const toast = useToast();

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

  const ringkasan = pl?.ringkasan && [
    ["Cuti", pl.ringkasan.jumlah_cuti],
    ["Shift", pl.ringkasan.jumlah_shift],
    ["Monitoring", pl.ringkasan.jumlah_monitoring],
    ["Keluhan", pl.ringkasan.jumlah_laporan_keluhan],
  ];

  return (
    <Laci judul="Detail Penempatan" label="Detail penempatan" lebar="max-w-lg" onClose={onClose}>
      {error && <Pesan>{error}</Pesan>}
      {!error && !pl && <Memuat>Memuat detail...</Memuat>}
      {pl && (
        <>
          <section className="kartu p-space-md space-y-space-sm">
            <div className="flex items-start justify-between gap-space-sm">
              {user.role === ROLE.TALENT ? (
                <>
                  <div className="min-w-0">
                    <div className="font-title-md text-title-md text-on-surface">{pl.posisi_penempatan}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">{pl.klien.nama_perusahaan}</div>
                  </div>
                  <PenempatanBadge placement={pl} />
                </>
              ) : (
                <>
                  <div className="min-w-0">
                    <div className="font-title-md text-title-md text-on-surface">{pl.talent.nama_lengkap}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">{pl.talent.email}</div>
                  </div>
                  <PlacementBadge status={pl.status_placement} />
                </>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-space-md gap-y-space-sm">
              {[
                ["Posisi", pl.posisi_penempatan],
                ["Klien", pl.klien.nama_perusahaan],
                ["Mulai", formatTanggal(pl.tanggal_mulai)],
                ["Selesai", pl.tanggal_selesai ? formatTanggal(pl.tanggal_selesai) : "Belum ditentukan"],
                ...(pl.alasan_penghentian ? [["Alasan penghentian", pl.alasan_penghentian]] : []),
              ].map(([label, isi]) => (
                <div key={label} className={`min-w-0 ${label === "Alasan penghentian" ? "col-span-2" : ""}`}>
                  <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</dt>
                  <dd className="font-body-md text-body-md text-on-surface break-words whitespace-pre-line">{isi}</dd>
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
          {pl.dokumen && <HistoriDokumen items={pl.dokumen} />}
          {bolehAkhiriPlacement(user) && pl.status_placement === "aktif" && (
            <AkhiriPlacement
              pl={pl}
              onBerhasil={(data, pesan) => {
                setPl(data);
                toast.sukses(pesan);
                onChanged();
              }}
            />
          )}
        </>
      )}
    </Laci>
  );
}

// R20: akhiri placement aktif → talent kembali tersedia di talent pool.
const MAKS_ALASAN = 1000;

// Histori dokumen penempatan (GET /placement/{id} → dokumen[]): kontrak kerja, SP, surat akhir penempatan, dll.
// Backend hanya mengirim dokumen yang boleh dilihat user; tautan membuka detailnya di menu Dokumen.
function HistoriDokumen({ items }) {
  return (
    <section className="kartu p-space-md space-y-space-sm">
      <h3 className="font-title-sm text-title-sm text-on-surface">Histori Dokumen</h3>
      {items.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ada dokumen untuk penempatan ini.</p>
      ) : (
        <ul className="divide-y divide-surface-container-high">
          {items.map((d) => {
            const j = JENIS_DOKUMEN[d.jenis_dokumen] ?? JENIS_DOKUMEN.lainnya;
            return (
              <li key={d.id_dokumen} className="py-space-sm first:pt-0 last:pb-0 flex items-start gap-space-sm">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px] mt-0.5">{j.ikon}</span>
                <div className="min-w-0 flex-1">
                  <Link to={`/dokumen-quotation-po?dokumen=${d.id_dokumen}`} className="block font-title-sm text-title-sm text-on-surface hover:text-primary hover:underline">
                    {d.label_jenis}
                  </Link>
                  <div className="font-body-sm text-body-sm text-on-surface-variant break-all">{d.nama_file}</div>
                  <div className="font-body-sm text-body-sm text-outline">{formatTanggal(d.tanggal_unggah)}</div>
                </div>
                <div className="shrink-0">
                  <StatusDokumenBadge status={d.status_dokumen} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// R20 + R37: akhiri placement aktif → talent kembali tersedia; sistem membuat surat akhir penempatan untuk ditandatangani Manager.
function AkhiriPlacement({ pl, onBerhasil }) {
  const [status, setStatus] = useState("");
  const [tanggal, setTanggal] = useState(pl.tanggal_selesai ?? "");
  const [alasan, setAlasan] = useState("");
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const dihentikan = status === "dihentikan";
  const kontrak = pl.tanggal_selesai ?? "";

  // Dihentikan berlaku hari ini (bukan tanggal akhir kontrak); Selesai memakai tanggal akhir kontrak. Tanggal yang sudah diubah pengguna tidak ditimpa.
  function pilihStatus(nilai) {
    setStatus(nilai);
    if (nilai === "dihentikan" && tanggal === kontrak) setTanggal(hariIni());
    if (nilai === "selesai" && tanggal === hariIni() && kontrak) setTanggal(kontrak);
  }

  async function simpan() {
    if (dihentikan && !alasan.trim()) {
      setError({ errors: { alasan_penghentian: ["Alasan penghentian wajib diisi bila penempatan dihentikan."] } });
      return;
    }
    setKirim(true);
    setError(null);
    try {
      const body = { status_placement: status, tanggal_selesai: tanggal || null, ...(dihentikan ? { alasan_penghentian: alasan.trim() } : {}) };
      const res = await api(`/placement/${pl.id_placement}/status`, { method: "PATCH", body });
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
      {error && !errorField(error, "alasan_penghentian") && <Pesan>{errorField(error, "tanggal_selesai") ?? errorField(error, "status_placement") ?? error.message}</Pesan>}
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
            onClick={() => pilihStatus(nilai)}
            className={`min-h-10 px-2 rounded-lg font-label-md text-label-md ${status === nilai ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="block space-y-1">
        <span className="font-label-md text-label-md text-on-surface">Tanggal selesai</span>
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container" />
        <span className="block font-body-sm text-body-sm text-on-surface-variant">
          {dihentikan ? "Tanggal penghentian; tercetak di surat sebagai tanggal berakhir." : "Kosongkan untuk memakai tanggal selesai kontrak (atau hari ini)."}
        </span>
      </label>
      {dihentikan && (
        <label className="block space-y-1">
          <span className="font-label-md text-label-md text-on-surface">
            Alasan penghentian <span className="text-error">*</span>
          </span>
          <textarea
            rows={3}
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            maxLength={MAKS_ALASAN}
            placeholder="Mis. klien mengakhiri proyek lebih awal."
            aria-invalid={errorField(error, "alasan_penghentian") ? true : undefined}
            className="input py-2"
          />
          <span className="flex justify-between gap-space-sm font-body-sm text-body-sm">
            <span className="text-error">{errorField(error, "alasan_penghentian")}</span>
            <span className="text-outline shrink-0">
              {alasan.length}/{MAKS_ALASAN}
            </span>
          </span>
        </label>
      )}
      <p className="flex items-start gap-1 font-body-sm text-body-sm text-on-surface-variant">
        <span aria-hidden="true" className="material-symbols-outlined text-[16px] mt-0.5">info</span>
        <span>
          Talent kembali tersedia di talent pool. Sistem membuat{" "}
          {status ? <strong>{dihentikan ? "Surat Pemberhentian Penempatan" : "Surat Keterangan Selesai Penempatan"}</strong> : "surat akhir penempatan"} untuk
          ditandatangani Manager dan mengirim notifikasi ke talent.
        </span>
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={simpan}
          disabled={!status || kirim}
          className="tombol-bahaya"
        >
          <Proses aktif={kirim}>Akhiri Penempatan</Proses>
        </button>
      </div>
    </section>
  );
}
