import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE } from "../auth/roles";
import FilterKompetensi from "../components/talentPool/FilterKompetensi";
import DetailDrawer from "../components/talentPool/DetailDrawer";
import { BarisKosong, BarisMemuat, Chip, KartuRingkasan, KepalaHalaman, KotakCari, Pagination, Pesan, PilihFilter, Sel, TabelKartu, formatTanggal } from "../components/ui";
import { STATUS_KETERSEDIAAN, StatusBadge } from "../components/talentPool/shared";

const PER_PAGE = 10;
const MAKS_CHIP = 3;

const KARTU = [
  { status: "", key: "total", label: "Total Talent", icon: "groups", warna: "text-primary", keterangan: "Seluruh talent pool" },
  { status: "tersedia", key: "tersedia", label: "Tersedia", icon: "person_check", warna: "text-on-tertiary-container", keterangan: "Termasuk yang sedang diproses. Klik untuk menyaring" },
  { status: "tidak_tersedia", key: "tidak_tersedia", label: "Tidak Tersedia", icon: "person_off", warna: "text-outline", keterangan: "Klik untuk menyaring tidak tersedia" },
];

// Halaman Talent Pool (FR-06): AM, TS, Manager melihat; TS mengubah status ketersediaan & tag keahlian.
export default function TalentPool() {
  const { user } = useAuth();
  const bolehUbah = user.role === ROLE.TALENT_SUPPORT;

  const [cari, setCari] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [kompetensi, setKompetensi] = useState([]);
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);

  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");

  const [opsiKompetensi, setOpsiKompetensi] = useState([]);
  const [errorKompetensi, setErrorKompetensi] = useState("");
  const [dipilih, setDipilih] = useState(null);

  // Pencarian dikirim 400 ms setelah berhenti mengetik.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(cari.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [cari]);

  useEffect(() => {
    api("/kompetensi?per_page=100")
      .then((res) => setOpsiKompetensi(res.data))
      .catch((err) => setErrorKompetensi(err.message));
  }, []);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    kompetensi.forEach((id) => params.append("kompetensi[]", id));

    setMemuat(true);
    setError("");
    api(`/talent-pool?${params}`)
      .then((res) => {
        if (batal) return;
        // Halaman bisa kosong setelah data berubah (mis. status diubah); mundur ke halaman terakhir.
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message))
      .finally(() => !batal && setMemuat(false));
    return () => {
      batal = true;
    };
  }, [search, status, kompetensi, page, versi]);

  const ubahFilter = (setter) => (nilai) => {
    setter(nilai);
    setPage(1);
  };

  function resetFilter() {
    setCari("");
    setSearch("");
    setStatus("");
    setKompetensi([]);
    setPage(1);
  }

  const tutupDetail = useCallback(() => setDipilih(null), []);
  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);

  const ringkasan = hasil?.meta.ringkasan;
  const adaFilter = Boolean(search || status || kompetensi.length);
  const namaKompetensi = (id) => opsiKompetensi.find((k) => k.id_kompetensi === id)?.nama_kompetensi ?? `#${id}`;

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="group" kategori="Talent Management" judul="Talent Pool">
        Talent berprofil lengkap otomatis masuk talent pool. Cari kandidat berdasarkan kompetensi
        {bolehUbah ? ", lalu kelola status ketersediaan dan tag keahliannya." : " dan lihat profil serta CV-nya."}
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm sm:gap-space-md">
          {KARTU.map((k) => (
            <KartuRingkasan
              key={k.key}
              label={k.label}
              nilai={ringkasan?.[k.key]}
              ikon={k.icon}
              warna={k.warna}
              keterangan={k.keterangan}
              aktif={status === k.status}
              onClick={() => ubahFilter(setStatus)(k.status)}
            />
          ))}
        </div>

        <div className="kartu p-space-md flex flex-col gap-space-sm">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
            <KotakCari value={cari} onChange={setCari} placeholder="Cari nama, email, domisili, kompetensi, atau tag..." />
            <FilterKompetensi opsi={opsiKompetensi} nilai={kompetensi} onChange={ubahFilter(setKompetensi)} disabled={!!errorKompetensi} />
            <PilihFilter
              ikon="filter_alt"
              label="Status ketersediaan"
              value={status}
              onChange={ubahFilter(setStatus)}
              semua="Semua Status"
              opsi={Object.entries(STATUS_KETERSEDIAAN).map(([nilai, { label }]) => [nilai, label])}
            />
            {adaFilter && (
              <button type="button" onClick={resetFilter} className="tombol-teks">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                Reset
              </button>
            )}
          </div>

          {kompetensi.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Harus memiliki:</span>
              {kompetensi.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => ubahFilter(setKompetensi)(kompetensi.filter((v) => v !== id))}
                  title="Hapus filter"
                  aria-label={`Hapus filter ${namaKompetensi(id)}`}
                  className="inline-flex items-center gap-0.5 min-h-[32px] pl-2.5 pr-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md hover:bg-primary-fixed-dim"
                >
                  {namaKompetensi(id)}
                  <span aria-hidden="true" className="material-symbols-outlined text-[16px]">close</span>
                </button>
              ))}
            </div>
          )}
          {errorKompetensi && <Pesan>{errorKompetensi}</Pesan>}
        </div>

        {error && <Pesan>{error}</Pesan>}

        <div className="kartu overflow-hidden">
          <TabelKartu kolom={["Nama", "Pendidikan", "Kompetensi", "Tanggal Masuk", "Status"]} className="md:min-w-[720px]" redup={memuat && hasil}>
            {!hasil && memuat && <BarisMemuat kolom={5} />}
            {hasil?.data.length === 0 && (
              <BarisKosong kolom={5} ikon="group">
                {adaFilter ? "Tidak ada talent yang cocok dengan pencarian atau filter." : "Talent pool masih kosong."}
              </BarisKosong>
            )}
            {hasil?.data.map((item) => (
              <BarisTalent key={item.id_talent_pool} item={item} onOpen={() => setDipilih(item.id_talent_pool)} />
            ))}
          </TabelKartu>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="talent" />}
        </div>
      </div>

      {dipilih && <DetailDrawer id={dipilih} bolehUbah={bolehUbah} onClose={tutupDetail} onUpdated={muatUlang} />}
    </div>
  );
}

