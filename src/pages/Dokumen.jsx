import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE } from "../auth/roles";
import { KeadaanKosong, KepalaHalaman, KotakCari, Memuat, Pagination, Pesan, PilihFilter, formatTanggal, useTunda } from "../components/ui";
import { JENIS_DOKUMEN, STATUS_DOKUMEN, StatusDokumenBadge } from "../components/dokumen/shared";
import { ModalGenerate, ModalUnggah } from "../components/dokumen/ModalDokumen";
import DokumenDrawer from "../components/dokumen/DokumenDrawer";

const BOLEH_UNGGAH = [ROLE.ACCOUNT_MANAGER, ROLE.HR_CLIENT, ROLE.MANAGER, ROLE.TALENT];

// Halaman Dokumen (FR-13, R25–R28): semua role sesuai scope; unggah (AM/HC/M/T), template (AM), tanda tangan digital.
export default function Dokumen() {
  const { user } = useAuth();
  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [jenis, setJenis] = useState("");
  const [status, setStatus] = useState("");
  const [perluTtd, setPerluTtd] = useState(false);
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [jumlahTtd, setJumlahTtd] = useState(null);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [modal, setModal] = useState(""); // "" | "unggah" | "generate"
  const [dipilih, setDipilih] = useState(null);

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: 10 });
    if (search) params.set("search", search);
    if (jenis) params.set("jenis", jenis);
    if (status) params.set("status", status);
    if (perluTtd) params.set("perlu_ttd", 1);
    setError("");
    api(`/dokumen?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message));
    // Jumlah dokumen yang menunggu tanda tangan user (untuk tombol filter).
    api("/dokumen?perlu_ttd=1&per_page=1")
      .then((res) => !batal && setJumlahTtd(res.meta.total))
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, [search, jenis, status, perluTtd, page, versi]);

  function berhasil(data, pesan) {
    setModal("");
    setSukses(pesan);
    setDipilih(data);
    setVersi((v) => v + 1);
  }

  const adaFilter = Boolean(search || jenis || status || perluTtd);

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman
        ikon="description"
        kategori="Operasional & HR"
        judul="Dokumen (Quotation & PO)"
        aksi={
          <div className="flex flex-col md:flex-row gap-space-sm">
            {user.role === ROLE.ACCOUNT_MANAGER && (
              <button type="button" onClick={() => (setSukses(""), setModal("generate"))} className="tombol-kedua">
                <span className="material-symbols-outlined text-[18px]">note_add</span>
                Buat dari Template
              </button>
            )}
            {BOLEH_UNGGAH.includes(user.role) && (
              <button type="button" onClick={() => (setSukses(""), setModal("unggah"))} className="tombol-utama">
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Unggah Dokumen
              </button>
            )}
          </div>
        }
      >
        Quotation, purchase order, perjanjian kerja sama, kontrak, dan dokumen lain beserta proses tanda tangan digitalnya.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-md">
        <div className="kartu p-space-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <KotakCari value={cari} onChange={setCari} placeholder="Cari nama file, klien, atau talent..." />
          <PilihFilter ikon="category" label="Jenis dokumen" value={jenis} onChange={(v) => (setJenis(v), setPage(1))} semua="Semua Jenis" opsi={Object.entries(JENIS_DOKUMEN).map(([v, j]) => [v, j.label])} />
          <PilihFilter ikon="filter_alt" label="Status dokumen" value={status} onChange={(v) => (setStatus(v), setPage(1))} semua="Semua Status" opsi={Object.entries(STATUS_DOKUMEN).map(([v, s]) => [v, s.label])} />
          <button
            type="button"
            aria-pressed={perluTtd}
            onClick={() => (setPerluTtd((x) => !x), setPage(1))}
            className={`min-h-[40px] px-3 rounded-lg flex items-center justify-center gap-1.5 font-label-md text-label-md transition-colors ${
              perluTtd ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface ring-1 ring-inset ring-outline-variant hover:bg-surface-container-low"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">draw</span>
            Perlu Tanda Tangan Saya
            {jumlahTtd > 0 && <span className={`px-1.5 rounded-full font-label-sm text-label-sm ${perluTtd ? "bg-on-primary text-primary" : "bg-error text-on-error"}`}>{jumlahTtd}</span>}
          </button>
        </div>

        {error && <Pesan>{error}</Pesan>}
        {sukses && !dipilih && <Pesan jenis="sukses">{sukses}</Pesan>}

        <div className="kartu overflow-hidden">
          {!hasil && !error && <Memuat>Memuat dokumen...</Memuat>}
          {hasil?.data.length === 0 && (
            <KeadaanKosong ikon="description">{adaFilter ? "Tidak ada dokumen yang cocok dengan pencarian atau filter." : "Belum ada dokumen."}</KeadaanKosong>
          )}
          {hasil?.data.length > 0 && (
            <div className="overflow-x-auto w-full">
              <table className="tabel min-w-[820px] text-left border-collapse">
                <thead>
                  <tr>
                    <th>Dokumen</th>
                    <th>Klien / Talent</th>
                    <th>Diunggah</th>
                    <th>Tanda Tangan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hasil.data.map((d) => {
                    const j = JENIS_DOKUMEN[d.jenis_dokumen] ?? JENIS_DOKUMEN.lainnya;
                    const sudah = d.penandatangan.filter((p) => p.status_ttd === "ditandatangani").length;
                    return (
                      <tr key={d.id_dokumen} onClick={() => (setSukses(""), setDipilih(d))} className="hover:bg-surface-container-low cursor-pointer align-top">
                        <td>
                          <button type="button" onClick={(e) => (e.stopPropagation(), setSukses(""), setDipilih(d))} className="text-left flex items-start gap-space-sm group">
                            <span className="material-symbols-outlined text-[20px] text-primary">{j.ikon}</span>
                            <span>
                              <span className="block font-title-sm text-title-sm text-on-surface group-hover:text-primary break-all">{d.nama_file}</span>
                              <span className="block font-body-sm text-body-sm text-on-surface-variant">{j.label}</span>
                            </span>
                          </button>
                        </td>
                        <td>
                          <span className="block text-on-surface">{d.klien?.nama_perusahaan ?? "-"}</span>
                          {d.talent && <span className="block font-body-sm text-body-sm text-on-surface-variant">{d.talent.nama_lengkap}</span>}
                        </td>
                        <td className="whitespace-nowrap">
                          <span className="block text-on-surface-variant">{formatTanggal(d.tanggal_unggah)}</span>
                          {d.uploader && <span className="block font-body-sm text-body-sm text-outline">oleh {d.uploader.nama}</span>}
                        </td>
                        <td>
                          {d.penandatangan.length ? (
                            <span className="text-on-surface-variant">
                              {sudah}/{d.penandatangan.length} menandatangani
                            </span>
                          ) : (
                            <span className="text-outline">-</span>
                          )}
                          {d.aksi.perlu_tanda_tangan_saya && (
                            <span className="mt-1 flex items-center gap-1 font-label-sm text-label-sm text-warning">
                              <span className="material-symbols-outlined text-[14px]">draw</span>
                              Menunggu tanda tangan Anda
                            </span>
                          )}
                        </td>
                        <td>
                          <StatusDokumenBadge status={d.status_dokumen} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="dokumen" />}
        </div>
      </div>

      {modal === "unggah" && <ModalUnggah user={user} onClose={() => setModal("")} onBerhasil={berhasil} />}
      {modal === "generate" && <ModalGenerate onClose={() => setModal("")} onBerhasil={berhasil} />}
      {dipilih && (
        <DokumenDrawer
          key={dipilih.id_dokumen + dipilih.status_dokumen + dipilih.penandatangan.length}
          dokumen={dipilih}
          pesan={sukses}
          onClose={() => (setDipilih(null), setSukses(""))}
          onBerhasil={berhasil}
        />
      )}
    </div>
  );
}

