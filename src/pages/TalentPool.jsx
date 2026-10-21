import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE } from "../auth/roles";
import FilterKompetensi from "../components/talentPool/FilterKompetensi";
import DetailDrawer from "../components/talentPool/DetailDrawer";
import { Chip, Pesan, STATUS_KETERSEDIAAN, StatusBadge, TagChip, formatTanggal, pecahTag } from "../components/talentPool/shared";

const PER_PAGE = 10;
const MAKS_CHIP = 3;

const KARTU = [
  { status: "", key: "total", label: "Total Talent", icon: "groups", warna: "text-primary" },
  { status: "tersedia", key: "tersedia", label: "Tersedia", icon: "person_check", warna: "text-on-tertiary-container" },
  { status: "tidak_tersedia", key: "tidak_tersedia", label: "Tidak Tersedia", icon: "person_off", warna: "text-outline" },
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
      <div className="bg-surface-container-low px-space-md sm:px-space-xl py-space-lg">
        <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm tracking-wider uppercase">
          <span className="material-symbols-outlined text-[16px]">group</span>
          <span>Talent Management</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile sm:font-headline-lg sm:text-headline-lg text-on-surface tracking-tight">
          Talent Pool
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          Talent berprofil lengkap otomatis masuk talent pool. Cari kandidat berdasarkan kompetensi
          {bolehUbah ? ", lalu kelola status ketersediaan dan tag keahliannya." : " dan lihat profil serta CV-nya."}
        </p>
      </div>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          {KARTU.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => ubahFilter(setStatus)(k.status)}
              aria-pressed={status === k.status}
              className={`text-left bg-surface-container-lowest p-space-md rounded-xl shadow-sm transition-all hover:shadow-md ${
                status === k.status ? "ring-2 ring-primary-container" : ""
              }`}
            >
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md">{k.label}</span>
                <span className={`material-symbols-outlined text-[20px] ${k.warna}`}>{k.icon}</span>
              </div>
              <div className="mt-space-sm font-headline-lg text-headline-lg text-on-surface">{ringkasan ? ringkasan[k.key] : "–"}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">
                {k.status ? `Klik untuk menyaring ${k.label.toLowerCase()}` : "Seluruh talent pool"}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
            <div className="relative w-full sm:flex-1 sm:min-w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
              <input
                type="search"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                maxLength={255}
                placeholder="Cari nama, email, domisili, kompetensi, atau tag..."
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>
            <FilterKompetensi opsi={opsiKompetensi} nilai={kompetensi} onChange={ubahFilter(setKompetensi)} disabled={!!errorKompetensi} />
            <div className="flex items-center gap-1.5 h-10 bg-surface-container-low px-2 rounded-lg w-full sm:w-auto">
              <span className="material-symbols-outlined text-outline text-[18px] ml-1">filter_alt</span>
              <select
                value={status}
                onChange={(e) => ubahFilter(setStatus)(e.target.value)}
                aria-label="Status ketersediaan"
                className="flex-1 bg-transparent font-label-md text-label-md text-on-surface focus:outline-none pr-2 cursor-pointer"
              >
                <option value="">Semua Status</option>
                {Object.entries(STATUS_KETERSEDIAAN).map(([nilai, { label }]) => (
                  <option key={nilai} value={nilai}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {adaFilter && (
              <button
                type="button"
                onClick={resetFilter}
                className="h-10 px-3 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-low flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
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
                  className="inline-flex items-center gap-0.5 pl-2 pr-1 py-0.5 rounded-lg bg-primary-fixed text-on-primary-fixed-variant font-label-md text-label-md hover:bg-primary-fixed-dim"
                >
                  {namaKompetensi(id)}
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              ))}
            </div>
          )}
          {errorKompetensi && <Pesan>{errorKompetensi}</Pesan>}
        </div>

        {error && <Pesan>{error}</Pesan>}

        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className={`w-full min-w-[880px] text-left border-collapse transition-opacity ${memuat && hasil ? "opacity-60" : ""}`}>
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                  <th className="py-3 px-4">Nama</th>
                  <th className="py-3 px-4">Pendidikan</th>
                  <th className="py-3 px-4">Kompetensi</th>
                  <th className="py-3 px-4">Tag Keahlian</th>
                  <th className="py-3 px-4">Tanggal Masuk</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-surface-container-low">
                {!hasil && memuat && (
                  <tr>
                    <td colSpan={6} className="py-space-xl text-center text-on-surface-variant">
                      Memuat talent pool...
                    </td>
                  </tr>
                )}
                {hasil?.data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-space-xl text-center text-on-surface-variant">
                      {adaFilter ? "Tidak ada talent yang cocok dengan pencarian atau filter." : "Talent pool masih kosong."}
                    </td>
                  </tr>
                )}
                {hasil?.data.map((item) => (
                  <BarisTalent key={item.id_talent_pool} item={item} onOpen={() => setDipilih(item.id_talent_pool)} />
                ))}
              </tbody>
            </table>
          </div>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} />}
        </div>
      </div>

      {dipilih && <DetailDrawer id={dipilih} bolehUbah={bolehUbah} onClose={tutupDetail} onUpdated={muatUlang} />}
    </div>
  );
}

