// Komponen & label bersama halaman operasional (cuti, shift, monitoring, keluhan; FR-14, 15, 18, 19).
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Badge, NADA } from "../ui";
import { Modal as ModalDasar } from "../dialog";

export const STATUS_CUTI = {
  menunggu: { label: "Menunggu", className: NADA.menunggu },
  disetujui: { label: "Disetujui", className: NADA.sukses },
  ditolak: { label: "Ditolak", className: NADA.bahaya },
  dibatalkan: { label: "Dibatalkan", className: NADA.netral },
};

export const STATUS_APPROVAL = {
  menunggu: { label: "Menunggu", ikon: "hourglass_top", className: "text-warning" },
  disetujui: { label: "Disetujui", ikon: "check_circle", className: "text-on-tertiary-container" },
  ditolak: { label: "Ditolak", ikon: "cancel", className: "text-error" },
};

export const JENIS_SHIFT = {
  pagi: { label: "Pagi", ikon: "wb_sunny", className: NADA.proses },
  siang: { label: "Siang", ikon: "light_mode", className: NADA.menunggu },
  malam: { label: "Malam", ikon: "dark_mode", className: NADA.gelap },
  libur: { label: "Libur", ikon: "beach_access", className: NADA.netral },
};

export const STATUS_LAPORAN = {
  baru: { label: "Baru", className: NADA.menunggu },
  diproses: { label: "Diproses", className: NADA.proses },
  selesai: { label: "Selesai", className: NADA.netral },
};

function BadgeDari({ peta, nilai }) {
  const s = peta[nilai] ?? { label: nilai, className: NADA.netral };
  return <Badge className={s.className}>{s.label}</Badge>;
}

export const CutiBadge = ({ status }) => <BadgeDari peta={STATUS_CUTI} nilai={status} />;
export const LaporanBadge = ({ status }) => <BadgeDari peta={STATUS_LAPORAN} nilai={status} />;

export function ShiftBadge({ jenis }) {
  const s = JENIS_SHIFT[jenis] ?? { label: jenis, ikon: "schedule", className: NADA.netral };
  return (
    <Badge className={`gap-1 ${s.className}`}>
      <span aria-hidden="true" className="material-symbols-outlined text-[14px]">{s.ikon}</span>
      {s.label}
    </Badge>
  );
}

export function StatusApproval({ label, approval }) {
  const s = STATUS_APPROVAL[approval.status] ?? STATUS_APPROVAL.menunggu;
  return (
    <span className={`flex items-center gap-1 font-body-sm text-body-sm ${s.className}`}>
      <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{s.ikon}</span>
      <span>
        {label}: {s.label}
        {approval.oleh && <span className="text-on-surface-variant"> ({approval.oleh})</span>}
      </span>
    </span>
  );
}

export const inputClass = (error) => `input ${error ? "input-error" : ""}`;

export const tombolUtama = "tombol-utama";
export const tombolHalaman = "tombol-utama w-full md:w-auto";

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

// Modal form dengan tombol Batal + aksi. Escape menutup modal (kecuali sedang menyimpan).
export function Modal({ judul, sibuk, onClose, onSubmit, aksi, children }) {
  return (
    <ModalDasar
      judul={judul}
      sibuk={sibuk}
      onClose={onClose}
      onSubmit={onSubmit}
      kaki={
        <>
          <button type="button" onClick={onClose} disabled={sibuk} className="tombol-kedua">
            Batal
          </button>
          {aksi}
        </>
      }
    >
      {children}
    </ModalDasar>
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
