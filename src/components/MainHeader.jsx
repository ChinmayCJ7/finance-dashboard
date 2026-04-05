export default function MainHeader() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-10 min-w-0">
      <p className="text-label-md text-on-surface-variant shrink-0">{today}</p>
      <div className="flex items-center gap-3 sm:gap-4 flex-1 sm:justify-end min-w-0">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-outline-variant/15 bg-surface-container-lowest text-on-surface-variant shadow-ambient hover:text-on-surface transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <div className="relative flex-1 max-w-md min-w-0">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search here"
            className="w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/70 shadow-ambient outline-none transition-[box-shadow] focus:ring-2 focus:ring-primary/25"
          />
        </div>
      </div>
    </header>
  );
}
