import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ROLE } from "../../auth/roles";
import { KeadaanKosong, Memuat, Pesan, errorField, formatAngka, formatTanggal, Proses } from "../ui";
import { useToast } from "../toast";
import { Laci } from "../dialog";
import { DaftarSertifikat } from "../sertifikat";
import {
  BadgeTahapPengajuan,
  EvaluasiBadge,
  INTERVIEW_FINAL,
  InterviewBadge,
  bolehAturInterview,
  bolehPlacement,
  bolehTinjau,
  formatJadwal,
  hariIni,
} from "./shared";

const inputClass = (error) => `input ${error ? "input-error" : ""}`;
const tombolUtama = "tombol-utama";
const tombolKedua = "tombol-kedua";

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

function Bagian({ icon, judul, aksi, children }) {
  return (
    <section className="kartu p-space-md space-y-space-sm">
      <div className="flex items-center justify-between gap-space-sm">
        <h3 className="flex items-center gap-space-sm font-title-sm text-title-sm text-on-surface">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
          {judul}
        </h3>
        {aksi}
      </div>
      {children}
    </section>
  );
}

// Kirim aksi ke API dengan status kirim/error/sukses yang seragam.
function useAksi(onBerhasil) {
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  async function jalankan(path, method, body) {
    setKirim(true);
    setError(null);
    try {
      const res = await api(path, { method, body });
      onBerhasil(res.message);
      return true;
    } catch (err) {
      setError(err);
      return false;
    } finally {
      setKirim(false);
    }
  }
  return { kirim, error, jalankan, setError };
}

// Panel samping detail pengajuan (GET /pengajuan/{id}) beserta aksi per role & tahap.
export default function PengajuanDrawer({ id, user, onClose, onChanged }) {
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [versi, setVersi] = useState(0);
  const toast = useToast();

  useEffect(() => {
    let batal = false;
    setError("");
    api(`/pengajuan/${id}`)
      .then((res) => !batal && setP(res.data))
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [id, versi]);

  function berhasil(pesan) {
    toast.sukses(pesan);
    setVersi((v) => v + 1);
    onChanged();
  }

  const jobBerjalan = p?.job_requirement.status_req === "diproses";
  const terbukaInterview = p && p.status_pengajuan === "lanjut_interview" && !p.evaluasi && jobBerjalan;
  const adaInterviewSelesai = p?.interviews?.some((i) => i.status_interview === "selesai");

  return (
    <Laci judul="Detail Pengajuan" label="Detail pengajuan" onClose={onClose}>
      {error && <Pesan>{error}</Pesan>}
      {!error && !p && <Memuat>Memuat detail...</Memuat>}
      {p && (
        <>
          <Ringkasan p={p} talent={user.role === ROLE.TALENT} />
          {user.role !== ROLE.TALENT && <PengalamanKandidat items={p.talent.riwayat_pengalaman_kerja ?? []} />}
          {user.role !== ROLE.TALENT && (p.talent.sertifikat?.length ?? 0) > 0 && (
            <Bagian icon="workspace_premium" judul="Sertifikat">
              <DaftarSertifikat items={p.talent.sertifikat} />
            </Bagian>
          )}
          {bolehTinjau(user) && p.status_pengajuan === "diajukan" && jobBerjalan && <Tinjau p={p} onBerhasil={berhasil} />}
          {p.status_pengajuan !== "diajukan" && (
            <Interviews p={p} user={user} terbuka={terbukaInterview} onBerhasil={berhasil} />
          )}
          <Evaluasi p={p} user={user} bolehIsi={bolehTinjau(user) && terbukaInterview && adaInterviewSelesai} perluInterview={terbukaInterview && !adaInterviewSelesai} onBerhasil={berhasil} />
          <Penempatan p={p} user={user} jobBerjalan={jobBerjalan} onBerhasil={berhasil} />
        </>
      )}
    </Laci>
  );
}

function Info({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</dt>
      <dd className="font-body-md text-body-md text-on-surface break-words">{children || "-"}</dd>
    </div>
  );
}

// Pengalaman kerja kandidat (GET /pengajuan/{id}) beserta deskripsi pekerjaan, untuk HR Client & internal.
function PengalamanKandidat({ items }) {
  return (
    <Bagian icon="work_history" judul="Pengalaman Kerja">
      {items.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ada pengalaman kerja.</p>
      ) : (
        <ol className="space-y-space-sm">
          {items.map((r) => (
            <li key={r.id_pengalaman_kerja} className="border-l-2 border-primary-fixed-dim pl-space-sm">
              <div className="font-title-sm text-title-sm text-on-surface">{r.posisi}</div>
              <div className="font-body-md text-body-md text-on-surface-variant">{[r.nama_perusahaan, r.lokasi].filter(Boolean).join(" · ")}</div>
              <div className="font-body-sm text-body-sm text-outline">
                {formatTanggal(r.tanggal_mulai)} – {r.masih_bekerja ? "Sekarang" : formatTanggal(r.tanggal_selesai)}
                {r.jenis_pekerjaan && ` · ${r.jenis_pekerjaan}`}
              </div>
              {r.deskripsi && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 whitespace-pre-line">{r.deskripsi}</p>}
            </li>
          ))}
        </ol>
      )}
    </Bagian>
  );
}

// `talent`: dibuka talent sendiri, sehingga nama, pendidikan, dan email dirinya tidak ditampilkan.
function Ringkasan({ p, talent }) {
  return (
    <Bagian icon={talent ? "work" : "person"} judul={talent ? p.job_requirement.posisi : p.talent.nama_lengkap}>
      <div className="flex flex-wrap gap-1">
        <BadgeTahapPengajuan pengajuan={p} />
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-space-md gap-y-space-sm pt-space-xs">
        <Info label="Posisi">{p.job_requirement.posisi}</Info>
        <Info label="Klien">{p.job_requirement.klien.nama_perusahaan}</Info>
        {!talent && <Info label="Pendidikan">{p.talent.pendidikan}</Info>}
        {!talent && <Info label="Email">{p.talent.email}</Info>}
        <Info label="Diajukan oleh">{p.account_manager?.nama_pegawai}</Info>
        <Info label="Tanggal pengajuan">{formatTanggal(p.tanggal_pengajuan)}</Info>
        {p.screening && <Info label="Skor kecocokan">{formatAngka(p.screening.skor_kecocokan, 2)}</Info>}
        {p.screening?.catatan_screening && <Info label="Catatan Talent Support">{p.screening.catatan_screening}</Info>}
      </dl>
      {p.job_requirement.status_req !== "diproses" && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Permintaan ini sudah {p.job_requirement.status_req}; proses kandidat tidak dapat dilanjutkan.</p>
      )}
    </Bagian>
  );
}

