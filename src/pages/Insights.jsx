import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import { useApp } from "../context/AppContext";
import { getInsights, getMonthlyData, formatCurrency } from "../utils/helpers";
import { CATEGORY_COLORS } from "../data/mockData";

const CHART_GRID = "#e8eef2";
const CHART_AXIS = "#5c6468";

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-float rounded-2xl shadow-ambient px-4 py-3 text-label-sm border border-outline-variant/10">
      <p className="font-display font-medium text-on-surface mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
}

export default function Insights() {
  const { state } = useApp();
  const { transactions } = state;
  const { topCategory, monthComparison, avgExpense, byCategory } = getInsights(transactions);
  const monthly = getMonthlyData(transactions);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto min-w-0">
      <div className="min-w-0">
        <h1 className="text-headline-page text-on-surface">Expenses</h1>
        <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl">Patterns and observations from your spending</p>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl py-20 text-center shadow-ambient px-6">
          <p className="text-body-md text-on-surface-variant">No transactions available for insights.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
              <p className="text-label-sm text-on-surface-variant font-medium mb-2">Highest Spending Category</p>
              {topCategory ? (
                <>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[topCategory.name] || "#94a3b8" }} />
                    <span className="font-display text-lg sm:text-title-lg font-semibold text-on-surface break-words">{topCategory.name}</span>
                  </div>
                  <p className="text-body-md text-on-surface-variant mt-2">{formatCurrency(topCategory.value)} spent</p>
                  <p className="text-label-sm text-on-surface-variant/80 mt-2">
                    {totalExpenses > 0 ? Math.round((topCategory.value / totalExpenses) * 100) : 0}% of total expenses
                  </p>
                </>
              ) : <p className="text-body-md text-on-surface-variant mt-3">No expense data</p>}
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
              <p className="text-label-sm text-on-surface-variant font-medium mb-2">Month-on-Month Expenses</p>
              {monthComparison ? (
                <>
                  <div className={`font-display text-lg sm:text-title-lg font-semibold mt-3 tabular-nums ${monthComparison.increased ? "text-error" : "text-primary-fixed-dim"}`}>
                    {monthComparison.increased ? "▲" : "▼"} {monthComparison.pct}%
                  </div>
                  <p className="text-body-md text-on-surface-variant mt-2">
                    {monthComparison.increased ? "More" : "Less"} than previous month
                  </p>
                  <p className="text-label-sm text-on-surface-variant/80 mt-2">
                    {formatCurrency(monthComparison.previous.expenses)} → {formatCurrency(monthComparison.current.expenses)}
                  </p>
                </>
              ) : <p className="text-body-md text-on-surface-variant mt-3">Need 2+ months of data</p>}
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
              <p className="text-label-sm text-on-surface-variant font-medium mb-2">Savings Rate</p>
              <div className={`font-display text-lg sm:text-title-lg font-semibold mt-3 tabular-nums ${savingsRate >= 20 ? "text-primary-fixed-dim" : savingsRate >= 10 ? "text-tertiary" : "text-error"}`}>
                {savingsRate}%
              </div>
              <p className="text-body-md text-on-surface-variant mt-2">of total income saved</p>
              <p className="text-label-sm text-on-surface-variant/80 mt-2">
                {savingsRate >= 20 ? "Great savings discipline!" : savingsRate >= 10 ? "Room to improve" : "Consider reducing expenses"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
            <div className="min-w-0 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
              <h2 className="font-display text-lg font-semibold text-on-surface sm:text-title-lg mb-6">Spending by Category</h2>
              {byCategory.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-body-md text-on-surface-variant">No expense data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byCategory} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Bar dataKey="value" name="Amount" radius={[0, 16, 16, 0]}>
                      {byCategory.map((entry) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="min-w-0 bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient">
              <h2 className="font-display text-lg font-semibold text-on-surface sm:text-title-lg mb-6">Monthly Expense Trend</h2>
              {monthly.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-body-md text-on-surface-variant">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: CHART_AXIS }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Bar dataKey="expenses" name="Expenses" fill="#c45a58" radius={[16, 16, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient min-w-0">
            <h2 className="font-display text-lg font-semibold text-on-surface sm:text-title-lg mb-6">Observations</h2>
            <div className="space-y-4">
              {topCategory && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-tertiary-container/35">
                  <span className="text-tertiary mt-0.5 shrink-0">◈</span>
                  <p className="text-body-md text-on-surface">
                    <span className="font-semibold">{topCategory.name}</span> is your biggest expense category,
                    accounting for {totalExpenses > 0 ? Math.round((topCategory.value / totalExpenses) * 100) : 0}% of total spending ({formatCurrency(topCategory.value)}).
                  </p>
                </div>
              )}
              {monthComparison && (
                <div className={`flex items-start gap-4 p-5 rounded-2xl ${monthComparison.increased ? "bg-error-container/50" : "bg-secondary-container/60"}`}>
                  <span className={`mt-0.5 shrink-0 ${monthComparison.increased ? "text-error" : "text-primary-fixed-dim"}`}>◈</span>
                  <p className="text-body-md text-on-surface">
                    Your expenses {monthComparison.increased ? "increased" : "decreased"} by{" "}
                    <span className="font-semibold font-display">{monthComparison.pct}%</span> compared to last month
                    ({formatCurrency(monthComparison.previous.expenses)} → {formatCurrency(monthComparison.current.expenses)}).
                  </p>
                </div>
              )}
              <div className={`flex items-start gap-4 p-5 rounded-2xl ${savingsRate >= 20 ? "bg-secondary-container/60" : "bg-secondary-container/35"}`}>
                <span className={`mt-0.5 shrink-0 ${savingsRate >= 20 ? "text-primary-fixed-dim" : "text-primary"}`}>◈</span>
                <p className="text-body-md text-on-surface">
                  You are saving <span className="font-semibold font-display">{savingsRate}%</span> of your income.{" "}
                  {savingsRate >= 20
                    ? "Excellent financial discipline — keep it up!"
                    : "Financial advisors recommend saving at least 20% of income."}
                </p>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-surface-container-low">
                <span className="text-on-surface-variant mt-0.5 shrink-0">◈</span>
                <p className="text-body-md text-on-surface">
                  Average transaction value for expenses is{" "}
                  <span className="font-semibold font-display">{formatCurrency(Math.round(avgExpense))}</span>.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
