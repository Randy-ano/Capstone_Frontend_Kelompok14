import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./auth/RequireAuth";
import Login from "./pages/Login";
import Daftar from "./pages/Daftar";
import DashboardRekapitulasi from "./pages/DashboardRekapitulasi";
import JadwalInterview from "./pages/JadwalInterview";
import KelolaPegawai from "./pages/KelolaPegawai";
import RekomendasiKandidat from "./pages/RekomendasiKandidat";
import Penempatan from "./pages/Penempatan";
import MasterDataSkill from "./pages/MasterDataSkill";
import PengajuanKandidat from "./pages/PengajuanKandidat";
import PermintaanKebutuhan from "./pages/PermintaanKebutuhan";
import PipelineRekrutmen from "./pages/PipelineRekrutmen";
import ProfilSaya from "./pages/ProfilSaya";
import TalentPool from "./pages/TalentPool";
import ComingSoon from "./pages/ComingSoon";

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="daftar" element={<Daftar />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard-rekapitulasi" replace />} />
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
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Route>
    </Routes>
  );
}
