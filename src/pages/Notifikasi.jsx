import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { KeadaanKosong, KepalaHalaman, Memuat, Pagination, Pesan, formatTanggalWaktu } from "../components/ui";
import { infoTipe, waktuRelatif } from "../components/notifikasi/shared";

const FILTER = [
  ["", "Semua"],
  ["0", "Belum dibaca"],
  ["1", "Sudah dibaca"],
];

// Halaman semua notifikasi milik user (FR-16).
export default function Notifikasi() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [jumlah, setJumlah] = useState(0);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: 15 });
    if (status) params.set("status_baca", status);
    setError("");
    api(`/notifikasi?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message));
    api("/notifikasi/belum-dibaca/jumlah")
      .then((res) => !batal && setJumlah(res.data.jumlah))
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, [status, page, versi]);

  async function buka(n) {
    if (!n.status_baca) await api(`/notifikasi/${n.id_notifikasi}/baca`, { method: "PATCH" }).catch(() => {});
    const tujuan = infoTipe(n.tipe_notifikasi, user.role).path;
    if (tujuan) navigate(tujuan);
    else setVersi((v) => v + 1);
  }

  async function bacaSemua() {
    try {
      const res = await api("/notifikasi/baca-semua", { method: "PATCH" });
      setSukses(res.message);
      setVersi((v) => v + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman
        ikon="notifications"
        kategori="Akun"
        judul="Notifikasi"
        aksi={
          jumlah > 0 && (
            <button type="button" onClick={bacaSemua} className="tombol-utama w-full md:w-auto">
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              Tandai Semua Dibaca ({jumlah})
            </button>
          )
        }
      >
        Pemberitahuan terkait proses rekrutmen, penempatan, cuti, keluhan, dan dokumen. Pengingat harian dikirim pukul 07.00 WIB.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-md">
        <div className="inline-flex self-start p-1 bg-surface-container rounded-full shadow-sm" role="tablist">
          {FILTER.map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={status === v}
              onClick={() => (setStatus(v), setPage(1))}
              className={`min-h-[40px] px-4 py-2 rounded-full font-label-md text-label-md transition-all ${status === v ? "bg-surface-container-lowest text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && <Pesan>{error}</Pesan>}
        {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}

        <div className="kartu overflow-hidden">
          {!hasil && !error && <Memuat>Memuat notifikasi...</Memuat>}
          {hasil?.data.length === 0 && <KeadaanKosong ikon="notifications_off">Tidak ada notifikasi.</KeadaanKosong>}
          <ul className="divide-y divide-surface-container-low">
            {hasil?.data.map((n) => (
              <li key={n.id_notifikasi}>
                <button type="button" onClick={() => buka(n)} className={`w-full text-left flex gap-space-md px-space-md py-space-md hover:bg-surface-container-low ${n.status_baca ? "" : "bg-primary-fixed/30"}`}>
                  <span className="w-10 h-10 shrink-0 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">{infoTipe(n.tipe_notifikasi, user.role).ikon}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block font-body-md text-body-md ${n.status_baca ? "text-on-surface-variant" : "text-on-surface font-medium"}`}>{n.pesan}</span>
                    <span className="block font-body-sm text-body-sm text-outline mt-0.5" title={formatTanggalWaktu(n.dibuat_pada)}>
                      {waktuRelatif(n.dibuat_pada)}
                      {n.kanal === "email" && " · dikirim juga lewat email"}
                    </span>
                  </span>
                  {!n.status_baca && <span className="w-2.5 h-2.5 mt-2 shrink-0 rounded-full bg-primary" aria-label="Belum dibaca" />}
                </button>
              </li>
            ))}
          </ul>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="notifikasi" />}
        </div>
      </div>
    </div>
  );
}
