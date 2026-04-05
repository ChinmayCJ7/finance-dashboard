import { useState, useEffect, useCallback } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import MainHeader from "./components/MainHeader";
import Dashboard from "./pages/Dashboard";
import Balances from "./pages/Balances";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import PlaceholderPage from "./pages/PlaceholderPage";

function BillsPage() {
  return <PlaceholderPage title="Bills" description="Manage recurring bills and due dates." />;
}

function Layout() {
  const { state } = useApp();
  const pages = {
    overview: Dashboard,
    balances: Balances,
    transactions: Transactions,
    bills: BillsPage,
    expenses: Insights,
    goals: Goals,
    settings: Settings,
  };
  const Page = pages[state.activePage] || Dashboard;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (mobileNavOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-background">
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-on-surface/35 backdrop-blur-sm lg:hidden"
          onClick={closeMobileNav}
        />
      )}

      <Sidebar mobileOpen={mobileNavOpen} onNavigate={closeMobileNav} />

      <div className="flex min-w-0 flex-1 flex-col min-h-screen min-h-[100dvh] lg:ml-60">
        <header
          className="sticky top-0 z-30 flex lg:hidden items-center justify-between gap-3 min-h-[3.25rem] bg-surface-container-lowest/92 backdrop-blur-xl shadow-ambient px-4 py-3
            pt-[max(0.75rem,env(safe-area-inset-top))]
            pl-[max(1rem,env(safe-area-inset-left))]
            pr-[max(1rem,env(safe-area-inset-right))]"
        >
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-on-surface hover:bg-surface-container-low active:bg-surface-container-low transition-colors"
            aria-expanded={mobileNavOpen}
            aria-controls="app-sidebar"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <span className="sr-only">{mobileNavOpen ? "Close menu" : "Open menu"}</span>
            {mobileNavOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <span className="font-display text-sm font-bold text-on-surface truncate text-center flex-1 px-2">
            FinanceOS
          </span>
          <div className="w-11 shrink-0" aria-hidden />
        </header>

        <main
          className="relative flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-background
            px-4 pt-5 pb-12 sm:px-6 sm:pt-8 sm:pb-14
            lg:rounded-tl-[1.75rem] lg:shadow-ambient lg:pl-10 lg:pr-14 lg:pt-8 lg:pb-14
            pb-[max(3rem,env(safe-area-inset-bottom))]"
        >
          <MainHeader />
          <Page />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
