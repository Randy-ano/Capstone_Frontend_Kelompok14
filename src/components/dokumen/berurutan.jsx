// Dokumen kerja sama berurutan (R34–R36, revisi 2026-11-06):
// kandidat diterima → Quotation → Purchase Order → PKS (per permintaan) → Kontrak Kerja (per kandidat) → penempatan.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ROLE } from "../../auth/roles";
import { NADA } from "../ui";

export const JENIS_BERURUTAN = ["quotation", "purchase_order", "pks", "kontrak_kerja"];

// Sama dengan KelengkapanDokumenService::PENGUNGGAH di backend (backend tetap yang menegakkan).
export const PENGUNGGAH = {
  quotation: [ROLE.ACCOUNT_MANAGER],
  purchase_order: [ROLE.HR_CLIENT],
  pks: [ROLE.ACCOUNT_MANAGER, ROLE.MANAGER],
  kontrak_kerja: [ROLE.ACCOUNT_MANAGER],
};

export const SYARAT = {
  quotation: "Permintaan yang sudah punya kandidat diterima di evaluasi dan belum punya Quotation.",
  purchase_order: "Permintaan yang Quotation-nya sudah selesai ditandatangani.",
  pks: "Permintaan yang Purchase Order-nya sudah selesai ditandatangani.",
  kontrak_kerja: "Kandidat diterima yang PKS permintaannya sudah selesai ditandatangani.",
};

/** Jenis dokumen yang boleh diunggah role ini: jenis berurutan sesuai hak + Surat Peringatan & Lainnya. */
export const jenisBolehUnggah = (role) => [
  ...JENIS_BERURUTAN.filter((j) => PENGUNGGAH[j].includes(role)),
  ...(role === ROLE.TALENT ? [] : ["surat_peringatan"]),
  "lainnya",
];

/** Pilihan permintaan (Quotation/PO/PKS) atau kandidat diterima (Kontrak Kerja) yang memenuhi urutan. */
export function useTujuan(jenis) {
  const [hasil, setHasil] = useState({ data: null, error: "" });
  useEffect(() => {
    if (!JENIS_BERURUTAN.includes(jenis)) return;
    let batal = false;
    setHasil({ data: null, error: "" });
    api(`/dokumen/tujuan?jenis=${jenis}`)
      .then((res) => !batal && setHasil({ data: res.data, error: "" }))
      .catch((err) => !batal && setHasil({ data: [], error: err.message }));
    return () => {
      batal = true;
    };
  }, [jenis]);
  return hasil;
}

export const labelTujuan = (t) => (t.id_pengajuan ? `${t.nama_lengkap} — ${t.posisi}, ${t.nama_perusahaan}` : `${t.posisi} — ${t.nama_perusahaan}`);

const GAYA_STATUS = {
  belum_ada: { ikon: "radio_button_unchecked", className: NADA.netral },
  menunggu: { ikon: "hourglass_top", className: NADA.menunggu },
  ditolak: { ikon: "cancel", className: NADA.bahaya },
  selesai: { ikon: "check_circle", className: NADA.sukses },
};

/** Satu baris daftar periksa: nama langkah, status (ikon + teks), dan tautan ke dokumennya. */
function BarisPeriksa({ langkah, nomor, judul }) {
  const g = GAYA_STATUS[langkah.status] ?? GAYA_STATUS.belum_ada;
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-space-sm gap-y-1 py-space-xs">
      <span className="flex items-center gap-space-sm min-w-0">
        <span className="w-6 h-6 shrink-0 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm">{nomor}</span>
        <span className="min-w-0">
          <span className="block font-title-sm text-title-sm text-on-surface">{judul ?? langkah.label}</span>
          {langkah.dokumen && (
            <Link to={`/dokumen-quotation-po?dokumen=${langkah.dokumen.id_dokumen}`} className="block font-body-sm text-body-sm text-primary hover:underline break-all">
              {langkah.dokumen.nama_file}
            </Link>
          )}
        </span>
      </span>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${g.className}`}>
        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">{g.ikon}</span>
        {langkah.label_status}
      </span>
    </li>
  );
}

/** Daftar periksa kandidat diterima (GET /pengajuan/{id} → kelengkapan_dokumen). */
export function DaftarPeriksaPengajuan({ kelengkapan }) {
  return (
    <div className="space-y-space-xs">
      <ol className="divide-y divide-surface-container-high">
        {kelengkapan.langkah.map((l, i) => (
          <BarisPeriksa key={l.jenis} langkah={l} nomor={i + 1} />
        ))}
      </ol>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {kelengkapan.selesai
          ? "Semua dokumen selesai ditandatangani. Talent Support dapat membuat penempatan."
          : `Belum selesai: ${kelengkapan.kurang.join(", ")}. Penempatan dapat dibuat setelah semua dokumen selesai ditandatangani.`}
      </p>
    </div>
  );
}

/** Daftar periksa permintaan (GET /job-requirements/{id} → kelengkapan_dokumen): 3 langkah + kontrak per kandidat. */
export function DaftarPeriksaPermintaan({ kelengkapan }) {
  return (
    <div className="space-y-space-sm">
      <ol className="divide-y divide-surface-container-high">
        {kelengkapan.langkah.map((l, i) => (
          <BarisPeriksa key={l.jenis} langkah={l} nomor={i + 1} />
        ))}
      </ol>
      <div>
        <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">4. Kontrak Kerja per kandidat diterima</div>
        <ul className="divide-y divide-surface-container-high">
          {kelengkapan.kontrak_kerja.map((k) => (
            <BarisPeriksa key={k.id_pengajuan} langkah={k} nomor="•" judul={`${k.nama_lengkap}${k.id_placement ? " (sudah ditempatkan)" : ""}`} />
          ))}
        </ul>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Tahap saat ini: {kelengkapan.tahap.label}.</p>
    </div>
  );
}

/** Indikator ringkas untuk tabel Pipeline (GET /progres → tahap_dokumen). */
export function TahapDokumen({ tahap }) {
  if (!tahap) return <span className="text-outline" title="Belum ada kandidat yang diterima di evaluasi">Belum dimulai</span>;
  return (
    <span className="block min-w-0">
      <span className="flex items-center gap-1 text-on-surface">
        <span aria-hidden="true" className={`material-symbols-outlined text-[18px] ${tahap.selesai ? "text-on-tertiary-container" : "text-warning"}`}>
          {tahap.selesai ? "task_alt" : "pending"}
        </span>
        {tahap.label}
      </span>
      <span className="block font-body-sm text-body-sm text-on-surface-variant">
        {tahap.langkah_selesai} dari {tahap.total_langkah} langkah selesai
      </span>
    </span>
  );
}
