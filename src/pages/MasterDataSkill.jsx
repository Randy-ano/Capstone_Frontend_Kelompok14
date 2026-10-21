import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { KepalaHalaman, KotakCari, Pagination, Pesan, PilihFilter, errorField, useTunda } from "../components/ui";

const PER_PAGE = 15;

// Halaman Master Data Skill (master kompetensi) — Talent Support & Manager.
// Kompetensi yang masih dipakai talent/job requirement tidak bisa dihapus (ditolak backend).
export default function MasterDataSkill() {
  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [kategori, setKategori] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);

  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [form, setForm] = useState(null); // null | { kompetensi: null } (tambah) | { kompetensi } (ubah)

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: PER_PAGE, dengan_pemakaian: 1 });
    if (search) params.set("search", search);
    if (kategori) params.set("kategori", kategori);

    setMemuat(true);
    setError("");
    api(`/kompetensi?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message))
      .finally(() => !batal && setMemuat(false));
    return () => {
      batal = true;
    };
  }, [search, kategori, page, versi]);

  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);
  const tutupForm = useCallback(() => setForm(null), []);
  const opsiKategori = hasil?.meta.kategori ?? [];
  const adaFilter = Boolean(search || kategori);

  function tersimpan(pesan) {
    setForm(null);
    setSukses(pesan);
    muatUlang();
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman
        ikon="database"
        kategori="Pengaturan"
        judul="Master Data Skill"
        aksi={
          <button
            type="button"
            onClick={() => {
              setSukses("");
              setForm({ kompetensi: null });
            }}
            className="w-full md:w-auto flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Tambah Kompetensi
          </button>
        }
      >
        Daftar kompetensi yang dipakai di profil talent, permintaan kebutuhan, dan perhitungan rekomendasi kandidat.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <KotakCari value={cari} onChange={setCari} placeholder="Cari nama kompetensi..." />
          <PilihFilter
            ikon="category"
            label="Kategori"
            value={kategori}
            onChange={(nilai) => {
              setKategori(nilai);
              setPage(1);
            }}
            semua="Semua Kategori"
            opsi={opsiKategori.map((k) => [k, k])}
          />
          {adaFilter && (
            <button
              type="button"
              onClick={() => {
                setCari("");
                setKategori("");
                setPage(1);
              }}
              className="h-10 px-3 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Reset
            </button>
          )}
        </div>

        {error && <Pesan>{error}</Pesan>}
        {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}

        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className={`w-full min-w-[640px] text-left border-collapse transition-opacity ${memuat && hasil ? "opacity-60" : ""}`}>
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                  <th className="py-3 px-4">Nama Kompetensi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Dipakai Talent</th>
                  <th className="py-3 px-4 text-center">Dipakai Permintaan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-surface-container-low">
                {!hasil && memuat && (
                  <tr>
                    <td colSpan={5} className="py-space-xl text-center text-on-surface-variant">
                      Memuat kompetensi...
                    </td>
                  </tr>
                )}
                {hasil?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-space-xl text-center text-on-surface-variant">
                      {adaFilter ? "Tidak ada kompetensi yang cocok dengan pencarian atau filter." : "Belum ada kompetensi."}
                    </td>
                  </tr>
                )}
                {hasil?.data.map((k) => (
                  <BarisKompetensi
                    key={k.id_kompetensi}
                    kompetensi={k}
                    onUbah={() => {
                      setSukses("");
                      setForm({ kompetensi: k });
                    }}
                    onTerhapus={(pesan) => {
                      setSukses(pesan);
                      muatUlang();
                    }}
                    onError={(pesan) => {
                      setSukses("");
                      setError(pesan);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="kompetensi" />}
        </div>
      </div>

      {form && <FormKompetensi kompetensi={form.kompetensi} opsiKategori={opsiKategori} onClose={tutupForm} onSaved={tersimpan} />}
    </div>
  );
}

function BarisKompetensi({ kompetensi: k, onUbah, onTerhapus, onError }) {
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [hapus, setHapus] = useState(false);
  const dipakai = k.jumlah_talent + k.jumlah_job_requirement > 0;

  async function handleHapus() {
    setHapus(true);
    try {
      const res = await api(`/kompetensi/${k.id_kompetensi}`, { method: "DELETE" });
      onTerhapus(`${res.message} (${k.nama_kompetensi})`);
    } catch (err) {
      onError(errorField(err, "id_kompetensi") ?? err.message);
      setHapus(false);
      setKonfirmasi(false);
    }
  }

  const tombol = "h-8 px-3 rounded-lg font-label-md text-label-md transition-colors disabled:opacity-40";

  return (
    <tr className="hover:bg-surface-container-low transition-colors">
      <td className="py-3 px-4 font-title-sm text-title-sm text-on-surface">{k.nama_kompetensi}</td>
      <td className="py-3 px-4 text-on-surface-variant">{k.kategori ?? <span className="text-outline">-</span>}</td>
      <td className="py-3 px-4 text-center">{k.jumlah_talent}</td>
      <td className="py-3 px-4 text-center">{k.jumlah_job_requirement}</td>
      <td className="py-3 px-4">
        {konfirmasi ? (
          <div className="flex items-center justify-end gap-1">
            <span className="font-body-sm text-body-sm text-on-surface-variant mr-1">Hapus?</span>
            <button type="button" onClick={() => setKonfirmasi(false)} disabled={hapus} className={`${tombol} text-on-surface-variant hover:bg-surface-container`}>
              Tidak
            </button>
            <button type="button" onClick={handleHapus} disabled={hapus} className={`${tombol} bg-error text-on-error`}>
              {hapus ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <button type="button" onClick={onUbah} className={`${tombol} text-primary hover:bg-surface-container flex items-center gap-1`}>
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Ubah
            </button>
            <button
              type="button"
              onClick={() => setKonfirmasi(true)}
              disabled={dipakai}
              title={dipakai ? "Masih dipakai talent atau permintaan kebutuhan, tidak dapat dihapus" : "Hapus kompetensi"}
              className={`${tombol} text-error hover:bg-error-container flex items-center gap-1`}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Hapus
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

const inputClass = (error) =>
  `w-full h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 transition-all ${
    error ? "ring-2 ring-error focus:ring-error" : "focus:ring-primary-container"
  }`;

// Modal tambah (POST /kompetensi) atau ubah (PUT /kompetensi/{id}).
function FormKompetensi({ kompetensi, opsiKategori, onClose, onSaved }) {
  const ubah = Boolean(kompetensi);
  const [nama, setNama] = useState(kompetensi?.nama_kompetensi ?? "");
  const [kategori, setKategori] = useState(kompetensi?.kategori ?? "");
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setKirim(true);
    setError(null);
    const body = { nama_kompetensi: nama, kategori: kategori.trim() || null };
    try {
      const res = ubah
        ? await api(`/kompetensi/${kompetensi.id_kompetensi}`, { method: "PUT", body })
        : await api("/kompetensi", { method: "POST", body });
      onSaved(`${res.message} (${res.data.nama_kompetensi})`);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  const e = (field) => errorField(error, field);
  // Form hanya 2 field: error lama dihapus begitu salah satu field diketik ulang.
  const ubahField = (setter) => (ev) => {
    setter(ev.target.value);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={ubah ? "Ubah kompetensi" : "Tambah kompetensi"}>
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={() => !kirim && onClose()} />
      <form
        noValidate
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !kirim) onClose();
        }}
        className="relative w-full sm:max-w-md bg-surface rounded-t-xl sm:rounded-xl shadow-xl"
      >
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 bg-surface-container-lowest rounded-t-xl border-b border-surface-container-high">
          <h2 className="font-title-md text-title-md text-on-surface">{ubah ? "Ubah Kompetensi" : "Tambah Kompetensi"}</h2>
          <button type="button" onClick={onClose} disabled={kirim} title="Tutup" className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="p-space-md sm:p-space-lg space-y-space-md">
          {error && !e("nama_kompetensi") && !e("kategori") && <Pesan>{error.message}</Pesan>}
          {ubah && kompetensi.jumlah_talent + kompetensi.jumlah_job_requirement > 0 && (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Dipakai {kompetensi.jumlah_talent} talent dan {kompetensi.jumlah_job_requirement} permintaan; perubahan nama langsung berlaku di semuanya.
            </p>
          )}
          <label className="block space-y-1">
            <span className="font-label-md text-label-md text-on-surface">
              Nama kompetensi <span className="text-error">*</span>
            </span>
            <input autoFocus value={nama} onChange={ubahField(setNama)} maxLength={100} placeholder="Contoh: Golang" className={inputClass(e("nama_kompetensi"))} />
            {e("nama_kompetensi") && <span className="block font-body-sm text-body-sm text-error">{e("nama_kompetensi")}</span>}
          </label>
          <label className="block space-y-1">
            <span className="font-label-md text-label-md text-on-surface">Kategori</span>
            <input list="opsi-kategori" value={kategori} onChange={ubahField(setKategori)} maxLength={100} placeholder="Pilih atau ketik kategori baru" className={inputClass(e("kategori"))} />
            <datalist id="opsi-kategori">
              {opsiKategori.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
            {e("kategori") && <span className="block font-body-sm text-body-sm text-error">{e("kategori")}</span>}
          </label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-space-sm px-space-lg py-space-md bg-surface-container-lowest border-t border-surface-container-high rounded-b-xl">
          <button type="button" onClick={onClose} disabled={kirim} className="h-10 px-4 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-50">
            Batal
          </button>
          <button type="submit" disabled={kirim} className="h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm disabled:opacity-50">
            {kirim ? "Menyimpan..." : ubah ? "Simpan Perubahan" : "Tambah"}
          </button>
        </div>
      </form>
    </div>
  );
}
