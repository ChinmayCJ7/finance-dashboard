import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/mockData";

const empty = { date: "", description: "", category: "Food & Dining", type: "expense", amount: "" };

export default function TransactionModal({ transaction, onClose }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) setForm({ ...transaction, amount: String(transaction.amount) });
    else setForm(empty);
  }, [transaction]);

  function validate() {
    const e = {};
    if (!form.date) e.date = "Required";
    if (!form.description.trim()) e.description = "Required";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    const payload = { ...form, amount: Number(form.amount) };
    if (transaction) dispatch({ type: "EDIT_TRANSACTION", payload });
    else dispatch({ type: "ADD_TRANSACTION", payload });
    onClose();
  }

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-on-surface/25 backdrop-blur-md pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div
        className="glass-float w-full max-w-md max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-ambient-hover border border-outline-variant/10"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-7 sm:py-5">
          <h2 className="font-display text-xl font-bold tracking-tight text-on-surface sm:text-headline-lg">{transaction ? "Edit Transaction" : "Add Transaction"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl text-on-surface-variant hover:bg-surface-container-low/80 text-xl leading-none flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7 sm:pb-7 pt-1 space-y-5">
          <div>
            <label className="text-label-sm text-on-surface-variant block mb-2">Description</label>
            <input
              className={`input-editorial w-full ${errors.description ? "!shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-error)_40%,transparent)]" : ""}`}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="e.g. Grocery Store"
            />
            {errors.description && <p className="text-label-sm text-error mt-2">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-2">Date</label>
              <input
                type="date"
                className={`input-editorial w-full ${errors.date ? "!shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-error)_40%,transparent)]" : ""}`}
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
              />
              {errors.date && <p className="text-label-sm text-error mt-2">{errors.date}</p>}
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-2">Amount (₹)</label>
              <input
                type="number"
                className={`input-editorial w-full ${errors.amount ? "!shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-error)_40%,transparent)]" : ""}`}
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                placeholder="0"
                min="1"
              />
              {errors.amount && <p className="text-label-sm text-error mt-2">{errors.amount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-2">Type</label>
              <select
                className="input-editorial w-full appearance-none bg-surface-container-lowest cursor-pointer"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-2">Category</label>
              <select
                className="input-editorial w-full appearance-none bg-surface-container-lowest cursor-pointer"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-11 py-3 rounded-2xl text-label-md text-on-surface-variant bg-surface-container-low hover:bg-surface-container-low/80 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 min-h-11 btn-primary-gradient inline-flex items-center justify-center">
              {transaction ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
