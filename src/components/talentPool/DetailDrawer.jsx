import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { initials } from "../../auth/roles";
import {
  Badge,
  Chip,
  HASIL_SCREENING,
  Pesan,
  STATUS_KANDIDAT,
  STATUS_KETERSEDIAAN,
  StatusBadge,
  TagChip,
  formatBulan,
  formatRupiah,
  formatTanggal,
  pecahTag,
} from "./shared";

// Panel samping detail talent pool (GET /talent-pool/{id}). `bolehUbah` = role TS (PATCH /talent-pool/{id}).
export default function DetailDrawer({ id, bolehUbah, onClose, onUpdated }) {
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let batal = false;
    setDetail(null);
    setError("");
    api(`/talent-pool/${id}`)
      .then((res) => !batal && setDetail(res.data))
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [id]);

  useEffect(() => {
    const esc = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  function handleUpdated(data) {
    setDetail(data);
    onUpdated();
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Detail talent">
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-surface flex flex-col shadow-xl">
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] shrink-0">
          <h2 className="font-title-md text-title-md text-on-surface">Detail Talent</h2>
          <button
            type="button"
            onClick={onClose}
            title="Tutup"
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">
          {error && <Pesan>{error}</Pesan>}
          {!error && !detail && (
            <div className="flex items-center justify-center gap-space-sm py-space-xl font-body-md text-body-md text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              Memuat detail...
            </div>
          )}
          {detail && (
            <>
              <Profil detail={detail} />
              {bolehUbah && <FormUbah detail={detail} onUpdated={handleUpdated} />}
              <RiwayatPendidikan items={detail.talent.riwayat_pendidikan} />
              <PengalamanKerja items={detail.talent.riwayat_pengalaman_kerja} lama={detail.talent.lama_pengalaman_tahun} />
              {detail.talent.sertifikat.length > 0 && <Sertifikat items={detail.talent.sertifikat} />}
              <RiwayatScreening items={detail.riwayat_screening} />
            </>
          )}
        </div>

        {detail && (
          <div className="shrink-0 px-space-lg py-space-md bg-surface-container-lowest border-t border-surface-container-high">
            <TombolCv id={detail.id_talent_pool} adaCv={detail.talent.ada_cv} nama={detail.talent.nama_lengkap} />
          </div>
        )}
      </div>
    </div>
  );
}

