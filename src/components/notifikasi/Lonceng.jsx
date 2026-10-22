import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../auth/AuthContext";
import { infoTipe, waktuRelatif } from "./shared";

const INTERVAL_MS = 60_000;

// Lonceng notifikasi di header: badge jumlah belum dibaca (diperbarui tiap menit & tiap pindah halaman)
// dan dropdown 8 notifikasi terbaru (FR-16).
export default function Lonceng() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [jumlah, setJumlah] = useState(0);
  const [buka, setBuka] = useState(false);
  const [daftar, setDaftar] = useState(null);
  const [error, setError] = useState("");
  const ref = useRef(null);

  const muatJumlah = useCallback(() => {
    api("/notifikasi/belum-dibaca/jumlah")
      .then((res) => setJumlah(res.data.jumlah))
      .catch(() => {});
  }, []);

  useEffect(() => {
    muatJumlah();
    const t = setInterval(muatJumlah, INTERVAL_MS);
    return () => clearInterval(t);
  }, [muatJumlah, pathname]);

  useEffect(() => {
    if (!buka) return;
    setError("");
    api("/notifikasi?per_page=8")
      .then((res) => setDaftar(res.data))
      .catch((err) => setError(err.message));
    const tutup = (e) => !ref.current?.contains(e.target) && setBuka(false);
    const esc = (e) => e.key === "Escape" && setBuka(false);
    document.addEventListener("mousedown", tutup);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", tutup);
      document.removeEventListener("keydown", esc);
    };
  }, [buka]);

  async function bukaNotifikasi(n) {
    setBuka(false);
    if (!n.status_baca) {
      await api(`/notifikasi/${n.id_notifikasi}/baca`, { method: "PATCH" }).catch(() => {});
      muatJumlah();
    }
    const tujuan = infoTipe(n.tipe_notifikasi, user.role).path;
    if (tujuan) navigate(tujuan);
  }

  async function bacaSemua() {
    await api("/notifikasi/baca-semua", { method: "PATCH" }).catch(() => {});
    setDaftar((l) => l?.map((n) => ({ ...n, status_baca: true })));
    setJumlah(0);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        title="Notifikasi"
        aria-expanded={buka}
        aria-label={jumlah ? `Notifikasi, ${jumlah} belum dibaca` : "Notifikasi"}
        className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {jumlah > 0 && (
          <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-error text-on-error font-label-sm text-[10px] flex items-center justify-center font-bold">
            {jumlah > 99 ? "99+" : jumlah}
          </span>
        )}
      </button>

      {buka && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-96 bg-surface-container-lowest rounded-xl shadow-lg ring-1 ring-surface-container-high z-50 overflow-hidden">
          <div className="flex items-center justify-between px-space-md py-space-sm border-b border-surface-container-high">
            <span className="font-title-sm text-title-sm text-on-surface">Notifikasi</span>
            {jumlah > 0 && (
              <button type="button" onClick={bacaSemua} className="font-label-md text-label-md text-primary hover:underline">
                Tandai semua dibaca
              </button>
            )}
          </div>
          <ul className="max-h-[60vh] overflow-y-auto divide-y divide-surface-container-low">
            {error && <li className="px-space-md py-space-md font-body-sm text-body-sm text-error">{error}</li>}
            {!daftar && !error && <li className="px-space-md py-space-md font-body-sm text-body-sm text-on-surface-variant">Memuat...</li>}
            {daftar?.length === 0 && <li className="px-space-md py-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">Belum ada notifikasi.</li>}
            {daftar?.map((n) => (
              <li key={n.id_notifikasi}>
                <button
                  type="button"
                  onClick={() => bukaNotifikasi(n)}
                  className={`w-full text-left flex gap-space-sm px-space-md py-space-sm hover:bg-surface-container-low ${n.status_baca ? "" : "bg-primary-fixed/30"}`}
                >
                  <span className="w-8 h-8 shrink-0 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">{infoTipe(n.tipe_notifikasi, user.role).ikon}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block font-body-sm text-body-sm ${n.status_baca ? "text-on-surface-variant" : "text-on-surface font-medium"}`}>{n.pesan}</span>
                    <span className="block font-label-sm text-label-sm text-outline mt-0.5">
                      {waktuRelatif(n.dibuat_pada)}
                      {n.kanal === "email" && " · email"}
                    </span>
                  </span>
                  {!n.status_baca && <span className="w-2 h-2 mt-1.5 shrink-0 rounded-full bg-primary" aria-label="Belum dibaca" />}
                </button>
              </li>
            ))}
          </ul>
          <Link to="/notifikasi" onClick={() => setBuka(false)} className="block text-center px-space-md py-space-sm border-t border-surface-container-high font-label-md text-label-md text-primary hover:bg-surface-container-low">
            Lihat semua notifikasi
          </Link>
        </div>
      )}
    </div>
  );
}
