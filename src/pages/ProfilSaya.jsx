import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { Chip, KeadaanKosong, KepalaHalaman, Memuat, Pesan, errorField } from "../components/ui";
import { STATUS_KANDIDAT } from "../components/talentPool/shared";
import FilterKompetensi from "../components/talentPool/FilterKompetensi";

const JENJANG = ["SMA/SMK", "D3", "D4", "S1", "S2", "S3"];
const JENIS_PEKERJAAN = ["Full-time", "Part-time", "Kontrak", "Magang", "Freelance"];
const FIELD_PROFIL = ["nama_lengkap", "tanggal_lahir", "nomor_telepon", "domisili", "alamat", "gaji_harapan", "tentang_saya", "linkedin", "github", "portfolio", "instagram"];

const PENDIDIKAN_KOSONG = { jenjang: "", nama_institusi: "", jurusan: "", tahun_mulai: "", tahun_selesai: "", deskripsi: "" };
const PENGALAMAN_KOSONG = { nama_perusahaan: "", posisi: "", jenis_pekerjaan: "", lokasi: "", tanggal_mulai: "", tanggal_selesai: "", masih_bekerja: false, deskripsi: "" };
const SERTIFIKAT_KOSONG = { nama_sertifikat: "", penerbit: "", tanggal_terbit: "", tanggal_kedaluwarsa: "", url_sertifikat: "" };
const BAHASA_KOSONG = { nama_bahasa: "", tingkat_kemampuan: "" };
// Sama dengan UpdateTalentProfileRequest::TINGKAT_BAHASA di backend.
const TINGKAT_BAHASA = ["Dasar", "Menengah", "Fasih", "Penutur Asli"];
const SARAN_BAHASA = ["Indonesia", "Inggris", "Mandarin", "Jepang", "Korea", "Arab", "Jerman", "Belanda", "Prancis"];

// Data API → isian form (null menjadi "" agar input terkendali).
const keString = (v) => (v == null ? "" : String(v));
function keForm(p) {
  return {
    ...Object.fromEntries(FIELD_PROFIL.map((f) => [f, keString(p[f])])),
    riwayat_pendidikan: p.riwayat_pendidikan.map((r) => Object.fromEntries(Object.keys(PENDIDIKAN_KOSONG).map((f) => [f, keString(r[f])]))),
    riwayat_pengalaman_kerja: p.riwayat_pengalaman_kerja.map((r) => ({
      ...Object.fromEntries(Object.keys(PENGALAMAN_KOSONG).map((f) => [f, keString(r[f])])),
      masih_bekerja: Boolean(r.masih_bekerja),
    })),
    sertifikat: p.sertifikat.map((r) => Object.fromEntries(Object.keys(SERTIFIKAT_KOSONG).map((f) => [f, keString(r[f])]))),
    bahasa: p.bahasa.map((r) => ({ nama_bahasa: r.nama_bahasa, tingkat_kemampuan: keString(r.tingkat_kemampuan) })),
    kompetensi: p.kompetensi.map((k) => k.id_kompetensi),
  };
}