// R15: HR Client meninjau pengajuan.
function Tinjau({ p, onBerhasil }) {
  const [konfirmasi, setKonfirmasi] = useState(false);
  const { kirim, error, jalankan } = useAksi(onBerhasil);
  const ubah = (status) => jalankan(`/pengajuan/${p.id_pengajuan}/status`, "PATCH", { status_pengajuan: status });

  return (
    <Bagian icon="rule" judul="Tinjau Kandidat">
      {error && <Pesan>{error.message}</Pesan>}
      {konfirmasi ? (
        <div className="bg-error-container rounded-lg p-space-sm space-y-space-sm">
          <p className="font-body-sm text-body-sm text-on-error-container">Tolak {p.talent.nama_lengkap}? Kandidat akan dikembalikan ke talent pool.</p>
          <div className="flex justify-end gap-space-sm">
            <button type="button" onClick={() => setKonfirmasi(false)} disabled={kirim} className="tombol-kedua">
              Tidak
            </button>
            <button type="button" onClick={() => ubah("ditolak")} disabled={kirim} className="tombol-bahaya">
              <Proses aktif={kirim}>Ya, Tolak</Proses>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-space-sm">
          <button type="button" onClick={() => ubah("lanjut_interview")} disabled={kirim} className={tombolUtama}>
            <Proses aktif={kirim} ikon="event_available">Lanjut Interview</Proses>
          </button>
          <button type="button" onClick={() => setKonfirmasi(true)} disabled={kirim} className="tombol-bahaya-garis">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">person_remove</span>
            Tolak
          </button>
        </div>
      )}
    </Bagian>
  );
}

// R16: daftar ronde interview + jadwalkan / jadwal ulang / selesai / batalkan (khusus Account Manager).
function Interviews({ p, user, terbuka, onBerhasil }) {
  const [tambah, setTambah] = useState(false);
  const atur = bolehAturInterview(user) && terbuka;

  return (
    <Bagian
      icon="event_available"
      judul="Jadwal Interview"
      aksi={
        atur && !tambah && (
          <button type="button" onClick={() => setTambah(true)} className={tombolKedua}>
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">add</span>
            Jadwalkan
          </button>
        )
      }
    >
      {p.interviews.length === 0 && !tambah && (
        <KeadaanKosong ringkas ikon="event_available">{atur ? "Belum ada jadwal. Jadwalkan interview pertama." : "Belum ada jadwal interview."}</KeadaanKosong>
      )}
      {tambah && (
        <FormJadwal
          judul="Jadwal baru"
          awal={{ tanggal_interview: "", waktu_interview: "", link_lokasi_meeting: "", instruksi: "" }}
          onBatal={() => setTambah(false)}
          onKirim={(body) => api("/interview", { method: "POST", body: { id_pengajuan: p.id_pengajuan, ...body } })}
          onBerhasil={(pesan) => {
            setTambah(false);
            onBerhasil(pesan);
          }}
        />
      )}
      <ol className="space-y-space-sm">
        {p.interviews.map((iv, i) => (
          <ItemInterview key={iv.id_interview} iv={iv} ronde={i + 1} atur={atur} onBerhasil={onBerhasil} />
        ))}
      </ol>
    </Bagian>
  );
}

