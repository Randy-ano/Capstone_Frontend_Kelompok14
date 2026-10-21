import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { ROLE } from "../../auth/roles";
import { Chip, Pesan, errorField } from "../ui";
import FilterKompetensi from "../talentPool/FilterKompetensi";

const inputClass = (error) =>
  `w-full h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 transition-all ${
    error ? "ring-2 ring-error focus:ring-error" : "focus:ring-primary-container"
  }`;

function Field({ label, wajib, error, children, className = "" }) {
  return (
    <label className={`block space-y-1 ${className}`}>
      <span className="font-label-md text-label-md text-on-surface">
        {label} {wajib && <span className="text-error">*</span>}
      </span>
      {children}
      {error && <span className="block font-body-sm text-body-sm text-error">{error}</span>}
    </label>
  );
}

// "2026-11-20T17:00:00+07:00" → "2026-11-20T17:00" (nilai input datetime-local, jam Asia/Jakarta dari backend).
const keInput = (iso) => (iso ? iso.slice(0, 16) : "");
const keApi = (nilai) => (nilai ? `${nilai.replace("T", " ")}:00` : "");

function awal(job) {
  return {
    id_klien: job?.klien.id_klien ?? "",
    posisi: job?.posisi ?? "",
    jumlah_kebutuhan: job?.jumlah_kebutuhan ?? 1,
    pengalaman_min: job?.pengalaman_min ?? 0,
    sla_deadline: keInput(job?.sla_deadline),
    kualifikasi: job?.kualifikasi ?? "",
    kompetensi: job?.kompetensi.map((k) => k.id_kompetensi) ?? [],
  };
}

