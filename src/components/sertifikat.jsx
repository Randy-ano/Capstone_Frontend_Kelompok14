import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Modal } from "./dialog";
import { Pesan, formatTanggal } from "./ui";

// File sertifikat disimpan di disk private backend; dibuka lewat GET /sertifikat/{id}/file (butuh token),
// lalu dipratinjau dari blob: PDF di iframe, gambar di <img>, dengan opsi buka di tab baru.

export const IKON_FILE = { pdf: "picture_as_pdf", gambar: "image" };

// Tombol "Lihat" yang memuat file lalu membuka modal pratinjau.
export function TombolLihatSertifikat({ sertifikat, className = "tombol-teks" }) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setBuka(true)} className={className} aria-label={`Lihat file ${sertifikat.nama_sertifikat}`}>
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">visibility</span>
        Lihat
      </button>
      {buka && <PratinjauSertifikat sertifikat={sertifikat} onClose={() => setBuka(false)} />}
    </>
  );
}

export function PratinjauSertifikat({ sertifikat, onClose }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let dibuat = null;
    let batal = false;
    api(`/sertifikat/${sertifikat.id_sertifikat}/file`, { blob: true })
      .then((blob) => {
        if (batal) return;
        dibuat = URL.createObjectURL(blob);
        setUrl(dibuat);
      })
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
      if (dibuat) URL.revokeObjectURL(dibuat);
    };
  }, [sertifikat.id_sertifikat]);

  const pdf = sertifikat.jenis_file === "pdf";
  return (
    <Modal
      judul={sertifikat.nama_sertifikat}
      label={`Pratinjau sertifikat ${sertifikat.nama_sertifikat}`}
      lebar="sm:max-w-3xl"
      onClose={onClose}
      kaki={
        url && (
          <a href={url} target="_blank" rel="noreferrer" className="tombol-kedua">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">open_in_new</span>
            Buka di tab baru
          </a>
        )
      }
    >
      <p className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant break-all">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{IKON_FILE[sertifikat.jenis_file] ?? "draft"}</span>
        {sertifikat.file_sertifikat}
      </p>
      {error && <Pesan>{error}</Pesan>}
      {!url && !error && (
        <div role="status" className="h-48 flex items-center justify-center gap-space-sm font-body-md text-body-md text-on-surface-variant">
          <span aria-hidden="true" className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
          Memuat file...
        </div>
      )}
      {url &&
        (pdf ? (
          <iframe title={`File ${sertifikat.nama_sertifikat}`} src={url} className="w-full h-[65vh] rounded-lg ring-1 ring-surface-container-high bg-surface-container-lowest" />
        ) : (
          <img src={url} alt={`File ${sertifikat.nama_sertifikat}`} className="w-full max-h-[65vh] object-contain rounded-lg ring-1 ring-surface-container-high bg-surface-container-lowest" />
        ))}
    </Modal>
  );
}

// Nama file + ikon + tombol Lihat; "Belum ada file" jika belum diunggah.
export function FileSertifikat({ sertifikat }) {
  if (!sertifikat.file_sertifikat) {
    return <span className="font-body-sm text-body-sm text-outline">Belum ada file</span>;
  }
  return (
    <span className="flex flex-wrap items-center gap-x-space-sm gap-y-1 min-w-0">
      <span className="flex items-center gap-1 min-w-0 font-body-sm text-body-sm text-on-surface-variant">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-[18px]">{IKON_FILE[sertifikat.jenis_file] ?? "draft"}</span>
        <span className="truncate max-w-[14rem]" title={sertifikat.file_sertifikat}>{sertifikat.file_sertifikat}</span>
      </span>
      <TombolLihatSertifikat sertifikat={sertifikat} />
    </span>
  );
}

// Daftar sertifikat untuk detail talent (Talent Pool, Pengajuan Kandidat, Rekomendasi Kandidat).
export function DaftarSertifikat({ items }) {
  return (
    <ul className="divide-y divide-surface-container-high">
      {items.map((s) => (
        <li key={s.id_sertifikat} className="py-space-sm first:pt-0 last:pb-0 space-y-1">
          <div className="font-title-sm text-title-sm text-on-surface">{s.nama_sertifikat}</div>
          {(s.penerbit || s.tanggal_terbit) && (
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              {[s.penerbit, s.tanggal_terbit && formatTanggal(s.tanggal_terbit)].filter(Boolean).join(" · ")}
            </div>
          )}
          <FileSertifikat sertifikat={s} />
        </li>
      ))}
    </ul>
  );
}
