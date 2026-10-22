import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { berandaFor } from "../data/navigation";
import { InputSandi, Isian, KakiHalaman, Merek, PesanError, TombolUtama, kelasInput } from "../components/auth/AuthUi";

// Jenis akun yang bisa mendaftar sendiri; `key` dipakai sebagai path endpoint /auth/register/{key}.
const JENIS_AKUN = [
  {
    key: "talent",
    label: "Saya Talent",
    info: "Sebagai Talent, Anda dapat melengkapi profil & kompetensi, membuat CV otomatis, dan direkomendasikan ke klien PT Intellisys setelah profil lengkap.",
  },
  {
    key: "hr-client",
    label: "Saya HR Perusahaan",
    info: "Perusahaan Anda terdaftar sebagai klien baru. Anda dapat mengajukan permintaan kebutuhan talent, meninjau kandidat, dan memantau penempatan.",
  },
];

// Field yang dikirim per jenis akun, sesuai RegisterTalentRequest & RegisterHrClientRequest di backend.
const FIELD_KIRIM = {
  talent: ["nama_lengkap", "email", "password", "password_confirmation"],
  "hr-client": [
    "nama_hr",
    "jabatan",
    "email",
    "password",
    "password_confirmation",
    "nama_perusahaan",
    "alamat",
    "no_telepon",
    "penanggung_jawab",
  ],
};

const WAJIB = {
  talent: { nama_lengkap: "Nama lengkap" },
  "hr-client": { nama_hr: "Nama HR", nama_perusahaan: "Nama perusahaan" },
};

const FORM_KOSONG = Object.fromEntries(FIELD_KIRIM["hr-client"].concat("nama_lengkap").map((f) => [f, ""]));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validasi ringan sebelum kirim; bentuknya sama dengan `errors` 422 backend ({ field: [pesan] }).
function validasi(jenis, form) {
  const errors = {};
  for (const [field, label] of Object.entries(WAJIB[jenis])) {
    if (!form[field].trim()) errors[field] = [`${label} wajib diisi.`];
  }
  if (!form.email.trim()) errors.email = ["Email wajib diisi."];
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = ["Format email tidak valid."];
  if (!form.password) errors.password = ["Password wajib diisi."];
  else if (form.password.length < 8) errors.password = ["Password minimal 8 karakter."];
  if (!form.password_confirmation) errors.password_confirmation = ["Konfirmasi password wajib diisi."];
  else if (form.password && form.password_confirmation !== form.password)
    errors.password_confirmation = ["Konfirmasi password tidak sama."];
  return errors;
}

