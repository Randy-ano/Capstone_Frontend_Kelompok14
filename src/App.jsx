import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./auth/RequireAuth";
import Login from "./pages/Login";
import Daftar from "./pages/Daftar";
import DashboardRekapitulasi from "./pages/DashboardRekapitulasi";
import RekomendasiKandidat from "./pages/RekomendasiKandidat";
import PenempatanMonitoring from "./pages/PenempatanMonitoring";
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
          <Route path="pipeline-rekrutmen" element={<PipelineRekrutmen />} />
          <Route path="talent-pool" element={<TalentPool />} />
          <Route path="rekomendasi-kandidat" element={<RekomendasiKandidat />} />
          <Route path="profil-saya" element={<ProfilSaya />} />
          <Route path="penugasan-penempatan" element={<PenempatanMonitoring />} />
          <Route path="permintaan-kebutuhan" element={<PermintaanKebutuhan />} />
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Route>
    </Routes>
  );
}
