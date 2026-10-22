import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { Memuat, Pesan, errorField, formatTanggalWaktu } from "../ui";
import { JENIS_DOKUMEN, ROLE_SINGKAT, STATUS_TTD, StatusDokumenBadge, unduhDokumen } from "./shared";

const tombol = "flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg font-label-lg text-label-lg transition-all disabled:opacity-50";

// Panel samping detail dokumen: unduh, daftar penandatangan, atur penandatangan (R27), tanda tangan (R28).
// `pesan` = pesan sukses aksi terakhir (unggah, buat, atur penandatangan, tanda tangan).
export default function DokumenDrawer({ dokumen: d, pesan, onClose, onBerhasil }) {
  const [unduh, setUnduh] = useState(false);
  const [error, setError] = useState("");
  const jenis = JENIS_DOKUMEN[d.jenis_dokumen] ?? JENIS_DOKUMEN.lainnya;

  useEffect(() => {
    const esc = (ev) => ev.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  async function klikUnduh() {
    setUnduh(true);
    setError("");
    try {
      await unduhDokumen(d);
    } catch (err) {
      setError(err.message);
    } finally {
      setUnduh(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Detail dokumen">
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-surface flex flex-col shadow-xl">
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] shrink-0">
          <h2 className="font-title-md text-title-md text-on-surface">Detail Dokumen</h2>
          <button type="button" onClick={onClose} title="Tutup" className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">
          {pesan && <Pesan jenis="sukses">{pesan}</Pesan>}
          {error && <Pesan>{error}</Pesan>}
          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm">
            <div className="flex items-start gap-space-sm">
              <span className="w-10 h-10 shrink-0 rounded-lg bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">{jenis.ikon}</span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-title-sm text-title-sm text-on-surface break-all">{d.nama_file}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">{jenis.label}</div>
              </div>
              <StatusDokumenBadge status={d.status_dokumen} />
            </div>
            <dl className="grid grid-cols-2 gap-space-sm font-body-sm text-body-sm">
              <Info label="Klien">{d.klien?.nama_perusahaan}</Info>
              <Info label="Talent">{d.talent?.nama_lengkap}</Info>
              <Info label="Diunggah oleh">{d.uploader?.nama}</Info>
              <Info label="Tanggal">{formatTanggalWaktu(d.tanggal_unggah)}</Info>
            </dl>
            <button type="button" onClick={klikUnduh} disabled={unduh} className={`${tombol} w-full bg-surface-container text-primary hover:bg-surface-variant`}>
              <span className="material-symbols-outlined text-[18px]">download</span>
              {unduh ? "Mengunduh..." : "Unduh Dokumen"}
            </button>
          </section>

          <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm">
            <h3 className="flex items-center gap-space-sm font-title-sm text-title-sm text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">draw</span>
              Penandatangan
            </h3>
            {d.penandatangan.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {d.aksi.boleh_atur_penandatangan ? "Belum ada penandatangan. Tentukan siapa yang harus menandatangani dokumen ini." : "Dokumen ini tidak memerlukan tanda tangan."}
              </p>
            ) : (
              <ul className="divide-y divide-surface-container-high">
                {d.penandatangan.map((p) => {
                  const s = STATUS_TTD[p.status_ttd] ?? STATUS_TTD.menunggu;
                  return (
                    <li key={p.id_ttd} className="py-space-sm first:pt-0 last:pb-0 flex items-center justify-between gap-space-sm">
                      <div className="min-w-0">
                        <div className="font-body-md text-body-md text-on-surface">{p.nama}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{ROLE_SINGKAT[p.role] ?? p.role}</div>
                      </div>
                      <div className={`flex flex-col items-end font-body-sm text-body-sm ${s.className}`}>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">{s.ikon}</span>
                          {s.label}
                        </span>
                        {p.tanggal_ttd && <span className="text-on-surface-variant">{formatTanggalWaktu(p.tanggal_ttd)}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {d.aksi.boleh_atur_penandatangan && <AturPenandatangan dokumen={d} onBerhasil={onBerhasil} />}
          </section>

          {d.aksi.perlu_tanda_tangan_saya && <TandaTangan dokumen={d} onBerhasil={onBerhasil} />}
        </div>
      </div>
    </div>
  );
}

function Info({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</dt>
      <dd className="text-on-surface break-words">{children || "-"}</dd>
    </div>
  );
}

// R27: pengunggah memilih penandatangan dari calon yang berhak.
function AturPenandatangan({ dokumen, onBerhasil }) {
  const [calon, setCalon] = useState(null);
  const [dipilih, setDipilih] = useState([]);
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/dokumen/${dokumen.id_dokumen}/calon-penandatangan`)
      .then((res) => setCalon(res.data))
      .catch((err) => setError(err));
  }, [dokumen.id_dokumen]);

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await api(`/dokumen/${dokumen.id_dokumen}/penandatangan`, { method: "POST", body: { id_user: dipilih } });
      onBerhasil(res.data, res.message);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <div className="bg-surface-container-low rounded-lg p-space-sm space-y-space-sm">
      <div className="font-label-md text-label-md text-on-surface">Pilih penandatangan</div>
      {error && <Pesan>{errorField(error, "id_user") ?? error.message}</Pesan>}
      {!calon && !error && <Memuat />}
      <ul className="max-h-60 overflow-y-auto space-y-1">
        {calon?.map((u) => (
          <li key={u.id_user}>
            <label className="flex items-center gap-space-sm px-2 py-1.5 rounded-lg cursor-pointer hover:bg-surface-container">
              <input
                type="checkbox"
                className="accent-primary w-4 h-4"
                checked={dipilih.includes(u.id_user)}
                onChange={() => {
                  setDipilih((l) => (l.includes(u.id_user) ? l.filter((x) => x !== u.id_user) : [...l, u.id_user]));
                  setError(null);
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-body-md text-body-md text-on-surface">{u.nama}</span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">
                  {ROLE_SINGKAT[u.role]} · {u.keterangan}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Setelah dikirim, penandatangan tidak dapat diubah dan dokumen menunggu tanda tangan.</p>
      <div className="flex justify-end">
        <button type="button" onClick={simpan} disabled={kirim} className={`${tombol} bg-primary text-on-primary hover:bg-primary-container shadow-sm`}>
          <span className="material-symbols-outlined text-[18px]">send</span>
          {kirim ? "Mengirim..." : `Minta Tanda Tangan (${dipilih.length})`}
        </button>
      </div>
    </div>
  );
}

// R28: tanda tangan digambar di canvas (atau unggah gambar), lalu dikirim sebagai PNG; atau tolak.
function TandaTangan({ dokumen, onBerhasil }) {
  const canvas = useRef(null);
  const menggambar = useRef(false);
  const [adaGoresan, setAdaGoresan] = useState(false);
  const [gambar, setGambar] = useState(null);
  const [tolak, setTolak] = useState(false);
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const c = canvas.current;
    const rasio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * rasio;
    c.height = c.offsetHeight * rasio;
    const ctx = c.getContext("2d");
    ctx.scale(rasio, rasio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0b1c30";
  }, []);

  const titik = (ev) => {
    const r = canvas.current.getBoundingClientRect();
    return [ev.clientX - r.left, ev.clientY - r.top];
  };
  function mulai(ev) {
    ev.preventDefault();
    canvas.current.setPointerCapture(ev.pointerId);
    menggambar.current = true;
    const ctx = canvas.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(...titik(ev));
  }
  function gerak(ev) {
    if (!menggambar.current) return;
    const ctx = canvas.current.getContext("2d");
    ctx.lineTo(...titik(ev));
    ctx.stroke();
    setAdaGoresan(true);
    setError(null);
  }
  function hapus() {
    const c = canvas.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
    setAdaGoresan(false);
  }

  async function kirimKeputusan(keputusan) {
    const fd = new FormData();
    fd.append("keputusan", keputusan);
    if (keputusan === "ditandatangani") {
      const file = gambar ?? (adaGoresan ? await new Promise((ok) => canvas.current.toBlob((b) => ok(new File([b], "tanda-tangan.png", { type: "image/png" })), "image/png")) : null);
      if (file) fd.append("file_tanda_tangan", file);
    }
    setKirim(true);
    setError(null);
    try {
      const res = await api(`/dokumen/${dokumen.id_dokumen}/tanda-tangan`, { method: "POST", body: fd });
      onBerhasil(res.data, res.message);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm ring-2 ring-primary-container">
      <h3 className="flex items-center gap-space-sm font-title-sm text-title-sm text-on-surface">
        <span className="material-symbols-outlined text-primary text-[20px]">signature</span>
        Tanda Tangan Anda
      </h3>
      {error && <Pesan>{errorField(error, "file_tanda_tangan") ?? errorField(error, "keputusan") ?? error.message}</Pesan>}
      {/* Canvas tetap terpasang (hanya disembunyikan) agar ukuran & skala yang diatur saat mount tidak hilang. */}
      <div className={gambar ? "hidden" : "space-y-space-sm"}>
          <canvas
            ref={canvas}
            onPointerDown={mulai}
            onPointerMove={gerak}
            onPointerUp={() => (menggambar.current = false)}
            onPointerLeave={() => (menggambar.current = false)}
            aria-label="Area tanda tangan"
            className="w-full h-40 rounded-lg bg-surface ring-1 ring-outline-variant touch-none cursor-crosshair"
          />
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Gambar tanda tangan di area di atas.</span>
            <button type="button" onClick={hapus} disabled={!adaGoresan} className="text-primary hover:underline disabled:opacity-40">
              Ulangi
            </button>
          </div>
      </div>
      <label className="block font-body-sm text-body-sm text-on-surface-variant">
        {gambar ? `Gambar dipilih: ${gambar.name}` : "Atau unggah gambar tanda tangan (PNG/JPG, maks 2 MB):"}
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          onChange={(ev) => {
            setGambar(ev.target.files[0] ?? null);
            setError(null);
          }}
          className="block w-full mt-1 file:mr-3 file:h-8 file:px-3 file:rounded-lg file:border-0 file:bg-surface-container file:text-primary file:font-label-md"
        />
      </label>

      {tolak ? (
        <div className="flex flex-wrap items-center justify-end gap-space-sm bg-error-container rounded-lg p-space-sm">
          <span className="font-body-sm text-body-sm text-on-error-container mr-auto">Tolak dokumen ini? Dokumen akan berstatus ditolak.</span>
          <button type="button" onClick={() => setTolak(false)} disabled={kirim} className={`${tombol} h-9 text-on-error-container`}>
            Tidak
          </button>
          <button type="button" onClick={() => kirimKeputusan("ditolak")} disabled={kirim} className={`${tombol} h-9 bg-error text-on-error`}>
            {kirim ? "Memproses..." : "Ya, Tolak"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-space-sm">
          <button type="button" onClick={() => setTolak(true)} disabled={kirim} className={`${tombol} text-error hover:bg-error-container`}>
            Tolak
          </button>
          <button type="button" onClick={() => kirimKeputusan("ditandatangani")} disabled={kirim} className={`${tombol} bg-primary text-on-primary hover:bg-primary-container shadow-sm`}>
            <span className="material-symbols-outlined text-[18px]">draw</span>
            {kirim ? "Menyimpan..." : "Tanda Tangani"}
          </button>
        </div>
      )}
    </section>
  );
}