// Isian form → body PUT /talent/profil ("" menjadi null, angka dikonversi). Riwayat dikirim utuh (menggantikan daftar lama).
const kosongNull = (v) => (typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v);
const angkaNull = (v) => (v === "" ? null : Number(v));
function keBody(form) {
  const body = Object.fromEntries(FIELD_PROFIL.map((f) => [f, kosongNull(form[f])]));
  body.nama_lengkap = form.nama_lengkap.trim();
  body.gaji_harapan = angkaNull(form.gaji_harapan);
  body.riwayat_pendidikan = form.riwayat_pendidikan.map((r) => ({
    jenjang: kosongNull(r.jenjang),
    nama_institusi: kosongNull(r.nama_institusi),
    jurusan: kosongNull(r.jurusan),
    tahun_mulai: angkaNull(r.tahun_mulai),
    tahun_selesai: angkaNull(r.tahun_selesai),
    deskripsi: kosongNull(r.deskripsi),
  }));
  body.riwayat_pengalaman_kerja = form.riwayat_pengalaman_kerja.map((r) => ({
    nama_perusahaan: kosongNull(r.nama_perusahaan),
    posisi: kosongNull(r.posisi),
    jenis_pekerjaan: kosongNull(r.jenis_pekerjaan),
    lokasi: kosongNull(r.lokasi),
    tanggal_mulai: kosongNull(r.tanggal_mulai),
    masih_bekerja: r.masih_bekerja,
    tanggal_selesai: r.masih_bekerja ? null : kosongNull(r.tanggal_selesai),
    deskripsi: kosongNull(r.deskripsi),
  }));
  body.sertifikat = form.sertifikat.map((r) => Object.fromEntries(Object.keys(SERTIFIKAT_KOSONG).map((f) => [f, kosongNull(r[f])])));
  body.bahasa = form.bahasa.map((r) => ({ nama_bahasa: kosongNull(r.nama_bahasa), tingkat_kemampuan: kosongNull(r.tingkat_kemampuan) }));
  return body;
}

const inputClass = (error) => `input ${error ? "input-error" : ""}`;

function Field({ label, wajib, error, className = "", children }) {
  return (
    <label className={`block space-y-1 min-w-0 ${className}`}>
      <span className="font-label-md text-label-md text-on-surface">
        {label} {wajib && <span className="text-error">*</span>}
      </span>
      {children}
      {error && <span className="block font-body-sm text-body-sm text-error">{error}</span>}
    </label>
  );
}

function Bagian({ ikon, judul, keterangan, aksi, children }) {
  return (
    <section className="kartu p-space-md sm:p-space-lg space-y-space-md">
      <div className="flex items-start justify-between gap-space-sm">
        <div>
          <h2 className="flex items-center gap-space-sm font-title-md text-title-md text-on-surface">
            <span className="material-symbols-outlined text-primary text-[22px]">{ikon}</span>
            {judul}
          </h2>
          {keterangan && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{keterangan}</p>}
        </div>
        {aksi}
      </div>
      {children}
    </section>
  );
}

