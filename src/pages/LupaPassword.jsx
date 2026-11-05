import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { IkonKiri, Isian, KartuTamu, PesanError, PesanSukses, TombolUtama, kelasInput, useJudulTab } from "../components/auth/AuthUi";

// Lupa password: kirim tautan reset ke email. Backend selalu membalas pesan yang sama (tidak membocorkan akun).
export default function LupaPassword() {
  useJudulTab("Lupa Password");
  const [email, setEmail] = useState("");
  const [sukses, setSukses] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await api("/auth/lupa-password", { method: "POST", body: { email } });
      setSukses(res.message);
    } catch (err) {
      // 422: email kosong/tidak valid; 429: terlalu banyak permintaan.
      setError(err.message);
      setFieldErrors(err.errors ?? {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KartuTamu
      judul="Lupa Password"
      keterangan="Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat password baru."
      bawah={
        <Link to="/login" className="inline-flex items-center gap-1 font-title-sm text-title-sm text-aksen hover:text-aksen-hover">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke halaman Masuk
        </Link>
      }
    >
      {sukses ? (
        <div className="space-y-space-md">
          <PesanSukses>{sukses}</PesanSukses>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Periksa kotak masuk email <strong className="text-on-surface break-all">{email}</strong>, termasuk folder spam. Tautan berlaku 60 menit dan hanya
            dapat dipakai sekali.
          </p>
          <button type="button" onClick={() => setSukses(null)} className="tombol-teks">
            Kirim ulang atau ganti email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-space-md">
          <PesanError>{error}</PesanError>
          <Isian label="Email Akun" error={fieldErrors.email}>
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
          <div className="pt-space-sm">
            <TombolUtama memproses={submitting}>
              Kirim Tautan Reset
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">send</span>
            </TombolUtama>
          </div>
        </form>
      )}
    </KartuTamu>
  );
}
