// Usulan kandidat dari Talent Support ke Account Manager (revisi alur 2026-11-05).
// Backend: POST /screening (usulkan), PATCH /screening/{id}/tidak-diteruskan (AM), POST /pengajuan (teruskan ke klien).
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Badge, NADA, Pesan, Proses, errorField, formatAngka, formatTanggal } from "../ui";
import { Modal } from "../dialog";
import { TERBUKA } from "../jobRequirement/shared";

export const MAKS_CATATAN = 1000;

export const STATUS_USULAN = {
  menunggu_am: { label: "Menunggu Tinjauan AM", className: NADA.menunggu },
  diteruskan: { label: "Diteruskan ke Klien", className: NADA.sukses },
  tidak_diteruskan: { label: "Tidak Diteruskan", className: NADA.bahaya },
};

export function UsulanBadge({ status, label }) {
  const s = STATUS_USULAN[status] ?? { label: label ?? status, className: NADA.netral };
  return <Badge className={s.className}>{label ?? s.label}</Badge>;
}

// Catatan TS untuk AM dan (jika ada) alasan AM tidak meneruskan.
export function CatatanUsulan({ catatan, alasan }) {
  if (!catatan && !alasan) return null;
  return (
    <div className="space-y-0.5 mt-0.5">
      {catatan && (
        <p className="font-body-sm text-body-sm text-on-surface-variant break-words">
          <span className="text-outline">Catatan TS: </span>“{catatan}”
        </p>
      )}
      {alasan && (
        <p className="font-body-sm text-body-sm text-error break-words">
          <span className="font-label-md text-label-md">Alasan tidak diteruskan: </span>
          {alasan}
        </p>
      )}
    </div>
  );
}

export function KolomCatatan({ value, onChange, label, placeholder, wajib = false, error }) {
  return (
    <label className="block space-y-1">
      <span className="font-label-md text-label-md text-on-surface">
        {label}
        {!wajib && <span className="text-outline font-normal"> (opsional)</span>}
      </span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAKS_CATATAN}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className="input py-2"
      />
      <span className="flex justify-between gap-space-sm font-body-sm text-body-sm">
        <span className="text-error">{error}</span>
        <span className="text-outline shrink-0">
          {value.length}/{MAKS_CATATAN}
        </span>
      </span>
    </label>
  );
}