export default function Daftar() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [jenis, setJenis] = useState("talent");
  const [form, setForm] = useState(FORM_KOSONG);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [lihatPassword, setLihatPassword] = useState(false);

  if (user) return <Navigate to={berandaFor(user.role)} replace />;

  function gantiJenis(key) {
    setJenis(key);
    setError(null);
    setFieldErrors({});
  }

  function ubah(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (fieldErrors[field]) setFieldErrors(({ [field]: _, ...sisa }) => sisa);
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const errorsLokal = validasi(jenis, form);
    setFieldErrors(errorsLokal);
    if (Object.keys(errorsLokal).length > 0) {
      setError("Periksa kembali isian yang ditandai.");
      return;
    }

    const data = Object.fromEntries(
      FIELD_KIRIM[jenis].map((f) => [f, f.startsWith("password") ? form[f] : form[f].trim()]),
    );

    setSubmitting(true);
    try {
      const baru = await register(jenis, data);
      navigate(berandaFor(baru.role), { replace: true });
    } catch (err) {
      // 422: validasi (mis. email sudah terdaftar); 0: backend mati.
      setError(err.message);
      setFieldErrors(err.errors ?? {});
      setSubmitting(false);
    }
  }

  const input = (field, props = {}) => (
    <input
      className={kelasInput(fieldErrors[field])}
      value={form[field]}
      onChange={ubah(field)}
      {...props}
    />
  );

  const password = (field, props) => (
    <InputSandi
      error={fieldErrors[field]}
      terlihat={lihatPassword}
      onToggle={() => setLihatPassword((v) => !v)}
      value={form[field]}
      onChange={ubah(field)}
      autoComplete="new-password"
      {...props}
    />
  );

  const bagianAkun = (
    <>
      <Isian label={jenis === "talent" ? "Email Utama" : "Email Kerja"} wajib error={fieldErrors.email}>
        {input("email", { type: "email", autoComplete: "email", placeholder: jenis === "talent" ? "nama@email.com" : "nama@perusahaan.com" })}
      </Isian>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Isian label="Kata Sandi" wajib error={fieldErrors.password}>
          {password("password", { placeholder: "Minimal 8 karakter" })}
        </Isian>
        <Isian label="Konfirmasi Sandi" wajib error={fieldErrors.password_confirmation}>
          {password("password_confirmation", { placeholder: "Ulangi kata sandi" })}
        </Isian>
      </div>
    </>
  );

  const infoJenis = JENIS_AKUN.find((j) => j.key === jenis).info;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center px-space-md py-space-xl">
      <header className="w-full max-w-2xl flex">
        <Merek />
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-2xl mt-space-xl bg-surface-container-lowest rounded-2xl border border-aksen/15 shadow-sm px-space-md py-space-xl sm:px-space-xl md:px-12 space-y-space-lg"
      >
        <div className="text-center space-y-space-sm">
          <h1 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface">Daftar Akun Baru</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Sudah memiliki akun?{" "}
            <Link to="/login" className="font-title-md text-title-md text-aksen hover:underline">
              Masuk ke akun
            </Link>
          </p>
        </div>

        <div role="tablist" aria-label="Jenis akun" className="grid grid-cols-2 gap-1 p-1 rounded-xl border border-outline-variant/60 bg-surface-container-low">
          {JENIS_AKUN.map((j) => (
            <button
              key={j.key}
              type="button"
              role="tab"
              aria-selected={jenis === j.key}
              onClick={() => gantiJenis(j.key)}
              className={`h-11 rounded-lg px-space-sm font-title-sm text-title-sm transition-all truncate ${
                jenis === j.key ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {j.label}
            </button>
          ))}
        </div>

        <PesanError>{error}</PesanError>

        {jenis === "talent" ? (
          <div className="space-y-space-md">
            <Isian label="Nama Lengkap" wajib error={fieldErrors.nama_lengkap}>
              {input("nama_lengkap", { autoComplete: "name", placeholder: "Masukkan nama lengkap Anda", autoFocus: true })}
            </Isian>
            {bagianAkun}
          </div>
        ) : (
          <>
            <fieldset className="space-y-space-md">
              <legend className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-sm">Data Anda</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <Isian label="Nama HR" wajib error={fieldErrors.nama_hr}>
                  {input("nama_hr", { autoComplete: "name", placeholder: "Masukkan nama Anda", autoFocus: true })}
                </Isian>
                <Isian label="Jabatan" error={fieldErrors.jabatan}>
                  {input("jabatan", { autoComplete: "organization-title", placeholder: "HR Manager" })}
                </Isian>
              </div>
              {bagianAkun}
            </fieldset>

            <fieldset className="space-y-space-md pt-space-md border-t border-surface-container">
              <legend className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-sm">Data Perusahaan</legend>
              <Isian label="Nama Perusahaan" wajib error={fieldErrors.nama_perusahaan}>
                {input("nama_perusahaan", { autoComplete: "organization", placeholder: "PT Maju Jaya" })}
              </Isian>
              <Isian label="Alamat" error={fieldErrors.alamat}>
                <textarea
                  className={`${kelasInput(fieldErrors.alamat)} h-auto py-3 min-h-[88px] resize-y`}
                  rows={3}
                  value={form.alamat}
                  onChange={ubah("alamat")}
                  autoComplete="street-address"
                  placeholder="Jl. Jend. Sudirman No. 21, Jakarta Selatan"
                />
              </Isian>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <Isian label="No. Telepon" error={fieldErrors.no_telepon}>
                  {input("no_telepon", { type: "tel", autoComplete: "tel", placeholder: "021-5550101" })}
                </Isian>
                <Isian label="Penanggung Jawab" error={fieldErrors.penanggung_jawab}>
                  {input("penanggung_jawab", { placeholder: "Nama penanggung jawab" })}
                </Isian>
              </div>
            </fieldset>
          </>
        )}

        <div className="flex items-start gap-space-sm p-space-md rounded-xl border border-primary-fixed bg-surface-container-low">
          <span className="material-symbols-outlined text-[20px] text-aksen">info</span>
          <p className="font-body-md text-body-md text-on-surface-variant">{infoJenis}</p>
        </div>

        <TombolUtama memproses={submitting}>
          Daftar Akun
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </TombolUtama>
      </form>

      <KakiHalaman className="mt-space-xl text-center" />
    </div>
  );
}
