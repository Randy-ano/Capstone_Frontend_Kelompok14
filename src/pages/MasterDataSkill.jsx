import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/toast";
import { Modal } from "../components/dialog";
import { BarisKosong, BarisMemuat, KepalaHalaman, KotakCari, Pagination, Pesan, PilihFilter, Sel, TabelKartu, errorField, useTunda, Proses } from "../components/ui";

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
  const toast = useToast();
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
    toast.sukses(pesan);
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
            onClick={() => setForm({ kompetensi: null })}
            className="tombol-utama w-full md:w-auto"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add_circle</span>
            Tambah Kompetensi
          </button>
        }
      >
        Daftar kompetensi yang dipakai di profil talent, permintaan kebutuhan, dan perhitungan rekomendasi kandidat.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="kartu p-space-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
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
              className="tombol-teks"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Reset
            </button>
          )}
        </div>

        {error && <Pesan>{error}</Pesan>}

        <div className="kartu overflow-hidden">
          <TabelKartu
            kolom={["Nama Kompetensi", "Kategori", { label: "Dipakai Talent", className: "angka" }, { label: "Dipakai Permintaan", className: "angka" }, { label: "Aksi", className: "aksi" }]}
            className="md:min-w-[640px]"
            redup={memuat && hasil}
          >
            {!hasil && memuat && <BarisMemuat kolom={5} />}
            {hasil?.data.length === 0 && (
              <BarisKosong kolom={5} ikon="psychology">
                {adaFilter ? "Tidak ada kompetensi yang cocok dengan pencarian atau filter." : "Belum ada kompetensi."}
              </BarisKosong>
            )}
            {hasil?.data.map((k) => (
              <BarisKompetensi
                key={k.id_kompetensi}
                kompetensi={k}
                onUbah={() => setForm({ kompetensi: k })}
                onTerhapus={(pesan) => {
                  toast.sukses(pesan);
                  muatUlang();
                }}
                onError={setError}
              />
            ))}
          </TabelKartu>
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


  return (
    <tr className="hover:bg-surface-container-low transition-colors">
      <Sel peran="judul" className="font-title-sm text-title-sm text-on-surface">{k.nama_kompetensi}</Sel>
      <Sel label="Kategori" className="text-on-surface-variant">{k.kategori ?? <span className="text-outline">-</span>}</Sel>
      <Sel peran="setengah" label="Dipakai Talent" className="angka">{k.jumlah_talent}</Sel>
      <Sel peran="setengah" label="Dipakai Permintaan" className="angka">{k.jumlah_job_requirement}</Sel>
      <Sel peran="aksi">
        {konfirmasi ? (
          <div className="flex items-center justify-end gap-1">
            <span className="font-body-sm text-body-sm text-on-surface-variant mr-1">Hapus?</span>
            <button type="button" onClick={() => setKonfirmasi(false)} disabled={hapus} className="tombol-kedua">
              Tidak
            </button>
            <button type="button" onClick={handleHapus} disabled={hapus} className="tombol-bahaya">
              <Proses aktif={hapus}>Ya, Hapus</Proses>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <button type="button" onClick={onUbah} className="tombol-kedua">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">edit</span>
              Ubah
            </button>
            <button
              type="button"
              onClick={() => setKonfirmasi(true)}
              disabled={dipakai}
              title={dipakai ? "Masih dipakai talent atau permintaan kebutuhan, tidak dapat dihapus" : "Hapus kompetensi"}
              className="tombol-bahaya-garis"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">delete</span>
              Hapus
            </button>
          </div>
        )}
      </Sel>
    </tr>
  );
}

const inputClass = (error) => `input ${error ? "input-error" : ""}`;

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
    <Modal
      judul={ubah ? "Ubah Kompetensi" : "Tambah Kompetensi"}
      label={ubah ? "Ubah kompetensi" : "Tambah kompetensi"}
      lebar="sm:max-w-md"
      sibuk={kirim}
      onClose={onClose}
      onSubmit={handleSubmit}
      kaki={
        <>
          <button type="button" onClick={onClose} disabled={kirim} className="tombol-kedua">
            Batal
          </button>
          <button type="submit" disabled={kirim} className="tombol-utama">
            <Proses aktif={kirim}>{ubah ? "Simpan Perubahan" : "Tambah"}</Proses>
          </button>
        </>
      }
    >
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
    </Modal>
  );
}
