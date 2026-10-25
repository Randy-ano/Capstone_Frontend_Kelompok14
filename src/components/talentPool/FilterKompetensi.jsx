import { useEffect, useRef, useState } from "react";

// Kunci pencocokan nama kompetensi, sama dengan backend (R33): huruf kecil tanpa spasi, titik, tanda hubung, garis bawah.
export const kunciKompetensi = (nama) => nama.toLowerCase().replace(/[\s._-]+/g, "");

// Dropdown pilih banyak kompetensi. `opsi` = data GET /kompetensi; `nilai` = daftar id_kompetensi terpilih.
// Dipakai sebagai filter (Talent Pool) maupun pemilih di form (job requirement, `lebar` = "penuh").
// `onTambah(teks)` (opsional) menampilkan opsi menambah kompetensi baru jika teks yang dicari belum ada di master.
export default function FilterKompetensi({
  opsi,
  nilai,
  onChange,
  disabled,
  label = "Kompetensi",
  keterangan = "Talent harus memiliki semua kompetensi terpilih.",
  lebar = "otomatis",
  error = false,
  onTambah,
}) {
  const penuh = lebar === "penuh";
  const [open, setOpen] = useState(false);
  const [cari, setCari] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const tutup = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", tutup);
    return () => document.removeEventListener("mousedown", tutup);
  }, [open]);

  // Escape hanya menutup dropdown, tidak ikut menutup form/drawer di belakangnya.
  function handleKeyDown(event) {
    if (open && event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
    }
  }

  const kata = cari.trim().toLowerCase();
  const tampil = opsi.filter(
    (k) =>
      !kata ||
      k.nama_kompetensi.toLowerCase().includes(kata) ||
      kunciKompetensi(k.nama_kompetensi).includes(kunciKompetensi(kata)) ||
      k.kategori?.toLowerCase().includes(kata),
  );

  const teks = cari.trim().replace(/\s+/g, " ");
  const bisaTambah = onTambah && kunciKompetensi(teks) !== "" && !opsi.some((k) => kunciKompetensi(k.nama_kompetensi) === kunciKompetensi(teks));
  const tambah = () => {
    onTambah(teks);
    setCari("");
  };

  const toggle = (id) => onChange(nilai.includes(id) ? nilai.filter((v) => v !== id) : [...nilai, id]);

  return (
    <div ref={ref} onKeyDown={handleKeyDown} className={`relative w-full ${penuh ? "" : "sm:w-auto"}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full min-h-[40px] flex items-center gap-1.5 px-3 rounded-lg bg-surface-container-lowest ring-1 ring-inset ring-outline-variant font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-60 ${
          penuh ? "" : "sm:w-auto"
        } ${error ? "!ring-2 !ring-error" : ""}`}
      >
        <span className="material-symbols-outlined text-outline text-[18px]">psychology</span>
        <span className="flex-1 text-left">{label}</span>
        {nilai.length > 0 && (
          <span className="px-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">{nilai.length}</span>
        )}
        <span className="material-symbols-outlined text-outline text-[18px]">{open ? "expand_less" : "expand_more"}</span>
      </button>

      {open && (
        <div className={`absolute left-0 mt-2 w-full ${penuh ? "" : "sm:w-72"} bg-surface-container-lowest rounded-xl shadow-lg ring-1 ring-surface-container-high z-30`}>
          <div className="p-space-sm border-b border-surface-container-high">
            <input
              autoFocus
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              // Enter di form tidak boleh mengirim form; jika teks belum ada di master, Enter menambahkannya.
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !onTambah) return;
                e.preventDefault();
                if (bisaTambah) tambah();
              }}
              placeholder={onTambah ? "Cari atau ketik kompetensi baru..." : "Cari kompetensi..."}
              className="input"
            />
            {keterangan && <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{keterangan}</p>}
          </div>
          <ul className="max-h-64 overflow-y-auto py-space-xs">
            {bisaTambah && (
              <li>
                <button
                  type="button"
                  onClick={tambah}
                  className="w-full min-h-[40px] flex items-start gap-space-sm px-space-md py-2 text-left font-body-md text-body-md text-primary hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span className="flex-1 break-words">
                    Tambah "<strong>{teks}</strong>" sebagai kompetensi baru
                  </span>
                </button>
              </li>
            )}
            {tampil.length === 0 && !bisaTambah && <li className="px-space-md py-2 font-body-sm text-body-sm text-on-surface-variant">Kompetensi tidak ditemukan.</li>}
            {tampil.map((k) => (
              <li key={k.id_kompetensi}>
                <label className="flex items-center gap-space-sm min-h-[40px] px-space-md py-1.5 cursor-pointer hover:bg-surface-container-low">
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
                className="tombol-teks w-full"
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
