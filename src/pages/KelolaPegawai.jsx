import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { INTERNAL, ROLE_LABEL } from "../auth/roles";
import { useToast } from "../components/toast";
import { Modal } from "../components/dialog";
import { Badge, BarisKosong, BarisMemuat, KepalaHalaman, KotakCari, Pagination, Pesan, PilihFilter, Sel, TabelKartu, errorField, useTunda, Proses } from "../components/ui";

const PER_PAGE = 15;
const OPSI_ROLE = INTERNAL.map((r) => [r, ROLE_LABEL[r]]);

// Halaman Kelola Akun Pegawai (FR-02, R2–R3) — khusus Manager.
// Akun internal (AM, TS, Manager) dibuat & diubah di sini; menonaktifkan akun langsung mengakhiri sesinya.
export default function KelolaPegawai() {
  const { user } = useAuth();
  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);

  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();
  const [form, setForm] = useState(null); // null | { pegawai: null } (tambah) | { pegawai } (ubah)

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (search) params.set("search", search);
    if (role) params.set("role", role);

    setMemuat(true);
    setError("");
    api(`/pegawai?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message))
      .finally(() => !batal && setMemuat(false));
    return () => {
      batal = true;
    };
  }, [search, role, page, versi]);

  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);
  const tutupForm = useCallback(() => setForm(null), []);
  const adaFilter = Boolean(search || role);

  function berhasil(pesan) {
    setForm(null);
    setError("");
    toast.sukses(pesan);
    muatUlang();
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman
        ikon="manage_accounts"
        kategori="Pengaturan"
        judul="Kelola Akun Pegawai"
        aksi={
          <button
            type="button"
            onClick={() => setForm({ pegawai: null })}
            className="tombol-utama w-full md:w-auto"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">person_add</span>
            Tambah Pegawai
          </button>
        }
      >
        Akun internal PT Intellisys IT Outsourcing (Account Manager, Talent Support, Manager). Akun yang dinonaktifkan tidak dapat masuk dan sesinya langsung berakhir.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="kartu p-space-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <KotakCari value={cari} onChange={setCari} placeholder="Cari nama atau email..." />
          <PilihFilter
            ikon="badge"
            label="Role"
            value={role}
            onChange={(nilai) => {
              setRole(nilai);
              setPage(1);
            }}
            semua="Semua Role"
            opsi={OPSI_ROLE}
          />
          {adaFilter && (
            <button
              type="button"
              onClick={() => {
                setCari("");
                setRole("");
                setPage(1);
              }}
              className="tombol-teks"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Reset
            </button>
          )}
        </div>

        {error && <Pesan>{error}</Pesan>}

        <div className="kartu overflow-hidden">
          <TabelKartu kolom={["Nama", "Email", "Role", "No. Telepon", "Status", { label: "Aksi", className: "aksi" }]} className="md:min-w-[760px]" redup={memuat && hasil}>
            {!hasil && memuat && <BarisMemuat kolom={6} />}
            {hasil?.data.length === 0 && (
              <BarisKosong kolom={6} ikon="manage_accounts">
                {adaFilter ? "Tidak ada pegawai yang cocok dengan pencarian atau filter." : "Belum ada pegawai."}
              </BarisKosong>
            )}
            {hasil?.data.map((p) => (
              <BarisPegawai
                key={p.id_pegawai}
                pegawai={p}
                diriSendiri={p.akun.id_user === user.id_user}
                onUbah={() => setForm({ pegawai: p })}
                onStatus={berhasil}
                onError={setError}
              />
            ))}
          </TabelKartu>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="pegawai" />}
        </div>
      </div>

      {form && <FormPegawai pegawai={form.pegawai} onClose={tutupForm} onSaved={berhasil} />}
    </div>
  );
}

function BarisPegawai({ pegawai: p, diriSendiri, onUbah, onStatus, onError }) {
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [kirim, setKirim] = useState(false);
  const aktif = p.akun.status_aktif;

  async function ubahStatus() {
    setKirim(true);
    try {
      const res = await api(`/users/${p.akun.id_user}/status`, { method: "PATCH", body: { status_aktif: !aktif } });
      onStatus(`${res.message} (${p.nama_pegawai})`);
    } catch (err) {
      onError(err.message);
    } finally {
      // Baris tetap terpasang setelah daftar dimuat ulang, jadi mode konfirmasi harus ditutup di sini.
      setKirim(false);
      setKonfirmasi(false);
    }
  }


  return (
    <tr className="hover:bg-surface-container-low transition-colors">
      <Sel peran="judul">
        <span className="block font-title-sm text-title-sm text-on-surface">
          {p.nama_pegawai} {diriSendiri && <span className="font-label-sm text-label-sm text-primary">(Anda)</span>}
        </span>
        <span className="block font-body-sm text-body-sm text-on-surface-variant">{p.jabatan}</span>
      </Sel>
      <Sel label="Email" className="text-on-surface-variant break-all">{p.akun.email}</Sel>
      <Sel peran="setengah" label="Role">
        <Badge className="bg-secondary-container text-on-secondary-fixed">{ROLE_LABEL[p.akun.role] ?? p.akun.role}</Badge>
      </Sel>
      <Sel peran="setengah" label="No. Telepon" className="text-on-surface-variant">{p.no_telepon ?? <span className="text-outline">-</span>}</Sel>
      <Sel peran="status">
        <Badge className={aktif ? "bg-tertiary-fixed text-on-tertiary-fixed-variant" : "bg-error-container text-on-error-container"}>{aktif ? "Aktif" : "Nonaktif"}</Badge>
      </Sel>
      <Sel peran="aksi">
        {konfirmasi ? (
          <div className="flex items-center justify-end gap-1">
            <span className="font-body-sm text-body-sm text-on-surface-variant mr-1">{aktif ? "Nonaktifkan?" : "Aktifkan?"}</span>
            <button type="button" onClick={() => setKonfirmasi(false)} disabled={kirim} className="tombol-kedua">
              Tidak
            </button>
            <button type="button" onClick={ubahStatus} disabled={kirim} className={aktif ? "tombol-bahaya" : "tombol-utama"}>
              <Proses aktif={kirim}>Ya</Proses>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            <button type="button" onClick={onUbah} className="tombol-kedua">
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">edit</span>
              Ubah
            </button>
            {!diriSendiri && (
              <button
                type="button"
                onClick={() => setKonfirmasi(true)}
                className={aktif ? "tombol-bahaya-garis" : "tombol-kedua"}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">{aktif ? "block" : "check_circle"}</span>
                {aktif ? "Nonaktifkan" : "Aktifkan"}
              </button>
            )}
          </div>
        )}
      </Sel>
    </tr>
  );
}

const inputClass = (error) => `input ${error ? "input-error" : ""}`;

function Field({ label, wajib, error, keterangan, children }) {
  return (
    <label className="block space-y-1">
      <span className="font-label-md text-label-md text-on-surface">
        {label} {wajib && <span className="text-error">*</span>}
      </span>
      {children}
      {keterangan && !error && <span className="block font-body-sm text-body-sm text-on-surface-variant">{keterangan}</span>}
      {error && <span className="block font-body-sm text-body-sm text-error">{error}</span>}
    </label>
  );
}

// Modal tambah (POST /pegawai) atau ubah (PUT /pegawai/{id}). Saat ubah, password hanya dikirim jika diisi.
function FormPegawai({ pegawai, onClose, onSaved }) {
  const ubah = Boolean(pegawai);
  const [form, setForm] = useState({
    nama_pegawai: pegawai?.nama_pegawai ?? "",
    jabatan: pegawai?.jabatan ?? "",
    email: pegawai?.akun.email ?? "",
    role: pegawai?.akun.role ?? "",
    no_telepon: pegawai?.no_telepon ?? "",
    password: "",
  });
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (ev) => {
    setForm((f) => ({ ...f, [field]: ev.target.value }));
    // Error field hilang saat diketik ulang; pesan umum ikut hilang jika semua error field sudah diperbaiki.
    // (`message` pada Error tidak ikut tersalin oleh spread, jadi disalin eksplisit.)
    if (errorField(error, field)) {
      setError((e) => {
        const errors = { ...e.errors, [field]: undefined };
        return Object.values(errors).some(Boolean) ? { message: e.message, errors } : null;
      });
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const body = {
      nama_pegawai: form.nama_pegawai.trim(),
      jabatan: form.jabatan.trim(),
      email: form.email.trim(),
      role: form.role,
      no_telepon: form.no_telepon.trim() || null,
    };
    if (!ubah || form.password) body.password = form.password;

    setKirim(true);
    setError(null);
    try {
      const res = ubah ? await api(`/pegawai/${pegawai.id_pegawai}`, { method: "PUT", body }) : await api("/pegawai", { method: "POST", body });
      onSaved(`${res.message}. (${res.data.nama_pegawai})`);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  const e = (field) => errorField(error, field);

  return (
    <Modal
      judul={ubah ? "Ubah Pegawai" : "Tambah Pegawai"}
      label={ubah ? "Ubah pegawai" : "Tambah pegawai"}
      lebar="sm:max-w-xl"
      sibuk={kirim}
      onClose={onClose}
      onSubmit={handleSubmit}
      kaki={
        <>
          <button type="button" onClick={onClose} disabled={kirim} className="tombol-kedua">
            Batal
          </button>
          <button type="submit" disabled={kirim} className="tombol-utama">
            <Proses aktif={kirim}>{ubah ? "Simpan Perubahan" : "Tambah Pegawai"}</Proses>
          </button>
        </>
      }
    >
      {error && <Pesan>{error.message}</Pesan>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Field label="Nama pegawai" wajib error={e("nama_pegawai")}>
          <input autoFocus value={form.nama_pegawai} onChange={set("nama_pegawai")} maxLength={255} className={inputClass(e("nama_pegawai"))} />
        </Field>
        <Field label="Jabatan" wajib error={e("jabatan")}>
          <input value={form.jabatan} onChange={set("jabatan")} maxLength={255} placeholder="Contoh: Talent Support" className={inputClass(e("jabatan"))} />
        </Field>
        <Field label="Email" wajib error={e("email")}>
          <input type="email" value={form.email} onChange={set("email")} maxLength={255} placeholder="nama@intellisys.test" className={inputClass(e("email"))} />
        </Field>
        <Field label="Role" wajib error={e("role")}>
          <select value={form.role} onChange={set("role")} className={inputClass(e("role"))}>
            <option value="">Pilih role...</option>
            {OPSI_ROLE.map(([nilai, label]) => (
              <option key={nilai} value={nilai}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="No. telepon" error={e("no_telepon")}>
          <input value={form.no_telepon} onChange={set("no_telepon")} maxLength={30} placeholder="0812-..." className={inputClass(e("no_telepon"))} />
        </Field>
        <Field label="Password" wajib={!ubah} error={e("password")} keterangan={ubah ? "Kosongkan jika tidak diubah. Minimal 8 karakter." : "Minimal 8 karakter."}>
          <input type="password" value={form.password} onChange={set("password")} autoComplete="new-password" className={inputClass(e("password"))} />
        </Field>
      </div>
    </Modal>
  );
}
