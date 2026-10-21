import { useEffect, useRef, useState } from "react";

// Dropdown pilih banyak kompetensi. `opsi` = data GET /kompetensi; `nilai` = daftar id_kompetensi terpilih.
export default function FilterKompetensi({ opsi, nilai, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [cari, setCari] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const tutup = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    const esc = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", tutup);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", tutup);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const kata = cari.trim().toLowerCase();
  const tampil = opsi.filter(
    (k) => !kata || k.nama_kompetensi.toLowerCase().includes(kata) || k.kategori?.toLowerCase().includes(kata),
  );

  const toggle = (id) => onChange(nilai.includes(id) ? nilai.filter((v) => v !== id) : [...nilai, id]);

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full sm:w-auto h-10 flex items-center gap-1.5 px-3 rounded-lg bg-surface-container-low font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-outline text-[18px]">psychology</span>
        <span className="flex-1 text-left">Kompetensi</span>
        {nilai.length > 0 && (
          <span className="px-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">{nilai.length}</span>
        )}
        <span className="material-symbols-outlined text-outline text-[18px]">{open ? "expand_less" : "expand_more"}</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-full sm:w-72 bg-surface-container-lowest rounded-xl shadow-lg ring-1 ring-surface-container-high z-30">
          <div className="p-space-sm border-b border-surface-container-high">
            <input
              autoFocus
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari kompetensi..."
              className="w-full h-9 px-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Talent harus memiliki semua kompetensi terpilih.</p>
          </div>
          <ul className="max-h-64 overflow-y-auto py-space-xs">
            {tampil.length === 0 && <li className="px-space-md py-2 font-body-sm text-body-sm text-on-surface-variant">Kompetensi tidak ditemukan.</li>}
            {tampil.map((k) => (
              <li key={k.id_kompetensi}>
                <label className="flex items-center gap-space-sm px-space-md py-1.5 cursor-pointer hover:bg-surface-container-low">
                  <input
                    type="checkbox"
                    checked={nilai.includes(k.id_kompetensi)}
                    onChange={() => toggle(k.id_kompetensi)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="flex-1 font-body-md text-body-md text-on-surface">{k.nama_kompetensi}</span>
                  <span className="font-label-sm text-label-sm text-outline">{k.kategori}</span>
                </label>
              </li>
            ))}
          </ul>
          {nilai.length > 0 && (
            <div className="p-space-sm border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full h-8 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low"
              >
                Hapus pilihan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
