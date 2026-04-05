import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useApp } from "../context/AppContext";
import { getSummary, getMonthlyData, getCategoryBreakdown, formatCurrency } from "../utils/helpers";
import SummaryCard from "../components/SummaryCard";
import PageSkeleton from "../components/SkeletonLoader";
import { CATEGORY_COLORS } from "../data/mockData";

const CHART_GRID = "#e8eef2";
const CHART_AXIS = "#5c6468";
const INCOME_FILL = "#2a9d8f";
const EXPENSE_FILL = "#c45a58";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-float rounded-2xl shadow-ambient px-4 py-3 text-label-sm min-w-32 border border-outline-variant/10">
      <p className="font-display font-semibold text-on-surface mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-2 text-on-surface-variant">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold font-display" style={{ color: p.color }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-float rounded-2xl shadow-ambient px-4 py-3 text-label-sm border border-outline-variant/10">
      <p className="font-display font-semibold text-on-surface">{payload[0].name}</p>
      <p className="font-display font-semibold text-title-lg mt-1" style={{ color: payload[0].payload.fill }}>{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="h-48 flex flex-col items-center justify-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-outline-variant)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
      </div>
      <p className="text-body-md text-on-surface-variant">{message}</p>
    </div>
  );
}

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { transactions } = state;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <PageSkeleton />;

  const { income, expenses, balance } = getSummary(transactions);
  const monthly = getMonthlyData(transactions);
  const breakdown = getCategoryBreakdown(transactions);
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-headline-page text-on-surface">Overview</h1>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-xl">
            Your financial overview — {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant glass-float rounded-2xl px-4 py-3 self-start sm:self-auto border border-outline-variant/10">
          <span className="w-2 h-2 rounded-full bg-primary-fixed-dim shrink-0" />
          Live data
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SummaryCard
          label="Total Balance"
          value={formatCurrency(balance)}
          sub={`${savingsRate}% savings rate`}
          color="blue"
          trend={savingsRate >= 20 ? "up" : "down"}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        <SummaryCard
          label="Total Income"
          value={formatCurrency(income)}
          sub={`${transactions.filter(t => t.type === "income").length} transactions`}
          color="green"
          trend="up"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          }
        />
        <SummaryCard
          label="Total Expenses"
          value={formatCurrency(expenses)}
          sub={`${transactions.filter(t => t.type === "expense").length} transactions`}
          color="red"
          trend="down"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">

        <div className="lg:col-span-2 min-w-0 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-on-surface sm:text-title-lg">Income vs Expenses</h2>
              <p className="text-label-sm text-on-surface-variant mt-1">Monthly comparison</p>
            </div>
            <div className="flex items-center gap-4 text-label-sm text-on-surface-variant">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-md bg-primary-fixed-dim inline-block shrink-0" />Income</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-md bg-error inline-block shrink-0" />Expenses</span>
            </div>
          </div>
          {monthly.length === 0 ? <EmptyState message="No monthly data yet" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} barGap={6} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in srgb, var(--color-primary) 6%, transparent)" }} />
                <Bar dataKey="income"   name="Income"   fill={INCOME_FILL} radius={[16, 16, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill={EXPENSE_FILL} radius={[16, 16, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="min-w-0 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
          <div className="mb-6">
            <h2 className="font-display text-lg font-semibold text-on-surface sm:text-title-lg">Spending by Category</h2>
            <p className="text-label-sm text-on-surface-variant mt-1">Expense breakdown</p>
          </div>
          {breakdown.length === 0 ? <EmptyState message="No expense data" /> : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={breakdown} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-5">
                {breakdown.slice(0, 5).map((b) => (
                  <div key={b.name} className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[b.name] || "#94a3b8" }} />
                      <span className="text-label-sm text-on-surface-variant truncate max-w-28">{b.name}</span>
                    </div>
                    <span className="text-label-sm font-display font-semibold text-on-surface shrink-0">{formatCurrency(b.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="min-w-0 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
        <div className="mb-6">
            <h2 className="font-display text-lg font-semibold text-on-surface sm:text-title-lg">Balance Trend</h2>
          <p className="text-label-sm text-on-surface-variant mt-1">Net balance over time</p>
        </div>
        {monthly.length === 0 ? <EmptyState message="No trend data yet" /> : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2a9d8f" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "color-mix(in srgb, var(--color-outline-variant) 25%, transparent)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#2a9d8f" strokeWidth={2.5} fill="url(#balGrad)" dot={false} activeDot={{ r: 5, fill: "#2a9d8f", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-on-surface sm:text-title-lg">Recent Transactions</h2>
            <p className="text-label-sm text-on-surface-variant mt-1">Latest activity</p>
          </div>
          <button
            type="button"
            className="text-label-md text-primary font-medium hover:opacity-80 transition-opacity self-start"
            onClick={() => dispatch({ type: "SET_PAGE", payload: "transactions" })}
          >
            View all →
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyState message="No transactions yet. Use Settings → Admin to add one." />
        ) : (
          <ul className="space-y-3 list-none p-0 m-0">
            {recent.map((t) => (
              <li key={t.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 py-4 px-3 sm:px-4 rounded-2xl transition-colors duration-200 hover:bg-surface-container-low">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm flex-shrink-0
                      ${t.type === "income" ? "bg-secondary-container" : "bg-error-container/70"}`}>
                      {t.type === "income"
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-fixed-dim)" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-md font-medium text-on-surface break-words [overflow-wrap:anywhere]">{t.description}</p>
                      <p className="text-label-sm text-on-surface-variant mt-1">{t.date}</p>
                      <span
                        className="text-label-sm px-3 py-1 rounded-2xl font-medium inline-block mt-2 sm:hidden bg-secondary-container text-tertiary max-w-full truncate align-top"
                        title={t.category}
                      >
                        {t.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 sm:flex-shrink-0 sm:pl-2 w-full sm:w-auto">
                    <span
                      className="text-label-sm px-3 py-1 rounded-2xl font-medium hidden sm:inline bg-secondary-container text-tertiary max-w-[7rem] truncate text-center"
                      title={t.category}
                    >
                      {t.category}
                    </span>
                    <span className={`text-lg sm:text-title-lg font-display font-semibold text-right tabular-nums break-all min-w-0 sm:max-w-none ${t.type === "income" ? "text-primary-fixed-dim" : "text-error"}`}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
