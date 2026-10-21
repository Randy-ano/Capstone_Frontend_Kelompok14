import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { berandaFor } from "../data/navigation";

// Jenis akun yang bisa mendaftar sendiri; `key` dipakai sebagai path endpoint /auth/register/{key}.
const JENIS_AKUN = [
  { key: "talent", label: "Saya Talent", icon: "person" },
  { key: "hr-client", label: "Saya HR Perusahaan", icon: "apartment" },
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

const inputClass = (error) =>
  `w-full px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 transition-all ${
    error ? "ring-2 ring-error focus:ring-error" : "focus:ring-primary-container"
  }`;

function Field({ label, wajib, error, children }) {
  return (
    <label className="block space-y-1">
      <span className="font-label-lg text-label-lg text-on-surface">
        {label}
        {wajib && <span className="text-error"> *</span>}
      </span>
      {children}
      {error && <span className="block font-body-sm text-body-sm text-error">{error[0]}</span>}
    </label>
  );
}

function PasswordInput({ error, terlihat, onToggle, ...props }) {
  return (
    <div className="relative">
      <input className={`${inputClass(error)} h-10 pr-10`} type={terlihat ? "text" : "password"} {...props} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={terlihat ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[20px]">{terlihat ? "visibility_off" : "visibility"}</span>
      </button>
    </div>
  );
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
      className={`${inputClass(fieldErrors[field])} h-10`}
      value={form[field]}
      onChange={ubah(field)}
      {...props}
    />
  );

  const password = (field, props) => (
    <PasswordInput
      error={fieldErrors[field]}
      terlihat={lihatPassword}
      onToggle={() => setLihatPassword((v) => !v)}
      value={form[field]}
      onChange={ubah(field)}
      autoComplete="new-password"
      placeholder="••••••••"
      {...props}
    />
  );

  const bagianAkun = (
    <>
      <Field label="Email" wajib error={fieldErrors.email}>
        {input("email", { type: "email", autoComplete: "email", placeholder: "nama@perusahaan.com" })}
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Field label="Password" wajib error={fieldErrors.password}>
          {password("password")}
        </Field>
        <Field label="Konfirmasi Password" wajib error={fieldErrors.password_confirmation}>
          {password("password_confirmation")}
        </Field>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant -mt-space-sm">Minimal 8 karakter.</p>
    </>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-space-md py-space-xl">
      <div className="w-full max-w-lg space-y-space-lg">
        <div className="flex items-center gap-space-sm justify-center">
          <img alt="Intellisys Talent Hub Logo" className="h-10 w-auto object-contain" src="/logo.jpg" />
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-primary tracking-tight">Intellisys Talent Hub</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">PT Intellisys IT Outsourcing</span>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-xl space-y-space-md"
        >
          <div className="space-y-1">
            <h1 className="font-headline-sm text-headline-sm text-on-surface">Buat akun baru</h1>
            <p className="font-body-md text-body-md text-secondary">Pilih jenis akun, lalu lengkapi data Anda.</p>
          </div>

          <div role="tablist" aria-label="Jenis akun" className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-surface-container-low">
            {JENIS_AKUN.map((j) => (
              <button
                key={j.key}
                type="button"
                role="tab"
                aria-selected={jenis === j.key}
                onClick={() => gantiJenis(j.key)}
                className={`h-9 flex items-center justify-center gap-1.5 rounded-md px-space-sm font-label-lg text-label-lg transition-all ${
                  jenis === j.key
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{j.icon}</span>
                <span className="truncate">{j.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-space-sm p-space-sm rounded-lg bg-error-container text-on-error-container font-body-md text-body-md">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {jenis === "talent" ? (
            <>
              <Field label="Nama Lengkap" wajib error={fieldErrors.nama_lengkap}>
                {input("nama_lengkap", { autoComplete: "name", placeholder: "Budi Santoso", autoFocus: true })}
              </Field>
              {bagianAkun}
            </>
          ) : (
            <>
              <fieldset className="space-y-space-md">
                <legend className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-sm">
                  Data Anda
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <Field label="Nama HR" wajib error={fieldErrors.nama_hr}>
                    {input("nama_hr", { autoComplete: "name", placeholder: "Sari Wulandari", autoFocus: true })}
                  </Field>
                  <Field label="Jabatan" error={fieldErrors.jabatan}>
                    {input("jabatan", { autoComplete: "organization-title", placeholder: "HR Manager" })}
                  </Field>
                </div>
                {bagianAkun}
              </fieldset>

              <div aria-hidden="true" className="border-t border-surface-container" />
              <fieldset className="space-y-space-md">
                <legend className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-sm">
                  Data Perusahaan
                </legend>
                <Field label="Nama Perusahaan" wajib error={fieldErrors.nama_perusahaan}>
                  {input("nama_perusahaan", { autoComplete: "organization", placeholder: "PT Maju Jaya" })}
                </Field>
                <Field label="Alamat" error={fieldErrors.alamat}>
                  <textarea
                    className={`${inputClass(fieldErrors.alamat)} py-2 min-h-[80px] resize-y`}
                    rows={3}
                    value={form.alamat}
                    onChange={ubah("alamat")}
                    autoComplete="street-address"
                    placeholder="Jl. Jend. Sudirman No. 21, Jakarta Selatan"
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <Field label="No. Telepon" error={fieldErrors.no_telepon}>
                    {input("no_telepon", { type: "tel", autoComplete: "tel", placeholder: "021-5550101" })}
                  </Field>
                  <Field label="Penanggung Jawab" error={fieldErrors.penanggung_jawab}>
                    {input("penanggung_jawab", { placeholder: "Rudi Hartanto" })}
                  </Field>
                </div>
              </fieldset>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            {submitting ? "Memproses..." : "Daftar"}
          </button>

          <p className="text-center font-body-md text-body-md text-secondary">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-label-lg text-label-lg text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
