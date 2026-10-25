import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLE_LABEL, displayUser, initials } from "../auth/roles";
import { navGroupsFor } from "../data/navigation";
import logo from "../assets/logo-intellisys.png";

const LINK_BASE = "relative flex items-center gap-space-sm min-h-[40px] px-space-sm py-2 rounded-lg font-body-md text-body-md transition-colors";
// Menu aktif: latar marun muda + teks primer tebal + garis penanda di kiri.
const LINK_ACTIVE =
  "bg-primary-fixed text-primary font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-primary";
const LINK_IDLE = "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface";

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const navGroups = navGroupsFor(user.role);
  const { nama } = displayUser(user);

  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-inverse-surface/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-surface-container-lowest border-r border-surface-container-high z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0 shadow-lg" : "-translate-x-full"
        }`}
      >
        <div className="px-space-lg pt-space-lg pb-space-md flex items-start justify-between gap-space-sm">
          <div className="min-w-0 space-y-2">
            <img alt="Intellisys" className="h-9 w-auto object-contain" src={logo} />
            <div className="flex flex-col min-w-0">
              <span className="font-title-sm text-title-sm text-on-surface tracking-tight truncate">Intellisys Talent Hub</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">PT Intellisys IT Outsourcing</span>
            </div>
          </div>
          <button type="button" onClick={onClose} title="Tutup menu" className="lg:hidden -mr-2 w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-space-md py-space-sm space-y-space-lg border-t border-surface-container">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-space-sm pb-1 font-label-sm text-label-sm uppercase tracking-wider text-outline">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.path} to={item.path} className={({ isActive }) => `${LINK_BASE} ${isActive ? LINK_ACTIVE : LINK_IDLE}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-space-md border-t border-surface-container">
          <div className="flex items-center gap-space-sm px-space-sm">
            <span className="w-9 h-9 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-semibold">
              {initials(nama)}
            </span>
            <span className="flex flex-col min-w-0">
              <span className="font-label-lg text-label-lg text-on-surface truncate">{nama}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{ROLE_LABEL[user.role]}</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