function ItemInterview({ iv, ronde, atur, onBerhasil }) {
  const [mode, setMode] = useState(""); // "" | "ulang" | "batal"
  const { kirim, error, jalankan } = useAksi(onBerhasil);
  const final = INTERVIEW_FINAL.includes(iv.status_interview);
  const sudahTiba = iv.tanggal_interview <= hariIni();
  const link = /^https?:\/\//i.test(iv.link_lokasi_meeting ?? "") ? iv.link_lokasi_meeting : null;

  return (
    <li className="rounded-lg ring-1 ring-surface-container-high p-space-sm space-y-1">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="min-w-0">
          <div className="font-label-sm text-label-sm text-outline">Ronde {ronde}</div>
          <div className="font-title-sm text-title-sm text-on-surface">{formatJadwal(iv.tanggal_interview, iv.waktu_interview)}</div>
          {iv.link_lokasi_meeting && (
            <div className="font-body-sm text-body-sm text-on-surface-variant break-all">
              {link ? (
                <a href={link} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {link}
                </a>
              ) : (
                iv.link_lokasi_meeting
              )}
            </div>
          )}
          {iv.instruksi && <p className="font-body-sm text-body-sm text-on-surface-variant">{iv.instruksi}</p>}
        </div>
        <InterviewBadge status={iv.status_interview} />
      </div>
      {error && <Pesan>{errorField(error, "status_interview") ?? error.message}</Pesan>}
      {atur && !final && mode === "" && (
        <div className="flex flex-wrap gap-1 pt-1">
          <button
            type="button"
            onClick={() => jalankan(`/interview/${iv.id_interview}`, "PUT", { status_interview: "selesai" })}
            disabled={kirim || !sudahTiba}
            title={sudahTiba ? "" : "Interview belum berlangsung"}
            className="tombol-kedua"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">task_alt</span>
            Tandai Selesai
          </button>
          <button type="button" onClick={() => setMode("ulang")} disabled={kirim} className="tombol-kedua">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">edit_calendar</span>
            Jadwal Ulang
          </button>
          <button type="button" onClick={() => setMode("batal")} disabled={kirim} className="tombol-bahaya-garis">
            <span aria-hidden="true" className="material-symbols-outlined text-[16px]">event_busy</span>
            Batalkan
          </button>
        </div>
      )}
      {mode === "batal" && (
        <div className="flex flex-wrap items-center justify-end gap-1 pt-1">
          <span className="font-body-sm text-body-sm text-on-surface-variant mr-auto">Batalkan jadwal ini?</span>
          <button type="button" onClick={() => setMode("")} disabled={kirim} className="tombol-kedua">
            Tidak
          </button>
          <button
            type="button"
            onClick={() => jalankan(`/interview/${iv.id_interview}`, "PUT", { status_interview: "dibatalkan" })}
            disabled={kirim}
            className="tombol-bahaya"
          >
            <Proses aktif={kirim}>Ya, Batalkan</Proses>
          </button>
        </div>
      )}
      {mode === "ulang" && (
        <FormJadwal
          judul="Jadwal ulang"
          awal={{ tanggal_interview: iv.tanggal_interview, waktu_interview: iv.waktu_interview, link_lokasi_meeting: iv.link_lokasi_meeting ?? "", instruksi: iv.instruksi ?? "" }}
          onBatal={() => setMode("")}
          onKirim={(body) => api(`/interview/${iv.id_interview}`, { method: "PUT", body })}
          onBerhasil={(pesan) => {
            setMode("");
            onBerhasil(pesan);
          }}
        />
      )}
    </li>
  );
}

