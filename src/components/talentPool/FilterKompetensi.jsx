import PilihBanyak from "../PilihBanyak";

// Kunci pencocokan nama kompetensi, sama dengan backend (R33): huruf kecil tanpa spasi, titik, tanda hubung, garis bawah.
export const kunciKompetensi = (nama) => nama.toLowerCase().replace(/[\s._-]+/g, "");

// Pemilih banyak kompetensi (memakai PilihBanyak, sehingga kolom cari sama di semua halaman: beberapa kata kunci
// dipisah koma). `opsi` = data GET /kompetensi; `nilai` = daftar id_kompetensi terpilih.
// Dipakai sebagai filter (Talent Pool) maupun pemilih di form (permintaan kebutuhan, profil talent; `lebar` = "penuh").
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
  return (
    <PilihBanyak
      opsi={opsi.map((k) => ({ value: k.id_kompetensi, label: k.nama_kompetensi, keterangan: k.kategori, cari: k.kategori }))}
      nilai={nilai}
      onChange={onChange}
      disabled={disabled}
      ikon="psychology"
      label={label}
      keterangan={[keterangan, "Pisahkan beberapa kata kunci dengan koma."].filter(Boolean).join(" ")}
      placeholder={onTambah ? "Cari atau ketik kompetensi baru..." : "Cari kompetensi, mis. laravel, react"}
      lebar={lebar}
      error={error}
      // "React.js" ditemukan dengan "reactjs" atau "react js" (sama dengan normalisasi backend).
      cocokTambahan={(kata, o) => kunciKompetensi(kata) !== "" && kunciKompetensi(o.label).includes(kunciKompetensi(kata))}
      tambah={
        onTambah && {
          bisa: (teks) => kunciKompetensi(teks) !== "" && !opsi.some((k) => kunciKompetensi(k.nama_kompetensi) === kunciKompetensi(teks)),
          jalankan: onTambah,
          label: (teks) => (
            <>
              Tambah "<strong>{teks}</strong>" sebagai kompetensi baru
            </>
          ),
        }
      }
    />
  );
}
