import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE } from "../auth/roles";
import { KartuRingkasan, KeadaanKosong, KepalaHalaman, KotakCari, Memuat, Pagination, Pesan, errorField, formatTanggal, formatTanggalWaktu, useTunda } from "../components/ui";
import { Field, LaporanBadge, Modal, inputClass, labelPlacement, tombolHalaman, usePlacement } from "../components/operasional/shared";

const KARTU = [
  { status: "", key: "total", label: "Total Tiket", ikon: "confirmation_number", warna: "text-primary" },
  { status: "baru", key: "baru", label: "Baru", ikon: "fiber_new", warna: "text-error" },
  { status: "diproses", key: "diproses", label: "Diproses", ikon: "pending", warna: "text-secondary" },
  { status: "selesai", key: "selesai", label: "Selesai", ikon: "task_alt", warna: "text-on-tertiary-container" },
];

// Halaman Tiket Komplain Klien (FR-19, R24): HR Client melapor; AM & Manager menindaklanjuti.
export default function TiketKomplain() {
  const { user } = useAuth();
  const hr = user.role === ROLE.HR_CLIENT;
  const [cari, setCari] = useState("");
  const search = useTunda(cari.trim());
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [buat, setBuat] = useState(false);
  const [dipilih, setDipilih] = useState(null);

  useEffect(() => setPage(1), [search]);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: 10 });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    setError("");
    api(`/laporan-keluhan?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [search, status, page, versi]);

  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);
  const r = hasil?.meta.ringkasan;

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman
        ikon="support_agent"
        kategori="Operasional & HR"
        judul="Tiket Komplain Klien"
        aksi={
          hr && (
            <button type="button" onClick={() => (setSukses(""), setBuat(true))} className={tombolHalaman}>
              <span className="material-symbols-outlined text-[18px]">add_comment</span>
              Buat Laporan
            </button>
          )
        }
      >
        {hr
          ? "Laporkan kendala terkait talent yang ditempatkan di perusahaan Anda; tim PT Intellisys akan menindaklanjuti."
          : "Keluhan klien terhadap talent yang ditempatkan beserta status tindak lanjutnya."}
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-md">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-space-md">
          {KARTU.map((k) => (
            <KartuRingkasan
              key={k.key}
              label={k.label}
              nilai={r?.[k.key]}
              ikon={k.ikon}
              warna={k.warna}
              aktif={status === k.status}
              onClick={() => {
                setStatus(k.status);
                setPage(1);
              }}
            />
          ))}
        </div>

        <div className="kartu p-space-md">
          <KotakCari value={cari} onChange={setCari} placeholder="Cari judul laporan atau nama talent..." />
        </div>

        {error && <Pesan>{error}</Pesan>}
        {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}

        <div className="kartu overflow-hidden">
          {!hasil && !error && <Memuat>Memuat tiket...</Memuat>}
          {hasil?.data.length === 0 && (
            <KeadaanKosong ikon="support_agent">
              {search || status ? "Tidak ada tiket yang cocok dengan pencarian atau filter." : "Belum ada tiket komplain."}
            </KeadaanKosong>
          )}
          {hasil?.data.length > 0 && (
            <div className="overflow-x-auto w-full">
              <table className="tabel min-w-[760px] text-left border-collapse">
                <thead>
                  <tr>
                    <th>Laporan</th>
                    <th>Talent</th>
                    <th>Dilaporkan</th>
                    <th>Ditindaklanjuti</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hasil.data.map((l) => (
                    <tr key={l.id_laporan} onClick={() => setDipilih(l)} className="hover:bg-surface-container-low cursor-pointer align-top">
                      <td className="max-w-[320px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDipilih(l);
                          }}
                          className="text-left font-title-sm text-title-sm text-on-surface hover:text-primary"
                        >
                          {l.judul_laporan}
                        </button>
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{l.deskripsi_keluhan}</p>
                      </td>
                      <td>
                        <span className="block text-on-surface">{l.placement.talent.nama_lengkap}</span>
                        <span className="block font-body-sm text-body-sm text-on-surface-variant">{l.placement.klien.nama_perusahaan}</span>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="block text-on-surface-variant">{formatTanggal(l.tanggal_laporan)}</span>
                        {l.pelapor && <span className="block font-body-sm text-body-sm text-outline">oleh {l.pelapor.nama_hr}</span>}
                      </td>
                      <td className="text-on-surface-variant">{l.tindak_lanjut.oleh ?? "-"}</td>
                      <td>
                        <LaporanBadge status={l.status_laporan} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="tiket" />}
        </div>
      </div>

      {buat && (
        <ModalBuat
          onClose={() => setBuat(false)}
          onBerhasil={(pesan) => {
            setBuat(false);
            setSukses(pesan);
            muatUlang();
          }}
        />
      )}
      {dipilih && (
        <DrawerTiket
          laporan={dipilih}
          user={user}
          onClose={() => setDipilih(null)}
          onBerhasil={(data, pesan) => {
            setDipilih(data);
            setSukses(pesan);
            muatUlang();
          }}
        />
      )}
    </div>
  );
}

function ModalBuat({ onClose, onBerhasil }) {
  const { daftar, error: errorPlacement } = usePlacement("");
  const [form, setForm] = useState({ id_placement: "", judul_laporan: "", deskripsi_keluhan: "" });
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const e = (f) => errorField(error, f);
  const set = (f) => (ev) => {
    setForm((x) => ({ ...x, [f]: ev.target.value }));
    setError(null);
  };

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await api("/laporan-keluhan", {
        method: "POST",
        body: {
          id_placement: form.id_placement ? Number(form.id_placement) : null,
          judul_laporan: form.judul_laporan.trim() || null,
          deskripsi_keluhan: form.deskripsi_keluhan.trim() || null,
        },
      });
      onBerhasil(res.message);
    } catch (err) {
      setError(err);
      setKirim(false);
    }
  }

  return (
    <Modal
      judul="Buat Laporan Keluhan"
      sibuk={kirim}
      onClose={onClose}
      onSubmit={simpan}
      aksi={
        <button type="submit" disabled={kirim} className="tombol-utama">
          {kirim ? "Mengirim..." : "Kirim Laporan"}
        </button>
      }
    >
      {errorPlacement && <Pesan>{errorPlacement}</Pesan>}
      {error && <Pesan>{error.message}</Pesan>}
      <Field label="Talent" wajib error={e("id_placement")}>
        <select value={form.id_placement} onChange={set("id_placement")} disabled={!daftar} className={inputClass(e("id_placement"))}>
          <option value="">{daftar ? "Pilih talent yang ditempatkan..." : "Memuat..."}</option>
          {daftar?.map((p) => (
            <option key={p.id_placement} value={p.id_placement}>
              {labelPlacement(p)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Judul laporan" wajib error={e("judul_laporan")}>
        <input value={form.judul_laporan} onChange={set("judul_laporan")} maxLength={255} placeholder="Contoh: Sering terlambat hadir" className={inputClass(e("judul_laporan"))} />
      </Field>
      <Field label="Deskripsi keluhan" wajib error={e("deskripsi_keluhan")}>
        <textarea rows={5} value={form.deskripsi_keluhan} onChange={set("deskripsi_keluhan")} maxLength={5000} className={`${inputClass(e("deskripsi_keluhan"))} h-auto py-2`} />
      </Field>
    </Modal>
  );
}

function DrawerTiket({ laporan: l, user, onClose, onBerhasil }) {
  const bolehTindak = [ROLE.ACCOUNT_MANAGER, ROLE.MANAGER].includes(user.role) && l.status_laporan !== "selesai";
  const [status, setStatus] = useState(l.status_laporan === "baru" ? "diproses" : "selesai");
  const [hasil, setHasil] = useState(l.tindak_lanjut.hasil ?? "");
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const esc = (ev) => ev.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await api(`/laporan-keluhan/${l.id_laporan}/tindak-lanjut`, {
        method: "PATCH",
        body: { status_laporan: status, hasil_tindak_lanjut: hasil.trim() || null },
      });
      onBerhasil(res.data, res.message);
    } catch (err) {
      setError(err);
    } finally {
      setKirim(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Detail tiket">
      <div className="absolute inset-0 bg-inverse-surface/40" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-surface flex flex-col shadow-xl">
        <div className="flex items-center justify-between gap-space-sm px-space-lg h-16 bg-surface-container-lowest border-b border-surface-container-high shrink-0">
          <h2 className="font-title-md text-title-md text-on-surface">Detail Tiket</h2>
          <button type="button" onClick={onClose} title="Tutup" className="tombol-ikon -mr-2">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-space-md sm:p-space-lg space-y-space-md">
          <section className="kartu p-space-md space-y-space-sm">
            <div className="flex items-start justify-between gap-space-sm">
              <h3 className="font-title-md text-title-md text-on-surface">{l.judul_laporan}</h3>
              <LaporanBadge status={l.status_laporan} />
            </div>
            <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">{l.deskripsi_keluhan}</p>
            <dl className="grid grid-cols-2 gap-space-sm pt-space-xs font-body-sm text-body-sm">
              <div>
                <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Talent</dt>
                <dd className="text-on-surface">{l.placement.talent.nama_lengkap}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Klien</dt>
                <dd className="text-on-surface">{l.placement.klien.nama_perusahaan}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Pelapor</dt>
                <dd className="text-on-surface">{l.pelapor?.nama_hr ?? "-"}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Dilaporkan</dt>
                <dd className="text-on-surface">{formatTanggalWaktu(l.tanggal_laporan)}</dd>
              </div>
            </dl>
          </section>

          <section className="kartu p-space-md space-y-space-sm">
            <h3 className="flex items-center gap-space-sm font-title-sm text-title-sm text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
              Tindak Lanjut
            </h3>
            {l.tindak_lanjut.oleh ? (
              <div className="space-y-1">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {l.tindak_lanjut.oleh} · {formatTanggalWaktu(l.tindak_lanjut.tanggal)}
                </p>
                {l.tindak_lanjut.hasil && <p className="font-body-md text-body-md text-on-surface whitespace-pre-line">{l.tindak_lanjut.hasil}</p>}
              </div>
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ditindaklanjuti.</p>
            )}

            {bolehTindak && (
              <div className="bg-surface-container-low rounded-lg p-space-sm space-y-space-sm">
                {error && <Pesan>{errorField(error, "status_laporan") ?? error.message}</Pesan>}
                <div className="grid grid-cols-2 gap-1" role="radiogroup" aria-label="Status laporan">
                  {[
                    ["diproses", "Diproses"],
                    ["selesai", "Selesai"],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={status === v}
                      onClick={() => (setStatus(v), setError(null))}
                      className={`h-10 rounded-lg font-label-md text-label-md ${status === v ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Field label="Hasil tindak lanjut" wajib={status === "selesai"} error={errorField(error, "hasil_tindak_lanjut")}>
                  <textarea
                    rows={4}
                    value={hasil}
                    onChange={(ev) => (setHasil(ev.target.value), setError(null))}
                    maxLength={5000}
                    className={`${inputClass(errorField(error, "hasil_tindak_lanjut"))} h-auto py-2`}
                  />
                </Field>
                <div className="flex justify-end">
                  <button type="button" onClick={simpan} disabled={kirim} className="tombol-utama">
                    {kirim ? "Menyimpan..." : "Simpan Tindak Lanjut"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