function FormJadwal({ judul, awal, onBatal, onKirim, onBerhasil }) {
  const [form, setForm] = useState(awal);
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  // Error lama dihapus begitu isian diubah.
  const set = (f) => (ev) => {
    setForm((x) => ({ ...x, [f]: ev.target.value }));
    setError(null);
  };
  const e = (f) => errorField(error, f);

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await onKirim({
        tanggal_interview: form.tanggal_interview,
        waktu_interview: form.waktu_interview,
        link_lokasi_meeting: form.link_lokasi_meeting.trim() || null,
        instruksi: form.instruksi.trim() || null,
      });
      onBerhasil(res.message);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <div className="bg-surface-container-low rounded-lg p-space-sm space-y-space-sm">
      <div className="font-label-md text-label-md text-on-surface">{judul}</div>
      {error && !e("tanggal_interview") && !e("waktu_interview") && <Pesan>{errorField(error, "id_pengajuan") ?? errorField(error, "status_interview") ?? error.message}</Pesan>}
      <div className="grid grid-cols-2 gap-space-sm">
        <Field label="Tanggal" wajib error={e("tanggal_interview")}>
          <input type="date" min={hariIni()} value={form.tanggal_interview} onChange={set("tanggal_interview")} className={inputClass(e("tanggal_interview"))} />
        </Field>
        <Field label="Waktu" wajib error={e("waktu_interview")}>
          <input type="time" value={form.waktu_interview} onChange={set("waktu_interview")} className={inputClass(e("waktu_interview"))} />
        </Field>
        <Field label="Link meeting / lokasi" error={e("link_lokasi_meeting")} className="col-span-2">
          <input value={form.link_lokasi_meeting} onChange={set("link_lokasi_meeting")} maxLength={255} placeholder="https://meet.google.com/... atau alamat" className={inputClass(e("link_lokasi_meeting"))} />
        </Field>
        <Field label="Instruksi" error={e("instruksi")} className="col-span-2">
          <textarea rows={2} value={form.instruksi} onChange={set("instruksi")} maxLength={2000} className={`${inputClass(e("instruksi"))} h-auto py-2`} />
        </Field>
      </div>
      <div className="flex justify-end gap-space-sm">
        <button type="button" onClick={onBatal} disabled={kirim} className="tombol-kedua">
          Batal
        </button>
        <button type="button" onClick={simpan} disabled={kirim} className={tombolUtama}>
          <Proses aktif={kirim}>Simpan Jadwal</Proses>
        </button>
      </div>
    </div>
  );
}

