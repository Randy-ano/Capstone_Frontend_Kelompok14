import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABEL } from "../auth/roles";
import { InputSandi, Isian, KakiHalaman, Merek, PanelFitur, PesanError, TombolUtama, kelasInput } from "../components/auth/AuthUi";

// Akun demo dari seeder backend (password semuanya "password"); hanya tampil saat development.
const AKUN_DEMO = [
  { email: "manager@intellisys.test", role: "manager" },
  { email: "am@intellisys.test", role: "account_manager" },
  { email: "ts@intellisys.test", role: "talent_support" },
  { email: "hr@intellisys.test", role: "hr_client" },
  { email: "talent@intellisys.test", role: "talent" },
];

export default function Login() {
  const { user, login } = useAuth();
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
    <div className="min-h-screen bg-surface-container-lowest grid lg:grid-cols-[46%_1fr]">
      <main className="flex flex-col px-space-md sm:px-16 xl:px-24 py-space-xl">
        <Merek />

        <div className="flex-1 flex flex-col justify-center w-full max-w-md py-space-xl">
          <h1 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface">Masuk ke Akun</h1>
          <p className="mt-space-sm font-body-lg text-body-lg text-on-surface-variant">
            Belum punya akun?{" "}
            <Link to="/daftar" className="font-title-md text-title-md text-aksen hover:underline">
              Daftar sekarang
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-space-xl space-y-space-md">
            <PesanError>{error}</PesanError>

            <Isian label="Email" error={fieldErrors.email}>
              <input
                className={kelasInput(fieldErrors.email)}
                type="email"
                autoComplete="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Isian>

            <Isian label="Kata Sandi" error={fieldErrors.password}>
              <InputSandi
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
              <TombolUtama memproses={submitting}>Masuk ke Platform</TombolUtama>
            </div>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-space-xl rounded-xl border border-outline-variant p-space-md space-y-space-sm">
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
        </div>

        <KakiHalaman className="pt-space-lg border-t border-surface-container max-w-md" />
      </main>

      <PanelFitur />
    </div>
  );
}