// Modal buat (POST /job-requirements) atau ubah (PUT /job-requirements/{id}) job requirement.
export default function FormJob({ job, user, opsiKompetensi, onClose, onSaved }) {
  const ubah = Boolean(job);
  const pilihKlien = !ubah && user.role === ROLE.ACCOUNT_MANAGER;
  const [form, setForm] = useState(() => awal(job));
  const [opsiKlien, setOpsiKlien] = useState([]);
  const [kirim, setKirim] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pilihKlien) return;
    api("/klien?per_page=100")
      .then((res) => setOpsiKlien(res.data))
      .catch((err) => setError(err));
  }, [pilihKlien]);

  const set = (field) => (nilai) => {
    setForm((f) => ({ ...f, [field]: nilai }));
    // `message` pada Error tidak ikut tersalin oleh spread, jadi disalin eksplisit.
    if (error?.errors?.[field]) setError((e) => ({ message: e.message, errors: { ...e.errors, [field]: undefined } }));
  };

  async function simpan(statusReq) {
    const body = {
      posisi: form.posisi.trim(),
      jumlah_kebutuhan: Number(form.jumlah_kebutuhan),
      pengalaman_min: Number(form.pengalaman_min),
      sla_deadline: keApi(form.sla_deadline),
      kualifikasi: form.kualifikasi.trim() || null,
      kompetensi: form.kompetensi,
    };
    if (pilihKlien) body.id_klien = form.id_klien ? Number(form.id_klien) : null;
    if (!ubah) body.status_req = statusReq;

    setKirim(statusReq ?? "ubah");
    setError(null);
    try {
      const res = ubah
        ? await api(`/job-requirements/${job.id_job_req}`, { method: "PUT", body })
        : await api("/job-requirements", { method: "POST", body });
      onSaved(res.data, res.message);
    } catch (err) {
      setError(err);
      setKirim(null);
    }
  }

  const e = (field) => errorField(error, field);
  const namaKompetensi = (id) => opsiKompetensi.find((k) => k.id_kompetensi === id)?.nama_kompetensi ?? `#${id}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={ubah ? "Ubah permintaan" : "Buat permintaan"}>
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={() => !kirim && onClose()} />
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          simpan(ubah ? undefined : "draft");
        }}
        // Escape menutup form saja, tidak ikut menutup drawer di belakangnya.
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            if (!kirim) onClose();
          }
        }}
        className="relative w-full sm:max-w-2xl max-h-[95vh] flex flex-col bg-surface rounded-t-xl sm:rounded-xl shadow-xl"
      >
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 shrink-0 bg-surface-container-lowest rounded-t-xl border-b border-surface-container-high">
          <h2 className="font-title-md text-title-md text-on-surface">{ubah ? "Ubah Permintaan Kebutuhan" : "Buat Permintaan Kebutuhan"}</h2>
          <button type="button" onClick={onClose} disabled={!!kirim} title="Tutup" className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">
          {error && <Pesan>{error.message}</Pesan>}

          {pilihKlien && (
            <Field label="Klien" wajib error={e("id_klien")}>
              <select value={form.id_klien} onChange={(ev) => set("id_klien")(ev.target.value)} className={inputClass(e("id_klien"))}>
                <option value="">Pilih klien...</option>
                {opsiKlien.map((k) => (
                  <option key={k.id_klien} value={k.id_klien}>
                    {k.nama_perusahaan}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {ubah && (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Klien: <strong className="text-on-surface">{job.klien.nama_perusahaan}</strong> (tidak dapat diganti)
            </p>
          )}

          <Field label="Posisi" wajib error={e("posisi")}>
            <input autoFocus value={form.posisi} onChange={(ev) => set("posisi")(ev.target.value)} maxLength={255} placeholder="Contoh: Backend Developer" className={inputClass(e("posisi"))} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <Field label="Jumlah kebutuhan" wajib error={e("jumlah_kebutuhan")}>
              <input type="number" min={1} max={100} value={form.jumlah_kebutuhan} onChange={(ev) => set("jumlah_kebutuhan")(ev.target.value)} className={inputClass(e("jumlah_kebutuhan"))} />
            </Field>
            <Field label="Pengalaman minimal (tahun)" error={e("pengalaman_min")}>
              <input type="number" min={0} max={50} value={form.pengalaman_min} onChange={(ev) => set("pengalaman_min")(ev.target.value)} className={inputClass(e("pengalaman_min"))} />
            </Field>
            <Field label="SLA deadline" wajib error={e("sla_deadline")}>
              <input type="datetime-local" value={form.sla_deadline} onChange={(ev) => set("sla_deadline")(ev.target.value)} className={inputClass(e("sla_deadline"))} />
            </Field>
          </div>

          <div className="space-y-1">
            <span className="block font-label-md text-label-md text-on-surface">
              Kompetensi dibutuhkan <span className="text-error">*</span>
            </span>
            <FilterKompetensi
              opsi={opsiKompetensi}
              nilai={form.kompetensi}
              onChange={set("kompetensi")}
              label={form.kompetensi.length ? `${form.kompetensi.length} kompetensi dipilih` : "Pilih kompetensi"}
              keterangan="Rekomendasi kandidat dihitung dari kecocokan kompetensi ini."
              lebar="penuh"
              error={Boolean(e("kompetensi"))}
            />
            {form.kompetensi.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {form.kompetensi.map((id) => (
                  <Chip key={id}>{namaKompetensi(id)}</Chip>
                ))}
              </div>
            )}
            {(e("kompetensi") || e("kompetensi.0")) && <span className="block font-body-sm text-body-sm text-error">{e("kompetensi") || e("kompetensi.0")}</span>}
          </div>

          <Field label="Kualifikasi" error={e("kualifikasi")}>
            <textarea
              rows={4}
              value={form.kualifikasi}
              onChange={(ev) => set("kualifikasi")(ev.target.value)}
              maxLength={5000}
              placeholder="Deskripsi tugas dan kualifikasi tambahan"
              className={`${inputClass(e("kualifikasi"))} h-auto py-2`}
            />
          </Field>
        </div>

        <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-space-sm px-space-lg py-space-md bg-surface-container-lowest border-t border-surface-container-high rounded-b-xl">
          <button type="button" onClick={onClose} disabled={!!kirim} className="h-10 px-4 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-50">
            Batal
          </button>
          {ubah ? (
            <button type="submit" disabled={!!kirim} className="h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm disabled:opacity-50">
              {kirim ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          ) : (
            <>
              <button type="submit" disabled={!!kirim} className="h-10 px-4 rounded-lg bg-surface-container text-primary hover:bg-surface-variant font-label-lg text-label-lg disabled:opacity-50">
                {kirim === "draft" ? "Menyimpan..." : "Simpan Draft"}
              </button>
              <button
                type="button"
                onClick={() => simpan("diajukan")}
                disabled={!!kirim}
                className="h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm disabled:opacity-50"
              >
                {kirim === "diajukan" ? "Mengajukan..." : "Simpan & Ajukan"}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
