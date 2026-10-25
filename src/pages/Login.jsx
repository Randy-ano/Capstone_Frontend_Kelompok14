import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABEL } from "../auth/roles";
import { IkonKiri, InputSandi, Isian, KakiHalaman, Merek, PesanError, TombolUtama, kelasInput, useJudulTab } from "../components/auth/AuthUi";

// Akun demo dari seeder backend (password semuanya "password"); hanya tampil saat development.
const AKUN_DEMO = [
  { email: "manager@intellisys.test", role: "manager" },
  { email: "am@intellisys.test", role: "account_manager" },
  { email: "ts@intellisys.test", role: "talent_support" },
  { email: "hr@intellisys.test", role: "hr_client" },
  { email: "talent@intellisys.test", role: "talent" },
];

// Mockup Stitch "Masuk - Varian 1 (Clean Enterprise Minimalist)": kartu di tengah dengan latar pola titik.
export default function Login() {
  const { user, login } = useAuth();
  useJudulTab("Masuk");
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ingat, setIngat] = useState(true);
  const [lihatSandi, setLihatSandi] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const tujuan = location.state?.from ?? "/dashboard-rekapitulasi";

  if (user) return <Navigate to={tujuan} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await login(email, password, ingat);
      navigate(tujuan, { replace: true });
    } catch (err) {
      // 422: email/password salah atau kosong; 403: akun nonaktif; 0: backend mati.
      setError(err.message);
      setFieldErrors(err.errors ?? {});
    } finally {
      setSubmitting(false);
    }
  }

  function pakaiAkunDemo(akun) {
    setEmail(akun.email);
    setPassword("password");
    setError(null);
    setFieldErrors({});
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-b from-surface to-surface-container-low">
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{ backgroundImage: "radial-gradient(rgba(148, 163, 184, 0.28) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />
      <div aria-hidden="true" className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-aksen-container blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-surface-container-high/60 blur-3xl pointer-events-none" />

      <main className="relative flex-1 flex flex-col items-center justify-center px-space-md py-space-xl gap-space-lg">
        <div className="w-full max-w-[460px] bg-surface-container-lowest rounded-2xl border border-outline-variant/50 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] p-space-lg sm:p-9">
          <div className="text-center mb-space-xl">
            <Merek tengah />
            <h1 className="mt-space-lg font-headline-md text-headline-md text-on-surface">Masuk ke Akun Anda</h1>
            <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">Akses terintegrasi pengelolaan talenta dan operasional.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-space-md">
            <PesanError>{error}</PesanError>

            <Isian label="Email Perusahaan / Akun" error={fieldErrors.email}>
              <div className="relative">
                <IkonKiri ikon="mail" />
                <input
                  className={`${kelasInput(fieldErrors.email)} pl-11`}
                  type="email"
                  autoComplete="email"
                  placeholder="nama@perusahaan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </Isian>

            <Isian label="Kata Sandi" error={fieldErrors.password}>
              <InputSandi
                ikon="lock"
                error={fieldErrors.password}
                terlihat={lihatSandi}
                onToggle={() => setLihatSandi((v) => !v)}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Isian>

            <label className="flex items-center gap-space-sm w-fit cursor-pointer select-none">
              <input type="checkbox" checked={ingat} onChange={(e) => setIngat(e.target.checked)} className="w-4 h-4 rounded accent-aksen" />
              <span className="font-body-md text-body-md text-on-surface-variant">Ingat saya</span>
            </label>

            <div className="pt-space-sm">
              <TombolUtama memproses={submitting}>
                Masuk ke Platform
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </TombolUtama>
            </div>
          </form>

          <div className="mt-space-lg pt-space-md border-t border-surface-container text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Belum memiliki akun?{" "}
              <Link to="/daftar" className="font-title-sm text-title-sm text-aksen hover:text-aksen-hover">
                Daftar Akun
              </Link>
            </p>
          </div>
        </div>

        {import.meta.env.DEV && (
          <div className="w-full max-w-[460px] rounded-xl border border-outline-variant/60 bg-surface-container-lowest/80 p-space-md space-y-space-sm">
            <div className="flex items-center justify-between gap-space-sm">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Akun demo (development)</span>
              <span className="font-body-sm text-body-sm text-outline">password: password</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {AKUN_DEMO.map((akun) => (
                <button
                  key={akun.email}
                  type="button"
                  onClick={() => pakaiAkunDemo(akun)}
                  className="flex items-center justify-between gap-space-sm px-space-sm py-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-left"
                >
                  <span className="font-body-md text-body-md text-on-surface truncate">{akun.email}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">{ROLE_LABEL[akun.role]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="relative w-full px-space-lg py-space-lg text-center border-t border-outline-variant/40 bg-surface-container-lowest/40 backdrop-blur-sm">
        <KakiHalaman />
      </footer>
    </div>
  );
}
