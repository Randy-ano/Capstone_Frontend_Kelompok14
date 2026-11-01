import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import RequireAuth, { MemuatSesi } from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthContext";
import BatasMuat from "./components/BatasMuat";
import Login from "./pages/Login";
import Daftar from "./pages/Daftar";

// Login & Daftar dimuat langsung; layout dan halaman lain dipecah per berkas agar unduhan awal kecil.
const AppLayout = lazy(() => import("./components/AppLayout"));
const CutiShift = lazy(() => import("./pages/CutiShift"));
const DashboardRekapitulasi = lazy(() => import("./pages/DashboardRekapitulasi"));
const Dokumen = lazy(() => import("./pages/Dokumen"));
const JadwalInterview = lazy(() => import("./pages/JadwalInterview"));
const KelolaPegawai = lazy(() => import("./pages/KelolaPegawai"));
const RekomendasiKandidat = lazy(() => import("./pages/RekomendasiKandidat"));
const Penempatan = lazy(() => import("./pages/Penempatan"));
const MasterDataSkill = lazy(() => import("./pages/MasterDataSkill"));
const MonitoringKinerja = lazy(() => import("./pages/MonitoringKinerja"));
const Notifikasi = lazy(() => import("./pages/Notifikasi"));
const PengajuanKandidat = lazy(() => import("./pages/PengajuanKandidat"));
const PermintaanKebutuhan = lazy(() => import("./pages/PermintaanKebutuhan"));
const PipelineRekrutmen = lazy(() => import("./pages/PipelineRekrutmen"));
const ProfilSaya = lazy(() => import("./pages/ProfilSaya"));
const TalentPool = lazy(() => import("./pages/TalentPool"));
const TiketKomplain = lazy(() => import("./pages/TiketKomplain"));
const TidakDitemukan = lazy(() => import("./pages/TidakDitemukan"));
const HalamanDepan = lazy(() => import("./pages/HalamanDepan"));
const PengaturanAkun = lazy(() => import("./pages/PengaturanAkun"));

// Alamat tak dikenal: pengguna login melihat 404 di dalam layout, tamu melihatnya tanpa layout (tidak dilempar ke halaman masuk).
function RuteTakDikenal() {
  const { user, loading } = useAuth();
  if (loading) return <MemuatSesi />;
  if (user) return <AppLayout isi={<TidakDitemukan />} judulIsi="Halaman tidak ditemukan" />;
  return (
    <div className="min-h-screen flex items-center bg-surface">
      <TidakDitemukan />
    </div>
  );
}

export default function App() {
  return (
    <BatasMuat>
      <Suspense fallback={<MemuatSesi />}>
        <Routes>
          <Route index element={<HalamanDepan />} />
          <Route path="login" element={<Login />} />
          <Route path="daftar" element={<Daftar />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="dashboard-rekapitulasi" element={<DashboardRekapitulasi />} />
              <Route path="master-data-skill" element={<MasterDataSkill />} />
              <Route path="pipeline-rekrutmen" element={<PipelineRekrutmen />} />
              <Route path="talent-pool" element={<TalentPool />} />
              <Route path="rekomendasi-kandidat" element={<RekomendasiKandidat />} />
              <Route path="profil-saya" element={<ProfilSaya />} />
              <Route path="penugasan-penempatan" element={<Penempatan />} />
              <Route path="pengajuan-kandidat" element={<PengajuanKandidat />} />
              <Route path="jadwal-interview" element={<JadwalInterview />} />
              <Route path="kelola-pegawai" element={<KelolaPegawai />} />
              <Route path="permintaan-kebutuhan" element={<PermintaanKebutuhan />} />
              <Route path="pengajuan-cuti-shift" element={<CutiShift />} />
              <Route path="monitoring-kinerja" element={<MonitoringKinerja />} />
              <Route path="tiket-komplain-klien" element={<TiketKomplain />} />
              <Route path="dokumen-quotation-po" element={<Dokumen />} />
              <Route path="notifikasi" element={<Notifikasi />} />
              <Route path="pengaturan-akun" element={<PengaturanAkun />} />
            </Route>
          </Route>
          <Route path="*" element={<RuteTakDikenal />} />
        </Routes>
      </Suspense>
    </BatasMuat>
  );
}
