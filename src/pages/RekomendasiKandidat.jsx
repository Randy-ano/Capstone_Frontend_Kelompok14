import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { Chip, KepalaHalaman, Memuat, Pesan, TagChip, errorField, formatAngka, formatTanggal, formatTanggalWaktu, pecahTag } from "../components/ui";
import { HASIL_SCREENING, HasilBadge } from "../components/talentPool/shared";
import { BarSkor, Pemenuhan, SlaBadge, StatusReqBadge, TERBUKA } from "../components/jobRequirement/shared";

// Halaman Rekomendasi Kandidat (FR-07, FR-08) — khusus Talent Support.
// Skor berbasis aturan (R9): 80% kecocokan kompetensi + 20% pengalaman kerja.
export default function RekomendasiKandidat() {
  const [params, setParams] = useSearchParams();
  const idJob = params.get("job") ?? "";

  const [opsiJob, setOpsiJob] = useState(null);
  const [errorJob, setErrorJob] = useState("");
  const [versi, setVersi] = useState(0);
  const [sukses, setSukses] = useState("");

  useEffect(() => {
    api("/job-requirements?per_page=100")
      .then((res) => setOpsiJob(res.data.filter((j) => TERBUKA.includes(j.status_req))))
      .catch((err) => setErrorJob(err.message));
  }, [versi]);

  const job = opsiJob?.find((j) => String(j.id_job_req) === idJob);
  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);

  function pilihJob(id) {
    setSukses("");
    setParams(id ? { job: id } : {});
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="person_search" kategori="Talent Management" judul="Rekomendasi Kandidat">
        Pencocokan berbasis aturan antara data profil talent dan kebutuhan klien: skor = 80% kecocokan kompetensi + 20% pengalaman kerja.
        Pilih permintaan, lalu screening kandidat yang sesuai.
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm space-y-space-sm">
          <label className="block space-y-1">
            <span className="font-label-md text-label-md text-on-surface">Permintaan kebutuhan</span>
            <select
              value={idJob}
              onChange={(e) => pilihJob(e.target.value)}
              disabled={!opsiJob}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
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
            <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ada permintaan berstatus diajukan atau diproses.</p>
          )}
          {idJob && opsiJob && !job && <Pesan>Permintaan tidak ditemukan atau sudah tidak terbuka untuk pencarian kandidat.</Pesan>}
        </div>

        {job && (
          <>
            <RingkasanJob job={job} />
            {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
              <div className="xl:col-span-7">
                <DaftarKandidat
                  key={`${job.id_job_req}-${versi}`}
                  job={job}
                  onScreening={(pesan) => {
                    setSukses(pesan);
                    muatUlang();
                  }}
                />
              </div>
              <div className="xl:col-span-5">
                <SudahScreening key={`${job.id_job_req}-${versi}`} job={job} onUbah={setSukses} />
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
    <div className="bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm flex flex-col lg:flex-row gap-space-md lg:items-center justify-between">
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
    <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
      <div className="p-space-md bg-surface-container-low flex items-center justify-between gap-space-sm">
        <h3 className="flex items-center gap-2 font-title-sm text-title-sm text-on-surface">
          <span className="material-symbols-outlined text-primary text-[20px]">{ikon}</span>
          {judul}
        </h3>
        {info}
      </div>
      <div className="p-space-md">{children}</div>
    </section>
  );
}

function DaftarKandidat({ job, onScreening }) {
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
      {hasil?.data.length === 0 && (
        <p className="font-body-md text-body-md text-on-surface-variant py-space-md text-center">
          Tidak ada kandidat tersedia yang memiliki minimal 1 kompetensi yang dibutuhkan.
          <br />
          <Link to="/talent-pool" className="text-primary hover:underline">
            Lihat talent pool
          </Link>
        </p>
      )}
      <ol className="space-y-space-md">
        {hasil?.data.map((k, i) => (
          <KartuKandidat key={k.id_talent} kandidat={k} peringkat={i + 1} job={job} onScreening={onScreening} />
        ))}
      </ol>
    </Bagian>
  );
}

