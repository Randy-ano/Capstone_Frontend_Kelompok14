import { Link, Navigate } from "react-router-dom";
import { MemuatSesi } from "../auth/RequireAuth";
import { useAuth } from "../auth/AuthContext";
import { berandaFor } from "../data/navigation";
import { KakiHalaman, useJudulTab } from "../components/auth/AuthUi";
import logo from "../assets/logo-intellisys.png";

const ALUR = [
  { ikon: "receipt_long", judul: "Kebutuhan", isi: "HR perusahaan mengajukan kebutuhan talent beserta kompetensi dan tenggat SLA." },
  { ikon: "person_search", judul: "Rekomendasi", isi: "Talent Support menyaring kandidat berdasarkan skor kecocokan kompetensi dan pengalaman." },
  { ikon: "event_available", judul: "Seleksi", isi: "Kandidat diajukan ke klien, lalu melewati interview dan evaluasi." },
  { ikon: "assignment_ind", judul: "Penempatan", isi: "Kandidat yang diterima ditempatkan, lengkap dengan dokumen dan tanda tangan digital." },
  { ikon: "monitoring", judul: "Monitoring", isi: "Cuti, shift, kinerja, dan keluhan dipantau selama masa penempatan." },
];

const PERAN = [
  {
    ikon: "badge",
    judul: "Talent",
    isi: ["Melengkapi profil dan kompetensi", "Membuat CV otomatis dari profil", "Memantau seleksi, penempatan, cuti, dan shift"],
  },
  {
    ikon: "business",
    judul: "HR Client",
    isi: ["Mengajukan kebutuhan talent", "Meninjau dan mengevaluasi kandidat", "Memantau talent yang ditempatkan di perusahaan"],
  },
  {
    ikon: "groups",
    judul: "Tim PT Intellisys",
    isi: ["Mencari dan mengajukan kandidat", "Mengatur interview, dokumen, dan penempatan", "Memantau SLA dan kinerja penempatan"],
  },
];

// Halaman depan publik di "/". Pengguna yang sudah login langsung diarahkan ke berandanya.
export default function HalamanDepan() {
  const { user, loading } = useAuth();
  useJudulTab("Selamat Datang");

  if (loading) return <MemuatSesi />;
  if (user) return <Navigate to={berandaFor(user)} replace />;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-surface-container-high">
        <div className="max-w-6xl mx-auto w-full h-16 px-space-md sm:px-space-lg flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <img alt="Logo Intellisys" className="h-8 sm:h-9 w-auto object-contain" src={logo} />
            <span className="hidden sm:inline font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface-variant">Talent Hub</span>
          </div>
          <nav className="flex items-center gap-space-xs sm:gap-space-sm shrink-0" aria-label="Akun">
            <Link to="/login" className="tombol-teks">
              Masuk
            </Link>
            <Link to="/daftar" className="tombol-utama">
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-surface-container-lowest border-b border-surface-container-high">
          <div className="max-w-6xl mx-auto px-space-md sm:px-space-lg py-12 sm:py-20">
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary">Intellisys Talent Hub</p>
            <h1 className="mt-space-sm max-w-3xl font-headline-xl-mobile text-headline-xl-mobile sm:font-headline-xl sm:text-headline-xl text-on-surface">
              Dari kebutuhan talent IT sampai penempatan, dalam satu alur yang bisa dipantau.
            </h1>
            <p className="mt-space-md max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              Sistem outsourcing talent PT Intellisys untuk talent IT, HR perusahaan klien, dan tim internal. Semua pihak melihat status terbaru tanpa perlu saling menanyakan.
            </p>
            <div className="mt-space-lg flex flex-col sm:flex-row gap-space-sm">
              <Link to="/daftar" className="tombol-utama">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">badge</span>
                Daftar sebagai Talent
              </Link>
              <Link to="/daftar?jenis=hr-client" className="tombol-kedua">
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">business</span>
                Daftar sebagai HR Perusahaan
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-space-md sm:px-space-lg py-12" aria-labelledby="judul-alur">
          <h2 id="judul-alur" className="font-headline-md text-headline-md text-on-surface">Alur kerja</h2>
          <ol className="mt-space-lg grid grid-cols-1 md:grid-cols-5 gap-space-md">
            {ALUR.map((a, i) => (
              <li key={a.judul} className="flex md:flex-col gap-space-md md:gap-space-sm">
                <span className="w-10 h-10 shrink-0 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <span aria-hidden="true" className="material-symbols-outlined text-[22px]">{a.ikon}</span>
                </span>
                <div className="min-w-0">
                  <h3 className="font-title-md text-title-md text-on-surface">
                    {i + 1}. {a.judul}
                  </h3>
                  <p className="mt-0.5 font-body-md text-body-md text-on-surface-variant">{a.isi}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-surface-container-low border-y border-surface-container-high" aria-labelledby="judul-peran">
          <div className="max-w-6xl mx-auto px-space-md sm:px-space-lg py-12">
            <h2 id="judul-peran" className="font-headline-md text-headline-md text-on-surface">Untuk siapa</h2>
            <div className="mt-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {PERAN.map((p) => (
                <article key={p.judul} className="kartu p-space-lg space-y-space-sm">
                  <h3 className="flex items-center gap-space-sm font-title-md text-title-md text-on-surface">
                    <span aria-hidden="true" className="material-symbols-outlined text-[22px] text-primary">{p.ikon}</span>
                    {p.judul}
                  </h3>
                  <ul className="space-y-1 font-body-md text-body-md text-on-surface-variant">
                    {p.isi.map((baris) => (
                      <li key={baris} className="flex items-start gap-space-sm">
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-primary mt-px">check</span>
                        {baris}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto w-full px-space-md sm:px-space-lg py-space-lg">
        <KakiHalaman className="text-center sm:text-left" />
      </footer>
    </div>
  );
}
