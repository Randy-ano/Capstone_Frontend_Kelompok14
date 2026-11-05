import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { InputSandi, Isian, KartuTamu, PesanError, TombolUtama, useJudulTab } from "../components/auth/AuthUi";

// Reset password dari tautan email: /reset-password?token=...&email=...
// Berhasil → ke halaman Masuk dengan pesan sukses dan email terisi.
export default function ResetPassword() {
  useJudulTab("Reset Password");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [lihatSandi, setLihatSandi] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await api("/auth/reset-password", {
        method: "POST",
        body: { email, token, password, password_confirmation: konfirmasi },
      });
      navigate("/login", { replace: true, state: { pesanSukses: res.message, email } });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors ?? {});
    } finally {
      setSubmitting(false);
    }
  }

  const kembali = (
    <Link to="/login" className="inline-flex items-center gap-1 font-title-sm text-title-sm text-aksen hover:text-aksen-hover">
      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
      Kembali ke halaman Masuk
    </Link>
  );

  if (!token || !email) {
    return (
      <KartuTamu judul="Reset Password" bawah={kembali}>
        <div className="space-y-space-md">
          <PesanError>Tautan reset password tidak lengkap. Buka tautan dari email Anda, atau minta tautan baru.</PesanError>
          <Link to="/lupa-password" className="tombol-kedua w-full">
            Minta tautan baru
          </Link>
        </div>
      </KartuTamu>
    );
  }

  // Token salah/kedaluwarsa dikirim backend di field `token`: tawarkan minta tautan baru.
  const tokenSalah = Boolean(fieldErrors.token);

  return (
    <KartuTamu judul="Buat Password Baru" keterangan="Password baru minimal 8 karakter. Setelah berhasil, Anda keluar dari semua perangkat." bawah={kembali}>
      <form onSubmit={handleSubmit} noValidate className="space-y-space-md">
        <PesanError>{error}</PesanError>
        {tokenSalah && (
          <Link to="/lupa-password" className="tombol-kedua w-full">
            Minta tautan baru
          </Link>
        )}

        <div className="space-y-1.5">
          <span className="block font-label-lg text-label-lg text-on-surface tracking-wide">Email Akun</span>
          <p className="h-12 px-4 flex items-center rounded-lg bg-surface-container font-body-lg text-body-lg text-on-surface-variant break-all">{email}</p>
          {fieldErrors.email && <span className="block font-body-sm text-body-sm text-error">{fieldErrors.email[0]}</span>}
        </div>

        <Isian label="Password Baru" error={fieldErrors.password}>
          <InputSandi
            ikon="lock"
            error={fieldErrors.password}
            terlihat={lihatSandi}
            onToggle={() => setLihatSandi((v) => !v)}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </Isian>

        <Isian label="Konfirmasi Password Baru">
          <InputSandi
            ikon="lock_reset"
            terlihat={lihatSandi}
            onToggle={() => setLihatSandi((v) => !v)}
            autoComplete="new-password"
            placeholder="Ulangi password baru"
            value={konfirmasi}
            onChange={(e) => setKonfirmasi(e.target.value)}
            required
          />
        </Isian>

        <div className="pt-space-sm">
          <TombolUtama memproses={submitting}>
            Simpan Password Baru
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">check</span>
          </TombolUtama>
        </div>
      </form>
    </KartuTamu>
  );
}