// TS mengusulkan talent ke AM. `job` tetap (dari Rekomendasi) atau dipilih dari permintaan diajukan/diproses (dari Talent Pool).
// `sudahDiusulkan` = id_job_req yang sudah pernah diusulkan untuk talent ini (disembunyikan dari pilihan).
export function ModalUsulkan({ talent, job, skor, sudahDiusulkan = [], onClose, onBerhasil }) {
  const [opsiJob, setOpsiJob] = useState(null);
  const [idJob, setIdJob] = useState(job ? String(job.id_job_req) : "");
  const [catatan, setCatatan] = useState("");
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (job) return;
    api("/job-requirements?per_page=100")
      .then((res) => setOpsiJob(res.data.filter((j) => TERBUKA.includes(j.status_req) && !sudahDiusulkan.includes(j.id_job_req))))
      .catch((err) => setError(err));
    // Daftar job cukup dimuat sekali saat modal dibuka.
  }, []);

  async function simpan() {
    if (!idJob) {
      setError({ errors: { id_job_req: ["Pilih permintaan kebutuhan tujuan."] } });
      return;
    }
    setKirim(true);
    setError(null);
    try {
      const res = await api("/screening", {
        method: "POST",
        body: { id_job_req: Number(idJob), id_talent: talent.id_talent, catatan_screening: catatan.trim() || null },
      });
      onBerhasil(res);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  const pesanUmum = error && !errorField(error, "id_job_req") && !errorField(error, "catatan_screening") ? errorField(error, "id_talent") ?? error.message : null;

  return (
    <Modal
      judul="Usulkan ke Account Manager"
      label="Usulkan kandidat ke Account Manager"
      sibuk={kirim}
      onClose={onClose}
      onSubmit={simpan}
      kaki={
        <>
          <button type="button" onClick={onClose} disabled={kirim} className="tombol-kedua">
            Batal
          </button>
          <button type="submit" disabled={kirim || (!job && !opsiJob)} className="tombol-utama">
            <Proses aktif={kirim} ikon="forward_to_inbox">
              Usulkan ke AM
            </Proses>
          </button>
        </>
      }
    >
      <div className="rounded-lg bg-surface-container-low p-space-sm">
        <div className="font-title-sm text-title-sm text-on-surface">{talent.nama_lengkap}</div>
        {job && (
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            {job.posisi} · {job.klien?.nama_perusahaan}
            {skor != null && ` · Skor kecocokan ${formatAngka(skor, 2)}`}
          </div>
        )}
      </div>

      {pesanUmum && <Pesan>{pesanUmum}</Pesan>}

      {!job && (
        <label className="block space-y-1">
          <span className="font-label-md text-label-md text-on-surface">Permintaan kebutuhan tujuan</span>
          <select value={idJob} onChange={(e) => setIdJob(e.target.value)} disabled={!opsiJob} className="input" aria-invalid={errorField(error, "id_job_req") ? true : undefined}>
            <option value="">{opsiJob ? "Pilih permintaan yang diajukan / diproses..." : "Memuat permintaan..."}</option>
            {opsiJob?.map((j) => (
              <option key={j.id_job_req} value={j.id_job_req}>
                {j.posisi} — {j.klien.nama_perusahaan} (SLA {formatTanggal(j.sla_deadline)})
              </option>
            ))}
          </select>
          {errorField(error, "id_job_req") && <span className="block font-body-sm text-body-sm text-error">{errorField(error, "id_job_req")}</span>}
          {opsiJob?.length === 0 && (
            <span className="block font-body-sm text-body-sm text-on-surface-variant">Tidak ada permintaan berstatus diajukan/diproses yang belum diusulkan untuk talent ini.</span>
          )}
        </label>
      )}

      <KolomCatatan
        label="Catatan untuk AM"
        value={catatan}
        onChange={setCatatan}
        placeholder="Mis. lulusan kampus yang diminta klien, latar belakang relevan, hal yang perlu dicek AM."
        error={errorField(error, "catatan_screening")}
      />
      <p className="flex items-start gap-1 font-body-sm text-body-sm text-on-surface-variant">
        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">info</span>
        Skor kecocokan dihitung otomatis dan ikut dikirim sebagai informasi. Talent di luar rekomendasi tetap boleh diusulkan; AM yang meninjau
        sebelum meneruskan ke klien.
      </p>
    </Modal>
  );
}

// AM tidak meneruskan usulan ke klien, dengan alasan wajib.
export function ModalTidakDiteruskan({ usulan, onClose, onBerhasil }) {
  const [alasan, setAlasan] = useState("");
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);

  async function simpan() {
    if (!alasan.trim()) {
      setError({ errors: { alasan: ["Alasan tidak diteruskan wajib diisi."] } });
      return;
    }
    setKirim(true);
    setError(null);
    try {
      const res = await api(`/screening/${usulan.id_screening}/tidak-diteruskan`, { method: "PATCH", body: { alasan: alasan.trim() } });
      onBerhasil(res);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <Modal
      judul="Tidak Diteruskan ke Klien"
      label="Tidak teruskan usulan"
      sibuk={kirim}
      onClose={onClose}
      onSubmit={simpan}
      kaki={
        <>
          <button type="button" onClick={onClose} disabled={kirim} className="tombol-kedua">
            Batal
          </button>
          <button type="submit" disabled={kirim} className="tombol-bahaya">
            <Proses aktif={kirim} ikon="block">
              Tidak Diteruskan
            </Proses>
          </button>
        </>
      }
    >
      <div className="rounded-lg bg-surface-container-low p-space-sm">
        <div className="font-title-sm text-title-sm text-on-surface">{usulan.talent.nama_lengkap}</div>
        <div className="font-body-sm text-body-sm text-on-surface-variant">
          {usulan.job_requirement.posisi} · {usulan.job_requirement.klien.nama_perusahaan}
        </div>
        <CatatanUsulan catatan={usulan.catatan_screening} />
      </div>
      {error && !errorField(error, "alasan") && <Pesan>{error.message}</Pesan>}
      <KolomCatatan
        label="Alasan tidak diteruskan"
        wajib
        value={alasan}
        onChange={setAlasan}
        placeholder="Mis. klien mensyaratkan lulusan S1 Informatika."
        error={errorField(error, "alasan")}
      />
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Usulan tercatat sebagai tidak diteruskan dan Talent Support pengusul menerima notifikasi. Talent kembali tersedia di talent pool dan tetap
        bisa diusulkan untuk permintaan lain.
      </p>
    </Modal>
  );
}
