import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE } from "../auth/roles";
import { KepalaHalaman, KotakCari, Memuat, Pagination, Pesan, PilihFilter, errorField, formatTanggalWaktu, useTunda } from "../components/ui";
import { PlacementBadge } from "../components/rekrutmen/shared";
import { Field, Modal, inputClass, labelPlacement, tombolHalaman, usePlacement } from "../components/operasional/shared";

// Halaman Monitoring Kinerja (FR-18, R23): Manager mencatat, AM & Manager melihat.
export default function MonitoringKinerja() {
  const { user } = useAuth();
  const manager = user.role === ROLE.MANAGER;
  const { daftar: placement } = usePlacement("");
  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [idPlacement, setIdPlacement] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [catat, setCatat] = useState(false);

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: 10 });
    if (search) params.set("search", search);
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
  }, [search, idPlacement, page, versi]);

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman
        ikon="monitoring"
        kategori="Operasional & HR"
        judul="Monitoring Kinerja"
        aksi={
          manager && (
            <button type="button" onClick={() => (setSukses(""), setCatat(true))} className={tombolHalaman}>
              <span className="material-symbols-outlined text-[18px]">add_notes</span>
              Catat Monitoring
            </button>
          )
        }
      >
        Catatan pemantauan kinerja talent yang ditempatkan di klien beserta rencana tindak lanjutnya.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <KotakCari value={cari} onChange={setCari} placeholder="Cari nama talent, posisi, atau klien..." />
          {placement && (
            <PilihFilter
              ikon="badge"
              label="Penempatan"
              value={idPlacement}
              onChange={(v) => {
                setIdPlacement(v);
                setPage(1);
              }}
              semua="Semua Penempatan"
              opsi={placement.map((p) => [String(p.id_placement), `${p.talent.nama_lengkap} (${p.klien.nama_perusahaan})`])}
            />
          )}
        </div>

        {error && <Pesan>{error}</Pesan>}
        {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}
        {!hasil && !error && <Memuat>Memuat monitoring...</Memuat>}
        {hasil?.data.length === 0 && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl text-center font-body-md text-body-md text-on-surface-variant">
            {search || idPlacement ? "Tidak ada catatan monitoring yang cocok." : "Belum ada catatan monitoring."}
          </div>
        )}

        <ol className="flex flex-col gap-space-sm">
          {hasil?.data.map((m) => (
            <li key={m.id_monitoring} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm">
              <div className="flex flex-wrap items-start justify-between gap-space-sm">
                <div className="min-w-0">
                  <div className="font-title-sm text-title-sm text-on-surface">{m.placement.talent.nama_lengkap}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    {m.placement.posisi_penempatan} · {m.placement.klien.nama_perusahaan}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <PlacementBadge status={m.placement.status_placement} />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{formatTanggalWaktu(m.tanggal_monitoring)}</span>
                </div>
              </div>
              <div>
                <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Hasil monitoring</div>
                <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">{m.hasil_monitoring}</p>
              </div>
              {m.catatan_tindak_lanjut && (
                <div className="bg-surface-container-low rounded-lg p-space-sm">
                  <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Tindak lanjut</div>
                  <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-line">{m.catatan_tindak_lanjut}</p>
                </div>
              )}
              {m.manager && <div className="font-body-sm text-body-sm text-on-surface-variant">Dicatat oleh {m.manager.nama_pegawai}</div>}
            </li>
          ))}
        </ol>
        {hasil && hasil.meta.total > 0 && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm">
            <Pagination meta={hasil.meta} onPage={setPage} satuan="catatan" />
          </div>
        )}
      </div>

      {catat && (
        <ModalCatat
          placement={placement}
          awal={idPlacement}
          onClose={() => setCatat(false)}
          onBerhasil={(pesan) => {
            setCatat(false);
            setSukses(pesan);
            setVersi((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}

function ModalCatat({ placement, awal, onClose, onBerhasil }) {
  const [form, setForm] = useState({ id_placement: awal, tanggal_monitoring: "", hasil_monitoring: "", catatan_tindak_lanjut: "" });
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const e = (f) => errorField(error, f);
  const set = (f) => (ev) => {
    setForm((x) => ({ ...x, [f]: ev.target.value }));
    setError(null);
  };

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await api("/monitoring", {
        method: "POST",
        body: {
          id_placement: form.id_placement ? Number(form.id_placement) : null,
          tanggal_monitoring: form.tanggal_monitoring ? `${form.tanggal_monitoring.replace("T", " ")}:00` : null,
          hasil_monitoring: form.hasil_monitoring.trim() || null,
          catatan_tindak_lanjut: form.catatan_tindak_lanjut.trim() || null,
        },
      });
      onBerhasil(res.message);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <Modal
      judul="Catat Monitoring"
      sibuk={kirim}
      onClose={onClose}
      onSubmit={simpan}
      aksi={
        <button type="submit" disabled={kirim} className="h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm disabled:opacity-50">
          {kirim ? "Menyimpan..." : "Simpan"}
        </button>
      }
    >
      {error && <Pesan>{error.message}</Pesan>}
      <Field label="Penempatan" wajib error={e("id_placement")}>
        <select value={form.id_placement} onChange={set("id_placement")} disabled={!placement} className={inputClass(e("id_placement"))}>
          <option value="">{placement ? "Pilih talent yang ditempatkan..." : "Memuat..."}</option>
          {placement?.map((p) => (
            <option key={p.id_placement} value={p.id_placement}>
              {labelPlacement(p)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Waktu monitoring" error={e("tanggal_monitoring")} keterangan="Kosongkan untuk memakai waktu sekarang.">
        <input type="datetime-local" value={form.tanggal_monitoring} onChange={set("tanggal_monitoring")} className={inputClass(e("tanggal_monitoring"))} />
      </Field>
      <Field label="Hasil monitoring" wajib error={e("hasil_monitoring")}>
        <textarea rows={4} value={form.hasil_monitoring} onChange={set("hasil_monitoring")} maxLength={5000} className={`${inputClass(e("hasil_monitoring"))} h-auto py-2`} />
      </Field>
      <Field label="Catatan tindak lanjut" error={e("catatan_tindak_lanjut")}>
        <textarea rows={3} value={form.catatan_tindak_lanjut} onChange={set("catatan_tindak_lanjut")} maxLength={5000} className={`${inputClass(e("catatan_tindak_lanjut"))} h-auto py-2`} />
      </Field>
    </Modal>
  );
}
