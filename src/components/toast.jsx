// Notifikasi toast: pojok kanan bawah di desktop, bawah tengah di HP; hilang otomatis ±4 detik, bisa ditutup manual.
// Pemakaian: const toast = useToast(); toast.sukses("Pengajuan cuti disetujui."); toast.gagal(pesan); toast.info(pesan);
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const DURASI_MS = 4000;

const VARIAN = {
  sukses: { ikon: "check_circle", warna: "text-on-tertiary-container" },
  gagal: { ikon: "error", warna: "text-error" },
  info: { ikon: "info", warna: "text-info" },
};

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [daftar, setDaftar] = useState([]);
  const urutan = useRef(0);

  // Objek api stabil agar aman dipakai di dependency useEffect.
  const api = useMemo(() => {
    const tambah = (jenis) => (pesan) => {
      if (!pesan) return;
      urutan.current += 1;
      const id = urutan.current;
      setDaftar((l) => [...l, { id, jenis, pesan }]);
    };
    return { sukses: tambah("sukses"), gagal: tambah("gagal"), info: tambah("info") };
  }, []);

  const tutup = (id) => setDaftar((l) => l.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed z-[100] bottom-space-md inset-x-space-md sm:inset-x-auto sm:right-space-lg sm:bottom-space-lg sm:w-96 flex flex-col gap-space-sm pointer-events-none">
        {daftar.map((t) => (
          <ItemToast key={t.id} toast={t} onTutup={() => tutup(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ItemToast({ toast, onTutup }) {
  const v = VARIAN[toast.jenis];
  const tutupTerbaru = useRef(onTutup);
  tutupTerbaru.current = onTutup;

  useEffect(() => {
    const t = setTimeout(() => tutupTerbaru.current(), DURASI_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role={toast.jenis === "gagal" ? "alert" : "status"}
      className="animasi-toast pointer-events-auto flex items-start gap-space-sm pl-space-md pr-1 py-1 rounded-xl bg-surface-container-lowest shadow-lg ring-1 ring-surface-container-high"
    >
      <span aria-hidden="true" className={`material-symbols-outlined text-[20px] shrink-0 mt-2 ${v.warna}`}>
        {v.ikon}
      </span>
      <span className="min-w-0 flex-1 py-2 font-body-md text-body-md text-on-surface break-words">{toast.pesan}</span>
      <button type="button" onClick={onTutup} aria-label="Tutup notifikasi" className="tombol-ikon">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
          close
        </span>
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);

// Menampilkan error yang tidak punya tempat di layar (mis. daftar pilihan gagal dimuat) sebagai toast gagal.
export function useToastGagal(pesan) {
  const toast = useToast();
  useEffect(() => {
    if (pesan) toast.gagal(pesan);
  }, [pesan, toast]);
}