function BarisTalent({ item, onOpen }) {
  const { talent } = item;
  const sisa = talent.kompetensi.length - MAKS_CHIP;

  return (
    <tr onClick={onOpen} className="hover:bg-surface-container-low cursor-pointer transition-colors align-top">
      <Sel peran="judul">
        <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(); }} className="text-left group max-w-full">
          <span className="block font-title-sm text-title-sm text-on-surface group-hover:text-primary">{talent.nama_lengkap}</span>
          <span className="block font-body-sm text-body-sm text-on-surface-variant break-all">{talent.email}</span>
        </button>
      </Sel>
      <Sel label="Pendidikan" className="text-on-surface-variant max-w-[220px]">{talent.pendidikan ?? "-"}</Sel>
      <Sel label="Kompetensi">
        <div className="flex flex-wrap gap-1 md:max-w-[260px]">
          {talent.kompetensi.slice(0, MAKS_CHIP).map((k) => (
            <Chip key={k.id_kompetensi} title={k.kategori}>
              {k.nama_kompetensi}
            </Chip>
          ))}
          {sisa > 0 && (
            <span
              title={talent.kompetensi.slice(MAKS_CHIP).map((k) => k.nama_kompetensi).join(", ")}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-md text-label-md"
            >
              +{sisa}
            </span>
          )}
          {talent.kompetensi.length === 0 && <span className="text-outline">-</span>}
        </div>
      </Sel>
      <Sel label="Tanggal Masuk" className="whitespace-nowrap text-on-surface-variant">{formatTanggal(item.tanggal_masuk)}</Sel>
      <Sel peran="status">
        <StatusBadge status={item.status_ketersediaan} />
      </Sel>
    </tr>
  );
}

