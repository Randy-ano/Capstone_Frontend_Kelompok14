// Monitoring kinerja per talent (FR-15, FR-18, R23, revisi 2026-11-06).
// HR Client: Tambah Catatan untuk talent di perusahaannya. Manager: Tambah Catatan & Beri SP (wajib dokumen Surat Peringatan).
// AM & TS: lihat saja. Talent: linimasa miliknya (read-only).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../auth/AuthContext";
import { ROLE } from "../../auth/roles";
import { Badge, KeadaanKosong, Memuat, NADA, Pesan, Proses, errorField, formatTanggal, formatTanggalWaktu } from "../ui";
import { Laci } from "../dialog";
import { useToast } from "../toast";
import { Field, Modal, PenempatanBadge, inputClass } from "./shared";

/** Badge "SP 1", "SP 2", … (teks, bukan warna saja). */
export function DaftarSp({ jumlah }) {
  if (!jumlah) return null;
  return (
    <span className="flex flex-wrap gap-1" aria-label={`${jumlah} Surat Peringatan`}>
      {Array.from({ length: jumlah }, (_, i) => (
        <Badge key={i} className={NADA.bahaya}>
          SP {i + 1}
        </Badge>
      ))}
    </span>
  );
}

/** Periode kontrak + sisa hari / hari menuju mulai. */
export function periodeKontrak(p) {
  const periode = `${formatTanggal(p.tanggal_mulai)} – ${p.tanggal_selesai ? formatTanggal(p.tanggal_selesai) : "tanpa tanggal selesai"}`;
  const sisa =
    p.status_tampil === "belum_aktif"
      ? `Mulai ${p.hari_menuju_mulai === 0 ? "hari ini" : `dalam ${p.hari_menuju_mulai} hari`}`
      : p.status_tampil === "selesai"
        ? "Kontrak selesai"
        : p.sisa_hari != null
          ? `Sisa ${p.sisa_hari} hari`
          : "Tanpa batas akhir";
  return { periode, sisa };
}

/** Kartu satu talent/penempatan di grid Monitoring Kinerja. */
export function KartuTalent({ p, onOpen }) {
  const { periode, sisa } = periodeKontrak(p);
  return (
    <button type="button" onClick={onOpen} className="kartu w-full h-full p-space-md text-left flex flex-col gap-space-sm hover:shadow-md hover:ring-primary/40 transition-shadow">
      <span className="flex items-start justify-between gap-space-sm">
        <span className="min-w-0">
          <span className="block font-title-md text-title-md text-on-surface break-words">{p.talent.nama_lengkap}</span>
          <span className="block font-body-sm text-body-sm text-on-surface-variant">
            {p.posisi_penempatan} · {p.klien.nama_perusahaan}
          </span>
        </span>
        <PenempatanBadge placement={p} />
      </span>
      <span className="block font-body-sm text-body-sm text-on-surface-variant">
        {periode}
        <span className="block font-label-md text-label-md text-on-surface">{sisa}</span>
      </span>
      <span className="mt-auto flex flex-wrap items-center gap-x-space-sm gap-y-1 pt-space-xs border-t border-surface-container-high">
        <span className="flex items-center gap-1 font-label-md text-label-md text-on-surface">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-primary">edit_note</span>
          {p.jumlah_catatan} catatan
        </span>
        {p.jumlah_sp > 0 ? <DaftarSp jumlah={p.jumlah_sp} /> : <span className="font-body-sm text-body-sm text-outline">Tanpa SP</span>}
      </span>
    </button>
  );
}

/** Ringkasan penempatan di atas linimasa. */
export function RingkasanPenempatan({ p }) {
  const { periode, sisa } = periodeKontrak(p);
  return (
    <section className="kartu p-space-md space-y-space-sm">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="min-w-0">
          <div className="font-title-md text-title-md text-on-surface">{p.talent.nama_lengkap}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            {p.posisi_penempatan} · {p.klien.nama_perusahaan}
          </div>
        </div>
        <PenempatanBadge placement={p} />
      </div>
      <dl className="grid grid-cols-2 gap-space-sm">
        <div>
          <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Periode kontrak</dt>
          <dd className="font-body-md text-body-md text-on-surface">{periode}</dd>
        </div>
        <div>
          <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Waktu</dt>
          <dd className="font-body-md text-body-md text-on-surface">{sisa}</dd>
        </div>
        <div>
          <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Catatan</dt>
          <dd className="font-body-md text-body-md text-on-surface">{p.jumlah_catatan}</dd>
        </div>
        <div>
          <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Surat Peringatan</dt>
          <dd className="font-body-md text-body-md text-on-surface">{p.jumlah_sp > 0 ? <DaftarSp jumlah={p.jumlah_sp} /> : "Tidak ada"}</dd>
        </div>
      </dl>
    </section>
  );
}