function KartuKandidat({ kandidat: k, peringkat, job, onScreening }) {
  const [buka, setBuka] = useState(false);
  const [catatan, setCatatan] = useState("");
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const tag = pecahTag(k.tag_keahlian);

  async function screening() {
    setKirim(true);
    setError(null);
    try {
      const res = await api("/screening", {
        method: "POST",
        body: { id_job_req: job.id_job_req, id_talent: k.id_talent, catatan_screening: catatan.trim() || null },
      });
      onScreening(`${res.message} ${k.nama_lengkap} masuk tahap screening.`);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <li className="rounded-xl ring-1 ring-surface-container-high p-space-md space-y-space-sm">
      <div className="flex items-start justify-between gap-space-md">
        <div className="flex items-start gap-space-sm min-w-0">
          <span className="w-7 h-7 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md">
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

      <div className="flex flex-wrap items-center gap-1">
        {k.kompetensi_cocok.map((nama) => (
          <span key={nama} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md">
            <span className="material-symbols-outlined text-[14px]">check</span>
            {nama}
          </span>
        ))}
        {k.kompetensi_kurang.map((nama) => (
          <span key={nama} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg ring-1 ring-outline-variant text-outline font-label-md text-label-md">
            <span className="material-symbols-outlined text-[14px]">close</span>
            {nama}
          </span>
        ))}
      </div>
      {tag.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tag.map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      )}

      {error && <Pesan>{errorField(error, "id_talent") ?? errorField(error, "id_job_req") ?? error.message}</Pesan>}
      {buka ? (
        <div className="space-y-space-sm pt-space-xs">
          <textarea
            rows={2}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            maxLength={2000}
            placeholder="Catatan screening (opsional)"
            className="w-full px-3 py-2 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
          <div className="flex flex-wrap justify-end gap-space-sm">
            <button type="button" onClick={() => setBuka(false)} disabled={kirim} className="h-9 px-3 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container">
              Batal
            </button>
            <button type="button" onClick={screening} disabled={kirim} className="h-9 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm disabled:opacity-50">
              {kirim ? "Memproses..." : "Konfirmasi Screening"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setBuka(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Screening
          </button>
        </div>
      )}
    </li>
  );
}

function SudahScreening({ job, onUbah }) {
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

  function ganti(baru, pesan) {
    setItems((list) => list.map((s) => (s.id_screening === baru.id_screening ? baru : s)));
    onUbah(pesan);
  }

  return (
    <Bagian ikon="fact_check" judul="Sudah di-screening" info={items && <span className="font-label-sm text-label-sm text-on-surface-variant">{items.length} kandidat</span>}>
      {error && <Pesan>{error}</Pesan>}
      {!error && !items && <Memuat />}
      {items?.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ada kandidat yang di-screening untuk permintaan ini.</p>}
      <ul className="divide-y divide-surface-container-high">
        {items?.map((s) => (
          <ItemScreening key={s.id_screening} screening={s} onSaved={ganti} />
        ))}
      </ul>
    </Bagian>
  );
}

function ItemScreening({ screening: s, onSaved }) {
  const [ubah, setUbah] = useState(false);
  const [hasil, setHasil] = useState(s.hasil_screening);
  const [catatan, setCatatan] = useState(s.catatan_screening ?? "");
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const final = s.hasil_screening === "tidak_lolos";

  async function simpan() {
    const body = {};
    if (hasil !== s.hasil_screening) body.hasil_screening = hasil;
    if ((catatan.trim() || null) !== (s.catatan_screening ?? null)) body.catatan_screening = catatan.trim() || null;

    setKirim(true);
    setError(null);
    try {
      const res = await api(`/screening/${s.id_screening}`, { method: "PUT", body });
      setUbah(false);
      onSaved(res.data, `${res.message} (${res.data.talent.nama_lengkap})`);
    } catch (err) {
      setError(err);
    } finally {
      setKirim(false);
    }
  }

  return (
    <li className="py-space-sm first:pt-0 last:pb-0 space-y-space-sm">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="min-w-0">
          <div className="font-title-sm text-title-sm text-on-surface">{s.talent.nama_lengkap}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            Skor {formatAngka(s.skor_kecocokan, 2)} · {formatTanggal(s.tanggal_screening)}
          </div>
          {s.catatan_screening && !ubah && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">“{s.catatan_screening}”</p>}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <HasilBadge hasil={s.hasil_screening} />
          {!ubah && (
            <button type="button" onClick={() => setUbah(true)} className="font-label-sm text-label-sm text-primary hover:underline">
              {final ? "Ubah catatan" : "Ubah hasil"}
            </button>
          )}
        </div>
      </div>

      {ubah && (
        <div className="bg-surface-container-low rounded-lg p-space-sm space-y-space-sm">
          {error && <Pesan>{errorField(error, "hasil_screening") ?? error.message}</Pesan>}
          {!final && (
            <div className="grid grid-cols-3 gap-1" role="radiogroup" aria-label="Hasil screening">
              {Object.entries(HASIL_SCREENING).map(([nilai, { label }]) => (
                <button
                  key={nilai}
                  type="button"
                  role="radio"
                  aria-checked={hasil === nilai}
                  onClick={() => setHasil(nilai)}
                  className={`h-9 rounded-lg font-label-md text-label-md transition-colors ${
                    hasil === nilai ? "bg-primary text-on-primary shadow-sm" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {hasil === "tidak_lolos" && !final && (
            <p className="font-body-sm text-body-sm text-error">Hasil "Tidak Lolos" bersifat final: talent dikembalikan menjadi tersedia dan hasil tidak dapat diubah lagi.</p>
          )}
          <textarea
            rows={2}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            maxLength={2000}
            placeholder="Catatan screening"
            className="w-full px-3 py-2 rounded-lg bg-surface-container-lowest font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
          <div className="flex justify-end gap-space-sm">
            <button
              type="button"
              onClick={() => {
                setUbah(false);
                setHasil(s.hasil_screening);
                setCatatan(s.catatan_screening ?? "");
                setError(null);
              }}
              disabled={kirim}
              className="h-9 px-3 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={simpan}
              disabled={kirim || (hasil === s.hasil_screening && (catatan.trim() || null) === (s.catatan_screening ?? null))}
              className="h-9 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm disabled:opacity-50"
            >
              {kirim ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