function Bagian({ icon, judul, aksi, children }) {
  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-md space-y-space-sm">
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

const Kosong = ({ children }) => <p className="font-body-sm text-body-sm text-on-surface-variant">{children}</p>;

function Info({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">{label}</dt>
      <dd className="font-body-md text-body-md text-on-surface break-words">{children || "-"}</dd>
    </div>
  );
}

// Hanya tautan http(s) yang dijadikan link; isi berasal dari input talent.
const amanUrl = (url) => (/^https?:\/\//i.test(url ?? "") ? url : null);

function Profil({ detail }) {
  const { talent } = detail;
  const tautan = [
    ["LinkedIn", talent.linkedin],
    ["GitHub", talent.github],
    ["Portfolio", talent.portfolio],
  ].filter(([, url]) => amanUrl(url));
  const tag = pecahTag(detail.tag_keahlian);

  return (
    <Bagian icon="person" judul="Profil">
      <div className="flex items-center gap-space-md">
        <span className="w-12 h-12 shrink-0 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-title-md text-title-md">
          {initials(talent.nama_lengkap ?? "")}
        </span>
        <div className="min-w-0">
          <div className="font-title-md text-title-md text-on-surface truncate">{talent.nama_lengkap}</div>
          <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{talent.email}</div>
          <div className="flex flex-wrap gap-1 mt-1">
            <StatusBadge status={detail.status_ketersediaan} />
            <Badge className="bg-secondary-container text-on-secondary-fixed">
              Kandidat: {STATUS_KANDIDAT[talent.status_kandidat] ?? talent.status_kandidat}
            </Badge>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-space-md gap-y-space-sm pt-space-xs">
        <Info label="Pendidikan">{talent.pendidikan}</Info>
        <Info label="Domisili">{talent.domisili}</Info>
        <Info label="Nomor Telepon">{talent.nomor_telepon}</Info>
        <Info label="Tanggal Lahir">{talent.tanggal_lahir && formatTanggal(talent.tanggal_lahir)}</Info>
        <Info label="Gaji Harapan">{talent.gaji_harapan != null && formatRupiah(talent.gaji_harapan)}</Info>
        <Info label="Masuk Talent Pool">{formatTanggal(detail.tanggal_masuk)}</Info>
      </dl>

      {talent.tentang_saya && (
        <div>
          <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Tentang Saya</div>
          <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">{talent.tentang_saya}</p>
        </div>
      )}

      <div>
        <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">Kompetensi</div>
        {talent.kompetensi.length ? (
          <div className="flex flex-wrap gap-1">
            {talent.kompetensi.map((k) => (
              <Chip key={k.id_kompetensi} title={k.kategori}>
                {k.nama_kompetensi}
              </Chip>
            ))}
          </div>
        ) : (
          <Kosong>Belum ada kompetensi.</Kosong>
        )}
      </div>

      <div>
        <div className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-1">Tag Keahlian</div>
        {tag.length ? (
          <div className="flex flex-wrap gap-1">
            {tag.map((t) => (
              <TagChip key={t}>{t}</TagChip>
            ))}
          </div>
        ) : (
          <Kosong>Belum ada tag keahlian.</Kosong>
        )}
      </div>

      {tautan.length > 0 && (
        <div className="flex flex-wrap gap-space-sm">
          {tautan.map(([label, url]) => (
            <a
              key={label}
              href={amanUrl(url)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              {label}
            </a>
          ))}
        </div>
      )}
    </Bagian>
  );
}

function FormUbah({ detail, onUpdated }) {
  const [status, setStatus] = useState(detail.status_ketersediaan);
  const [tag, setTag] = useState(detail.tag_keahlian ?? "");
  const [simpan, setSimpan] = useState(false);
  const [error, setError] = useState(null);
  const [sukses, setSukses] = useState("");

  const tagBaru = tag.trim() || null;
  const berubah = { status: status !== detail.status_ketersediaan, tag: tagBaru !== (detail.tag_keahlian ?? null) };

  async function handleSubmit(event) {
    event.preventDefault();
    const body = {};
    if (berubah.status) body.status_ketersediaan = status;
    if (berubah.tag) body.tag_keahlian = tagBaru;

    setSimpan(true);
    setError(null);
    setSukses("");
    try {
      const res = await api(`/talent-pool/${detail.id_talent_pool}`, { method: "PATCH", body });
      setSukses(res.message);
      onUpdated(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setSimpan(false);
    }
  }

  const errorField = (field) => error?.errors?.[field]?.[0];

  return (
    <Bagian icon="edit_note" judul="Kelola Talent Pool">
      <form onSubmit={handleSubmit} className="space-y-space-sm" noValidate>
        {error && <Pesan>{error.message}</Pesan>}
        {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}

        <fieldset>
          <legend className="font-label-md text-label-md text-on-surface mb-1">Status ketersediaan</legend>
          <div className="grid grid-cols-2 gap-space-sm">
            {Object.entries(STATUS_KETERSEDIAAN).map(([nilai, { label }]) => (
              <label
                key={nilai}
                className={`flex items-center justify-center gap-1.5 h-10 rounded-lg cursor-pointer font-label-md text-label-md transition-colors ${
                  status === nilai
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <input type="radio" name="status_ketersediaan" value={nilai} checked={status === nilai} onChange={() => setStatus(nilai)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
          {errorField("status_ketersediaan") && <p className="mt-1 font-body-sm text-body-sm text-error">{errorField("status_ketersediaan")}</p>}
        </fieldset>

        <label className="block space-y-1">
          <span className="font-label-md text-label-md text-on-surface">Tag keahlian</span>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            maxLength={255}
            placeholder="Contoh: Laravel, MySQL, REST API"
            className={`w-full h-10 px-3 rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-2 ${
              errorField("tag_keahlian") ? "ring-2 ring-error focus:ring-error" : "focus:ring-primary-container"
            }`}
          />
          <span className="block font-body-sm text-body-sm text-on-surface-variant">Pisahkan dengan koma. Kosongkan untuk menghapus semua tag.</span>
          {errorField("tag_keahlian") && <span className="block font-body-sm text-body-sm text-error">{errorField("tag_keahlian")}</span>}
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={simpan || (!berubah.status && !berubah.tag)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-primary"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {simpan ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </Bagian>
  );
}

function RiwayatPendidikan({ items }) {
  return (
    <Bagian icon="school" judul="Riwayat Pendidikan">
      {items.length === 0 ? (
        <Kosong>Belum ada riwayat pendidikan.</Kosong>
      ) : (
        <ol className="space-y-space-sm">
          {items.map((p) => (
            <li key={p.id_riwayat_pendidikan} className="border-l-2 border-primary-fixed-dim pl-space-sm">
              <div className="font-title-sm text-title-sm text-on-surface">
                {[p.jenjang, p.jurusan].filter(Boolean).join(" ")}
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant">{p.nama_institusi}</div>
              <div className="font-body-sm text-body-sm text-outline">
                {p.tahun_mulai ?? "?"} – {p.tahun_selesai ?? "Sekarang"}
              </div>
              {p.deskripsi && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{p.deskripsi}</p>}
            </li>
          ))}
        </ol>
      )}
    </Bagian>
  );
}

function PengalamanKerja({ items, lama }) {
  return (
    <Bagian
      icon="work_history"
      judul="Pengalaman Kerja"
      aksi={
        <Badge className="bg-primary-fixed text-on-primary-fixed-variant">
          Total {Number(lama).toLocaleString("id-ID", { maximumFractionDigits: 1 })} tahun
        </Badge>
      }
    >
      {items.length === 0 ? (
        <Kosong>Belum ada pengalaman kerja.</Kosong>
      ) : (
        <ol className="space-y-space-sm">
          {items.map((p, i) => (
            <li key={`${p.nama_perusahaan}-${p.tanggal_mulai}-${i}`} className="border-l-2 border-primary-fixed-dim pl-space-sm">
              <div className="font-title-sm text-title-sm text-on-surface">{p.posisi}</div>
              <div className="font-body-md text-body-md text-on-surface-variant">{p.nama_perusahaan}</div>
              <div className="font-body-sm text-body-sm text-outline">
                {formatBulan(p.tanggal_mulai)} – {p.masih_bekerja ? "Sekarang" : formatBulan(p.tanggal_selesai)}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Bagian>
  );
}

function Sertifikat({ items }) {
  return (
    <Bagian icon="workspace_premium" judul="Sertifikat">
      <ul className="space-y-space-sm">
        {items.map((s) => (
          <li key={s.id_sertifikat}>
            <div className="font-title-sm text-title-sm text-on-surface">{s.nama_sertifikat}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              {[s.penerbit, s.tanggal_terbit && formatTanggal(s.tanggal_terbit)].filter(Boolean).join(" · ")}
            </div>
          </li>
        ))}
      </ul>
    </Bagian>
  );
}

function RiwayatScreening({ items }) {
  return (
    <Bagian icon="fact_check" judul="Riwayat Screening">
      {items.length === 0 ? (
        <Kosong>Talent belum pernah di-screening.</Kosong>
      ) : (
        <ul className="divide-y divide-surface-container-high">
          {items.map((s) => {
            const hasil = HASIL_SCREENING[s.hasil_screening] ?? { label: s.hasil_screening, className: "bg-surface-container" };
            return (
              <li key={s.id_screening} className="py-space-sm first:pt-0 last:pb-0 flex items-start justify-between gap-space-sm">
                <div className="min-w-0">
                  <div className="font-title-sm text-title-sm text-on-surface">{s.posisi ?? "-"}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    {[s.nama_perusahaan, formatTanggal(s.tanggal_screening)].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge className={hasil.className}>{hasil.label}</Badge>
                  {s.skor_kecocokan != null && (
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Skor {Number(s.skor_kecocokan).toLocaleString("id-ID")}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Bagian>
  );
}

// CV diunduh lewat fetch ber-token (endpoint terproteksi), lalu dibuka di tab baru sebagai blob PDF.
function TombolCv({ id, adaCv, nama }) {
  const [memuat, setMemuat] = useState(false);
  const [error, setError] = useState("");

  async function lihatCv() {
    // Tab dibuka sebelum await agar tidak diblokir popup blocker.
    const tab = window.open("", "_blank");
    setMemuat(true);
    setError("");
    try {
      const blob = await api(`/talent-pool/${id}/cv`, { blob: true });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      else window.location.assign(url);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      setError(err.message);
    } finally {
      setMemuat(false);
    }
  }

  return (
    <div className="space-y-space-sm">
      {error && <Pesan>{error}</Pesan>}
      <div className="flex items-center justify-between gap-space-sm">
        <span className="font-body-sm text-body-sm text-on-surface-variant min-w-0">
          {adaCv ? `CV ${nama}` : "Talent belum membuat CV."}
        </span>
        <button
          type="button"
          onClick={lihatCv}
          disabled={!adaCv || memuat}
          className="shrink-0 flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm transition-all disabled:opacity-50 disabled:hover:bg-primary"
        >
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          {memuat ? "Membuka..." : "Lihat CV"}
        </button>
      </div>
    </div>
  );
}
