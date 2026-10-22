import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABEL, displayUser } from "../auth/roles";
import { KepalaHalaman, Pesan, errorField } from "../components/ui";

const FORM_KOSONG = { password_lama: "", password: "", password_confirmation: "" };

const kelasInput = (error) =>
  `w-full h-10 pl-3 pr-10 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 transition-all ${
    error ? "ring-2 ring-error focus:ring-error" : "focus:ring-primary-container"
  }`;

// Pengaturan Akun (semua role): informasi akun dan ubah password (PUT /auth/password).
export default function PengaturanAkun() {
  const { user } = useAuth();
  const { nama, keterangan } = displayUser(user);
  const [form, setForm] = useState(FORM_KOSONG);
  const [terlihat, setTerlihat] = useState(false);
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const [sukses, setSukses] = useState("");

  const ubah = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function simpan(event) {
    event.preventDefault();
    setKirim(true);
    setError(null);
    setSukses("");
    try {
      const res = await api("/auth/password", { method: "PUT", body: form });
      setSukses(res.message);
      setForm(FORM_KOSONG);
    } catch (err) {
      setError(err);
    } finally {
      setKirim(false);
    }
  }

  const isian = (field, label, keteranganIsian, autoComplete) => (
    <label className="block space-y-1">
      <span className="font-label-lg text-label-lg text-on-surface">{label}</span>
      <div className="relative">
        <input
          className={kelasInput(errorField(error, field))}
          type={terlihat ? "text" : "password"}
          autoComplete={autoComplete}
          value={form[field]}
          onChange={ubah(field)}
          required
        />
        <button
          type="button"
          onClick={() => setTerlihat((v) => !v)}
          aria-label={terlihat ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">{terlihat ? "visibility_off" : "visibility"}</span>
        </button>
      </div>
      {errorField(error, field) ? (
        <span className="block font-body-sm text-body-sm text-error">{errorField(error, field)}</span>
      ) : (
        keteranganIsian && <span className="block font-body-sm text-body-sm text-on-surface-variant">{keteranganIsian}</span>
      )}
    </label>
  );

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="settings" kategori="Pengaturan" judul="Pengaturan Akun">
        Informasi akun Anda dan penggantian password.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-space-lg items-start">
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-lg space-y-space-md">
          <h2 className="font-title-md text-title-md text-on-surface">Informasi Akun</h2>
          <dl className="space-y-space-sm">
            {[
              ["Nama", nama],
              ["Email", user.email],
              ["Peran", ROLE_LABEL[user.role]],
              ["Keterangan", keterangan],
            ]
              .filter(([label, isi]) => isi && !(label === "Keterangan" && isi === ROLE_LABEL[user.role]))
              .map(([label, isi]) => (
                <div key={label}>
                  <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</dt>
                  <dd className="font-body-md text-body-md text-on-surface break-words">{isi}</dd>
                </div>
              ))}
          </dl>
        </section>

        <form onSubmit={simpan} noValidate className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md sm:p-space-lg space-y-space-md">
          <div>
            <h2 className="font-title-md text-title-md text-on-surface">Ubah Password</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Setelah password diganti, sesi di perangkat lain otomatis keluar. Sesi di perangkat ini tetap aktif.
            </p>
          </div>
          {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}
          {error && !error.errors && <Pesan>{error.message}</Pesan>}
          {isian("password_lama", "Password lama", null, "current-password")}
          {isian("password", "Password baru", "Minimal 8 karakter dan berbeda dari password lama.", "new-password")}
          {isian("password_confirmation", "Konfirmasi password baru", null, "new-password")}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={kirim}
              className="flex items-center gap-1.5 h-10 px-5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">{kirim ? "progress_activity" : "lock_reset"}</span>
              {kirim ? "Menyimpan..." : "Simpan Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
