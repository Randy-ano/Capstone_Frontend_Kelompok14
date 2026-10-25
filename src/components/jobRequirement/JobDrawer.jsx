import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { INTERNAL, ROLE } from "../../auth/roles";
import { Chip, KeadaanKosong, Memuat, Pesan, formatAngka, formatTanggal, formatTanggalWaktu } from "../ui";
import { HasilBadge } from "../talentPool/shared";
import { BISA_DIBATALKAN, BISA_DIUBAH, Pemenuhan, SlaBadge, StatusReqBadge, TAHAPAN, TERBUKA, bolehKelola } from "./shared";

// Panel samping detail job requirement + log progres (GET /job-requirements/{id}/progres).
// `versi` berubah dari luar (mis. setelah form ubah disimpan) agar data dimuat ulang; `pesan` = pesan sukses dari form.
export default function JobDrawer({ id, user, versi, pesan, onClose, onChanged, onEdit }) {
  const [job, setJob] = useState(null);
  const [screening, setScreening] = useState(null);
  const [error, setError] = useState("");
  const [muat, setMuat] = useState(0);
  const internal = INTERNAL.includes(user.role);

  useEffect(() => {
    let batal = false;
    setError("");
    api(`/job-requirements/${id}/progres`)
      .then((res) => !batal && setJob(res.data))
      .catch((err) => !batal && setError(err.message));
    if (internal) {
      api(`/screening?id_job_req=${id}&per_page=100`)
        .then((res) => !batal && setScreening(res.data))
        .catch((err) => !batal && setError(err.message));
    }
    return () => {
      batal = true;
    };
  }, [id, internal, versi, muat]);

  useEffect(() => {
    const esc = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Detail permintaan kebutuhan">
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-surface flex flex-col shadow-xl">
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 bg-surface-container-lowest border-b border-surface-container-high shrink-0">
          <h2 className="font-title-md text-title-md text-on-surface">Detail Permintaan</h2>
          <button type="button" onClick={onClose} title="Tutup" className="tombol-ikon -mr-2">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">
          {pesan && <Pesan jenis="sukses">{pesan}</Pesan>}
          {error && <Pesan>{error}</Pesan>}
          {!error && !job && <Memuat>Memuat detail...</Memuat>}
          {job && (
            <>
              <Ringkasan job={job} />
              <Aksi
                job={job}
                user={user}
                onEdit={() => onEdit(job)}
                onUbahStatus={(data) => {
                  setJob((j) => ({ ...j, ...data }));
                  setMuat((m) => m + 1);
                  onChanged();
                }}
              />
              <RingkasanProgres ringkasan={job.ringkasan_progres} />
              {internal && <KandidatScreening items={screening} />}
              <LogProgres items={job.log_progres} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Bagian({ icon, judul, aksi, children }) {
  return (
    <section className="kartu p-space-md space-y-space-sm">
      <div className="flex items-center justify-between gap-space-sm">
        <h3 className="flex items-center gap-space-sm font-title-sm text-title-sm text-on-surface">
          <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
          {judul}
        </h3>
        {aksi}
      </div>
      {children}
    </section>
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

function Ringkasan({ job }) {
  return (
    <Bagian icon="work" judul={job.posisi}>
      <div className="flex flex-wrap gap-1">
        <StatusReqBadge status={job.status_req} />
        <SlaBadge indikator={job.indikator_sla} />
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-space-md gap-y-space-sm pt-space-xs">
        <Info label="Klien">{job.klien.nama_perusahaan}</Info>
        <Info label="Account Manager">{job.account_manager?.nama_pegawai ?? "Belum ditentukan"}</Info>
        <Info label="Kebutuhan">
          <Pemenuhan terpenuhi={job.terpenuhi} jumlah={job.jumlah_kebutuhan} />
        </Info>
        <Info label="Pengalaman minimal">{job.pengalaman_min ? `${job.pengalaman_min} tahun` : "Tidak ada"}</Info>
        <Info label="SLA deadline">{formatTanggalWaktu(job.sla_deadline)}</Info>
        <Info label="Dibuat">{formatTanggal(job.dibuat_pada)}</Info>
      </dl>
      <div>
        <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">Kompetensi dibutuhkan</div>
        <div className="flex flex-wrap gap-1">
          {job.kompetensi.map((k) => (
            <Chip key={k.id_kompetensi} title={k.kategori}>
              {k.nama_kompetensi}
            </Chip>
          ))}
        </div>
      </div>
      {job.kualifikasi && (
        <div>
          <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Kualifikasi</div>
          <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">{job.kualifikasi}</p>
        </div>
      )}
    </Bagian>
  );
}

// Tombol sesuai role & status: HC/AM ubah/ajukan/batalkan; TS cari kandidat.
function Aksi({ job, user, onEdit, onUbahStatus }) {
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [kirim, setKirim] = useState("");
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");

  const kelola = bolehKelola(user);
  const bisaUbah = kelola && BISA_DIUBAH.includes(job.status_req);
  const bisaAjukan = kelola && job.status_req === "draft";
  const bisaBatal = kelola && BISA_DIBATALKAN.includes(job.status_req);
  const cariKandidat = user.role === ROLE.TALENT_SUPPORT && TERBUKA.includes(job.status_req);

  if (!bisaUbah && !bisaAjukan && !bisaBatal && !cariKandidat && !sukses) return null;

  async function ubahStatus(status) {
    setKirim(status);
    setError("");
    setSukses("");
    try {
      const res = await api(`/job-requirements/${job.id_job_req}/status`, { method: "PATCH", body: { status_req: status } });
      setSukses(res.message);
      setKonfirmasi(false);
      onUbahStatus(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setKirim("");
    }
  }


  return (
    <div className="space-y-space-sm">
      {error && <Pesan>{error}</Pesan>}
      {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}
      {konfirmasi ? (
        <div className="bg-error-container rounded-xl p-space-md space-y-space-sm">
          <p className="font-body-md text-body-md text-on-error-container">
            Batalkan permintaan <strong>{job.posisi}</strong>? Kandidat yang sedang diproses untuk permintaan ini akan dikembalikan menjadi tersedia.
          </p>
          <div className="flex flex-wrap justify-end gap-space-sm">
            <button type="button" onClick={() => setKonfirmasi(false)} disabled={!!kirim} className="tombol-kedua">
              Tidak
            </button>
            <button type="button" onClick={() => ubahStatus("dibatalkan")} disabled={!!kirim} className="tombol-bahaya">
              {kirim ? "Membatalkan..." : "Ya, Batalkan"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-space-sm">
          {cariKandidat && (
            <Link to={`/rekomendasi-kandidat?job=${job.id_job_req}`} className="tombol-utama">
              <span className="material-symbols-outlined text-[18px]">person_search</span>
              Cari Kandidat
            </Link>
          )}
          {bisaAjukan && (
            <button type="button" onClick={() => ubahStatus("diajukan")} disabled={!!kirim} className="tombol-utama">
              <span className="material-symbols-outlined text-[18px]">send</span>
              {kirim === "diajukan" ? "Mengajukan..." : "Ajukan"}
            </button>
          )}
          {bisaUbah && (
            <button type="button" onClick={onEdit} disabled={!!kirim} className="tombol-kedua">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Ubah
            </button>
          )}
          {bisaBatal && (
            <button type="button" onClick={() => setKonfirmasi(true)} disabled={!!kirim} className="tombol-bahaya-garis">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              Batalkan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RingkasanProgres({ ringkasan }) {
  const angka = [
    ["Screening", ringkasan.jumlah_screening],
    ["Menunggu", ringkasan.screening_pending],
    ["Lolos", ringkasan.screening_lolos],
    ["Tidak lolos", ringkasan.screening_tidak_lolos],
    ["Sisa kebutuhan", ringkasan.sisa_kebutuhan],
  ];
  return (
    <Bagian icon="monitoring" judul="Ringkasan Progres">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-space-sm">
        {angka.map(([label, nilai]) => (
          <div key={label} className="bg-surface-container-low rounded-lg p-space-sm text-center">
            <div className="font-title-md text-title-md text-on-surface">{nilai}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">{label}</div>
          </div>
        ))}
      </div>
    </Bagian>
  );
}

function KandidatScreening({ items }) {
  return (
    <Bagian icon="fact_check" judul="Kandidat di-screening">
      {!items ? (
        <Memuat />
      ) : items.length === 0 ? (
        <KeadaanKosong ringkas ikon="fact_check">Belum ada kandidat yang di-screening.</KeadaanKosong>
      ) : (
        <ul className="divide-y divide-surface-container-high">
          {items.map((s) => (
            <li key={s.id_screening} className="py-space-sm first:pt-0 last:pb-0 flex items-start justify-between gap-space-sm">
              <div className="min-w-0">
                <div className="font-title-sm text-title-sm text-on-surface">{s.talent.nama_lengkap}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  {formatTanggal(s.tanggal_screening)} · oleh {s.talent_support?.nama_pegawai ?? "-"}
                </div>
                {s.catatan_screening && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">“{s.catatan_screening}”</p>}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <HasilBadge hasil={s.hasil_screening} />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Skor {formatAngka(s.skor_kecocokan, 2)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Bagian>
  );
}

function LogProgres({ items }) {
  return (
    <Bagian icon="timeline" judul="Log Progres">
      {items.length === 0 ? (
        <KeadaanKosong ringkas ikon="timeline">Belum ada progres. Log dimulai saat permintaan diajukan.</KeadaanKosong>
      ) : (
        <ol className="relative border-l-2 border-surface-container-high ml-3 space-y-space-md">
          {items.map((log) => {
            const t = TAHAPAN[log.status_tahapan] ?? { label: log.status_tahapan, ikon: "radio_button_checked" };
            return (
              <li key={log.id_progres} className="pl-space-lg relative">
                <span
                  className={`absolute -left-[13px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    log.status_tahapan === "ditolak" ? "bg-error-container text-on-error-container" : "bg-primary-fixed text-on-primary-fixed-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{t.ikon}</span>
                </span>
                <div className="flex flex-wrap items-center gap-x-space-sm gap-y-1">
                  <span className="font-title-sm text-title-sm text-on-surface">{t.label}</span>
                  <SlaBadge indikator={log.indikator_sla} />
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  {formatTanggalWaktu(log.log_waktu_pembaruan)}
                  {log.talent && ` · ${log.talent.nama_lengkap}`}
                  {log.penanggung_jawab && ` · PJ: ${log.penanggung_jawab.nama_pegawai}`}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Bagian>
  );
}
