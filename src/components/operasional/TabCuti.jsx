import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { ROLE } from "../../auth/roles";
import { KeadaanKosong, Memuat, Pagination, Pesan, PilihFilter, errorField, formatTanggal, Proses, teksUtuh } from "../ui";
import { useToast } from "../toast";
import {
  CutiBadge,
  Field,
  Modal,
  STATUS_CUTI,
  StatusApproval,
  hitungHariKerja,
  inputClass,
  keIso,
  labelPlacementSaya,
  tombolHalaman,
  tombolUtama,
  usePlacement,
} from "./shared";

// Tab Cuti (FR-14, R21): talent mengajukan & membatalkan; hanya HR Client yang memutuskan.
// Manager, AM, dan TS hanya melihat. Lama cuti dihitung dalam hari kerja (Sabtu & Minggu tidak dihitung).
export default function TabCuti({ user }) {
  const talent = user.role === ROLE.TALENT;
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");
  const toast = useToast();
  const [ajukan, setAjukan] = useState(false);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: 10 });
    if (status) params.set("status", status);
    setError("");
    api(`/cuti?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [status, page, versi]);

  const berhasil = (pesan) => {
    setError("");
    toast.sukses(pesan);
    setVersi((v) => v + 1);
  };

  return (
    <div className="flex flex-col gap-space-md">
      <div className="kartu p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <PilihFilter
          ikon="filter_alt"
          label="Status cuti"
          value={status}
          onChange={(n) => {
            setStatus(n);
            setPage(1);
          }}
          semua="Semua Status"
          opsi={Object.entries(STATUS_CUTI).map(([v, s]) => [v, s.label])}
        />
        {talent && (
          <button type="button" onClick={() => setAjukan(true)} className={tombolHalaman}>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">event_upcoming</span>
            Ajukan Cuti
          </button>
        )}
      </div>

      {error && <Pesan>{error}</Pesan>}
      {!hasil && !error && <Memuat>Memuat pengajuan cuti...</Memuat>}
      {hasil?.data.length === 0 && (
        <div className="kartu">
          <KeadaanKosong ikon="event_busy">
          {status ? "Tidak ada cuti dengan status ini." : talent ? "Anda belum pernah mengajukan cuti." : "Belum ada pengajuan cuti."}
          </KeadaanKosong>
        </div>
      )}

      <ul className="flex flex-col gap-space-sm">
        {hasil?.data.map((c) => (
          <ItemCuti key={c.id_cuti} cuti={c} user={user} onBerhasil={berhasil} onError={setError} />
        ))}
      </ul>
      {hasil && hasil.meta.total > 0 && (
        <div className="kartu">
          <Pagination meta={hasil.meta} onPage={setPage} satuan="pengajuan cuti" />
        </div>
      )}

      {ajukan && (
        <ModalAjukanCuti
          onClose={() => setAjukan(false)}
          onBerhasil={(pesan) => {
            setAjukan(false);
            berhasil(pesan);
          }}
        />
      )}
    </div>
  );
}

function ItemCuti({ cuti: c, user, onBerhasil, onError }) {
  const [konfirmasi, setKonfirmasi] = useState("");
  const [kirim, setKirim] = useState(false);
  const menunggu = c.status_cuti === "menunggu";
  const bolehPutuskan = menunggu && user.role === ROLE.HR_CLIENT;
  const bolehBatal = menunggu && user.role === ROLE.TALENT;

  async function kirimAksi(path, body) {
    setKirim(true);
    try {
      const res = await api(path, { method: "PATCH", body });
      onBerhasil(res.message);
    } catch (err) {
      onError(errorField(err, "keputusan") ?? errorField(err, "status_cuti") ?? err.message);
    } finally {
      setKirim(false);
      setKonfirmasi("");
    }
  }

  return (
    <li className="kartu-item p-space-md flex flex-col lg:flex-row lg:items-center gap-space-sm">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-space-sm">
          <span className="font-title-sm text-title-sm text-on-surface">
            {formatTanggal(c.tanggal_mulai)}
            {c.tanggal_selesai !== c.tanggal_mulai && ` – ${formatTanggal(c.tanggal_selesai)}`}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {c.jumlah_hari_kerja} hari kerja{c.jumlah_hari !== c.jumlah_hari_kerja && ` (${c.jumlah_hari} hari kalender)`}
          </span>
          <CutiBadge status={c.status_cuti} />
        </div>
        {user.role !== ROLE.TALENT ? (
          <div className="font-body-md text-body-md text-on-surface">
            {c.placement.talent.nama_lengkap} <span className="text-on-surface-variant">· {c.placement.posisi_penempatan} · {c.placement.klien.nama_perusahaan}</span>
          </div>
        ) : (
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            {c.placement.posisi_penempatan} · {c.placement.klien.nama_perusahaan}
          </div>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant">{c.alasan_cuti}</p>
        <div className="flex flex-wrap gap-x-space-md gap-y-1">
          <StatusApproval label="HR Client" approval={c.approval_klien} />
        </div>
      </div>

      {(bolehPutuskan || bolehBatal) && (
        <div className="flex flex-wrap items-center gap-1 shrink-0">
          {konfirmasi ? (
            <>
              <span className="font-body-sm text-body-sm text-on-surface-variant mr-1">
                {konfirmasi === "batal" ? "Batalkan cuti ini?" : konfirmasi === "ditolak" ? "Tolak cuti ini?" : "Setujui cuti ini?"}
              </span>
              <button type="button" onClick={() => setKonfirmasi("")} disabled={kirim} className="tombol-kedua">
                Tidak
              </button>
              <button
                type="button"
                disabled={kirim}
                onClick={() =>
                  konfirmasi === "batal" ? kirimAksi(`/cuti/${c.id_cuti}/batal`) : kirimAksi(`/cuti/${c.id_cuti}/approval`, { keputusan: konfirmasi })
                }
                className={konfirmasi === "disetujui" ? "tombol-utama" : "tombol-bahaya"}
              >
                <Proses aktif={kirim}>Ya</Proses>
              </button>
            </>
          ) : bolehPutuskan ? (
            <>
              <button type="button" onClick={() => setKonfirmasi("disetujui")} className={tombolUtama}>
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">check</span>
                Setujui
              </button>
              <button type="button" onClick={() => setKonfirmasi("ditolak")} className="tombol-bahaya-garis">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">close</span>
                Tolak
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setKonfirmasi("batal")} className="tombol-bahaya-garis">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">event_busy</span>
              Batalkan
            </button>
          )}
        </div>
      )}
    </li>
  );
}

// Tanggal ISO + n hari.
const geserHari = (iso, n) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return keIso(d);
};

function ModalAjukanCuti({ onClose, onBerhasil }) {
  const { daftar, error: errorPlacement } = usePlacement("aktif");
  const [form, setForm] = useState({ id_placement: "", tanggal_mulai: "", tanggal_selesai: "", alasan_cuti: "" });
  const [kuota, setKuota] = useState(null);
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const e = (f) => errorField(error, f);
  const set = (f) => (ev) => {
    setForm((x) => ({ ...x, [f]: ev.target.value }));
    setError(null);
  };

  // Talent biasanya hanya punya satu placement aktif: pilih otomatis.
  useEffect(() => {
    if (daftar?.length === 1) setForm((x) => ({ ...x, id_placement: String(daftar[0].id_placement) }));
  }, [daftar]);

  // Kuota dihitung per tahun kalender: ikuti tahun tanggal mulai (default tahun ini).
  const besok = geserHari(keIso(new Date()), 1);
  const tahun = (form.tanggal_mulai || besok).slice(0, 4);
  useEffect(() => {
    let batal = false;
    api(`/cuti/kuota?tahun=${tahun}`)
      .then((res) => !batal && setKuota(res.data))
      .catch(() => !batal && setKuota(null));
    return () => {
      batal = true;
    };
  }, [tahun]);

  // Batas tanggal: paling cepat besok dan di dalam periode penempatan yang dipilih.
  const placement = daftar?.find((p) => String(p.id_placement) === form.id_placement);
  const minMulai = placement && placement.tanggal_mulai > besok ? placement.tanggal_mulai : besok;
  const maks = placement?.tanggal_selesai ?? undefined;
  const lama = hitungHariKerja(form.tanggal_mulai, form.tanggal_selesai);
  const lewatKuota = kuota && form.tanggal_mulai.slice(0, 4) === form.tanggal_selesai.slice(0, 4) && lama > kuota.sisa;

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await api("/cuti", {
        method: "POST",
        body: {
          id_placement: form.id_placement ? Number(form.id_placement) : null,
          tanggal_mulai: form.tanggal_mulai || null,
          tanggal_selesai: form.tanggal_selesai || null,
          alasan_cuti: form.alasan_cuti.trim() || null,
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
      judul="Ajukan Cuti"
      sibuk={kirim}
      onClose={onClose}
      onSubmit={simpan}
      aksi={
        <button type="submit" disabled={kirim || daftar?.length === 0} className="tombol-utama">
          <Proses aktif={kirim}>Kirim Pengajuan</Proses>
        </button>
      }
    >
      {errorPlacement && <Pesan>{errorPlacement}</Pesan>}
      {daftar?.length === 0 && <Pesan>Anda belum memiliki penempatan aktif, sehingga belum dapat mengajukan cuti.</Pesan>}
      {error && <Pesan>{error.message}</Pesan>}
      <div className="rounded-lg bg-surface-container-low px-space-md py-space-sm flex flex-wrap items-center justify-between gap-x-space-md gap-y-1">
        <span className="font-label-md text-label-md text-on-surface">
          Sisa kuota{kuota ? ` ${kuota.tahun}` : ""}: {kuota ? `${kuota.sisa} hari kerja` : "..."}
        </span>
        {kuota && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            dari {kuota.kuota} hari kerja · terpakai {kuota.terpakai}
          </span>
        )}
      </div>
      <Field label="Penempatan" wajib error={e("id_placement")}>
        <select value={form.id_placement} onChange={set("id_placement")} disabled={!daftar} className={inputClass(e("id_placement"))}>
          <option value="">{daftar ? "Pilih penempatan..." : "Memuat..."}</option>
          {daftar?.map((p) => (
            <option key={p.id_placement} value={p.id_placement}>
              {labelPlacementSaya(p)}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Field label="Tanggal mulai" wajib error={e("tanggal_mulai")} keterangan="Paling cepat besok.">
          <input type="date" min={minMulai} max={maks} value={form.tanggal_mulai} onChange={set("tanggal_mulai")} className={inputClass(e("tanggal_mulai"))} />
        </Field>
        <Field label="Tanggal selesai" wajib error={e("tanggal_selesai")}>
          <input
            type="date"
            min={form.tanggal_mulai || minMulai}
            max={maks}
            value={form.tanggal_selesai}
            onChange={set("tanggal_selesai")}
            className={inputClass(e("tanggal_selesai"))}
          />
        </Field>
      </div>
      <p className={`font-label-md text-label-md ${lewatKuota || (form.tanggal_mulai && form.tanggal_selesai && lama === 0) ? "text-error" : "text-on-surface"}`}>
        Lama cuti: {lama} hari kerja
        {form.tanggal_mulai && form.tanggal_selesai && lama === 0 && " — rentang hanya berisi Sabtu/Minggu."}
        {lewatKuota && " — melebihi sisa kuota."}
      </p>
      <Field label="Alasan cuti" wajib error={e("alasan_cuti")}>
        <textarea rows={3} value={form.alasan_cuti} onChange={set("alasan_cuti")} maxLength={2000} className={`${inputClass(e("alasan_cuti"))} h-auto py-2`} />
      </Field>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {teksUtuh("Sabtu dan Minggu tidak dihitung. Cuti diputuskan oleh HR Client perusahaan tempat Anda ditempatkan.")}
      </p>
    </Modal>
  );
}
