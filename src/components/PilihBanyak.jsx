import { useEffect, useRef, useState } from "react";

// Pecah teks pencarian menjadi beberapa kata kunci dipisah koma ("laravel, react, sql"), sama dengan backend.
export const pecahKataKunci = (teks) =>
  [...new Set((teks ?? "").split(",").map((k) => k.trim().toLowerCase()).filter(Boolean))];

// Cocok jika salah satu kata kunci ada di salah satu teks (tanpa beda huruf besar/kecil). Tanpa kata kunci = cocok.
export const cocokKataKunci = (kataKunci, ...teks) =>
  kataKunci.length === 0 || kataKunci.some((k) => teks.some((t) => t?.toLowerCase().includes(k)));

// Dropdown pilih banyak dengan kolom cari (beberapa kata kunci dipisah koma). Dipakai semua pemilih kompetensi
// (form permintaan, profil talent, filter talent pool) dan filter kategori Master Data Skill.
// `opsi` = [{ value, label, keterangan?, cari? }]: `cari` = teks tambahan yang ikut dicocokkan (mis. kategori).
// `cocokTambahan(kata, opsi)` (opsional) = aturan cocok tambahan per kata kunci.
// `onTambah(teks)` (opsional) menampilkan opsi menambah item baru jika teks yang dicari belum ada.
export default function PilihBanyak({
  opsi,
  nilai,
  onChange,
  disabled,
  ikon = "checklist",
  label,
  keterangan,
  placeholder = "Cari... (pisahkan beberapa kata kunci dengan koma)",
  lebar = "otomatis",
  error = false,
  cocokTambahan,
  tambah,
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

  const kata = pecahKataKunci(cari);
  const tampil = opsi.filter(
    (o) => cocokKataKunci(kata, o.label, o.cari) || (cocokTambahan && kata.some((k) => cocokTambahan(k, o))),
  );
  // tambah = { bisa(teks) → boolean, jalankan(teks), label(teks) }; hanya untuk satu kata (tanpa koma).
  const teks = cari.trim().replace(/\s+/g, " ");
  const bisaTambah = Boolean(tambah && teks && !teks.includes(",") && tambah.bisa(teks));
  const jalankanTambah = () => {
    tambah.jalankan(teks);
    setCari("");
  };

  const toggle = (v) => onChange(nilai.includes(v) ? nilai.filter((x) => x !== v) : [...nilai, v]);
  const semuaTampilTerpilih = tampil.length > 0 && tampil.every((o) => nilai.includes(o.value));
  const pilihSemuaTampil = () =>
    onChange(semuaTampilTerpilih ? nilai.filter((v) => !tampil.some((o) => o.value === v)) : [...new Set([...nilai, ...tampil.map((o) => o.value)])]);

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
        <span aria-hidden="true" className="material-symbols-outlined text-outline text-[18px]">{ikon}</span>
        <span className="flex-1 text-left">{label}</span>
        {nilai.length > 0 && <span className="px-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm">{nilai.length}</span>}
        <span aria-hidden="true" className="material-symbols-outlined text-outline text-[18px]">{open ? "expand_less" : "expand_more"}</span>
      </button>

      {open && (
        <div className={`absolute left-0 mt-2 w-full ${penuh ? "" : "sm:w-72"} bg-surface-container-lowest rounded-xl shadow-lg ring-1 ring-surface-container-high z-30`}>
          <div className="p-space-sm border-b border-surface-container-high">
            <input
              autoFocus
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              // Enter di form tidak boleh mengirim form; jika bisa ditambah, Enter menambahkannya.
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (bisaTambah) jalankanTambah();
              }}
              placeholder={placeholder}
              aria-label={`Cari ${label?.toLowerCase() ?? ""}`}
              className="input"
            />
            {keterangan && <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{keterangan}</p>}
          </div>
          <ul className="max-h-64 overflow-y-auto py-space-xs">
            {bisaTambah && (
              <li>
                <button
                  type="button"
                  onClick={jalankanTambah}
                  className="w-full min-h-[40px] flex items-start gap-space-sm px-space-md py-2 text-left font-body-md text-body-md text-primary hover:bg-surface-container-low"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add_circle</span>
                  <span className="flex-1 break-words">{tambah.label(teks)}</span>
                </button>
              </li>
            )}
            {kata.length > 0 && tampil.length > 1 && (
              <li>
                <button type="button" onClick={pilihSemuaTampil} className="w-full min-h-[40px] px-space-md py-1.5 text-left font-label-md text-label-md text-primary hover:bg-surface-container-low">
                  {semuaTampilTerpilih ? "Batalkan pilihan hasil pencarian" : `Pilih semua hasil (${tampil.length})`}
                </button>
              </li>
            )}
            {tampil.length === 0 && !bisaTambah && <li className="px-space-md py-2 font-body-sm text-body-sm text-on-surface-variant">Tidak ditemukan.</li>}
            {tampil.map((o) => (
              <li key={o.value}>
                <label className="flex items-center gap-space-sm min-h-[40px] px-space-md py-1.5 cursor-pointer hover:bg-surface-container-low">
                  <input type="checkbox" checked={nilai.includes(o.value)} onChange={() => toggle(o.value)} className="accent-primary w-4 h-4" />
                  <span className="flex-1 font-body-md text-body-md text-on-surface">{o.label}</span>
                  {o.keterangan && <span className="font-label-sm text-label-sm text-outline">{o.keterangan}</span>}
                </label>
              </li>
            ))}
          </ul>
          {nilai.length > 0 && (
            <div className="p-space-sm border-t border-surface-container-high">
              <button type="button" onClick={() => onChange([])} className="tombol-teks w-full">
                Hapus pilihan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