// R17: hasil evaluasi, atau form evaluasi untuk HR Client setelah interview selesai.
function Evaluasi({ p, user, bolehIsi, perluInterview, onBerhasil }) {
  const [form, setFormAsli] = useState({ nilai_score: "", status_evaluasi: "", catatan_evaluasi: "" });
  const { kirim, error, jalankan, setError } = useAksi(onBerhasil);
  const e = (f) => errorField(error, f);
  // Error lama dihapus begitu isian diubah.
  const setForm = (ubah) => {
    setFormAsli(ubah);
    setError(null);
  };

  if (p.evaluasi) {
    const ev = p.evaluasi;
    return (
      <Bagian icon="rate_review" judul="Evaluasi Klien">
        <div className="flex items-center gap-space-sm">
          <EvaluasiBadge status={ev.status_evaluasi} />
          {ev.nilai_score != null && <span className="font-title-md text-title-md text-on-surface">Nilai {ev.nilai_score}</span>}
        </div>
        {ev.catatan_evaluasi && <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">{ev.catatan_evaluasi}</p>}
        {ev.hr_client && <p className="font-body-sm text-body-sm text-on-surface-variant">Oleh {ev.hr_client.nama_hr} · {formatTanggal(ev.dibuat_pada)}</p>}
      </Bagian>
    );
  }
  if (!bolehIsi) {
    return perluInterview && user.role === ROLE.HR_CLIENT ? (
      <Bagian icon="rate_review" judul="Evaluasi Klien">
        <p className="font-body-sm text-body-sm text-on-surface-variant">Evaluasi dapat diisi setelah minimal 1 interview ditandai selesai oleh Account Manager.</p>
      </Bagian>
    ) : null;
  }

  return (
    <Bagian icon="rate_review" judul="Beri Evaluasi">
      {error && <Pesan>{error.message}</Pesan>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Field label="Nilai (0–100)" wajib error={e("nilai_score")}>
          <input type="number" min={0} max={100} value={form.nilai_score} onChange={(ev) => setForm((f) => ({ ...f, nilai_score: ev.target.value }))} className={inputClass(e("nilai_score"))} />
        </Field>
        <fieldset className="space-y-1">
          <legend className="font-label-md text-label-md text-on-surface">
            Hasil <span className="text-error">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-1">
            {[
              ["diterima", "Diterima"],
              ["ditolak", "Ditolak"],
            ].map(([nilai, label]) => (
              <button
                key={nilai}
                type="button"
                role="radio"
                aria-checked={form.status_evaluasi === nilai}
                onClick={() => setForm((f) => ({ ...f, status_evaluasi: nilai }))}
                className={`h-10 rounded-lg font-label-md text-label-md ${form.status_evaluasi === nilai ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {e("status_evaluasi") && <span className="block font-body-sm text-body-sm text-error">{e("status_evaluasi")}</span>}
        </fieldset>
        <Field label="Catatan" error={e("catatan_evaluasi")} className="sm:col-span-2">
          <textarea rows={3} value={form.catatan_evaluasi} onChange={(ev) => setForm((f) => ({ ...f, catatan_evaluasi: ev.target.value }))} maxLength={5000} className={`${inputClass(e("catatan_evaluasi"))} h-auto py-2`} />
        </Field>
      </div>
      {form.status_evaluasi === "ditolak" && <p className="font-body-sm text-body-sm text-error">Kandidat yang ditolak dikembalikan ke talent pool.</p>}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={kirim}
          onClick={() =>
            jalankan("/evaluasi", "POST", {
              id_pengajuan: p.id_pengajuan,
              nilai_score: form.nilai_score === "" ? null : Number(form.nilai_score),
              status_evaluasi: form.status_evaluasi || null,
              catatan_evaluasi: form.catatan_evaluasi.trim() || null,
            })
          }
          className={tombolUtama}
        >
          <Proses aktif={kirim}>Simpan Evaluasi</Proses>
        </button>
      </div>
    </Bagian>
  );
}

// R18: TS membuat placement dari evaluasi diterima; setelah ada, tampilkan tautannya.
function Penempatan({ p, user, jobBerjalan, onBerhasil }) {
  const [form, setFormAsli] = useState({ tanggal_mulai: "", tanggal_selesai: "", posisi_penempatan: p.job_requirement.posisi });
  const { kirim, error, jalankan, setError } = useAksi(onBerhasil);
  const e = (f) => errorField(error, f);
  const setForm = (ubah) => {
    setFormAsli(ubah);
    setError(null);
  };

  if (p.id_placement) {
    return (
      <Bagian icon="assignment_ind" judul="Penempatan">
        <p className="font-body-md text-body-md text-on-surface">Kandidat sudah ditempatkan.</p>
        <Link to={`/penugasan-penempatan?placement=${p.id_placement}`} className={`${tombolKedua} w-fit`}>
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">open_in_new</span>
          Lihat Penempatan
        </Link>
      </Bagian>
    );
  }
  if (!(bolehPlacement(user) && p.evaluasi?.status_evaluasi === "diterima" && jobBerjalan)) return null;

  return (
    <Bagian icon="assignment_ind" judul="Buat Penempatan">
      {error && !e("tanggal_mulai") && !e("tanggal_selesai") && <Pesan>{errorField(error, "id_evaluasi") ?? error.message}</Pesan>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <Field label="Posisi penempatan" error={e("posisi_penempatan")} className="sm:col-span-2">
          <input value={form.posisi_penempatan} onChange={(ev) => setForm((f) => ({ ...f, posisi_penempatan: ev.target.value }))} maxLength={255} className={inputClass(e("posisi_penempatan"))} />
        </Field>
        <Field label="Tanggal mulai" wajib error={e("tanggal_mulai")}>
          <input type="date" value={form.tanggal_mulai} onChange={(ev) => setForm((f) => ({ ...f, tanggal_mulai: ev.target.value }))} className={inputClass(e("tanggal_mulai"))} />
        </Field>
        <Field label="Tanggal selesai kontrak" error={e("tanggal_selesai")}>
          <input type="date" value={form.tanggal_selesai} onChange={(ev) => setForm((f) => ({ ...f, tanggal_selesai: ev.target.value }))} className={inputClass(e("tanggal_selesai"))} />
        </Field>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">Talent akan berstatus ditempatkan dan tidak tersedia di talent pool. Jika kebutuhan tercapai, permintaan menjadi terpenuhi.</p>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={kirim}
          onClick={() =>
            jalankan("/placement", "POST", {
              id_evaluasi: p.evaluasi.id_evaluasi,
              tanggal_mulai: form.tanggal_mulai || null,
              tanggal_selesai: form.tanggal_selesai || null,
              posisi_penempatan: form.posisi_penempatan.trim() || null,
            })
          }
          className={tombolUtama}
        >
          <Proses aktif={kirim}>Buat Penempatan</Proses>
        </button>
      </div>
    </Bagian>
  );
}
