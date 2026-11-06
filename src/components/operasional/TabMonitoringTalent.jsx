import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { KeadaanKosong, Memuat, Pesan, PilihFilter } from "../ui";
import { LinimasaMonitoring, RingkasanPenempatan } from "./monitoring";

// FR-15: talent melihat riwayat monitoring kinerja miliknya (read-only; backend hanya mengirim penempatan miliknya).
// Linimasa sama dengan panel Monitoring Kinerja: catatan HR Client/Manager dan Surat Peringatan.
export default function TabMonitoringTalent() {
  const [daftar, setDaftar] = useState(null);
  const [idPlacement, setIdPlacement] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api("/monitoring/talent?per_page=100")
      .then((res) => {
        setDaftar(res.data);
        if (res.data[0]) setIdPlacement(String(res.data[0].id_placement));
      })
      .catch((err) => setError(err.message));
  }, []);

  const p = daftar?.find((x) => String(x.id_placement) === idPlacement);

  return (
    <div className="flex flex-col gap-space-md">
      <div className="kartu p-space-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
        <p className="flex-1 min-w-0 font-body-md text-body-md text-on-surface-variant">
          Catatan kinerja dari HR Client perusahaan tempat Anda bekerja dan dari Manager PT Intellisys IT Outsourcing, termasuk Surat Peringatan bila ada.
        </p>
        {daftar?.length > 1 && (
          <PilihFilter
            ikon="badge"
            label="Penempatan"
            value={idPlacement}
            onChange={(v) => v && setIdPlacement(v)}
            semua="Pilih penempatan"
            opsi={daftar.map((x) => [String(x.id_placement), `${x.posisi_penempatan} (${x.klien.nama_perusahaan})`])}
          />
        )}
      </div>

      {error && <Pesan>{error}</Pesan>}
      {!daftar && !error && <Memuat>Memuat monitoring...</Memuat>}
      {daftar?.length === 0 && (
        <div className="kartu">
          <KeadaanKosong ikon="monitoring">Belum ada penempatan untuk dimonitor.</KeadaanKosong>
        </div>
      )}
      {p && (
        <>
          <RingkasanPenempatan p={p} />
          <section className="kartu p-space-md space-y-space-sm">
            <h3 className="font-title-sm text-title-sm text-on-surface">Linimasa catatan &amp; SP</h3>
            <LinimasaMonitoring idPlacement={p.id_placement} kosong="Belum ada catatan monitoring untuk penempatan Anda." />
          </section>
        </>
      )}
    </div>
  );
}
