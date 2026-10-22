import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { ROLE } from "../../auth/roles";
import { Memuat, Pagination, Pesan, PilihFilter, errorField, formatTanggal } from "../ui";
import {
  Field,
  JENIS_SHIFT,
  Modal,
  ShiftBadge,
  inputClass,
  keIso,
  labelPlacement,
  namaHari,
  tombol,
  tombolHalaman,
  usePlacement,
} from "./shared";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Tab Shift (FR-15, R22): HR Client & Manager mengatur (input massal), talent melihat shift miliknya.
export default function TabShift({ user }) {
  const kelola = [ROLE.HR_CLIENT, ROLE.MANAGER].includes(user.role);
  const { daftar: placement } = usePlacement(kelola ? "aktif" : "");
  const [bulan, setBulan] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [idPlacement, setIdPlacement] = useState("");
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");
  const [atur, setAtur] = useState(false);

  useEffect(() => {
    let batal = false;
    const akhir = new Date(bulan.getFullYear(), bulan.getMonth() + 1, 0);
    const params = new URLSearchParams({ page, per_page: 50, dari: keIso(bulan), sampai: keIso(akhir) });
    if (idPlacement) params.set("id_placement", idPlacement);
    setError("");
    api(`/shift?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [bulan, idPlacement, page, versi]);

  const geser = (n) => {
    setBulan((b) => new Date(b.getFullYear(), b.getMonth() + n, 1));
    setPage(1);
  };
  const berhasil = (pesan) => {
    setSukses(pesan);
    setError("");
    setVersi((v) => v + 1);
  };
  const hari = keIso(new Date());

  return (
    <div className="flex flex-col gap-space-md">
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => geser(-1)} title="Bulan sebelumnya" className="p-2 rounded-lg hover:bg-surface-container text-on-surface">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="min-w-[140px] text-center font-title-sm text-title-sm text-on-surface">
            {BULAN[bulan.getMonth()]} {bulan.getFullYear()}
          </span>
          <button type="button" onClick={() => geser(1)} title="Bulan berikutnya" className="p-2 rounded-lg hover:bg-surface-container text-on-surface">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
        {kelola && placement && (
          <PilihFilter
            ikon="badge"
            label="Talent"
            value={idPlacement}
            onChange={(v) => {
              setIdPlacement(v);
              setPage(1);
            }}
            semua="Semua Talent"
            opsi={placement.map((p) => [String(p.id_placement), `${p.talent.nama_lengkap} (${p.klien.nama_perusahaan})`])}
          />
        )}
        {kelola && (
          <button type="button" onClick={() => (setSukses(""), setAtur(true))} className={`${tombolHalaman} sm:ml-auto`}>
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            Atur Shift
          </button>
        )}
      </div>

      {error && <Pesan>{error}</Pesan>}
      {sukses && <Pesan jenis="sukses">{sukses}</Pesan>}

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        {!hasil && !error && <Memuat>Memuat shift...</Memuat>}
        {hasil?.data.length === 0 && (
          <p className="p-space-xl text-center font-body-md text-body-md text-on-surface-variant">Belum ada shift pada bulan ini.</p>
        )}
        {hasil?.data.length > 0 && (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                  <th className="py-3 px-4">Tanggal</th>
                  {user.role !== ROLE.TALENT && <th className="py-3 px-4">Talent</th>}
                  <th className="py-3 px-4">Shift</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Diatur oleh</th>
                  {kelola && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md divide-y divide-surface-container-low">
                {hasil.data.map((s) => (
                  <BarisShift key={s.id_shift} shift={s} user={user} kelola={kelola} hariIni={hari} onBerhasil={berhasil} onError={(m) => (setSukses(""), setError(m))} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="shift" />}
      </div>

      {atur && (
        <ModalAturShift
          placement={placement}
          awalPlacement={idPlacement}
          onClose={() => setAtur(false)}
          onBerhasil={(pesan) => {
            setAtur(false);
            berhasil(pesan);
          }}
        />
      )}
    </div>
  );
}

function BarisShift({ shift: s, user, kelola, hariIni, onBerhasil, onError }) {
  const [mode, setMode] = useState(""); // "" | "ubah" | "hapus"
  const [jenis, setJenis] = useState(s.jenis_shift);
  const [kirim, setKirim] = useState(false);

  async function aksi(method, body) {
    setKirim(true);
    try {
      const res = await api(`/shift/${s.id_shift}`, { method, body });
      setMode("");
      onBerhasil(res.message);
    } catch (err) {
      onError(errorField(err, "jenis_shift") ?? errorField(err, "tanggal_shift") ?? err.message);
    } finally {
      setKirim(false);
    }
  }

  return (
    <tr className={s.tanggal_shift === hariIni ? "bg-primary-fixed/30" : ""}>
      <td className="py-2.5 px-4 whitespace-nowrap">
        <span className="text-on-surface">
          {namaHari(s.tanggal_shift)}, {formatTanggal(s.tanggal_shift)}
        </span>
        {s.tanggal_shift === hariIni && <span className="ml-2 font-label-sm text-label-sm text-primary">Hari ini</span>}
      </td>
      {user.role !== ROLE.TALENT && <td className="py-2.5 px-4 text-on-surface">{s.placement.talent.nama_lengkap}</td>}
      <td className="py-2.5 px-4">
        {mode === "ubah" ? (
          <select value={jenis} onChange={(e) => setJenis(e.target.value)} aria-label="Jenis shift" className="h-9 px-2 rounded-lg bg-surface-container-low font-label-md text-label-md">
            {Object.entries(JENIS_SHIFT).map(([v, j]) => (
              <option key={v} value={v}>
                {j.label}
              </option>
            ))}
          </select>
        ) : (
          <ShiftBadge jenis={s.jenis_shift} />
        )}
      </td>
      <td className="py-2.5 px-4 text-on-surface-variant">{s.keterangan ?? "-"}</td>
      <td className="py-2.5 px-4 text-on-surface-variant">{s.diatur_oleh ?? "-"}</td>
      {kelola && (
        <td className="py-2.5 px-4">
          <div className="flex justify-end gap-1">
            {mode === "" && (
              <>
                <button type="button" onClick={() => setMode("ubah")} className={`${tombol} text-primary hover:bg-surface-container`}>
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Ubah
                </button>
                <button type="button" onClick={() => setMode("hapus")} className={`${tombol} text-error hover:bg-error-container`}>
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Hapus
                </button>
              </>
            )}
            {mode !== "" && (
              <>
                <button type="button" onClick={() => (setMode(""), setJenis(s.jenis_shift))} disabled={kirim} className={`${tombol} text-on-surface-variant hover:bg-surface-container`}>
                  Batal
                </button>
                <button
                  type="button"
                  disabled={kirim || (mode === "ubah" && jenis === s.jenis_shift)}
                  onClick={() => (mode === "ubah" ? aksi("PUT", { jenis_shift: jenis }) : aksi("DELETE"))}
                  className={`${tombol} ${mode === "hapus" ? "bg-error text-on-error" : "bg-primary text-on-primary"}`}
                >
                  {kirim ? "Memproses..." : mode === "hapus" ? "Ya, Hapus" : "Simpan"}
                </button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}

const HARI_PILIH = [
  [1, "Sen"],
  [2, "Sel"],
  [3, "Rab"],
  [4, "Kam"],
  [5, "Jum"],
  [6, "Sab"],
  [0, "Min"],
];

// Input massal: rentang tanggal + hari dalam seminggu → daftar tanggal (R22).
function ModalAturShift({ placement, awalPlacement, onClose, onBerhasil }) {
  const [form, setForm] = useState({ id_placement: awalPlacement, dari: "", sampai: "", jenis_shift: "pagi", keterangan: "" });
  const [hari, setHari] = useState([1, 2, 3, 4, 5]);
  const [kirim, setKirim] = useState(false);
  const [error, setError] = useState(null);
  const e = (f) => errorField(error, f);
  const set = (f) => (ev) => {
    setForm((x) => ({ ...x, [f]: ev.target.value }));
    setError(null);
  };

  const tanggal = useMemo(() => {
    if (!form.dari || !form.sampai || form.sampai < form.dari) return [];
    const hasil = [];
    for (let d = new Date(`${form.dari}T00:00:00`); keIso(d) <= form.sampai && hasil.length <= 400; d.setDate(d.getDate() + 1)) {
      if (hari.includes(d.getDay())) hasil.push(keIso(d));
    }
    return hasil;
  }, [form.dari, form.sampai, hari]);

  async function simpan() {
    setKirim(true);
    setError(null);
    try {
      const res = await api("/shift", {
        method: "POST",
        body: {
          id_placement: form.id_placement ? Number(form.id_placement) : null,
          tanggal,
          jenis_shift: form.jenis_shift,
          keterangan: form.keterangan.trim() || null,
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
      judul="Atur Shift"
      sibuk={kirim}
      onClose={onClose}
      onSubmit={simpan}
      aksi={
        <button type="submit" disabled={kirim} className="h-10 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg shadow-sm disabled:opacity-50">
          {kirim ? "Menyimpan..." : `Simpan ${tanggal.length} Shift`}
        </button>
      }
    >
      {error && <Pesan>{error.message}</Pesan>}
      <Field label="Talent" wajib error={e("id_placement")}>
        <select value={form.id_placement} onChange={set("id_placement")} disabled={!placement} className={inputClass(e("id_placement"))}>
          <option value="">{placement ? "Pilih talent yang ditempatkan..." : "Memuat..."}</option>
          {placement?.map((p) => (
            <option key={p.id_placement} value={p.id_placement}>
              {labelPlacement(p)}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-space-sm">
        <Field label="Dari tanggal" wajib>
          <input type="date" value={form.dari} onChange={set("dari")} className={inputClass(false)} />
        </Field>
        <Field label="Sampai tanggal" wajib>
          <input type="date" min={form.dari} value={form.sampai} onChange={set("sampai")} className={inputClass(false)} />
        </Field>
      </div>
      <fieldset className="space-y-1">
        <legend className="font-label-md text-label-md text-on-surface">Hari</legend>
        <div className="flex flex-wrap gap-1">
          {HARI_PILIH.map(([n, label]) => (
            <label
              key={n}
              className={`h-9 min-w-[3rem] px-2 flex items-center justify-center rounded-lg cursor-pointer font-label-md text-label-md ${
                hari.includes(n) ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={hari.includes(n)}
                onChange={() => {
                  setHari((h) => (h.includes(n) ? h.filter((x) => x !== n) : [...h, n]));
                  setError(null);
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {tanggal.length ? `${tanggal.length} tanggal akan diatur. Tanggal yang sudah punya shift akan diperbarui.` : "Pilih rentang tanggal dan hari."}
      </p>
      {(e("tanggal") || e("tanggal.0")) && <p className="font-body-sm text-body-sm text-error">{e("tanggal") ?? e("tanggal.0")}</p>}
      <div className="grid grid-cols-2 gap-space-sm">
        <Field label="Jenis shift" wajib error={e("jenis_shift")}>
          <select value={form.jenis_shift} onChange={set("jenis_shift")} className={inputClass(e("jenis_shift"))}>
            {Object.entries(JENIS_SHIFT).map(([v, j]) => (
              <option key={v} value={v}>
                {j.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Keterangan" error={e("keterangan")}>
          <input value={form.keterangan} onChange={set("keterangan")} maxLength={255} placeholder="Contoh: WFO 08.00–17.00" className={inputClass(e("keterangan"))} />
        </Field>
      </div>
    </Modal>
  );
}
