// Detail usulan kandidat (GET /screening/{id}) untuk ditinjau sebelum diteruskan ke klien (feedback SUS 2026-11-14).
// Urutan: identitas & pendidikan → pengalaman → skor & rincian kecocokan → kompetensi & bahasa → catatan TS → CV & sertifikat → aksi.
// Aksi "Ajukan ke Klien" (POST /pengajuan) dan "Tidak Diteruskan" hanya untuk Account Manager; TS & Manager hanya membaca.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ROLE } from "../../auth/roles";
import { Laci } from "../dialog";
import { Badge, NADA, Pesan, Proses, Memuat, errorField, formatAngka, formatTanggal } from "../ui";
import { DaftarSertifikat } from "../sertifikat";
import { TombolCv } from "../talentPool/DetailDrawer";
import { BarSkor } from "../jobRequirement/shared";
import { Bagian, Info, PengalamanKandidat } from "./PengajuanDrawer";
import { CatatanUsulan, ModalTidakDiteruskan, UsulanBadge } from "./usulan";

// `onDiteruskan(res)` / `onTidakDiteruskan(res)` dipanggil setelah aksi berhasil. Tanpa `onDiteruskan` panel hanya baca untuk semua role.
export default function DetailUsulan({ id, user, onClose, onDiteruskan, onTidakDiteruskan }) {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");
  const [kirim, setKirim] = useState(false);
  const [errorAksi, setErrorAksi] = useState("");
  const [tolak, setTolak] = useState(false);

  useEffect(() => {
    let batal = false;
    setError("");
    api(`/screening/${id}`)
      .then((res) => !batal && setS(res.data))
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [id]);

  const am = user.role === ROLE.ACCOUNT_MANAGER;
  const menunggu = s?.status_usulan === "menunggu_am";
  const jobBerjalan = s?.job_requirement.status_req === "diproses";
  const bolehAksi = am && !!onDiteruskan && menunggu && jobBerjalan;

  async function ajukan() {
    setKirim(true);
    setErrorAksi("");
    try {
      const res = await api("/pengajuan", { method: "POST", body: { id_screening: s.id_screening } });
      onDiteruskan(res, s);
    } catch (err) {
      setErrorAksi(errorField(err, "id_screening") ?? err.message);
      setKirim(false);
    }
  }

  const kaki = s && (
    bolehAksi ? (
      <div className="space-y-space-sm">
        {errorAksi && <Pesan>{errorAksi}</Pesan>}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-space-sm">
          <button type="button" onClick={() => setTolak(true)} disabled={kirim} className="tombol-kedua">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">block</span>
            Tidak Diteruskan
          </button>
          <button type="button" onClick={ajukan} disabled={kirim} className="tombol-utama">
            <Proses aktif={kirim} ikon="send">
              Ajukan ke Klien
            </Proses>
          </button>
        </div>
      </div>
    ) : (
      <KeteranganBacaSaja s={s} am={am} menunggu={menunggu} jobBerjalan={jobBerjalan} adaAksi={!!onDiteruskan} />
    )
  );

  return (
    <Laci judul="Detail Usulan Kandidat" label="Detail usulan kandidat" sibuk={kirim} onClose={onClose} kaki={kaki}>
      {error && <Pesan>{error}</Pesan>}
      {!error && !s && <Memuat>Memuat detail kandidat...</Memuat>}
      {s && (
        <>
          <Identitas s={s} />
          <PengalamanKandidat items={s.talent.riwayat_pengalaman_kerja} />
          <SkorKecocokan s={s} />
          <KompetensiBahasa talent={s.talent} cocok={s.rincian_kecocokan.kompetensi_cocok} />
          <Bagian icon="rate_review" judul="Catatan Screening Talent Support">
            {s.catatan_screening || s.alasan_tidak_diteruskan ? (
              <CatatanUsulan catatan={s.catatan_screening} alasan={s.alasan_tidak_diteruskan} />
            ) : (
              <p className="font-body-sm text-body-sm text-outline">Talent Support tidak menulis catatan.</p>
            )}
            <p className="font-body-sm text-body-sm text-outline">
              Diusulkan {formatTanggal(s.tanggal_screening)}
              {s.talent_support && ` oleh ${s.talent_support.nama_pegawai}`}
            </p>
          </Bagian>
          <Bagian icon="folder_open" judul="CV & Sertifikat">
            <TombolCv id={s.talent.id_talent_pool} adaCv={s.talent.ada_cv && !!s.talent.id_talent_pool} nama={s.talent.nama_lengkap} />
            <div className="border-t border-surface-container-high pt-space-sm">
              {s.talent.sertifikat.length > 0 ? (
                <DaftarSertifikat items={s.talent.sertifikat} />
              ) : (
                <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ada sertifikat.</p>
              )}
            </div>
          </Bagian>
        </>
      )}

      {tolak && (
        <ModalTidakDiteruskan
          usulan={s}
          onClose={() => setTolak(false)}
          onBerhasil={(res) => {
            setTolak(false);
            onTidakDiteruskan?.(res);
          }}
        />
      )}
    </Laci>
  );
}

function Identitas({ s }) {
  const { talent, job_requirement: job } = s;
  const riwayat = talent.riwayat_pendidikan;
  return (
    <Bagian icon="person" judul={talent.nama_lengkap} aksi={<UsulanBadge status={s.status_usulan} label={s.label_status_usulan} />}>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-space-md gap-y-space-sm">
        <Info label="Permintaan">
          {job.posisi} · {job.klien.nama_perusahaan}
        </Info>
        <Info label="Pendidikan terakhir">{talent.pendidikan}</Info>
        <Info label="Email">{talent.email}</Info>
        <Info label="Domisili">{talent.domisili}</Info>
      </dl>
      {riwayat.length > 1 && (
        <details className="group">
          <summary className="cursor-pointer font-label-md text-label-md text-primary list-none flex items-center gap-1">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px] transition-transform group-open:rotate-90">chevron_right</span>
            Riwayat pendidikan ({riwayat.length})
          </summary>
          <ul className="mt-space-xs space-y-1 pl-space-md">
            {riwayat.map((r) => (
              <li key={r.id_riwayat_pendidikan} className="font-body-sm text-body-sm text-on-surface-variant">
                <span className="text-on-surface">{[r.jenjang, r.jurusan].filter(Boolean).join(" ")}</span> – {r.nama_institusi}
                {(r.tahun_mulai || r.tahun_selesai) && ` (${r.tahun_mulai ?? "?"}–${r.tahun_selesai ?? "sekarang"})`}
              </li>
            ))}
          </ul>
        </details>
      )}
      {s.job_requirement.status_req !== "diproses" && (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Permintaan ini sudah {s.job_requirement.status_req}; usulan tidak dapat ditindaklanjuti.
        </p>
      )}
    </Bagian>
  );
}

