import { INTERNAL, ROLE } from "../auth/roles";

const { TALENT, HR_CLIENT, ACCOUNT_MANAGER, TALENT_SUPPORT, MANAGER } = ROLE;

// Struktur menu sidebar sesuai mockup Stitch "Intellisys Talent Hub Dashboard".
// `ready: true` menandai halaman yang sudah memiliki desain di Stitch.
// `roles` mengikuti kolom Role di tabel endpoint BACKEND_SPEC bagian 7; tanpa `roles` = semua role.
// `labelTalent` = nama menu khusus role talent (menu role lain tetap memakai `label`).
export const NAV_GROUPS = [
  {
    label: "Utama",
    items: [
      { path: "/dashboard-rekapitulasi", label: "Dashboard Rekapitulasi", labelTalent: "Beranda", icon: "grid_view", ready: true },
      { path: "/pipeline-rekrutmen", label: "Pipeline Rekrutmen", icon: "view_kanban", ready: true, roles: INTERNAL },
    ],
  },
  {
    label: "Talent Management",
    items: [
      { path: "/profil-saya", label: "Profil & CV Saya", icon: "badge", ready: true, roles: [TALENT] },
      { path: "/talent-pool", label: "Talent Pool", icon: "group", ready: true, roles: INTERNAL },
      { path: "/rekomendasi-kandidat", label: "Rekomendasi Kandidat", icon: "person_search", ready: true, roles: [TALENT_SUPPORT] },
      { path: "/penugasan-penempatan", label: "Penugasan Penempatan", labelTalent: "Penempatan Saya", icon: "assignment_ind", ready: true },
    ],
  },
  {
    label: "Klien & Rekuisisi",
    items: [
      { path: "/permintaan-kebutuhan", label: "Permintaan Kebutuhan", icon: "receipt_long", ready: true, roles: [HR_CLIENT, ...INTERNAL] },
      { path: "/pengajuan-kandidat", label: "Pengajuan Kandidat", labelTalent: "Proses Seleksi", icon: "send", ready: true },
      { path: "/jadwal-interview", label: "Jadwal Interview", icon: "event_available", ready: true },
    ],
  },
  {
    label: "Operasional & HR",
    items: [
      { path: "/monitoring-kinerja", label: "Monitoring Kinerja", icon: "monitoring", ready: true, roles: [ACCOUNT_MANAGER, MANAGER] },
      { path: "/pengajuan-cuti-shift", label: "Pengajuan Cuti & Shift", icon: "calendar_clock", ready: true, roles: [TALENT, HR_CLIENT, MANAGER] },
      { path: "/tiket-komplain-klien", label: "Tiket Komplain Klien", icon: "support_agent", ready: true, roles: [HR_CLIENT, ACCOUNT_MANAGER, MANAGER] },
      { path: "/dokumen-quotation-po", label: "Dokumen (Quotation & PO)", icon: "description", ready: true },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { path: "/master-data-skill", label: "Master Data Skill", icon: "database", ready: true, roles: [TALENT_SUPPORT, MANAGER] },
      { path: "/pengaturan-akun", label: "Pengaturan Akun", icon: "settings", ready: true },
      { path: "/kelola-pegawai", label: "Kelola Akun Pegawai", icon: "manage_accounts", ready: true, roles: [MANAGER] },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export const canAccess = (item, role) => !item.roles || item.roles.includes(role);

export const labelUntuk = (item, role) => (role === TALENT && item.labelTalent) || item.label;

// Menu yang boleh dilihat role tertentu (dengan nama sesuai role); grup kosong disembunyikan.
export const navGroupsFor = (role) =>
  NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccess(item, role)).map((item) => ({ ...item, label: labelUntuk(item, role) })),
  })).filter((group) => group.items.length > 0);

// Halaman pertama setelah masuk: menu pertama yang boleh diakses role tersebut.
export const berandaFor = (role) => NAV_ITEMS.find((item) => canAccess(item, role))?.path ?? "/";
