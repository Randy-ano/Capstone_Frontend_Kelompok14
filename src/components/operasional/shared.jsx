// Komponen & label bersama halaman operasional (cuti, shift, monitoring, keluhan; FR-14, 15, 18, 19).
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Badge } from "../ui";

export const STATUS_CUTI = {
  menunggu: { label: "Menunggu", className: "bg-secondary-container text-on-secondary-fixed" },
  disetujui: { label: "Disetujui", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  ditolak: { label: "Ditolak", className: "bg-error-container text-on-error-container" },
  dibatalkan: { label: "Dibatalkan", className: "bg-surface-container-high text-on-surface-variant" },
};

export const STATUS_APPROVAL = {
  menunggu: { label: "Menunggu", ikon: "hourglass_top", className: "text-on-surface-variant" },
  disetujui: { label: "Disetujui", ikon: "check_circle", className: "text-on-tertiary-container" },
  ditolak: { label: "Ditolak", ikon: "cancel", className: "text-error" },
};

export const JENIS_SHIFT = {
  pagi: { label: "Pagi", ikon: "wb_sunny", className: "bg-primary-fixed text-on-primary-fixed-variant" },
  siang: { label: "Siang", ikon: "light_mode", className: "bg-secondary-fixed-dim text-on-secondary-fixed" },
  malam: { label: "Malam", ikon: "dark_mode", className: "bg-inverse-surface text-inverse-on-surface" },
  libur: { label: "Libur", ikon: "beach_access", className: "bg-surface-container-high text-on-surface-variant" },
};

export const STATUS_LAPORAN = {
  baru: { label: "Baru", className: "bg-error-container text-on-error-container" },
  diproses: { label: "Diproses", className: "bg-secondary-container text-on-secondary-fixed" },
  selesai: { label: "Selesai", className: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
};

function BadgeDari({ peta, nilai }) {
  const s = peta[nilai] ?? { label: nilai, className: "bg-surface-container" };
  return <Badge className={s.className}>{s.label}</Badge>;
}

export const CutiBadge = ({ status }) => <BadgeDari peta={STATUS_CUTI} nilai={status} />;
export const LaporanBadge = ({ status }) => <BadgeDari peta={STATUS_LAPORAN} nilai={status} />;

export function ShiftBadge({ jenis }) {
  const s = JENIS_SHIFT[jenis] ?? { label: jenis, ikon: "schedule", className: "bg-surface-container" };
  return (
    <Badge className={`gap-1 ${s.className}`}>
      <span className="material-symbols-outlined text-[14px]">{s.ikon}</span>
      {s.label}
    </Badge>
  );
}

export function StatusApproval({ label, approval }) {
  const s = STATUS_APPROVAL[approval.status] ?? STATUS_APPROVAL.menunggu;
  return (
    <span className={`flex items-center gap-1 font-body-sm text-body-sm ${s.className}`}>
      <span className="material-symbols-outlined text-[16px]">{s.ikon}</span>
      <span>
        {label}: {s.label}
        {approval.oleh && <span className="text-on-surface-variant"> ({approval.oleh})</span>}
      </span>
    </span>
  );
}

export const inputClass = (error) =>
  `w-full h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 transition-all ${
    error ? "ring-2 ring-error focus:ring-error" : "focus:ring-primary-container"
  }`;

export const tombol = "flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg font-label-md text-label-md transition-all disabled:opacity-50";
export const tombolUtama = `${tombol} bg-primary text-on-primary hover:bg-primary-container shadow-sm`;
export const tombolHalaman =
  "w-full md:w-auto flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-md";

export function Field({ label, wajib, error, keterangan, className = "", children }) {
  return (
    <label className={`block space-y-1 min-w-0 ${className}`}>
      <span className="font-label-md text-label-md text-on-surface">
        {label} {wajib && <span className="text-error">*</span>}
      </span>
      {children}
      {keterangan && !error && <span className="block font-body-sm text-body-sm text-on-surface-variant">{keterangan}</span>}
      {error && <span className="block font-body-sm text-body-sm text-error">{error}</span>}
    </label>
  );
}

// Modal form; di HP muncul dari bawah selebar layar. Escape menutup modal (kecuali sedang menyimpan).
export function Modal({ judul, sibuk, onClose, onSubmit, aksi, children }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={judul}>
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={() => !sibuk && onClose()} />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            if (!sibuk) onClose();
          }
        }}
        className="relative w-full sm:max-w-lg max-h-[95vh] flex flex-col bg-surface rounded-t-xl sm:rounded-xl shadow-xl"
      >
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 shrink-0 bg-surface-container-lowest rounded-t-xl border-b border-surface-container-high">
          <h2 className="font-title-md text-title-md text-on-surface">{judul}</h2>
          <button type="button" onClick={onClose} disabled={sibuk} title="Tutup" className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">{children}</div>
        <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-space-sm px-space-lg py-space-md bg-surface-container-lowest border-t border-surface-container-high rounded-b-xl">
          <button type="button" onClick={onClose} disabled={sibuk} className="h-10 px-4 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-50">
            Batal
          </button>
          {aksi}
        </div>
      </form>
    </div>
  );
}

// Daftar placement yang dapat dilihat user (GET /placement), untuk pilihan di form & filter.
export function usePlacement(status = "aktif") {
  const [daftar, setDaftar] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const params = new URLSearchParams({ per_page: 100 });
    if (status) params.set("status", status);
    api(`/placement?${params}`)
      .then((res) => setDaftar(res.data))
      .catch((err) => setError(err.message));
  }, [status]);
  return { daftar, error };
}

export const labelPlacement = (p) => `${p.talent.nama_lengkap} — ${p.posisi_penempatan} (${p.klien.nama_perusahaan})`;

// "2026-10-22" dari objek Date lokal (bukan UTC).
export const keIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const namaHari = (iso) => HARI[new Date(`${iso}T00:00:00`).getDay()];