// Skor besar = skor tersimpan saat usulan dibuat; rincian di bawahnya dihitung ulang dari profil saat ini (R9).
function SkorKecocokan({ s }) {
  const r = s.rincian_kecocokan;
  const jumlahJob = s.job_requirement.jumlah_kompetensi;
  const berbeda = s.skor_kecocokan != null && Math.abs(s.skor_kecocokan - r.skor_kecocokan) >= 0.01;
  return (
    <Bagian icon="analytics" judul="Skor Kecocokan">
      <div className="flex items-end gap-space-sm">
        <span className="tabular-nums font-headline-md text-headline-md text-primary leading-none">{formatAngka(s.skor_kecocokan, 2)}</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant pb-0.5">/ 100 · saat diusulkan</span>
      </div>
      <p className="font-body-sm text-body-sm text-outline">
        Rincian di bawah dihitung ulang dari profil saat ini
        {berbeda && ` (skor saat ini ${formatAngka(r.skor_kecocokan, 2)})`}.
      </p>
      <div className="space-y-space-sm">
        <BarisSkor
          label={`Kompetensi (${r.bobot_kompetensi}%)`}
          nilai={r.skor_kompetensi}
          keterangan={`${r.kompetensi_cocok.length} dari ${jumlahJob} kompetensi permintaan dimiliki`}
        />
        <BarisSkor
          label={`Pengalaman (${r.bobot_pengalaman}%)`}
          nilai={r.skor_pengalaman}
          warna="bg-tertiary-fixed-dim"
          keterangan={
            r.pengalaman_min > 0
              ? `${formatAngka(r.lama_pengalaman)} tahun dari minimal ${r.pengalaman_min} tahun`
              : `${formatAngka(r.lama_pengalaman)} tahun · permintaan tanpa syarat minimal`
          }
        />
      </div>
      <div className="space-y-space-xs">
        <div className="font-label-md text-label-md text-on-surface">Kecocokan dengan permintaan</div>
        <div className="flex flex-wrap gap-1">
          {r.kompetensi_cocok.map((k) => (
            <Badge key={k} className={NADA.sukses}>
              <span aria-hidden="true" className="material-symbols-outlined text-[14px] mr-0.5">check</span>
              {k}
            </Badge>
          ))}
          {r.kompetensi_kurang.map((k) => (
            <Badge key={k} className={NADA.bahaya}>
              <span aria-hidden="true" className="material-symbols-outlined text-[14px] mr-0.5">close</span>
              {k}
            </Badge>
          ))}
          {jumlahJob === 0 && <span className="font-body-sm text-body-sm text-outline">Permintaan belum punya kompetensi.</span>}
        </div>
        {r.kompetensi_kurang.length > 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            <span className="sr-only">Keterangan: </span>Tanda silang = kompetensi permintaan yang belum dimiliki kandidat.
          </p>
        )}
      </div>
    </Bagian>
  );
}

