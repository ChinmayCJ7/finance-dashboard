import { useApp } from "../context/AppContext";
import { getSummary, formatCurrency } from "../utils/helpers";

export default function Balances() {
  const { state } = useApp();
  const { income, expenses, balance } = getSummary(state.transactions);

  const cards = [
    { label: "Total balance", value: formatCurrency(balance), hint: "Across accounts" },
    { label: "Available", value: formatCurrency(Math.max(0, balance)), hint: "Ready to spend" },
    { label: "Monthly flow", value: formatCurrency(income - expenses), hint: "Income − expenses" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto min-w-0">
      <div>
        <h1 className="text-headline-page text-on-surface">Balances</h1>
        <p className="text-body-md text-on-surface-variant mt-2">Account overview at a glance</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/10"
          >
            <p className="text-label-sm text-on-surface-variant">{c.label}</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-2 tabular-nums">{c.value}</p>
            <p className="text-xs text-on-surface-variant mt-3">{c.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
