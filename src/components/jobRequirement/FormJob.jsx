import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { ROLE } from "../../auth/roles";
import { Chip, Pesan, errorField } from "../ui";
import FilterKompetensi, { kunciKompetensi } from "../talentPool/FilterKompetensi";

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

// Kompetensi baru (belum ada di master) dengan label "baru" dan tombol hapus.
function ChipBaru({ children, onHapus, disabled }) {
  return (
    <span className="inline-flex items-center gap-1 max-w-full pl-2 pr-0.5 py-0.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md">
      <span className="truncate">{children}</span>
      <span className="px-1 rounded bg-surface-container-lowest/70 font-label-sm text-label-sm">baru</span>
      <button type="button" onClick={onHapus} disabled={disabled} title={`Hapus ${children}`} className="p-0.5 rounded hover:bg-surface-container-lowest/70 disabled:opacity-50">
        <span className="material-symbols-outlined text-[16px] leading-none">close</span>
      </button>
    </span>
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
    // R33: nama kompetensi yang belum ada di master; dibuat backend saat job disimpan.
    kompetensi_baru: [],
  };
}

// Kompetensi baru yang dibuat saat job disimpan (R33) ditambahkan ke opsi master tanpa memuat ulang, urut nama.
export const tambahOpsiKompetensi = (opsi, kompetensi) => {
  const baru = kompetensi.filter((k) => !opsi.some((o) => o.id_kompetensi === k.id_kompetensi));
  return baru.length ? [...opsi, ...baru].sort((a, b) => a.nama_kompetensi.localeCompare(b.nama_kompetensi, "id")) : opsi;
};

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
      kompetensi_baru: form.kompetensi_baru,
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
  const jumlahKompetensi = form.kompetensi.length + form.kompetensi_baru.length;
  // Error pertama untuk kompetensi, kompetensi.N, kompetensi_baru, atau kompetensi_baru.N.
  const errorKompetensi = Object.entries(error?.errors ?? {}).find(([field, pesan]) => /^kompetensi(_baru)?(\.\d+)?$/.test(field) && pesan)?.[1][0];

  const hapusErrorKompetensi = () =>
    setError((err) =>
      err?.errors ? { message: err.message, errors: Object.fromEntries(Object.entries(err.errors).filter(([field]) => !field.startsWith("kompetensi"))) } : err,
    );

  function pilihKompetensi(ids) {
    setForm((f) => ({ ...f, kompetensi: ids }));
    hapusErrorKompetensi();
  }

  // Teks yang sama dengan kompetensi master (setelah normalisasi) dipilih dari master; yang sudah ditambahkan tidak dobel.
  function tambahKompetensiBaru(teks) {
    const kunci = kunciKompetensi(teks);
    const master = opsiKompetensi.find((k) => kunciKompetensi(k.nama_kompetensi) === kunci);
    setForm((f) => {
      if (master) return f.kompetensi.includes(master.id_kompetensi) ? f : { ...f, kompetensi: [...f.kompetensi, master.id_kompetensi] };
      if (f.kompetensi_baru.some((nama) => kunciKompetensi(nama) === kunci)) return f;
      return { ...f, kompetensi_baru: [...f.kompetensi_baru, teks] };
    });
    hapusErrorKompetensi();
  }

  function hapusKompetensiBaru(nama) {
    setForm((f) => ({ ...f, kompetensi_baru: f.kompetensi_baru.filter((n) => n !== nama) }));
    hapusErrorKompetensi();
  }

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
              onChange={pilihKompetensi}
              onTambah={tambahKompetensiBaru}
              label={jumlahKompetensi ? `${jumlahKompetensi} kompetensi dipilih` : "Pilih kompetensi"}
              keterangan="Rekomendasi kandidat dihitung dari kecocokan kompetensi ini. Belum ada di daftar? Ketik namanya untuk menambah kompetensi baru."
              lebar="penuh"
              error={Boolean(errorKompetensi)}
            />
            {jumlahKompetensi > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {form.kompetensi.map((id) => (
                  <Chip key={id}>{namaKompetensi(id)}</Chip>
                ))}
                {form.kompetensi_baru.map((nama) => (
                  <ChipBaru key={nama} onHapus={() => hapusKompetensiBaru(nama)} disabled={!!kirim}>
                    {nama}
                  </ChipBaru>
                ))}
              </div>
            )}
            {errorKompetensi && <span className="block font-body-sm text-body-sm text-error">{errorKompetensi}</span>}
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
