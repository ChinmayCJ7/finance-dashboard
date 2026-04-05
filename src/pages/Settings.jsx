import { useApp } from "../context/AppContext";

export default function Settings() {
  const { state, dispatch } = useApp();

  return (
    <div className="max-w-3xl mx-auto min-w-0 space-y-8">
      <div>
        <h1 className="text-headline-page text-on-surface">Settings</h1>
        <p className="text-body-md text-on-surface-variant mt-2">Preferences and access</p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/10 space-y-4">
        <h2 className="font-display text-lg font-semibold text-on-surface">Role</h2>
        <p className="text-sm text-on-surface-variant">
          Viewer can browse data; Admin can add, edit, and delete transactions.
        </p>
        <div className="flex rounded-xl overflow-hidden bg-surface-container-low p-1 gap-1 max-w-md">
          {["viewer", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => dispatch({ type: "SET_ROLE", payload: r })}
              className={`flex-1 min-h-11 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize
                ${state.role === r
                  ? "bg-primary text-on-primary shadow-ambient"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/80"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
