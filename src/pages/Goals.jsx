import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const TEAL = "#2a9d8f";
const CHART_GRID = "#e8eaed";
const CHART_AXIS = "#6b7280";

const SAVINGS_THIS = [
  { day: "May 01", thisMonth: 1200, lastMonth: 800 },
  { day: "May 05", thisMonth: 1800, lastMonth: 1100 },
  { day: "May 10", thisMonth: 2400, lastMonth: 1500 },
  { day: "May 15", thisMonth: 3100, lastMonth: 1900 },
  { day: "May 20", thisMonth: 3800, lastMonth: 2400 },
  { day: "May 25", thisMonth: 4200, lastMonth: 2800 },
  { day: "May 30", thisMonth: 4800, lastMonth: 3200 },
];

const CATEGORY_GOALS = [
  { id: "housing", name: "Housing", amount: "$250.00", icon: "house" },
  { id: "food", name: "Food", amount: "$250.00", icon: "food" },
  { id: "transport", name: "Transportation", amount: "$250.00", icon: "car" },
  { id: "entertainment", name: "Entertainment", amount: "$250.00", icon: "film" },
  { id: "shopping", name: "Shopping", amount: "$250.00", icon: "bag" },
  { id: "others", name: "Others", amount: "$250.00", icon: "dots" },
];

function CategoryIcon({ name }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "house":
      return (
        <svg {...common}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "food":
      return (
        <svg {...common}>
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case "car":
      return (
        <svg {...common}>
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10H5l-2.5 2.1C2.7 12.3 2 13.1 2 14v3c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M5 10V6l3-3h8l3 3v4" />
        </svg>
      );
    case "film":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2 2 7" />
        </svg>
      );
    case "bag":
      return (
        <svg {...common}>
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      );
  }
}

function SavingsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-3 py-2 text-xs shadow-ambient">
      <p className="font-semibold text-on-surface mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-on-surface-variant">
          <span style={{ color: p.color }}>{p.name}</span>: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function SemiGauge({ achieved, target }) {
  const pct = Math.min(100, Math.round((achieved / target) * 100));
  const data = [
    { name: "done", value: pct },
    { name: "rest", value: Math.max(0, 100 - pct) },
  ];

  const label = achieved >= 1000 ? `${Math.round(achieved / 1000)}K` : String(achieved);

  return (
    <div className="relative w-[200px] h-[120px] shrink-0 mx-auto sm:mx-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="72%"
            outerRadius="100%"
            dataKey="value"
            stroke="none"
            paddingAngle={0}
          >
            <Cell fill={TEAL} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-end justify-center pb-1 pointer-events-none">
        <div className="text-center translate-y-[-0.25rem]">
          <p className="font-display text-2xl font-bold text-on-surface tabular-nums">{label}</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">Target vs Achievement</p>
        </div>
      </div>
    </div>
  );
}

export default function Goals() {
  const gauge = useMemo(() => ({ achieved: 12500, target: 20000 }), []);

  return (
    <div className="space-y-8 sm:space-y-10 max-w-7xl mx-auto min-w-0">
      <div>
        <h1 className="text-headline-page text-on-surface">Goals</h1>
        <p className="text-body-md text-on-surface-variant mt-2">Track savings targets and category budgets</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-title-lg font-display font-semibold text-on-surface">Goals overview</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient border border-outline-variant/10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <p className="text-label-md font-semibold text-on-surface">Savings goal</p>
              <label className="sr-only" htmlFor="goal-range">
                Date range
              </label>
              <select
                id="goal-range"
                className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/25 w-full sm:w-auto"
              >
                <option>01 May - 31 May</option>
                <option>01 Apr - 30 Apr</option>
              </select>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-label-sm text-on-surface-variant">Target achieved</p>
                  <p className="font-display text-xl font-bold text-on-surface mt-1 tabular-nums">
                    ${gauge.achieved.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant">This month target</p>
                  <p className="font-display text-xl font-bold text-on-surface mt-1 tabular-nums">
                    ${gauge.target.toLocaleString()}
                  </p>
                </div>
              </div>
              <SemiGauge achieved={gauge.achieved} target={gauge.target} />
            </div>
            <button
              type="button"
              className="mt-8 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Adjust goal
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-ambient border border-outline-variant/10 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <p className="text-label-md font-semibold text-on-surface">Saving summary</p>
              <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant">
                <span className="flex items-center gap-2">
                  <span className="h-0.5 w-6 rounded-full bg-primary" />
                  This month
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-0 w-8 border-t-2 border-dashed border-gray-400" />
                  Same period last month
                </span>
              </div>
            </div>
            <div className="h-[220px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SAVINGS_THIS} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={TEAL} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: CHART_AXIS }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: CHART_AXIS }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v / 1000}k`}
                    domain={[0, 5000]}
                  />
                  <Tooltip content={<SavingsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="thisMonth"
                    name="This month"
                    stroke={TEAL}
                    strokeWidth={2}
                    fill="url(#savingsFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: TEAL, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lastMonth"
                    name="Last month"
                    stroke="#9ca3af"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    fill="none"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-title-lg font-display font-semibold text-on-surface">Expenses goals by category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_GOALS.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-ambient border border-outline-variant/10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant">
                <CategoryIcon name={c.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-on-surface truncate">{c.name}</p>
                <p className="text-sm text-on-surface-variant mt-0.5 tabular-nums">{c.amount}</p>
              </div>
              <button
                type="button"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border-2 border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Adjust
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