function BarisSkor({ label, nilai, keterangan, warna = "bg-primary" }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-space-sm">
        <span className="font-label-md text-label-md text-on-surface">{label}</span>
        <span className="tabular-nums font-title-sm text-title-sm text-on-surface">{formatAngka(nilai, 2)}</span>
      </div>
      <BarSkor nilai={nilai} className={warna} />
      <div className="font-body-sm text-body-sm text-on-surface-variant">{keterangan}</div>
    </div>
  );
}

// Kompetensi tidak punya level (hanya kategori); tingkat kemampuan hanya ada pada bahasa.
function KompetensiBahasa({ talent, cocok }) {
  return (
    <Bagian icon="psychology" judul="Kompetensi & Bahasa">
      {talent.kompetensi.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ada kompetensi.</p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {talent.kompetensi.map((k) => {
            const sesuai = cocok.includes(k.nama_kompetensi);
            return (
              <li
                key={k.id_kompetensi}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-label-md text-label-md ${
                  sesuai ? "bg-primary-fixed text-on-primary-fixed-variant" : "bg-surface-container text-on-surface-variant"
                }`}
                title={sesuai ? "Dibutuhkan permintaan" : undefined}
              >
                {k.nama_kompetensi}
                {k.kategori && <span className="font-body-sm text-body-sm opacity-75">· {k.kategori}</span>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="font-body-sm text-body-sm text-outline">Kompetensi berwarna = dibutuhkan permintaan ini. Kompetensi dicatat beserta kategorinya (tanpa level).</p>
      <div className="border-t border-surface-container-high pt-space-sm">
        <div className="font-label-md text-label-md text-on-surface mb-1">Bahasa</div>
        {talent.bahasa.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Belum diisi.</p>
        ) : (
          <ul className="flex flex-wrap gap-x-space-md gap-y-1">
            {talent.bahasa.map((b) => (
              <li key={b.id_bahasa} className="font-body-md text-body-md text-on-surface">
                {b.nama_bahasa} <span className="text-on-surface-variant">– {b.tingkat_kemampuan}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Bagian>
  );
}

function KeteranganBacaSaja({ s, am, menunggu, jobBerjalan, adaAksi }) {
  let teks;
  if (!menunggu) teks = `Usulan ini ${s.label_status_usulan.toLowerCase()}.`;
  else if (!jobBerjalan) teks = "Permintaan tidak lagi diproses, sehingga usulan tidak dapat diteruskan.";
  else if (!am) teks = "Hanya Account Manager yang dapat mengajukan usulan ini ke klien.";
  else if (!adaAksi) teks = null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
      <p className="flex items-start gap-1 font-body-sm text-body-sm text-on-surface-variant">
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">visibility</span>
        {teks ?? "Tinjau dan putuskan usulan ini di menu Pengajuan Kandidat."}
      </p>
      {am && menunggu && jobBerjalan && !adaAksi && (
        <Link to="/pengajuan-kandidat?tab=usulan" className="tombol-kedua shrink-0">
          Buka Usulan TS
        </Link>
      )}
    </div>
  );
}
