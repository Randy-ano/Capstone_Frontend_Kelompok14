import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE } from "../auth/roles";
import { KepalaHalaman, KotakCari, Memuat, Pagination, Pesan, PilihFilter, errorField, formatAngka, formatTanggal, useTunda } from "../components/ui";
import { PengajuanBadge, STATUS_PENGAJUAN, tahapPengajuan } from "../components/rekrutmen/shared";
import PengajuanDrawer from "../components/rekrutmen/PengajuanDrawer";

const PER_PAGE = 10;

const KETERANGAN = {
  [ROLE.HR_CLIENT]: "Tinjau kandidat yang diajukan PT Intellisys, pantau jadwal interview dari Account Manager, lalu beri evaluasi.",
  [ROLE.TALENT]: "Pantau proses Anda: diajukan ke klien, interview, sampai hasil evaluasi.",
  [ROLE.ACCOUNT_MANAGER]: "Ajukan kandidat yang lolos screening ke klien, jadwalkan interview dan tandai selesai, lalu pantau hingga evaluasi.",
};

// Halaman Pengajuan Kandidat (FR-10, 11, 12, 17): AM mengajukan, HR Client meninjau/interview/evaluasi, TS membuat placement.
export default function PengajuanKandidat() {
  const { user } = useAuth();
  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);

  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [dipilih, setDipilih] = useState(null);
  const [ajukan, setAjukan] = useState(false);

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    setMemuat(true);
    setError("");
    api(`/pengajuan?${params}`)
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
  }, [search, status, page, versi]);

  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);
  const tutupDetail = useCallback(() => setDipilih(null), []);
  const adaFilter = Boolean(search || status);

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman
        ikon="send"
        kategori="Klien & Rekuisisi"
        judul={user.role === ROLE.TALENT ? "Proses Seleksi" : "Pengajuan Kandidat"}
        aksi={
          user.role === ROLE.ACCOUNT_MANAGER && (
            <button
              type="button"
              onClick={() => {
                setSukses("");
                setAjukan(true);
              }}
              className="w-full md:w-auto flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              Ajukan Kandidat
            </button>
          )
        }
      >
        {KETERANGAN[user.role] ?? "Kandidat yang diajukan ke klien beserta proses interview, evaluasi, dan placement."}
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <KotakCari value={cari} onChange={setCari} placeholder="Cari nama kandidat atau posisi..." />
          <PilihFilter
            ikon="filter_alt"
            label="Status pengajuan"
            value={status}
            onChange={(n) => {
              setStatus(n);
              setPage(1);
            }}
            semua="Semua Status"
            opsi={Object.entries(STATUS_PENGAJUAN).map(([v, s]) => [v, s.label])}
          />
          {adaFilter && (
            <button
              type="button"
              onClick={() => {
                setCari("");
                setStatus("");
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
            <table className={`w-full min-w-[860px] text-left border-collapse transition-opacity ${memuat && hasil ? "opacity-60" : ""}`}>
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                  <th className="py-3 px-4">Kandidat</th>
                  <th className="py-3 px-4">Posisi & Klien</th>
                  <th className="py-3 px-4">Diajukan</th>
                  <th className="py-3 px-4">Tahap Saat Ini</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-surface-container-low">
                {!hasil && memuat && (
                  <tr>
                    <td colSpan={5} className="py-space-xl text-center text-on-surface-variant">
                      Memuat pengajuan...
                    </td>
                  </tr>
                )}
                {hasil?.data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-space-xl text-center text-on-surface-variant">
                      {adaFilter ? "Tidak ada pengajuan yang cocok dengan pencarian atau filter." : "Belum ada pengajuan kandidat."}
                    </td>
                  </tr>
                )}
                {hasil?.data.map((p) => {
                  const tahap = tahapPengajuan(p);
                  return (
                    <tr key={p.id_pengajuan} onClick={() => setDipilih(p.id_pengajuan)} className="hover:bg-surface-container-low cursor-pointer transition-colors align-top">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDipilih(p.id_pengajuan);
                          }}
                          className="text-left group"
                        >
                          <span className="block font-title-sm text-title-sm text-on-surface group-hover:text-primary">{p.talent.nama_lengkap}</span>
                          <span className="block font-body-sm text-body-sm text-on-surface-variant">{p.talent.pendidikan ?? p.talent.email}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="block text-on-surface">{p.job_requirement.posisi}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">{p.job_requirement.klien.nama_perusahaan}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="block text-on-surface-variant">{formatTanggal(p.tanggal_pengajuan)}</span>
                        {p.account_manager && <span className="block font-body-sm text-body-sm text-outline">oleh {p.account_manager.nama_pegawai}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-on-surface">
                          <span className="material-symbols-outlined text-[18px] text-primary">{tahap.ikon}</span>
                          {tahap.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <PengajuanBadge status={p.status_pengajuan} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="pengajuan" />}
        </div>
      </div>

      {dipilih && <PengajuanDrawer id={dipilih} user={user} onClose={tutupDetail} onChanged={muatUlang} />}
      {ajukan && (
        <ModalAjukan
          onClose={() => setAjukan(false)}
          onBerhasil={(pesan, id) => {
            setAjukan(false);
            setSukses(pesan);
            muatUlang();
            setDipilih(id);
          }}
        />
      )}
    </div>
  );
}

// AM memilih kandidat yang lolos screening dan belum diajukan (R14).
function ModalAjukan({ onClose, onBerhasil }) {
  const [daftar, setDaftar] = useState(null);
  const [error, setError] = useState("");
  const [kirim, setKirim] = useState(null);

  useEffect(() => {
    api("/screening?hasil=lolos&belum_diajukan=1&per_page=100")
      .then((res) => setDaftar(res.data.filter((s) => s.job_requirement.status_req === "diproses")))
      .catch((err) => setError(err.message));
  }, []);

  async function ajukan(s) {
    setKirim(s.id_screening);
    setError("");
    try {
      const res = await api("/pengajuan", { method: "POST", body: { id_screening: s.id_screening } });
      onBerhasil(`${res.message} (${s.talent.nama_lengkap})`, res.data.id_pengajuan);
    } catch (err) {
      setError(errorField(err, "id_screening") ?? err.message);
      setKirim(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Ajukan kandidat"
      onKeyDown={(e) => e.key === "Escape" && !kirim && onClose()}
    >
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={() => !kirim && onClose()} />
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col bg-surface rounded-t-xl sm:rounded-xl shadow-xl">
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 shrink-0 bg-surface-container-lowest rounded-t-xl border-b border-surface-container-high">
          <h2 className="font-title-md text-title-md text-on-surface">Ajukan Kandidat ke Klien</h2>
          <button type="button" autoFocus onClick={onClose} disabled={!!kirim} title="Tutup" className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">Kandidat yang lolos screening dan belum diajukan, untuk permintaan yang sedang diproses.</p>
          {error && <Pesan>{error}</Pesan>}
          {!error && !daftar && <Memuat />}
          {daftar?.length === 0 && <p className="font-body-md text-body-md text-on-surface-variant py-space-md text-center">Belum ada kandidat lolos screening yang menunggu diajukan.</p>}
          <ul className="divide-y divide-surface-container-high">
            {daftar?.map((s) => (
              <li key={s.id_screening} className="py-space-sm flex flex-col sm:flex-row sm:items-center gap-space-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-title-sm text-title-sm text-on-surface">{s.talent.nama_lengkap}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    {s.job_requirement.posisi} · {s.job_requirement.klien.nama_perusahaan} · Skor {formatAngka(s.skor_kecocokan, 2)}
                  </div>
                  {s.catatan_screening && <div className="font-body-sm text-body-sm text-outline">“{s.catatan_screening}”</div>}
                </div>
                <button
                  type="button"
                  onClick={() => ajukan(s)}
                  disabled={!!kirim}
                  className="shrink-0 flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  {kirim === s.id_screening ? "Mengajukan..." : "Ajukan"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
