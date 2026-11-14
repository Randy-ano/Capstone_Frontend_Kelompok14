// Tab "Usulan dari Talent Support" di halaman Pengajuan Kandidat (khusus AM, revisi 2026-11-05).
// AM membuka detail kandidat (GET /screening/{id}) dulu, lalu dari panel detail memilih Ajukan ke Klien (POST /pengajuan)
// atau Tidak Diteruskan (PATCH /screening/{id}/tidak-diteruskan).
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../auth/AuthContext";
import { BarisKosong, BarisMemuat, Pesan, PilihFilter, Sel, TabelKartu, formatAngka, formatTanggal } from "../ui";
import { useToast } from "../toast";
import { CatatanUsulan, UsulanBadge } from "./usulan";
import DetailUsulan from "./DetailUsulan";

// Opsi kosong PilihFilter = "Menunggu tinjauan" (status_usulan=menunggu_am).
const FILTER = [["tidak_diteruskan", "Tidak diteruskan"]];

// Usulan hanya bisa ditinjau selama permintaannya masih diproses (usulan di permintaan yang dibatalkan disembunyikan).
export const usulanAktif = (s) => s.job_requirement.status_req === "diproses";

export default function TabUsulan({ onDiteruskan, onJumlah }) {
  const [status, setStatus] = useState("menunggu_am");
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [versi, setVersi] = useState(0);
  const [dibuka, setDibuka] = useState(null);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    let batal = false;
    setError("");
    api(`/screening?status_usulan=${status}&per_page=100`)
      .then((res) => {
        if (batal) return;
        const data = status === "menunggu_am" ? res.data.filter(usulanAktif) : res.data;
        setItems(data);
        if (status === "menunggu_am") onJumlah?.(data.length);
      })
      .catch((err) => !batal && setError(err.message));
    return () => {
      batal = true;
    };
  }, [status, versi, onJumlah]);

  const menunggu = status === "menunggu_am";
  const kolom = ["Kandidat", !menunggu && "Status", "Permintaan", { label: "Skor", className: "angka" }, "Catatan Talent Support", "Diusulkan", "Detail"];
  const jumlahKolom = kolom.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-space-md">
      <div className="kartu p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Talent yang diusulkan Talent Support untuk permintaan yang sedang diproses. Buka detail kandidat untuk meninjau profil, skor kecocokan,
          catatan screening, CV, dan sertifikat sebelum mengajukan ke klien atau mencatat alasan tidak diteruskan.
        </p>
        <PilihFilter
          ikon="filter_alt"
          label="Status usulan"
          value={menunggu ? "" : status}
          onChange={(v) => (setItems(null), setStatus(v || "menunggu_am"))}
          semua="Menunggu tinjauan"
          opsi={FILTER}
        />
      </div>

      {error && <Pesan>{error}</Pesan>}

      <div className="kartu overflow-hidden">
        <TabelKartu kolom={kolom} className="md:min-w-[960px]">
          {!items && !error && <BarisMemuat kolom={jumlahKolom} />}
          {items?.length === 0 && (
            <BarisKosong kolom={jumlahKolom} ikon="forward_to_inbox">
              {menunggu ? "Belum ada usulan dari Talent Support yang menunggu tinjauan." : "Belum ada usulan yang tidak diteruskan."}
            </BarisKosong>
          )}
          {items?.map((s) => (
            <tr key={s.id_screening} onClick={() => setDibuka(s.id_screening)} className="align-top hover:bg-surface-container-low cursor-pointer transition-colors">
              <Sel peran="judul">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDibuka(s.id_screening);
                  }}
                  className="text-left group"
                >
                  <span className="block font-title-sm text-title-sm text-on-surface group-hover:text-primary">{s.talent.nama_lengkap}</span>
                  <span className="block font-body-sm text-body-sm text-on-surface-variant break-all">{s.talent.email}</span>
                </button>
              </Sel>
              {!menunggu && (
                <Sel peran="status">
                  <UsulanBadge status={s.status_usulan} label={s.label_status_usulan} />
                </Sel>
              )}
              <Sel label="Permintaan">
                <span className="block text-on-surface">{s.job_requirement.posisi}</span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">{s.job_requirement.klien.nama_perusahaan}</span>
              </Sel>
              <Sel peran="setengah" label="Skor" className="angka font-title-sm text-title-sm text-on-surface">
                {formatAngka(s.skor_kecocokan, 2)}
              </Sel>
              <Sel label="Catatan Talent Support" className="max-w-[320px]">
                {s.catatan_screening || s.alasan_tidak_diteruskan ? (
                  <CatatanUsulan catatan={s.catatan_screening} alasan={s.alasan_tidak_diteruskan} />
                ) : (
                  <span className="text-outline">Tanpa catatan</span>
                )}
              </Sel>
              <Sel peran="setengah" label="Diusulkan" className="whitespace-nowrap">
                <span className="block text-on-surface-variant">{formatTanggal(s.tanggal_screening)}</span>
                {s.talent_support && <span className="block font-body-sm text-body-sm text-outline">oleh {s.talent_support.nama_pegawai}</span>}
              </Sel>
              <Sel peran="aksi">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDibuka(s.id_screening);
                  }}
                  className={`${menunggu ? "tombol-utama" : "tombol-kedua"} whitespace-nowrap w-full md:w-auto`}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px]">visibility</span>
                  {menunggu ? "Tinjau Detail" : "Lihat Detail"}
                </button>
              </Sel>
            </tr>
          ))}
        </TabelKartu>
      </div>

      {dibuka && (
        <DetailUsulan
          id={dibuka}
          user={user}
          onClose={() => setDibuka(null)}
          onDiteruskan={(res, usulan) => {
            setDibuka(null);
            toast.sukses(`${res.message} (${usulan.talent.nama_lengkap})`);
            setVersi((v) => v + 1);
            onDiteruskan(res.data.id_pengajuan);
          }}
          onTidakDiteruskan={(res) => {
            setDibuka(null);
            toast.sukses(`${res.message} (${res.data.talent.nama_lengkap})`);
            setVersi((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}
