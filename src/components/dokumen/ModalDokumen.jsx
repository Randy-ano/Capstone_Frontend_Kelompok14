import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { INTERNAL, ROLE } from "../../auth/roles";
import { Pesan, errorField } from "../ui";
import { Field, Modal, inputClass, labelPlacement, usePlacement } from "../operasional/shared";
import { JENIS_DOKUMEN, formatRupiahInput } from "./shared";

const tombolSimpan = "h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm disabled:opacity-50";

// Error lama dihapus saat isian berubah; `message` Error disalin eksplisit.
function useForm(awal) {
  const [form, setForm] = useState(awal);
  const [error, setError] = useState(null);
  const set = (f) => (ev) => {
    setForm((x) => ({ ...x, [f]: ev.target.value }));
    setError(null);
  };
  return { form, setForm, error, setError, set, e: (f) => errorField(error, f) };
}

function useKlien(aktif) {
  const [daftar, setDaftar] = useState(null);
  useEffect(() => {
    if (!aktif) return;
    api("/klien?per_page=100")
      .then((res) => setDaftar(res.data))
      .catch(() => setDaftar([]));
  }, [aktif]);
  return daftar;
}

// R25: unggah file (pdf/doc/docx/png/jpg, maks 5 MB).
export function ModalUnggah({ user, onClose, onBerhasil }) {
  const internal = INTERNAL.includes(user.role);
  const { daftar: placement } = usePlacement("");
  const klien = useKlien(internal);
  const { form, error, setError, set, e } = useForm({ jenis_dokumen: "", id_placement: "", id_klien: "" });
  const [file, setFile] = useState(null);
  const [kirim, setKirim] = useState(false);

  async function simpan() {
    const fd = new FormData();
    if (file) fd.append("file", file);
    fd.append("jenis_dokumen", form.jenis_dokumen);
    if (form.id_placement) fd.append("id_placement", form.id_placement);
    else if (internal && form.id_klien) fd.append("id_klien", form.id_klien);

    setKirim(true);
    setError(null);
    try {
      const res = await api("/dokumen/upload", { method: "POST", body: fd });
      onBerhasil(res.data, res.message);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <Modal judul="Unggah Dokumen" sibuk={kirim} onClose={onClose} onSubmit={simpan} aksi={<button type="submit" disabled={kirim} className={tombolSimpan}>{kirim ? "Mengunggah..." : "Unggah"}</button>}>
      {error && <Pesan>{error.message}</Pesan>}
      {user.role === ROLE.TALENT && (
        <p className="flex items-start gap-space-sm rounded-lg bg-surface-container-low p-space-sm font-body-sm text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-primary">info</span>
          Dokumen yang Anda unggah langsung menunggu tanda tangan Anda sendiri; penandatangan tidak perlu dipilih.
        </p>
      )}
      <Field label="File" wajib error={e("file")} keterangan="PDF, DOC, DOCX, PNG, atau JPG; maksimal 5 MB.">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={(ev) => {
            setFile(ev.target.files[0] ?? null);
            setError(null);
          }}
          className="block w-full font-body-sm text-body-sm text-on-surface-variant file:mr-3 file:h-9 file:px-3 file:rounded-lg file:border-0 file:bg-surface-container file:text-primary file:font-label-md"
        />
      </Field>
      <Field label="Jenis dokumen" wajib error={e("jenis_dokumen")}>
        <select value={form.jenis_dokumen} onChange={set("jenis_dokumen")} className={inputClass(e("jenis_dokumen"))}>
          <option value="">Pilih jenis...</option>
          {Object.entries(JENIS_DOKUMEN)
            .filter(([v]) => v !== "cv")
            .map(([v, j]) => (
              <option key={v} value={v}>
                {j.label}
              </option>
            ))}
        </select>
      </Field>
      <Field label="Terkait penempatan" error={e("id_placement")} keterangan="Opsional. Talent dan klien dokumen diambil dari penempatan ini.">
        <select value={form.id_placement} onChange={set("id_placement")} disabled={!placement} className={inputClass(e("id_placement"))}>
          <option value="">{placement ? "Tidak terkait penempatan" : "Memuat..."}</option>
          {placement?.map((p) => (
            <option key={p.id_placement} value={p.id_placement}>
              {labelPlacement(p)}
            </option>
          ))}
        </select>
      </Field>
      {internal && !form.id_placement && (
        <Field label="Klien" error={e("id_klien")} keterangan="Opsional, untuk dokumen klien seperti quotation, PO, atau PKS.">
          <select value={form.id_klien} onChange={set("id_klien")} disabled={!klien} className={inputClass(e("id_klien"))}>
            <option value="">Tidak terkait klien</option>
            {klien?.map((k) => (
              <option key={k.id_klien} value={k.id_klien}>
                {k.nama_perusahaan}
              </option>
            ))}
          </select>
        </Field>
      )}
    </Modal>
  );
}

const ITEM_KOSONG = { deskripsi: "", jumlah: "1", harga_satuan: "" };

// R26: quotation / purchase order / PKS dari template.
export function ModalGenerate({ onClose, onBerhasil }) {
  const klien = useKlien(true);
  const hari = new Date();
  const hariIni = `${hari.getFullYear()}-${String(hari.getMonth() + 1).padStart(2, "0")}-${String(hari.getDate()).padStart(2, "0")}`;
  const { form, error, setError, set, e } = useForm({
    jenis_dokumen: "quotation",
    id_klien: "",
    nomor_dokumen: "",
    tanggal_dokumen: hariIni,
    berlaku_sampai: "",
    perihal: "",
    ketentuan: "",
    catatan: "",
  });
  const [items, setItems] = useState([{ ...ITEM_KOSONG }]);
  const [kirim, setKirim] = useState(false);
  const pks = form.jenis_dokumen === "pks";
  const total = items.reduce((t, i) => t + (Number(i.jumlah) || 0) * (Number(i.harga_satuan) || 0), 0);

  const ubahItem = (idx, f) => (ev) => {
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, [f]: ev.target.value } : it)));
    setError(null);
  };

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await api("/dokumen/generate", {
        method: "POST",
        body: {
          jenis_dokumen: form.jenis_dokumen,
          id_klien: form.id_klien ? Number(form.id_klien) : null,
          nomor_dokumen: form.nomor_dokumen.trim(),
          tanggal_dokumen: form.tanggal_dokumen || null,
          berlaku_sampai: form.berlaku_sampai || null,
          perihal: form.perihal.trim(),
          items: pks
            ? undefined
            : items.map((i) => ({
                deskripsi: i.deskripsi.trim(),
                jumlah: i.jumlah === "" ? null : Number(i.jumlah),
                harga_satuan: i.harga_satuan === "" ? null : Number(i.harga_satuan),
              })),
          ketentuan: pks ? form.ketentuan.trim() || null : null,
          catatan: form.catatan.trim() || null,
        },
      });
      onBerhasil(res.data, res.message);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <Modal judul="Buat Dokumen dari Template" sibuk={kirim} onClose={onClose} onSubmit={simpan} aksi={<button type="submit" disabled={kirim} className={tombolSimpan}>{kirim ? "Membuat PDF..." : "Buat Dokumen"}</button>}>
      {error && <Pesan>{error.message}</Pesan>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Field label="Jenis" wajib error={e("jenis_dokumen")}>
          <select value={form.jenis_dokumen} onChange={set("jenis_dokumen")} className={inputClass(e("jenis_dokumen"))}>
            {["quotation", "purchase_order", "pks"].map((v) => (
              <option key={v} value={v}>
                {JENIS_DOKUMEN[v].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Klien" wajib error={e("id_klien")}>
          <select value={form.id_klien} onChange={set("id_klien")} disabled={!klien} className={inputClass(e("id_klien"))}>
            <option value="">{klien ? "Pilih klien..." : "Memuat..."}</option>
            {klien?.map((k) => (
              <option key={k.id_klien} value={k.id_klien}>
                {k.nama_perusahaan}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nomor dokumen" wajib error={e("nomor_dokumen")}>
          <input value={form.nomor_dokumen} onChange={set("nomor_dokumen")} maxLength={100} placeholder="Contoh: QUO/2026/10/002" className={inputClass(e("nomor_dokumen"))} />
        </Field>
        <Field label="Perihal" wajib error={e("perihal")}>
          <input value={form.perihal} onChange={set("perihal")} maxLength={255} placeholder="Contoh: Penawaran 2 Backend Developer" className={inputClass(e("perihal"))} />
        </Field>
        <Field label="Tanggal dokumen" wajib error={e("tanggal_dokumen")}>
          <input type="date" value={form.tanggal_dokumen} onChange={set("tanggal_dokumen")} className={inputClass(e("tanggal_dokumen"))} />
        </Field>
        <Field label="Berlaku sampai" error={e("berlaku_sampai")}>
          <input type="date" min={form.tanggal_dokumen} value={form.berlaku_sampai} onChange={set("berlaku_sampai")} className={inputClass(e("berlaku_sampai"))} />
        </Field>
      </div>

      {pks ? (
        <Field label="Ketentuan" wajib error={e("ketentuan")}>
          <textarea rows={6} value={form.ketentuan} onChange={set("ketentuan")} maxLength={10000} placeholder={"1. Masa kerja sama 12 bulan.\n2. ..."} className={`${inputClass(e("ketentuan"))} h-auto py-2`} />
        </Field>
      ) : (
        <fieldset className="space-y-space-sm">
          <legend className="font-label-md text-label-md text-on-surface mb-1">
            Rincian item <span className="text-error">*</span>
          </legend>
          {e("items") && <p className="font-body-sm text-body-sm text-error">{e("items")}</p>}
          {items.map((it, i) => (
            <div key={i} className="rounded-lg ring-1 ring-surface-container-high p-space-sm space-y-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-outline">Item {i + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => setItems((l) => l.filter((_, x) => x !== i))} className="font-label-sm text-label-sm text-error hover:underline">
                    Hapus
                  </button>
                )}
              </div>
              <Field label="Deskripsi" wajib error={e(`items.${i}.deskripsi`)}>
                <input value={it.deskripsi} onChange={ubahItem(i, "deskripsi")} maxLength={255} className={inputClass(e(`items.${i}.deskripsi`))} />
              </Field>
              <div className="grid grid-cols-2 gap-space-sm">
                <Field label="Jumlah" wajib error={e(`items.${i}.jumlah`)}>
                  <input type="number" min={1} value={it.jumlah} onChange={ubahItem(i, "jumlah")} className={inputClass(e(`items.${i}.jumlah`))} />
                </Field>
                <Field label="Harga satuan (Rp)" wajib error={e(`items.${i}.harga_satuan`)}>
                  <input type="number" min={0} value={it.harga_satuan} onChange={ubahItem(i, "harga_satuan")} className={inputClass(e(`items.${i}.harga_satuan`))} />
                </Field>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setItems((l) => [...l, { ...ITEM_KOSONG }])} disabled={items.length >= 30} className="flex items-center gap-1 h-9 px-3 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah item
            </button>
            <span className="font-title-sm text-title-sm text-on-surface">Total {formatRupiahInput(total)}</span>
          </div>
        </fieldset>
      )}

      <Field label="Catatan" error={e("catatan")}>
        <textarea rows={2} value={form.catatan} onChange={set("catatan")} maxLength={5000} placeholder="Contoh: Harga belum termasuk PPN." className={`${inputClass(e("catatan"))} h-auto py-2`} />
      </Field>
    </Modal>
  );
}