// Halaman Profil & CV Saya (FR-03, FR-04) — khusus Talent.
// Profil lengkap (R4: nama + ≥1 riwayat pendidikan + ≥1 kompetensi) otomatis masuk talent pool (R5).
export default function ProfilSaya() {
  const { muatUlangUser } = useAuth();
  const [profil, setProfil] = useState(null);
  const [form, setForm] = useState(null);
  const [opsiKompetensi, setOpsiKompetensi] = useState([]);
  const [errorMuat, setErrorMuat] = useState("");
  const [error, setError] = useState(null);
  const [sukses, setSukses] = useState("");
  const [simpan, setSimpan] = useState(false);

  useEffect(() => {
    api("/talent/profil")
      .then((res) => {
        setProfil(res.data);
        setForm(keForm(res.data));
      })
      .catch((err) => setErrorMuat(err.message));
    api("/kompetensi?per_page=100")
      .then((res) => setOpsiKompetensi(res.data))
      .catch((err) => setErrorMuat(err.message));
  }, []);

  if (errorMuat) {
    return (
      <div className="p-space-md sm:p-space-xl">
        <Pesan>{errorMuat}</Pesan>
      </div>
    );
  }
  if (!form)
    return (
      <div className="px-space-md sm:px-space-xl pt-space-lg">
        <div className="kartu p-space-lg">
          <Memuat baris={5}>Memuat profil...</Memuat>
        </div>
      </div>
    );

  const awal = keForm(profil);
  const berubah = JSON.stringify(form) !== JSON.stringify(awal);
  const kompetensiBerubah = JSON.stringify(form.kompetensi) !== JSON.stringify(awal.kompetensi);
  const e = (field) => errorField(error, field);

  const ubah = (field) => (ev) => setForm((f) => ({ ...f, [field]: ev.target.value }));
  const ubahBaris = (daftar, i, field, nilai) =>
    setForm((f) => ({ ...f, [daftar]: f[daftar].map((r, j) => (j === i ? { ...r, [field]: nilai } : r)) }));
  const tambahBaris = (daftar, kosong) => setForm((f) => ({ ...f, [daftar]: [...f[daftar], { ...kosong }] }));
  const hapusBaris = (daftar, i) => setForm((f) => ({ ...f, [daftar]: f[daftar].filter((_, j) => j !== i) }));

  async function handleSimpan() {
    setSimpan(true);
    setError(null);
    setSukses("");
    try {
      let res = await api("/talent/profil", { method: "PUT", body: keBody(form) });
      const pesan = [res.message];
      if (kompetensiBerubah) {
        res = await api("/talent/profil/kompetensi", { method: "PUT", body: { id_kompetensi: form.kompetensi } });
        pesan.push(res.message);
      }
      setProfil(res.data);
      setForm(keForm(res.data));
      setSukses(pesan.join(" "));
      muatUlangUser().catch(() => {});
    } catch (err) {
      setError(err);
    } finally {
      setSimpan(false);
    }
  }

  function batal() {
    setForm(keForm(profil));
    setError(null);
  }

  const namaKompetensi = (id) => opsiKompetensi.find((k) => k.id_kompetensi === id)?.nama_kompetensi ?? `#${id}`;

  return (
    <div className="flex flex-col w-full pb-32">
      <KepalaHalaman ikon="badge" kategori="Talent" judul="Profil & CV Saya">
        Lengkapi profil Anda. Profil yang lengkap otomatis masuk talent pool PT Intellisys dan dapat direkomendasikan ke klien sesuai kompetensi dan pengalaman.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <StatusProfil profil={profil} />
        {error && <Pesan>{error.message}</Pesan>}
        {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}

        <Bagian ikon="person" judul="Data Pribadi">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-md">
            <Field label="Nama lengkap" wajib error={e("nama_lengkap")}>
              <input value={form.nama_lengkap} onChange={ubah("nama_lengkap")} maxLength={255} className={inputClass(e("nama_lengkap"))} />
            </Field>
            <Field label="Tanggal lahir" error={e("tanggal_lahir")}>
              <input type="date" value={form.tanggal_lahir} onChange={ubah("tanggal_lahir")} className={inputClass(e("tanggal_lahir"))} />
            </Field>
            <Field label="Nomor telepon" error={e("nomor_telepon")}>
              <input value={form.nomor_telepon} onChange={ubah("nomor_telepon")} maxLength={20} placeholder="0812-..." className={inputClass(e("nomor_telepon"))} />
            </Field>
            <Field label="Domisili" error={e("domisili")}>
              <input value={form.domisili} onChange={ubah("domisili")} maxLength={255} placeholder="Contoh: Bekasi" className={inputClass(e("domisili"))} />
            </Field>
            <Field label="Gaji harapan (Rp/bulan)" error={e("gaji_harapan")}>
              <input type="number" min={0} step={100000} value={form.gaji_harapan} onChange={ubah("gaji_harapan")} placeholder="Contoh: 8000000" className={inputClass(e("gaji_harapan"))} />
            </Field>
            <Field label="Alamat" error={e("alamat")}>
              <input value={form.alamat} onChange={ubah("alamat")} className={inputClass(e("alamat"))} />
            </Field>
            <Field label="Tentang saya" error={e("tentang_saya")} className="sm:col-span-2 xl:col-span-3">
              <textarea rows={4} value={form.tentang_saya} onChange={ubah("tentang_saya")} maxLength={5000} placeholder="Ringkasan singkat keahlian dan minat Anda" className={`${inputClass(e("tentang_saya"))} h-auto py-2`} />
            </Field>
          </div>
        </Bagian>

        <Bagian ikon="link" judul="Tautan" keterangan="Diawali http:// atau https://">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
            {[
              ["linkedin", "LinkedIn", "https://linkedin.com/in/..."],
              ["github", "GitHub", "https://github.com/..."],
              ["portfolio", "Portofolio", "https://..."],
              ["instagram", "Instagram", "https://instagram.com/..."],
            ].map(([field, label, contoh]) => (
              <Field key={field} label={label} error={e(field)}>
                <input type="url" value={form[field]} onChange={ubah(field)} maxLength={255} placeholder={contoh} className={inputClass(e(field))} />
              </Field>
            ))}
          </div>
        </Bagian>

        <Bagian
          ikon="school"
          judul="Riwayat Pendidikan"
          keterangan="Minimal 1 riwayat pendidikan agar profil lengkap."
          aksi={<TombolTambah onClick={() => tambahBaris("riwayat_pendidikan", PENDIDIKAN_KOSONG)} />}
        >
          {form.riwayat_pendidikan.length === 0 && <Kosong>Belum ada riwayat pendidikan.</Kosong>}
          <datalist id="opsi-jenjang">
            {JENJANG.map((j) => (
              <option key={j} value={j} />
            ))}
          </datalist>
          {form.riwayat_pendidikan.map((r, i) => {
            const ef = (f) => e(`riwayat_pendidikan.${i}.${f}`);
            const set = (f) => (ev) => ubahBaris("riwayat_pendidikan", i, f, ev.target.value);
            return (
              <KartuBaris key={i} judul={`Pendidikan ${i + 1}`} onHapus={() => hapusBaris("riwayat_pendidikan", i)}>
                <Field label="Jenjang" wajib error={ef("jenjang")}>
                  <input list="opsi-jenjang" value={r.jenjang} onChange={set("jenjang")} maxLength={50} placeholder="Contoh: S1" className={inputClass(ef("jenjang"))} />
                </Field>
                <Field label="Institusi" wajib error={ef("nama_institusi")}>
                  <input value={r.nama_institusi} onChange={set("nama_institusi")} maxLength={255} className={inputClass(ef("nama_institusi"))} />
                </Field>
                <Field label="Jurusan" error={ef("jurusan")}>
                  <input value={r.jurusan} onChange={set("jurusan")} maxLength={255} className={inputClass(ef("jurusan"))} />
                </Field>
                <div className="grid grid-cols-2 gap-space-sm">
                  <Field label="Tahun mulai" error={ef("tahun_mulai")}>
                    <input type="number" value={r.tahun_mulai} onChange={set("tahun_mulai")} placeholder="2019" className={inputClass(ef("tahun_mulai"))} />
                  </Field>
                  <Field label="Tahun selesai" error={ef("tahun_selesai")}>
                    <input type="number" value={r.tahun_selesai} onChange={set("tahun_selesai")} placeholder="2023" className={inputClass(ef("tahun_selesai"))} />
                  </Field>
                </div>
              </KartuBaris>
            );
          })}
        </Bagian>

        <Bagian
          ikon="work_history"
          judul="Pengalaman Kerja"
          keterangan="Lama pengalaman dihitung dari periode ini dan ikut menentukan skor rekomendasi."
          aksi={<TombolTambah onClick={() => tambahBaris("riwayat_pengalaman_kerja", PENGALAMAN_KOSONG)} />}
        >
          {form.riwayat_pengalaman_kerja.length === 0 && <Kosong>Belum ada pengalaman kerja.</Kosong>}
          <datalist id="opsi-jenis-pekerjaan">
            {JENIS_PEKERJAAN.map((j) => (
              <option key={j} value={j} />
            ))}
          </datalist>
          {form.riwayat_pengalaman_kerja.map((r, i) => {
            const ef = (f) => e(`riwayat_pengalaman_kerja.${i}.${f}`);
            const set = (f) => (ev) => ubahBaris("riwayat_pengalaman_kerja", i, f, ev.target.value);
            return (
              <KartuBaris key={i} judul={`Pengalaman ${i + 1}`} onHapus={() => hapusBaris("riwayat_pengalaman_kerja", i)}>
                <Field label="Perusahaan" wajib error={ef("nama_perusahaan")}>
                  <input value={r.nama_perusahaan} onChange={set("nama_perusahaan")} maxLength={255} className={inputClass(ef("nama_perusahaan"))} />
                </Field>
                <Field label="Posisi" wajib error={ef("posisi")}>
                  <input value={r.posisi} onChange={set("posisi")} maxLength={255} className={inputClass(ef("posisi"))} />
                </Field>
                <Field label="Jenis pekerjaan" error={ef("jenis_pekerjaan")}>
                  <input list="opsi-jenis-pekerjaan" value={r.jenis_pekerjaan} onChange={set("jenis_pekerjaan")} maxLength={50} className={inputClass(ef("jenis_pekerjaan"))} />
                </Field>
                <Field label="Lokasi" error={ef("lokasi")}>
                  <input value={r.lokasi} onChange={set("lokasi")} maxLength={255} className={inputClass(ef("lokasi"))} />
                </Field>
                <Field label="Tanggal mulai" wajib error={ef("tanggal_mulai")}>
                  <input type="date" value={r.tanggal_mulai} onChange={set("tanggal_mulai")} className={inputClass(ef("tanggal_mulai"))} />
                </Field>
                <div className="space-y-1">
                  <Field label="Tanggal selesai" wajib={!r.masih_bekerja} error={ef("tanggal_selesai")}>
                    <input type="date" value={r.masih_bekerja ? "" : r.tanggal_selesai} onChange={set("tanggal_selesai")} disabled={r.masih_bekerja} className={inputClass(ef("tanggal_selesai"))} />
                  </Field>
                  <label className="flex items-center gap-space-sm min-h-[40px] font-body-sm text-body-sm text-on-surface cursor-pointer">
                    <input type="checkbox" checked={r.masih_bekerja} onChange={(ev) => ubahBaris("riwayat_pengalaman_kerja", i, "masih_bekerja", ev.target.checked)} className="accent-primary w-4 h-4" />
                    Masih bekerja di sini
                  </label>
                </div>
              </KartuBaris>
            );
          })}
        </Bagian>

        <Bagian ikon="psychology" judul="Kompetensi" keterangan="Minimal 1 kompetensi agar profil lengkap. Dipakai untuk mencocokkan Anda dengan kebutuhan klien.">
          <FilterKompetensi
            opsi={opsiKompetensi}
            nilai={form.kompetensi}
            onChange={(nilai) => setForm((f) => ({ ...f, kompetensi: nilai }))}
            label={form.kompetensi.length ? `${form.kompetensi.length} kompetensi dipilih` : "Pilih kompetensi"}
            keterangan=""
            lebar="penuh"
            error={Boolean(e("id_kompetensi"))}
          />
          {form.kompetensi.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {form.kompetensi.map((id) => (
                <Chip key={id}>{namaKompetensi(id)}</Chip>
              ))}
            </div>
          ) : (
            <Kosong>Belum ada kompetensi.</Kosong>
          )}
          {e("id_kompetensi") && <p className="font-body-sm text-body-sm text-error">{e("id_kompetensi")}</p>}
        </Bagian>

        <Bagian
          ikon="workspace_premium"
          judul="Sertifikat"
          keterangan="Opsional. Ditampilkan di CV Anda."
          aksi={<TombolTambah onClick={() => tambahBaris("sertifikat", SERTIFIKAT_KOSONG)} />}
        >
          {form.sertifikat.length === 0 && <Kosong>Belum ada sertifikat.</Kosong>}
          {form.sertifikat.map((r, i) => {
            const ef = (f) => e(`sertifikat.${i}.${f}`);
            const set = (f) => (ev) => ubahBaris("sertifikat", i, f, ev.target.value);
            return (
              <KartuBaris key={i} judul={`Sertifikat ${i + 1}`} onHapus={() => hapusBaris("sertifikat", i)}>
                <Field label="Nama sertifikat" wajib error={ef("nama_sertifikat")}>
                  <input value={r.nama_sertifikat} onChange={set("nama_sertifikat")} maxLength={255} placeholder="Contoh: AWS Certified Developer" className={inputClass(ef("nama_sertifikat"))} />
                </Field>
                <Field label="Penerbit" error={ef("penerbit")}>
                  <input value={r.penerbit} onChange={set("penerbit")} maxLength={255} placeholder="Contoh: Amazon Web Services" className={inputClass(ef("penerbit"))} />
                </Field>
                <Field label="Tanggal terbit" error={ef("tanggal_terbit")}>
                  <input type="date" value={r.tanggal_terbit} onChange={set("tanggal_terbit")} className={inputClass(ef("tanggal_terbit"))} />
                </Field>
                <Field label="Berlaku sampai" error={ef("tanggal_kedaluwarsa")}>
                  <input type="date" value={r.tanggal_kedaluwarsa} onChange={set("tanggal_kedaluwarsa")} className={inputClass(ef("tanggal_kedaluwarsa"))} />
                </Field>
                <Field label="Tautan verifikasi" error={ef("url_sertifikat")} className="sm:col-span-2">
                  <input type="url" value={r.url_sertifikat} onChange={set("url_sertifikat")} maxLength={255} placeholder="https://..." className={inputClass(ef("url_sertifikat"))} />
                </Field>
              </KartuBaris>
            );
          })}
        </Bagian>

        <Bagian
          ikon="translate"
          judul="Bahasa"
          keterangan="Opsional. Bahasa yang Anda kuasai beserta tingkat kemampuannya; ditampilkan di CV."
          aksi={<TombolTambah onClick={() => tambahBaris("bahasa", BAHASA_KOSONG)} />}
        >
          {form.bahasa.length === 0 && <Kosong>Belum ada bahasa.</Kosong>}
          <datalist id="opsi-bahasa">
            {SARAN_BAHASA.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
          {form.bahasa.map((r, i) => {
            const ef = (f) => e(`bahasa.${i}.${f}`);
            const set = (f) => (ev) => ubahBaris("bahasa", i, f, ev.target.value);
            return (
              <KartuBaris key={i} judul={`Bahasa ${i + 1}`} onHapus={() => hapusBaris("bahasa", i)}>
                <Field label="Bahasa" wajib error={ef("nama_bahasa")}>
                  <input list="opsi-bahasa" value={r.nama_bahasa} onChange={set("nama_bahasa")} maxLength={100} placeholder="Contoh: Inggris" className={inputClass(ef("nama_bahasa"))} />
                </Field>
                <Field label="Tingkat kemampuan" wajib error={ef("tingkat_kemampuan")}>
                  <select value={r.tingkat_kemampuan} onChange={set("tingkat_kemampuan")} className={inputClass(ef("tingkat_kemampuan"))}>
                    <option value="">Pilih tingkat</option>
                    {TINGKAT_BAHASA.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </KartuBaris>
            );
          })}
        </Bagian>

        <BagianCv profil={profil} adaPerubahan={berubah} onCvDibuat={(data) => setProfil((p) => ({ ...p, ada_cv: data.ada_cv }))} />
      </div>

      {berubah && (
        <div className="fixed bottom-0 right-0 left-0 lg:left-72 z-40 bg-surface-container-lowest/95 backdrop-blur border-t border-surface-container-high px-space-md sm:px-space-xl py-space-sm flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-space-sm">
          <span className="font-body-sm text-body-sm text-on-surface-variant sm:mr-auto">Ada perubahan yang belum disimpan.</span>
          <button type="button" onClick={batal} disabled={simpan} className="tombol-kedua">
            Batalkan Perubahan
          </button>
          <button type="button" onClick={handleSimpan} disabled={simpan} className="tombol-utama">
            {simpan ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      )}
    </div>
  );
}

const Kosong = ({ children }) => <KeadaanKosong ringkas>{children}</KeadaanKosong>;

function TombolTambah({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="tombol-teks shrink-0">
      <span className="material-symbols-outlined text-[18px]">add</span>
      Tambah
    </button>
  );
}

function KartuBaris({ judul, onHapus, children }) {
  return (
    <div className="rounded-xl ring-1 ring-surface-container-high p-space-md space-y-space-sm">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md text-on-surface-variant">{judul}</span>
        <button type="button" onClick={onHapus} title="Hapus baris" className="tombol-bahaya-garis px-3">
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Hapus
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-space-md">{children}</div>
    </div>
  );
}

// Status R4 dari data yang sudah tersimpan.
function StatusProfil({ profil }) {
  const lengkap = profil.status_kelengkapan === "lengkap";
  const syarat = [
    ["Nama lengkap terisi", Boolean(profil.nama_lengkap)],
    ["Minimal 1 riwayat pendidikan", profil.riwayat_pendidikan.length > 0],
    ["Minimal 1 kompetensi", profil.kompetensi.length > 0],
  ];
  return (
    <div
      className={`rounded-xl ring-1 ring-inset p-space-md flex flex-col sm:flex-row sm:items-center gap-space-md ${
        lengkap ? "bg-tertiary-fixed text-on-tertiary-fixed-variant ring-on-tertiary-container/25" : "bg-warning-container text-on-warning-container ring-warning/25"
      }`}
    >
      <span className="material-symbols-outlined text-[32px]">{lengkap ? "verified" : "pending"}</span>
      <div className="flex-1 min-w-0">
        <div className="font-title-md text-title-md">{lengkap ? "Profil lengkap" : "Profil belum lengkap"}</div>
        <div className="font-body-sm text-body-sm">
          {lengkap
            ? `Anda sudah masuk talent pool. Status kandidat: ${STATUS_KANDIDAT[profil.status_kandidat] ?? profil.status_kandidat}.`
            : "Lengkapi syarat berikut agar masuk talent pool dan bisa membuat CV."}
        </div>
      </div>
      <ul className="flex flex-col gap-0.5 shrink-0">
        {syarat.map(([label, ok]) => (
          <li key={label} className="flex items-center gap-1 font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">{ok ? "check_circle" : "radio_button_unchecked"}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Generate CV (POST /talent/cv/generate) dari data tersimpan, lalu lihat lewat unduhan ber-token.
function BagianCv({ profil, adaPerubahan, onCvDibuat }) {
  const [proses, setProses] = useState("");
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const lengkap = profil.status_kelengkapan === "lengkap";

  async function generate() {
    setProses("generate");
    setError("");
    setSukses("");
    try {
      const res = await api("/talent/cv/generate", { method: "POST" });
      setSukses(res.message);
      onCvDibuat(res.data);
    } catch (err) {
      setError(errorField(err, "profil") ?? err.message);
    } finally {
      setProses("");
    }
  }

  async function lihat() {
    // Tab dibuka sebelum await agar tidak diblokir popup blocker.
    const tab = window.open("", "_blank");
    setProses("lihat");
    setError("");
    try {
      const blob = await api("/talent/cv/download", { blob: true });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.location.assign(url);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      setError(err.message);
    } finally {
      setProses("");
    }
  }

  const keterangan = adaPerubahan
    ? "Simpan perubahan terlebih dahulu; CV dibuat dari data yang sudah tersimpan."
    : !lengkap
      ? "CV dapat dibuat setelah profil lengkap."
      : profil.ada_cv
        ? "Buat ulang CV setiap kali profil berubah agar isinya terbaru."
        : "Anda belum membuat CV.";

  return (
    <Bagian ikon="picture_as_pdf" judul="CV" keterangan="CV dibuat otomatis dari data profil Anda dan dapat dilihat oleh tim PT Intellisys.">
      {error && <Pesan>{error}</Pesan>}
      {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-space-sm">
        <span className="font-body-md text-body-md text-on-surface-variant sm:mr-auto">{keterangan}</span>
        <button
          type="button"
          onClick={lihat}
          disabled={!profil.ada_cv || !!proses}
          className="tombol-kedua"
        >
          <span className="material-symbols-outlined text-[18px]">visibility</span>
          {proses === "lihat" ? "Membuka..." : "Lihat CV"}
        </button>
        <button
          type="button"
          onClick={generate}
          disabled={adaPerubahan || !lengkap || !!proses}
          className="tombol-utama"
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          {proses === "generate" ? "Membuat..." : profil.ada_cv ? "Buat Ulang CV" : "Buat CV"}
        </button>
      </div>
    </Bagian>
  );
}