function BarisTalent({ item, onOpen }) {
  const { talent } = item;
  const sisa = talent.kompetensi.length - MAKS_CHIP;
  const tag = pecahTag(item.tag_keahlian);

  return (
    <tr onClick={onOpen} className="hover:bg-surface-container-low cursor-pointer transition-colors align-top">
      <td className="py-3 px-4">
        <button type="button" onClick={(e) => { e.stopPropagation(); onOpen(); }} className="text-left group">
          <span className="block font-title-sm text-title-sm text-on-surface group-hover:text-primary">{talent.nama_lengkap}</span>
          <span className="block font-body-sm text-body-sm text-on-surface-variant">{talent.email}</span>
        </button>
      </td>
      <td className="py-3 px-4 text-on-surface-variant max-w-[220px]">{talent.pendidikan ?? "-"}</td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1 max-w-[260px]">
          {talent.kompetensi.slice(0, MAKS_CHIP).map((k) => (
            <Chip key={k.id_kompetensi} title={k.kategori}>
              {k.nama_kompetensi}
            </Chip>
          ))}
          {sisa > 0 && (
            <span
              title={talent.kompetensi.slice(MAKS_CHIP).map((k) => k.nama_kompetensi).join(", ")}
              className="inline-flex items-center px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md"
            >
              +{sisa}
            </span>
          )}
          {talent.kompetensi.length === 0 && <span className="text-outline">-</span>}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {tag.length ? tag.map((t) => <TagChip key={t}>{t}</TagChip>) : <span className="text-outline">-</span>}
        </div>
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-on-surface-variant">{formatTanggal(item.tanggal_masuk)}</td>
      <td className="py-3 px-4">
        <StatusBadge status={item.status_ketersediaan} />
      </td>
    </tr>
  );
}

// Nomor halaman ringkas: 1 … 4 5 6 … 10.
function nomorHalaman(sekarang, terakhir) {
  const nomor = new Set([1, terakhir, sekarang - 1, sekarang, sekarang + 1].filter((n) => n >= 1 && n <= terakhir));
  const urut = [...nomor].sort((a, b) => a - b);
  return urut.flatMap((n, i) => (i > 0 && n - urut[i - 1] > 1 ? ["…", n] : [n]));
}

function Pagination({ meta, onPage }) {
  const { current_page: sekarang, last_page: terakhir } = meta;
  const tombol = "min-w-[2.25rem] h-9 px-2 rounded-lg font-label-md text-label-md transition-colors disabled:opacity-40";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm px-space-md py-space-sm border-t border-surface-container-high">
      <span className="font-body-sm text-body-sm text-on-surface-variant">
        Menampilkan <strong>{meta.from}</strong>–<strong>{meta.to}</strong> dari <strong>{meta.total}</strong> talent
      </span>
      <nav className="flex items-center gap-1" aria-label="Halaman">
        <button type="button" className={`${tombol} hover:bg-surface-container`} disabled={sekarang <= 1} onClick={() => onPage(sekarang - 1)} title="Sebelumnya">
          <span className="material-symbols-outlined text-[18px] align-middle">chevron_left</span>
        </button>
        {nomorHalaman(sekarang, terakhir).map((n, i) =>
          n === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-outline">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPage(n)}
              aria-current={n === sekarang ? "page" : undefined}
              className={`${tombol} ${n === sekarang ? "bg-primary text-on-primary" : "hover:bg-surface-container text-on-surface"}`}
            >
              {n}
            </button>
          ),
        )}
        <button type="button" className={`${tombol} hover:bg-surface-container`} disabled={sekarang >= terakhir} onClick={() => onPage(sekarang + 1)} title="Berikutnya">
          <span className="material-symbols-outlined text-[18px] align-middle">chevron_right</span>
        </button>
      </nav>
    </div>
  );
}
