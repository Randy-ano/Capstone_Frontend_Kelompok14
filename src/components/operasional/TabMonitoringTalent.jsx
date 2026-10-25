import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { KeadaanKosong, Memuat, Pagination, Pesan, PilihFilter, formatTanggalWaktu } from "../ui";
import { PlacementBadge } from "../rekrutmen/shared";

// FR-15: talent melihat catatan monitoring kinerja tentang dirinya (read-only; backend hanya mengirim placement miliknya).
export default function TabMonitoringTalent() {
  const [placement, setPlacement] = useState([]);
  const [idPlacement, setIdPlacement] = useState("");
  const [page, setPage] = useState(1);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/placement?per_page=100")
      .then((res) => setPlacement(res.data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: 10 });
    if (idPlacement) params.set("id_placement", idPlacement);
    setError("");
    api(`/monitoring?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [idPlacement, page]);

  return (
    <div className="flex flex-col gap-space-md">
      <div className="kartu p-space-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
        <p className="flex-1 min-w-0 font-body-md text-body-md text-on-surface-variant">
          Catatan pemantauan kinerja Anda dari Manager PT Intellisys beserta rencana tindak lanjutnya.
        </p>
        {placement.length > 1 && (
          <PilihFilter
            ikon="badge"
            label="Penempatan"
            value={idPlacement}
            onChange={(v) => {
              setIdPlacement(v);
              setPage(1);
            }}
            semua="Semua Penempatan"
            opsi={placement.map((p) => [String(p.id_placement), `${p.posisi_penempatan} (${p.klien.nama_perusahaan})`])}
          />
        )}
      </div>

      {error && <Pesan>{error}</Pesan>}
      {!hasil && !error && <Memuat>Memuat monitoring...</Memuat>}
      {hasil?.data.length === 0 && (
        <div className="kartu">
          <KeadaanKosong ikon="monitoring">
          Belum ada catatan monitoring untuk penempatan Anda.
          </KeadaanKosong>
        </div>
      )}

      <ol className="flex flex-col gap-space-sm">
        {hasil?.data.map((m) => (
          <li key={m.id_monitoring} className="kartu p-space-md space-y-space-sm">
            <div className="flex flex-wrap items-start justify-between gap-space-sm">
              <div className="min-w-0">
                <div className="font-title-sm text-title-sm text-on-surface">{formatTanggalWaktu(m.tanggal_monitoring)}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  {m.placement.posisi_penempatan} · {m.placement.klien.nama_perusahaan}
                </div>
              </div>
              <PlacementBadge status={m.placement.status_placement} />
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Hasil monitoring</div>
              <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">{m.hasil_monitoring}</p>
            </div>
            <div className="bg-surface-container-low rounded-lg p-space-sm">
              <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Catatan tindak lanjut</div>
              <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-line">{m.catatan_tindak_lanjut || "Tidak ada catatan tindak lanjut."}</p>
            </div>
            {m.manager && <div className="font-body-sm text-body-sm text-on-surface-variant">Dicatat oleh {m.manager.nama_pegawai}</div>}
          </li>
        ))}
      </ol>
      {hasil && hasil.meta.total > 0 && (
        <div className="kartu">
          <Pagination meta={hasil.meta} onPage={setPage} satuan="catatan" />
        </div>
      )}
    </div>
  );
}
