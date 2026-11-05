import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import { ROLE } from "../auth/roles";
import { BarisKosong, BarisMemuat, KepalaHalaman, Pagination, Pesan, PilihFilter, Sel, TabelKartu } from "../components/ui";
import { InterviewBadge, STATUS_INTERVIEW, bolehAturInterview, formatJadwal, hariIni } from "../components/rekrutmen/shared";
import PengajuanDrawer from "../components/rekrutmen/PengajuanDrawer";

const PER_PAGE = 15;

// Halaman Jadwal Interview (FR-11): semua role sesuai scope; detail & aksi lewat drawer pengajuan.
export default function JadwalInterview() {
  const { user } = useAuth();
  // Talent melihat interviewnya sendiri: kolom nama kandidat tidak perlu.
  const talent = user.role === ROLE.TALENT;
  const [status, setStatus] = useState("");
  const [lewat, setLewat] = useState(false);
  const [page, setPage] = useState(1);
  const [versi, setVersi] = useState(0);

  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState("");
  const [dipilih, setDipilih] = useState(null);

  useEffect(() => {
    let batal = false;
    const params = new URLSearchParams({ page, per_page: PER_PAGE });
    if (!lewat) params.set("dari", hariIni());
    if (status) params.set("status", status);

    setMemuat(true);
    setError("");
    api(`/interview?${params}`)
      .then((res) => {
        if (batal) return;
        if (res.data.length === 0 && page > 1 && res.meta.last_page < page) setPage(res.meta.last_page);
        else setHasil(res);
      })
      .catch((err) => !batal && setError(err.message))
      .finally(() => !batal && setMemuat(false));
    return () => {
      batal = true;
    };
  }, [status, lewat, page, versi]);

  const muatUlang = useCallback(() => setVersi((v) => v + 1), []);
  const tutupDetail = useCallback(() => setDipilih(null), []);
  const hari = hariIni();

  return (
    <div className="flex flex-col w-full pb-space-xl">
      <KepalaHalaman ikon="event_available" kategori="Klien & Rekuisisi" judul="Jadwal Interview">
        Jadwal interview kandidat, urut dari yang terdekat.{" "}
        {bolehAturInterview(user)
          ? "Klik baris untuk melihat detail, menandai selesai, menjadwal ulang, atau membatalkan."
          : "Jadwal diatur oleh Account Manager PT Intellisys; klik baris untuk melihat detail."}
      </KepalaHalaman>

      <div className="px-space-md sm:px-space-xl pt-space-lg flex flex-col gap-space-lg">
        <div className="kartu p-space-md flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-space-sm">
          <PilihFilter
            ikon="filter_alt"
            label="Status interview"
            value={status}
            onChange={(n) => {
              setStatus(n);
              setPage(1);
            }}
            semua="Semua Status"
            opsi={Object.entries(STATUS_INTERVIEW).map(([v, s]) => [v, s.label])}
          />
          <label className="flex items-center gap-space-sm min-h-[40px] px-3 rounded-lg bg-surface-container-lowest ring-1 ring-inset ring-outline-variant font-label-md text-label-md text-on-surface cursor-pointer">
            <input
              type="checkbox"
              checked={lewat}
              onChange={(e) => {
                setLewat(e.target.checked);
                setPage(1);
              }}
              className="accent-primary w-4 h-4"
            />
            Tampilkan jadwal yang sudah lewat
          </label>
        </div>

        {error && <Pesan>{error}</Pesan>}

        <div className="kartu overflow-hidden">
          <TabelKartu
            kolom={talent ? ["Jadwal", "Posisi & Klien", "Link / Lokasi", "Status"] : ["Jadwal", "Kandidat", "Posisi & Klien", "Link / Lokasi", "Status"]}
            className={talent ? "md:min-w-[680px]" : "md:min-w-[820px]"}
            redup={memuat && hasil}
          >
            {!hasil && memuat && <BarisMemuat kolom={talent ? 4 : 5} />}
            {hasil?.data.length === 0 && (
              <BarisKosong kolom={talent ? 4 : 5} ikon="event_available">
                {lewat || status ? "Tidak ada jadwal interview yang cocok." : "Tidak ada jadwal interview mendatang."}
              </BarisKosong>
            )}
            {hasil?.data.map((iv) => {
              const link = /^https?:\/\//i.test(iv.link_lokasi_meeting ?? "") ? iv.link_lokasi_meeting : null;
              return (
                <tr key={iv.id_interview} onClick={() => setDipilih(iv.pengajuan.id_pengajuan)} className="hover:bg-surface-container-low cursor-pointer transition-colors align-top">
                  <Sel label="Jadwal" className="whitespace-nowrap">
                    <span className="block font-title-sm text-title-sm text-on-surface">{formatJadwal(iv.tanggal_interview, iv.waktu_interview)}</span>
                    {iv.tanggal_interview === hari && <span className="font-label-sm text-label-sm text-primary">Hari ini</span>}
                  </Sel>
                  {!talent && (
                    <Sel peran="judul">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDipilih(iv.pengajuan.id_pengajuan);
                        }}
                        className="text-left text-on-surface hover:text-primary max-md:font-title-sm max-md:text-title-sm"
                      >
                        {iv.pengajuan.talent.nama_lengkap}
                      </button>
                    </Sel>
                  )}
                  <Sel peran={talent ? "judul" : undefined} label="Posisi & Klien">
                    <span className="block text-on-surface">{iv.pengajuan.job_requirement.posisi}</span>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">{iv.pengajuan.job_requirement.klien.nama_perusahaan}</span>
                  </Sel>
                  <Sel label="Link / Lokasi" className="max-w-[240px] break-all text-on-surface-variant">
                    {link ? (
                      <a href={link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary hover:underline">
                        {link}
                      </a>
                    ) : (
                      iv.link_lokasi_meeting ?? <span className="text-outline">-</span>
                    )}
                  </Sel>
                  <Sel peran="status">
                    <InterviewBadge status={iv.status_interview} />
                  </Sel>
                </tr>
              );
            })}
          </TabelKartu>
          {hasil && hasil.meta.total > 0 && <Pagination meta={hasil.meta} onPage={setPage} satuan="jadwal" />}
        </div>
      </div>

      {dipilih && <PengajuanDrawer id={dipilih} user={user} onClose={tutupDetail} onChanged={muatUlang} />}
    </div>
  );
}
