// Drawer (Laci) & Modal bersama: animasi masuk, Esc menutup dialog teratas, Tab tetap di dalam dialog, dan fokus kembali ke tombol pemicu.
import { useEffect, useRef } from "react";

// Dialog terbuka, urut dari bawah ke atas; hanya yang teratas menerima Esc & Tab.
const TUMPUKAN = [];
const FOKUSABEL = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialog(panelRef, { aktif = true, sibuk = false, onClose }) {
  const terbaru = useRef();
  terbaru.current = { sibuk, onClose };

  // Pemicu dicatat saat render, sebelum autoFocus milik isi dialog memindahkan fokus.
  const pemicu = useRef(null);
  if (!aktif) pemicu.current = null;
  else if (!pemicu.current) pemicu.current = document.activeElement;

  useEffect(() => {
    if (!aktif) return undefined;
    const panel = panelRef.current;
    // Pemicu bisa sudah hilang jika dialog ini dibuka tepat saat dialog lain ditutup (form tersimpan → drawer terbuka).
    const asal = pemicu.current?.isConnected ? pemicu.current : document.activeElement;
    const penanda = {};
    TUMPUKAN.push(penanda);
    if (!panel.contains(document.activeElement)) panel.focus({ preventScroll: true });

    function tekan(event) {
      if (TUMPUKAN[TUMPUKAN.length - 1] !== penanda) return;
      if (event.key === "Escape") {
        if (!terbaru.current.sibuk) terbaru.current.onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const daftar = [...panel.querySelectorAll(FOKUSABEL)].filter((el) => el.offsetParent !== null);
      if (daftar.length === 0) {
        event.preventDefault();
        return;
      }
      const kini = document.activeElement;
      const pertama = daftar[0];
      const terakhir = daftar[daftar.length - 1];
      if (!panel.contains(kini) || (event.shiftKey && (kini === pertama || kini === panel)) || (!event.shiftKey && kini === terakhir)) {
        event.preventDefault();
        (event.shiftKey ? terakhir : pertama).focus();
      }
    }

    document.addEventListener("keydown", tekan);
    return () => {
      document.removeEventListener("keydown", tekan);
      TUMPUKAN.splice(TUMPUKAN.indexOf(penanda), 1);
      if (asal?.isConnected) asal.focus({ preventScroll: true });
    };
  }, [aktif, panelRef]);
}

function TombolTutup({ onClose, sibuk }) {
  return (
    <button type="button" onClick={onClose} disabled={sibuk} aria-label="Tutup" title="Tutup" className="tombol-ikon -mr-2">
      <span aria-hidden="true" className="material-symbols-outlined text-[22px]">close</span>
    </button>
  );
}

// Panel samping detail. `kaki` = bagian tetap di bawah panel (opsional).
export function Laci({ judul, label = judul, lebar = "max-w-xl", onClose, kaki, children }) {
  const panel = useRef(null);
  useDialog(panel, { onClose });
  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label={label}>
      <div className="animasi-latar absolute inset-0 bg-inverse-surface/40" onClick={onClose} />
      <div ref={panel} tabIndex={-1} className={`animasi-laci relative w-full ${lebar} h-full bg-surface flex flex-col shadow-xl`}>
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 bg-surface-container-lowest border-b border-surface-container-high shrink-0">
          <h2 className="font-title-md text-title-md text-on-surface">{judul}</h2>
          <TombolTutup onClose={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">{children}</div>
        {kaki && <div className="shrink-0 px-space-lg py-space-md bg-surface-container-lowest border-t border-surface-container-high">{kaki}</div>}
      </div>
    </div>
  );
}

// Modal; di HP muncul dari bawah selebar layar. Dengan `onSubmit` panelnya berupa <form>. `sibuk` menahan penutupan selama menyimpan.
export function Modal({ judul, label = judul, lebar = "sm:max-w-lg", sibuk = false, onClose, onSubmit, kaki, children }) {
  const panel = useRef(null);
  useDialog(panel, { sibuk, onClose });
  const Panel = onSubmit ? "form" : "div";
  const propsForm = onSubmit
    ? {
        noValidate: true,
        onSubmit: (event) => {
          event.preventDefault();
          onSubmit(event);
        },
      }
    : {};
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <div className="animasi-latar absolute inset-0 bg-inverse-surface/40" onClick={() => !sibuk && onClose()} />
      <Panel ref={panel} tabIndex={-1} {...propsForm} className={`animasi-modal relative w-full ${lebar} max-h-[95vh] flex flex-col bg-surface rounded-t-xl sm:rounded-xl shadow-xl`}>
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 shrink-0 bg-surface-container-lowest rounded-t-xl border-b border-surface-container-high">
          <h2 className="font-title-md text-title-md text-on-surface">{judul}</h2>
          <TombolTutup onClose={onClose} sibuk={sibuk} />
        </div>
        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">{children}</div>
        {kaki && <div className="shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-space-sm px-space-lg py-space-md bg-surface-container-lowest border-t border-surface-container-high rounded-b-xl">{kaki}</div>}
      </Panel>
    </div>
  );
}
