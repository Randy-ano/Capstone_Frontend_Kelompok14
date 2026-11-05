import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { INTERNAL, ROLE } from "../auth/roles";
import { KeadaanKosong, KepalaHalaman, KotakCari, Pagination, Pesan, PilihFilter, Skeleton, useTunda } from "../components/ui";
import { KartuTalent, PanelTalent } from "../components/operasional/monitoring";

const KETERANGAN = {
  [ROLE.HR_CLIENT]: "Pantau talent yang ditempatkan di perusahaan Anda dan tambahkan catatan absensi, shift, atau kinerja harian.",
  [ROLE.MANAGER]: "Pantau kinerja setiap talent dari catatan HR Client, tambahkan catatan, dan beri Surat Peringatan bila diperlukan.",
};

const STATUS = [
  ["aktif", "Aktif"],
  ["belum_aktif", "Belum Aktif"],
  ["selesai", "Selesai"],
];

// Halaman Monitoring Kinerja (FR-18, R23, revisi 2026-11-06): grid kartu per talent yang punya penempatan.
// HR Client mencatat, Manager mencatat & memberi SP, AM & TS melihat.
export default function MonitoringKinerja() {
  const { user } = useAuth();
  const internal = INTERNAL.includes(user.role);
  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [status, setStatus] = useState("aktif");
  const [klien, setKlien] = useState("");
  const [opsiKlien, setOpsiKlien] = useState([]);
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");
  const [dipilih, setDipilih] = useState(null);

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    if (!internal) return;
    api("/klien?per_page=100")
      .then((res) => setOpsiKlien(res.data))
      .catch(() => setOpsiKlien([]));
  }, [internal]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: 12 });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (klien) params.set("id_klien", klien);
    setMemuat(true);
    setError("");
    api(`/monitoring/talent?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else {
          setHasil(res);
          // Panel yang terbuka memakai data kartu terbaru (jumlah catatan & SP).
          setDipilih((d) => (d ? res.data.find((p) => p.id_placement === d.id_placement) ?? d : d));
        }
      })
      .catch((err) => !batal && setError(err.message))
      .finally(() => !batal && setMemuat(false));
    return () => {
      batal = true;
    };
  }, [search, status, klien, page, versi]);

  const r = hasil?.meta?.ringkasan;
  const adaFilter = Boolean(search || klien || status !== "aktif");

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="monitoring" kategori="Operasional & HR" judul="Monitoring Kinerja">
        {KETERANGAN[user.role] ?? "Pantau catatan kinerja dan Surat Peringatan setiap talent yang ditempatkan."}
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="kartu p-space-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <KotakCari value={cari} onChange={setCari} placeholder="Cari nama talent atau posisi..." />
          <PilihFilter
            ikon="filter_alt"
            label="Status kontrak"
            value={status}
            onChange={(v) => (setStatus(v), setPage(1))}
            semua="Semua Status"
            opsi={STATUS.map(([v, l]) => [v, r ? `${l} (${r[v]})` : l])}
          />
          {internal && (
            <PilihFilter
              ikon="apartment"
              label="Klien"
              value={klien}
              onChange={(v) => (setKlien(v), setPage(1))}
              semua="Semua Klien"
              opsi={opsiKlien.map((k) => [String(k.id_klien), k.nama_perusahaan])}
            />
          )}
          {adaFilter && (
            <button
              type="button"
              onClick={() => {
                setCari("");
                setStatus("aktif");
                setKlien("");
                setPage(1);
              }}
              className="tombol-teks"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Reset
            </button>
          )}
        </div>

        {error && <Pesan>{error}</Pesan>}

        {!hasil && memuat && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-md" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        )}
        {hasil?.data.length === 0 && (
          <div className="kartu">
            <KeadaanKosong ikon="monitoring">{adaFilter ? "Tidak ada talent yang cocok dengan pencarian atau filter." : "Belum ada talent dengan penempatan aktif."}</KeadaanKosong>
          </div>
        )}
        {hasil?.data.length > 0 && (
          <ul className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-md transition-opacity ${memuat ? "opacity-60" : ""}`} aria-label="Talent dengan penempatan">
            {hasil.data.map((p) => (
              <li key={p.id_placement}>
                <KartuTalent p={p} onOpen={() => setDipilih(p)} />
              </li>
            ))}
          </ul>
        )}
        {hasil && hasil.meta.total > 0 && (
          <div className="kartu overflow-hidden">
            <Pagination meta={hasil.meta} onPage={setPage} satuan="talent" />
          </div>
        )}
      </div>

      {dipilih && <PanelTalent p={dipilih} onClose={() => setDipilih(null)} onChanged={() => setVersi((v) => v + 1)} />}
    </div>
  );
}
