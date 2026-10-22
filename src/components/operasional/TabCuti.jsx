import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { ROLE } from "../../auth/roles";
import { Memuat, Pagination, Pesan, PilihFilter, errorField, formatTanggal } from "../ui";
import { hariIni } from "../rekrutmen/shared";
import { CutiBadge, Field, Modal, STATUS_CUTI, StatusApproval, inputClass, labelPlacement, tombol, tombolHalaman, tombolUtama, usePlacement } from "./shared";

// Tab Cuti (FR-14, R21): talent mengajukan & membatalkan; HR Client dan Manager memberi keputusan masing-masing.
export default function TabCuti({ user }) {
  const talent = user.role === ROLE.TALENT;
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
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
    setSukses(pesan);
    setVersi((v) => v + 1);
  };

  return (
    <div className="flex flex-col gap-space-md">
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
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
          <button type="button" onClick={() => (setSukses(""), setAjukan(true))} className={tombolHalaman}>
            <span className="material-symbols-outlined text-[18px]">event_upcoming</span>
            Ajukan Cuti
          </button>
        )}
      </div>

      {error && <Pesan>{error}</Pesan>}
      {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}
      {!hasil && !error && <Memuat>Memuat pengajuan cuti...</Memuat>}
      {hasil?.data.length === 0 && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-xl text-center font-body-md text-body-md text-on-surface-variant">
          {status ? "Tidak ada cuti dengan status ini." : talent ? "Anda belum pernah mengajukan cuti." : "Belum ada pengajuan cuti."}
        </div>
      )}

      <ul className="flex flex-col gap-space-sm">
        {hasil?.data.map((c) => (
          <ItemCuti key={c.id_cuti} cuti={c} user={user} onBerhasil={berhasil} onError={(m) => (setSukses(""), setError(m))} />
        ))}
      </ul>
      {hasil && hasil.meta.total > 0 && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm">
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
  const sisi = user.role === ROLE.HR_CLIENT ? c.approval_klien : user.role === ROLE.MANAGER ? c.approval_manager : null;
  const bolehPutuskan = menunggu && sisi?.status === "menunggu";
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
    <li className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md flex flex-col lg:flex-row lg:items-center gap-space-sm">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-space-sm">
          <span className="font-title-sm text-title-sm text-on-surface">
            {formatTanggal(c.tanggal_mulai)}
            {c.tanggal_selesai !== c.tanggal_mulai && ` – ${formatTanggal(c.tanggal_selesai)}`}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{c.jumlah_hari} hari</span>
          <CutiBadge status={c.status_cuti} />
        </div>
        {user.role !== ROLE.TALENT && (
          <div className="font-body-md text-body-md text-on-surface">
            {c.placement.talent.nama_lengkap} <span className="text-on-surface-variant">· {c.placement.posisi_penempatan} · {c.placement.klien.nama_perusahaan}</span>
          </div>
        )}
        <p className="font-body-sm text-body-sm text-on-surface-variant">{c.alasan_cuti}</p>
        <div className="flex flex-wrap gap-x-space-md gap-y-1">
          <StatusApproval label="Klien" approval={c.approval_klien} />
          <StatusApproval label="Manager" approval={c.approval_manager} />
        </div>
      </div>

      {(bolehPutuskan || bolehBatal) && (
        <div className="flex flex-wrap items-center gap-1 shrink-0">
          {konfirmasi ? (
            <>
              <span className="font-body-sm text-body-sm text-on-surface-variant mr-1">
                {konfirmasi === "batal" ? "Batalkan cuti ini?" : konfirmasi === "ditolak" ? "Tolak cuti ini?" : "Setujui cuti ini?"}
              </span>
              <button type="button" onClick={() => setKonfirmasi("")} disabled={kirim} className={`${tombol} text-on-surface-variant hover:bg-surface-container`}>
                Tidak
              </button>
              <button
                type="button"
                disabled={kirim}
                onClick={() =>
                  konfirmasi === "batal" ? kirimAksi(`/cuti/${c.id_cuti}/batal`) : kirimAksi(`/cuti/${c.id_cuti}/approval`, { keputusan: konfirmasi })
                }
                className={`${tombol} ${konfirmasi === "disetujui" ? "bg-primary text-on-primary" : "bg-error text-on-error"}`}
              >
                {kirim ? "Memproses..." : "Ya"}
              </button>
            </>
          ) : bolehPutuskan ? (
            <>
              <button type="button" onClick={() => setKonfirmasi("disetujui")} className={tombolUtama}>
                <span className="material-symbols-outlined text-[18px]">check</span>
                Setujui
              </button>
              <button type="button" onClick={() => setKonfirmasi("ditolak")} className={`${tombol} text-error hover:bg-error-container`}>
                <span className="material-symbols-outlined text-[18px]">close</span>
                Tolak
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setKonfirmasi("batal")} className={`${tombol} text-error hover:bg-error-container`}>
              <span className="material-symbols-outlined text-[18px]">event_busy</span>
              Batalkan
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function ModalAjukanCuti({ onClose, onBerhasil }) {
  const { daftar, error: errorPlacement } = usePlacement("aktif");
  const [form, setForm] = useState({ id_placement: "", tanggal_mulai: "", tanggal_selesai: "", alasan_cuti: "" });
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
        <button type="submit" disabled={kirim || daftar?.length === 0} className="h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm disabled:opacity-50">
          {kirim ? "Mengirim..." : "Kirim Pengajuan"}
        </button>
      }
    >
      {errorPlacement && <Pesan>{errorPlacement}</Pesan>}
      {daftar?.length === 0 && <Pesan>Anda belum memiliki penempatan aktif, sehingga belum dapat mengajukan cuti.</Pesan>}
      {error && <Pesan>{error.message}</Pesan>}
      <Field label="Penempatan" wajib error={e("id_placement")}>
        <select value={form.id_placement} onChange={set("id_placement")} disabled={!daftar} className={inputClass(e("id_placement"))}>
          <option value="">{daftar ? "Pilih penempatan..." : "Memuat..."}</option>
          {daftar?.map((p) => (
            <option key={p.id_placement} value={p.id_placement}>
              {labelPlacement(p)}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-space-sm">
        <Field label="Tanggal mulai" wajib error={e("tanggal_mulai")}>
          <input type="date" min={hariIni()} value={form.tanggal_mulai} onChange={set("tanggal_mulai")} className={inputClass(e("tanggal_mulai"))} />
        </Field>
        <Field label="Tanggal selesai" wajib error={e("tanggal_selesai")}>
          <input type="date" min={form.tanggal_mulai || hariIni()} value={form.tanggal_selesai} onChange={set("tanggal_selesai")} className={inputClass(e("tanggal_selesai"))} />
        </Field>
      </div>
      <Field label="Alasan cuti" wajib error={e("alasan_cuti")}>
        <textarea rows={3} value={form.alasan_cuti} onChange={set("alasan_cuti")} maxLength={2000} className={`${inputClass(e("alasan_cuti"))} h-auto py-2`} />
      </Field>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Cuti disetujui setelah HR klien dan Manager PT Intellisys sama-sama menyetujui.</p>
    </Modal>
  );
}
