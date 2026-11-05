import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { Chip, KeadaanKosong, KepalaHalaman, Memuat, Pesan, TagChip, formatAngka, formatTanggal, formatTanggalWaktu, tagSelainKompetensi } from "../components/ui";
import { useToast } from "../components/toast";
import { IKON_FILE, TombolLihatSertifikat } from "../components/sertifikat";
import { CatatanUsulan, ModalUsulkan, UsulanBadge } from "../components/rekrutmen/usulan";
import { BarSkor, Pemenuhan, SlaBadge, StatusReqBadge, TERBUKA } from "../components/jobRequirement/shared";

// Halaman Rekomendasi Kandidat (FR-07, FR-08) — khusus Talent Support. TS mengusulkan kandidat ke Account Manager
// beserta catatan (revisi 2026-11-05); talent di luar daftar ini (skor < 70) bisa diusulkan dari Talent Pool.
// Skor berbasis aturan (R9): 80% kecocokan kompetensi + 20% pengalaman kerja. Hanya kandidat dengan skor
// minimal `meta.skor_minimum` (70) yang dikirim backend. Setiap kompetensi permintaan tampil sekali per kandidat:
// cocok (centang) atau belum dimiliki (silang).
export default function RekomendasiKandidat() {
  const [params, setParams] = useSearchParams();
  const idJob = params.get("job") ?? "";

  const [opsiJob, setOpsiJob] = useState(null);
  const [errorJob, setErrorJob] = useState("");
  const [versi, setVersi] = useState(0);
  const toast = useToast();

  useEffect(() => {
    api("/job-requirements?per_page=100")
      .then((res) => setOpsiJob(res.data.filter((j) => TERBUKA.includes(j.status_req))))
      .catch((err) => setErrorJob(err.message));
  }, [versi]);

  const job = opsiJob?.find((j) => String(j.id_job_req) === idJob);
  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);

  function pilihJob(id) {
    setParams(id ? { job: id } : {});
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="person_search" kategori="Talent Management" judul="Rekomendasi Kandidat">
        Pencocokan berbasis aturan antara data profil talent dan kebutuhan klien: skor = 80% kecocokan kompetensi + 20% pengalaman kerja.
        Pilih permintaan, lalu usulkan kandidat yang sesuai ke Account Manager.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="kartu p-space-md space-y-space-sm">
          <label className="block space-y-1">
            <span className="font-label-md text-label-md text-on-surface">Permintaan kebutuhan</span>
            <select
              value={idJob}
              onChange={(e) => pilihJob(e.target.value)}
              disabled={!opsiJob}
              className="input"
            >
              <option value="">{opsiJob ? "Pilih permintaan yang diajukan / diproses..." : "Memuat permintaan..."}</option>
              {opsiJob?.map((j) => (
                <option key={j.id_job_req} value={j.id_job_req}>
                  {j.posisi} — {j.klien.nama_perusahaan} (SLA {formatTanggal(j.sla_deadline)})
                </option>
              ))}
            </select>
          </label>
          {errorJob && <Pesan>{errorJob}</Pesan>}
          {opsiJob && opsiJob.length === 0 && (
            <KeadaanKosong ringkas ikon="receipt_long">Belum ada permintaan berstatus diajukan atau diproses.</KeadaanKosong>
          )}
          {idJob && opsiJob && !job && <Pesan>Permintaan tidak ditemukan atau sudah tidak terbuka untuk pencarian kandidat.</Pesan>}
        </div>

        {job && (
          <>
            <RingkasanJob job={job} />
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
              <div className="xl:col-span-7">
                <DaftarKandidat
                  key={`${job.id_job_req}-${versi}`}
                  job={job}
                  onUsul={(pesan) => {
                    toast.sukses(pesan);
                    muatUlang();
                  }}
                />
              </div>
              <div className="xl:col-span-5">
                <SudahDiusulkan key={`${job.id_job_req}-${versi}`} job={job} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RingkasanJob({ job }) {
  return (
    <div className="kartu p-space-md sm:p-space-lg flex flex-col lg:flex-row gap-space-md lg:items-center justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-1">
          <StatusReqBadge status={job.status_req} />
          <SlaBadge indikator={job.indikator_sla} />
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">{job.posisi}</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {job.klien.nama_perusahaan} · SLA {formatTanggalWaktu(job.sla_deadline)} ·{" "}
          {job.pengalaman_min ? `min. ${job.pengalaman_min} tahun pengalaman` : "tanpa minimal pengalaman"}
        </p>
        <div className="flex flex-wrap gap-1 pt-1">
          {job.kompetensi.map((k) => (
            <Chip key={k.id_kompetensi}>{k.nama_kompetensi}</Chip>
          ))}
        </div>
      </div>
      <div className="shrink-0 lg:w-48">
        <Pemenuhan terpenuhi={job.terpenuhi} jumlah={job.jumlah_kebutuhan} />
      </div>
    </div>
  );
}

function Bagian({ ikon, judul, info, children }) {
  return (
    <section className="kartu overflow-hidden">
      <div className="p-space-md bg-surface-container-low flex items-center justify-between gap-space-sm">
        <h3 className="flex items-center gap-2 font-title-sm text-title-sm text-on-surface">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px]">{ikon}</span>
          {judul}
        </h3>
        {info}
      </div>
      <div className="p-space-md">{children}</div>
    </section>
  );
}

function DaftarKandidat({ job, onUsul }) {
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let batal = false;
    api(`/job-requirements/${job.id_job_req}/rekomendasi`)
      .then((res) => !batal && setHasil(res))
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [job.id_job_req]);

  return (
    <Bagian
      ikon="insights"
      judul="Kandidat Direkomendasikan"
      info={hasil && <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{hasil.message}</span>}
    >
      {error && <Pesan>{error}</Pesan>}
      {!error && !hasil && <Memuat>Menghitung skor kecocokan...</Memuat>}
      {hasil && (
        <p className="mb-space-sm flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">info</span>
          Menampilkan kandidat dengan skor minimal {hasil.meta?.skor_minimum ?? 70}.
        </p>
      )}
      {hasil?.data.length === 0 && (
        <KeadaanKosong
          ikon="person_search"
          aksi={
            <Link to="/talent-pool" className="tombol-teks">
              Lihat talent pool
            </Link>
          }
        >
          Belum ada kandidat tersedia dengan skor kecocokan minimal {hasil.meta?.skor_minimum ?? 70}. Kandidat lain belum cukup memenuhi
          kompetensi atau pengalaman yang dibutuhkan, atau sudah diusulkan untuk permintaan ini. Talent lain tetap bisa diusulkan dari
          Talent Pool.
        </KeadaanKosong>
      )}
      <ol className="space-y-space-md">
        {hasil?.data.map((k, i) => (
          <KartuKandidat key={k.id_talent} kandidat={k} peringkat={i + 1} job={job} onUsul={onUsul} />
        ))}
      </ol>
    </Bagian>
  );
}

function KartuKandidat({ kandidat: k, peringkat, job, onUsul }) {
  const [buka, setBuka] = useState(false);
  // Tag keahlian hanya yang bukan nama kompetensi, karena kompetensi sudah tampil sebagai cocok/belum.
  const tag = tagSelainKompetensi(k.tag_keahlian, [...k.kompetensi_cocok, ...k.kompetensi_kurang]);

  return (
    <li className="rounded-xl ring-1 ring-surface-container-high p-space-md space-y-space-sm">
      <div className="flex items-start justify-between gap-space-md">
        <div className="flex items-start gap-space-sm min-w-0">
          <span className="w-7 h-7 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md">
            {peringkat}
          </span>
          <div className="min-w-0">
            <div className="font-title-md text-title-md text-on-surface">{k.nama_lengkap}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              {k.pendidikan ?? "-"} · {formatAngka(k.lama_pengalaman)} tahun pengalaman
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-headline-md text-headline-md text-primary leading-none">{formatAngka(k.skor_kecocokan, 2)}</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant">skor kecocokan</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
        <div className="space-y-1">
          <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>Kompetensi (80%)</span>
            <span>{formatAngka(k.skor_kompetensi, 2)}</span>
          </div>
          <BarSkor nilai={k.skor_kompetensi} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>Pengalaman (20%)</span>
            <span>{formatAngka(k.skor_pengalaman, 2)}</span>
          </div>
          <BarSkor nilai={k.skor_pengalaman} className="bg-tertiary-fixed-dim" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="font-label-sm text-label-sm text-on-surface-variant">
          Kompetensi permintaan: {k.kompetensi_cocok.length} dari {k.kompetensi_cocok.length + k.kompetensi_kurang.length} cocok
        </div>
        <ul className="flex flex-wrap items-center gap-1" aria-label="Kompetensi permintaan">
          {k.kompetensi_cocok.map((nama) => (
            <li key={nama} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md">
              <span aria-hidden="true" className="material-symbols-outlined text-[14px]">check</span>
              {nama}
              <span className="sr-only">(cocok)</span>
            </li>
          ))}
          {k.kompetensi_kurang.map((nama) => (
            <li key={nama} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg ring-1 ring-outline-variant text-outline font-label-md text-label-md">
              <span aria-hidden="true" className="material-symbols-outlined text-[14px]">close</span>
              {nama}
              <span className="sr-only">(belum dimiliki)</span>
            </li>
          ))}
        </ul>
      </div>
      {(k.sertifikat?.length ?? 0) > 0 && (
        <div className="space-y-1">
          <div className="font-label-sm text-label-sm text-on-surface-variant">Sertifikat</div>
          <ul className="space-y-1" aria-label="Sertifikat kandidat">
            {k.sertifikat.map((s) => (
              <li key={s.id_sertifikat} className="flex flex-wrap items-center justify-between gap-x-space-sm gap-y-1">
                <span className="flex items-center gap-1 min-w-0 font-body-sm text-body-sm text-on-surface">
                  <span aria-hidden="true" className="material-symbols-outlined text-primary text-[18px]">{IKON_FILE[s.jenis_file] ?? "workspace_premium"}</span>
                  <span className="break-words">{s.nama_sertifikat}</span>
                </span>
                {s.file_sertifikat ? (
                  <TombolLihatSertifikat sertifikat={s} className="tombol-teks min-h-[32px] px-2" />
                ) : (
                  <span className="font-body-sm text-body-sm text-outline">Belum ada file</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {tag.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Tag:</span>
          {tag.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={() => setBuka(true)} className="tombol-utama w-full sm:w-auto">
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
          Usulkan ke AM
        </button>
      </div>
      {buka && (
        <ModalUsulkan
          talent={k}
          job={job}
          skor={k.skor_kecocokan}
          onClose={() => setBuka(false)}
          onBerhasil={(res) => {
            setBuka(false);
            onUsul(`${res.message} (${k.nama_lengkap})`);
          }}
        />
      )}
    </li>
  );
}

function SudahDiusulkan({ job }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let batal = false;
    api(`/screening?id_job_req=${job.id_job_req}&per_page=100`)
      .then((res) => !batal && setItems(res.data))
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [job.id_job_req]);

  return (
    <Bagian ikon="forward_to_inbox" judul="Sudah Diusulkan ke AM" info={items && <span className="font-label-sm text-label-sm text-on-surface-variant">{items.length} kandidat</span>}>
      {error && <Pesan>{error}</Pesan>}
      {!error && !items && <Memuat />}
      {items?.length === 0 && <KeadaanKosong ringkas ikon="forward_to_inbox">Belum ada kandidat yang diusulkan untuk permintaan ini.</KeadaanKosong>}
      <ul className="divide-y divide-surface-container-high">
        {items?.map((s) => (
          <li key={s.id_screening} className="py-space-sm first:pt-0 last:pb-0 space-y-1">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="min-w-0">
                <div className="font-title-sm text-title-sm text-on-surface">{s.talent.nama_lengkap}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">
                  Skor {formatAngka(s.skor_kecocokan, 2)} · {formatTanggal(s.tanggal_screening)}
                  {s.talent_support && ` · oleh ${s.talent_support.nama_pegawai}`}
                </div>
              </div>
              <div className="shrink-0">
                <UsulanBadge status={s.status_usulan} label={s.label_status_usulan} />
              </div>
            </div>
            <CatatanUsulan catatan={s.catatan_screening} alasan={s.alasan_tidak_diteruskan} />
          </li>
        ))}
      </ul>
    </Bagian>
  );
}
