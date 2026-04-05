import { useState } from "react";
import { useApp } from "../context/AppContext";
import { applyFilters, formatCurrency, formatDate, getUniqueMonths } from "../utils/helpers";
import { downloadTransactionsCsv, downloadTransactionsJson } from "../utils/exportTransactions";
import { CATEGORIES } from "../data/mockData";
import TransactionModal from "../components/TransactionModal";

export default function Transactions() {
  const { state, dispatch } = useApp();
  const { transactions, filters, role } = state;
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [modal, setModal] = useState(null);

  const months = getUniqueMonths(transactions);
  const filtered = applyFilters(transactions, filters);
  const sorted = [...filtered].sort((a, b) => {
    let v = 0;
    if (sortBy === "date") v = a.date.localeCompare(b.date);
    else if (sortBy === "amount") v = a.amount - b.amount;
    else if (sortBy === "description") v = a.description.localeCompare(b.description);
    return sortDir === "asc" ? v : -v;
  });

  function toggleSort(col) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  }

  function handleDelete(id) {
    if (window.confirm("Delete this transaction?")) {
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    }
  }

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-outline-variant/60">
      {sortBy === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-headline-page text-on-surface">Transactions</h1>
          <p className="text-body-md text-on-surface-variant mt-2">
            {filtered.length} of {transactions.length} transactions
            <span className="text-on-surface-variant/70"> · Export uses current filters and sort</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-row flex-wrap gap-2 w-full sm:w-auto">
            <button
              type="button"
              className="inline-flex items-center justify-center min-h-11 px-4 rounded-2xl text-sm font-medium text-on-surface bg-surface-container-lowest border border-outline-variant/20 shadow-ambient hover:bg-surface-container-low transition-colors"
              onClick={() => downloadTransactionsCsv(sorted)}
            >
              Export CSV
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center min-h-11 px-4 rounded-2xl text-sm font-medium text-on-surface bg-surface-container-lowest border border-outline-variant/20 shadow-ambient hover:bg-surface-container-low transition-colors"
              onClick={() => downloadTransactionsJson(sorted)}
            >
              Export JSON
            </button>
          </div>
          {role === "admin" && (
            <button
              type="button"
              onClick={() => setModal("add")}
              className="btn-primary-gradient inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-11 self-stretch sm:self-start"
            >
              <span className="text-lg leading-none">+</span> Add Transaction
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            className="input-editorial w-full"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => dispatch({ type: "SET_FILTER", payload: { search: e.target.value } })}
          />
          <select
            className="input-editorial w-full appearance-none cursor-pointer"
            value={filters.type}
            onChange={(e) => dispatch({ type: "SET_FILTER", payload: { type: e.target.value } })}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            className="input-editorial w-full appearance-none cursor-pointer"
            value={filters.category}
            onChange={(e) => dispatch({ type: "SET_FILTER", payload: { category: e.target.value } })}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            className="input-editorial w-full appearance-none cursor-pointer"
            value={filters.month}
            onChange={(e) => dispatch({ type: "SET_FILTER", payload: { month: e.target.value } })}
          >
            <option value="all">All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>{new Date(m + "-01").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</option>
            ))}
          </select>
        </div>
        {(filters.search || filters.category !== "all" || filters.type !== "all" || filters.month !== "all") && (
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET_FILTERS" })}
            className="mt-4 text-label-sm text-primary font-medium hover:opacity-80 transition-opacity"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden">
        {sorted.length === 0 ? (
          <div className="py-20 text-center px-6">
            <p className="text-body-md text-on-surface-variant">No transactions match your filters.</p>
            <button
              type="button"
              onClick={() => dispatch({ type: "RESET_FILTERS" })}
              className="mt-3 text-label-sm text-primary font-medium hover:opacity-80 transition-opacity"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto p-4 sm:p-6">
            <table className="w-full text-body-md border-separate border-spacing-x-0 border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 text-label-sm font-medium text-on-surface-variant rounded-l-2xl bg-surface-container-low">
                    <button type="button" onClick={() => toggleSort("date")} className="flex items-center hover:text-on-surface transition-colors">
                      Date <SortIcon col="date" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-label-sm font-medium text-on-surface-variant bg-surface-container-low">
                    <button type="button" onClick={() => toggleSort("description")} className="flex items-center hover:text-on-surface transition-colors">
                      Description <SortIcon col="description" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-label-sm font-medium text-on-surface-variant bg-surface-container-low">Category</th>
                  <th className="text-left px-4 py-3 text-label-sm font-medium text-on-surface-variant bg-surface-container-low">Type</th>
                  <th className="text-right px-4 py-3 text-label-sm font-medium text-on-surface-variant bg-surface-container-low">
                    <button type="button" onClick={() => toggleSort("amount")} className="flex items-center ml-auto hover:text-on-surface transition-colors">
                      Amount <SortIcon col="amount" />
                    </button>
                  </th>
                  {role === "admin" && (
                    <th className="text-center px-4 py-3 text-label-sm font-medium text-on-surface-variant rounded-r-2xl bg-surface-container-low">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id} className="group transition-colors hover:bg-surface-container-low/80">
                    <td className="px-4 py-4 text-on-surface-variant whitespace-nowrap rounded-l-2xl align-middle">{formatDate(t.date)}</td>
                    <td className="px-4 py-4 font-medium text-on-surface align-middle">{t.description}</td>
                    <td className="px-4 py-4 align-middle">
                      <span
                        className="inline-flex items-center text-label-sm px-3 py-1.5 rounded-2xl bg-secondary-container text-tertiary max-w-[10rem] truncate"
                        title={t.category}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`text-label-sm px-3 py-1.5 rounded-2xl font-medium inline-block
                        ${t.type === "income" ? "bg-secondary-container text-primary-fixed-dim" : "bg-error-container/80 text-error"}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-right font-display font-semibold text-title-lg whitespace-nowrap align-middle
                      ${t.type === "income" ? "text-primary-fixed-dim" : "text-error"}`}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </td>
                    {role === "admin" && (
                      <td className="px-4 py-4 text-center whitespace-nowrap rounded-r-2xl align-middle">
                        <button type="button" onClick={() => setModal(t)} className="text-label-sm text-primary font-medium hover:opacity-80 mr-4 transition-opacity">Edit</button>
                        <button type="button" onClick={() => handleDelete(t.id)} className="text-label-sm text-error font-medium hover:opacity-80 transition-opacity">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <TransactionModal
          transaction={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
