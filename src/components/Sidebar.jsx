import { useApp } from "../context/AppContext";

const NAV = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "balances",
    label: "Balances",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5" />
        <path d="M8 3H3v5" />
        <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
        <path d="m15 9 6-6" />
      </svg>
    ),
  },
  {
    id: "bills",
    label: "Bills",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: "goals",
    label: "Goals",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
];

export default function Sidebar({ mobileOpen = false, onNavigate }) {
  const { state, dispatch } = useApp();

  function goToPage(id) {
    dispatch({ type: "SET_PAGE", payload: id });
    onNavigate?.();
  }

  return (
    <aside
      id="app-sidebar"
      className={`
        fixed inset-y-0 left-0 z-50 flex h-screen min-h-0 w-[min(17.5rem,88vw)] flex-col overflow-hidden bg-sidebar text-sidebar-muted
        py-6 pl-[max(1rem,env(safe-area-inset-left))] pr-3
        transition-transform duration-300 ease-out shadow-2xl shadow-black/20
        lg:z-40 lg:w-60 lg:translate-x-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="px-3 mb-8">
        <span className="font-display text-lg font-bold text-white tracking-tight">FinanceOS</span>
      </div>

      <nav className="flex-1 space-y-1 px-1 min-h-0 overflow-y-auto" aria-label="Primary">
        {NAV.map((item) => {
          const active = state.activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goToPage(item.id)}
              className={`w-full min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors
                ${active ? "bg-sidebar-active text-white shadow-lg shadow-black/15" : "text-sidebar-muted hover:text-white hover:bg-white/5"}`}
            >
              <span className={`shrink-0 ${active ? "text-white" : "text-sidebar-muted"}`}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 shrink-0 space-y-4 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>

        <div className="flex items-center gap-3 px-2 py-3 rounded-xl bg-white/5">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary-container ring-2 ring-white/10" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">Chinmay J</p>
            <button type="button" className="text-xs text-sidebar-muted hover:text-white transition-colors mt-0.5">
              View profile
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