/** Linimasa catatan & SP satu penempatan (terbaru di atas). */
export function LinimasaMonitoring({ idPlacement, versi = 0, kosong = "Belum ada catatan monitoring untuk penempatan ini." }) {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  // Talent membuka dokumen jika menu Dokumen terbuka baginya; role lain selalu punya menu Dokumen.
  const bolehDokumen = user.role !== ROLE.TALENT || user.akses_dokumen;

  useEffect(() => {
    let batal = false;
    setError("");
    api(`/monitoring?id_placement=${idPlacement}&per_page=100`)
      .then((res) => !batal && setItems(res.data))
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [idPlacement, versi]);

  if (error) return <Pesan>{error}</Pesan>;
  if (!items) return <Memuat>Memuat riwayat...</Memuat>;
  if (items.length === 0) return <KeadaanKosong ringkas ikon="monitoring">{kosong}</KeadaanKosong>;

  return (
    <ol className="relative space-y-space-md before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-surface-container-high" aria-label="Riwayat monitoring">
      {items.map((m) => {
        const sp = m.tipe === "sp";
        return (
          <li key={m.id_monitoring} className="relative pl-11">
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center material-symbols-outlined text-[18px] ${
                sp ? "bg-error-container text-on-error-container" : "bg-primary-fixed text-on-primary-fixed-variant"
              }`}
            >
              {sp ? "gavel" : "edit_note"}
            </span>
            <div className={`rounded-xl p-space-sm space-y-1 ${sp ? "ring-2 ring-error/40 bg-error-container/20" : "ring-1 ring-surface-container-high bg-surface-container-lowest"}`}>
              <div className="flex flex-wrap items-center gap-x-space-sm gap-y-1">
                <Badge className={sp ? NADA.bahaya : NADA.netral}>{sp ? `Surat Peringatan · ${m.label_tipe}` : m.label_tipe}</Badge>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{formatTanggalWaktu(m.tanggal_monitoring)}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface whitespace-pre-line break-words">{m.hasil_monitoring}</p>
              {m.catatan_tindak_lanjut && (
                <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line break-words">
                  <span className="font-label-md text-label-md">Tindak lanjut: </span>
                  {m.catatan_tindak_lanjut}
                </p>
              )}
              {m.dokumen && (
                <p className="flex items-center gap-1 font-body-sm text-body-sm">
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-primary">description</span>
                  {bolehDokumen ? (
                    <Link to={`/dokumen-quotation-po?dokumen=${m.dokumen.id_dokumen}`} className="text-primary hover:underline break-all">
                      {m.dokumen.nama_file}
                    </Link>
                  ) : (
                    <span className="break-all">{m.dokumen.nama_file}</span>
                  )}
                </p>
              )}
              <p className="font-body-sm text-body-sm text-outline">
                Dicatat oleh {m.pencatat ? `${m.pencatat.nama} (${m.pencatat.label_role})` : "-"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Form Tambah Catatan (HR Client / Manager) atau Beri SP (Manager). */
export function ModalMonitoring({ p, sp = false, onClose, onBerhasil }) {
  const [form, setForm] = useState({ hasil_monitoring: "", catatan_tindak_lanjut: "", sumber: "pilih", id_dokumen: "" });
  const [file, setFile] = useState(null);
  const [opsiSp, setOpsiSp] = useState(null);
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const e = (f) => errorField(error, f);
  const set = (f) => (ev) => {
    setForm((x) => ({ ...x, [f]: ev.target.value }));
    setError(null);
  };

  useEffect(() => {
    if (!sp) return;
    api(`/dokumen?jenis=surat_peringatan&id_talent=${p.talent.id_talent}&per_page=50`)
      .then((res) => setOpsiSp(res.data.filter((d) => d.status_dokumen !== "ditolak")))
      .catch(() => setOpsiSp([]));
  }, [sp, p.talent.id_talent]);

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      let idDokumen = sp && form.sumber === "pilih" ? form.id_dokumen || null : null;
      if (sp && form.sumber === "unggah") {
        if (!file) throw { errors: { id_dokumen: ["Pilih file Surat Peringatan yang akan diunggah."] }, message: "" };
        const fd = new FormData();
        fd.append("file", file);
        fd.append("jenis_dokumen", "surat_peringatan");
        fd.append("id_placement", p.id_placement);
        idDokumen = (await api("/dokumen/upload", { method: "POST", body: fd })).data.id_dokumen;
        setForm((x) => ({ ...x, sumber: "pilih", id_dokumen: String(idDokumen) }));
      }
      const res = await api("/monitoring", {
        method: "POST",
        body: {
          id_placement: p.id_placement,
          tipe: sp ? "sp" : "catatan",
          id_dokumen: idDokumen ? Number(idDokumen) : null,
          hasil_monitoring: form.hasil_monitoring.trim(),
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
      judul={sp ? "Beri Surat Peringatan" : "Tambah Catatan Monitoring"}
      sibuk={kirim}
      onClose={onClose}
      onSubmit={simpan}
      aksi={
        <button type="submit" disabled={kirim} className={sp ? "tombol-bahaya" : "tombol-utama"}>
          <Proses aktif={kirim} ikon={sp ? "gavel" : "save"}>
            {sp ? "Beri SP" : "Simpan Catatan"}
          </Proses>
        </button>
      }
    >
      <p className="rounded-lg bg-surface-container-low p-space-sm font-body-sm text-body-sm text-on-surface-variant">
        {p.talent.nama_lengkap} · {p.posisi_penempatan}, {p.klien.nama_perusahaan}
      </p>
      {error?.message && !e("hasil_monitoring") && !e("id_dokumen") && <Pesan>{error.message}</Pesan>}
      {sp && (
        <fieldset className="space-y-space-sm">
          <legend className="font-label-md text-label-md text-on-surface mb-1">
            Dokumen Surat Peringatan <span className="text-error">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-surface-container-low" role="radiogroup" aria-label="Sumber dokumen">
            {[
              ["pilih", "Pilih yang ada"],
              ["unggah", "Unggah baru"],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={form.sumber === v}
                onClick={() => setForm((x) => ({ ...x, sumber: v }))}
                className={`min-h-[40px] rounded-md font-label-md text-label-md ${form.sumber === v ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
              >
                {l}
              </button>
            ))}
          </div>
          {form.sumber === "pilih" ? (
            <Field label="Dokumen" error={e("id_dokumen")} keterangan={opsiSp?.length === 0 ? "Belum ada dokumen Surat Peringatan untuk talent ini. Pilih Unggah baru." : "Dokumen berjenis Surat Peringatan milik talent ini."}>
              <select value={form.id_dokumen} onChange={set("id_dokumen")} disabled={!opsiSp || opsiSp.length === 0} className={inputClass(e("id_dokumen"))}>
                <option value="">{!opsiSp ? "Memuat..." : "Pilih dokumen..."}</option>
                {opsiSp?.map((d) => (
                  <option key={d.id_dokumen} value={d.id_dokumen}>
                    {d.nama_file} ({formatTanggal(d.tanggal_unggah)})
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="File Surat Peringatan" error={e("id_dokumen") ?? e("file")} keterangan="PDF, DOC, DOCX, PNG, atau JPG; maks 5 MB. Dokumen tersimpan di menu Dokumen; penandatangan dapat diatur di sana.">
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
          )}
        </fieldset>
      )}
      <Field label={sp ? "Alasan Surat Peringatan" : "Catatan"} wajib error={e("hasil_monitoring")}>
        <textarea
          rows={4}
          value={form.hasil_monitoring}
          onChange={set("hasil_monitoring")}
          maxLength={5000}
          placeholder={sp ? "Contoh: keterlambatan berulang setelah teguran lisan." : "Contoh: absensi lengkap, target harian tercapai."}
          className={`${inputClass(e("hasil_monitoring"))} h-auto py-2`}
        />
      </Field>
      <Field label="Tindak lanjut" error={e("catatan_tindak_lanjut")}>
        <textarea rows={2} value={form.catatan_tindak_lanjut} onChange={set("catatan_tindak_lanjut")} maxLength={5000} className={`${inputClass(e("catatan_tindak_lanjut"))} h-auto py-2`} />
      </Field>
    </Modal>
  );
}

/** Panel riwayat satu talent: ringkasan penempatan, tombol aksi sesuai role, linimasa. */
export function PanelTalent({ p, onClose, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();
  const [modal, setModal] = useState(null); // null | "catatan" | "sp"
  const [versi, setVersi] = useState(0);
  const aktif = p.status_tampil === "aktif";
  const bolehCatat = [ROLE.HR_CLIENT, ROLE.MANAGER].includes(user.role);
  const bolehSp = user.role === ROLE.MANAGER;

  return (
    <Laci judul="Riwayat Monitoring" label="Riwayat monitoring talent" onClose={onClose}>
      <RingkasanPenempatan p={p} />
      {(bolehCatat || bolehSp) &&
        (aktif ? (
          <div className="flex flex-col sm:flex-row gap-space-sm">
            {bolehCatat && (
              <button type="button" onClick={() => setModal("catatan")} className="tombol-utama">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_notes</span>
                Tambah Catatan
              </button>
            )}
            {bolehSp && (
              <button type="button" onClick={() => setModal("sp")} className="tombol-bahaya-garis">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">gavel</span>
                Beri SP
              </button>
            )}
          </div>
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Catatan baru hanya dapat ditambahkan saat penempatan berstatus Aktif.</p>
        ))}
      <section className="space-y-space-sm">
        <h3 className="font-title-sm text-title-sm text-on-surface">Linimasa catatan &amp; SP</h3>
        <LinimasaMonitoring idPlacement={p.id_placement} versi={versi} />
      </section>
      {modal && (
        <ModalMonitoring
          p={p}
          sp={modal === "sp"}
          onClose={() => setModal(null)}
          onBerhasil={(pesan) => {
            setModal(null);
            toast.sukses(pesan);
            setVersi((v) => v + 1);
            onChanged();
          }}
        />
      )}
    </Laci>
  );
}
