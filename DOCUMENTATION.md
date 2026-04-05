# FinanceOS — Technical Documentation

This document is the complete technical reference for the **finance-dashboard** (FinanceOS) project: architecture, data flow, state API, data models, utility functions, components, pages, styling system, build configuration, and troubleshooting.

For a quick start and feature overview, see [README.md](./README.md).

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Entry Point and Application Shell](#4-entry-point-and-application-shell)
5. [State Management](#5-state-management)
6. [Data Model](#6-data-model)
7. [Utility Functions](#7-utility-functions)
8. [Components](#8-components)
9. [Pages](#9-pages)
10. [Styling and Theming](#10-styling-and-theming)
11. [Build Configuration](#11-build-configuration)
12. [File Structure](#12-file-structure)
13. [Assumptions and Limitations](#13-assumptions-and-limitations)
14. [Troubleshooting and Common Patterns](#14-troubleshooting-and-common-patterns)
15. [Related Documentation](#15-related-documentation)

---

## 1. Purpose

FinanceOS is a **single-page, frontend-only** personal finance dashboard. It has no backend or authentication server. Roles (Viewer vs. Admin) and transaction data are simulated entirely in the browser; persistence is handled via `localStorage`.

The application provides:
- A visual overview of income, expenses, balance, and savings
- Full transaction management (add, edit, delete) for Admin users
- Expense insights, month-on-month comparisons, and auto-generated observations
- Savings goals tracking and category budget management
- CSV and JSON export of the transaction list

---

## 2. Tech Stack

| Area | Technology | Version |
|------|-----------|---------|
| UI | React | 19.2.4 |
| Build | Vite | 8.0.1 |
| Styling | Tailwind CSS | 4.2.2 |
| Tailwind Vite integration | @tailwindcss/vite | 4.2.2 |
| Charts | Recharts | 3.8.1 |
| Global state | React Context + `useReducer` | (built-in) |
| Linting | ESLint | 9.39.4 |
| React ESLint plugins | eslint-plugin-react-hooks, eslint-plugin-react-refresh | 7.0.1 / 0.5.2 |

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│  ┌──────────┐    ┌──────────────────────────────────────┐   │
│  │index.html│───▶│ main.jsx  (ReactDOM.createRoot)      │   │
│  └──────────┘    │   └─ App.jsx                         │   │
│                  │       └─ AppProvider (context/state) │   │
│                  │           └─ Layout                  │   │
│                  │               ├─ Sidebar             │   │
│                  │               ├─ MainHeader          │   │
│                  │               └─ <ActivePage>        │   │
│                  └──────────────────────────────────────┘   │
│                                                             │
│  localStorage: fd_transactions  ◄──────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User action (click / form submit)
        │
        ▼
Component calls dispatch(action)
        │
        ▼
AppContext reducer produces new state
        │
        ├──▶ Mutations (ADD / EDIT / DELETE) also write to localStorage
        │
        ▼
React re-renders affected components
        │
        ▼
Utility functions (helpers.js) compute derived data for display
```

### Navigation Model

There is **no URL-based routing**. Page switching is controlled entirely by `state.activePage` in the global context. The `Layout` component maps this value to a page component:

| `activePage` value | Rendered component |
|--------------------|--------------------|
| `overview` | `Dashboard.jsx` |
| `balances` | `Balances.jsx` |
| `transactions` | `Transactions.jsx` |
| `bills` | `PlaceholderPage` (Bills) |
| `expenses` | `Insights.jsx` |
| `goals` | `Goals.jsx` |
| `settings` | `Settings.jsx` |

---

## 4. Entry Point and Application Shell

### `index.html`

Standard Vite HTML entry. Contains `<div id="root">` and a single `<script type="module" src="/src/main.jsx">` import.

### `src/main.jsx`

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Mounts the React tree into `#root` inside StrictMode.

### `src/App.jsx`

Wraps the entire tree in `AppProvider` (context), then renders the `Layout` component.

**Layout responsibilities:**

| Responsibility | Implementation |
|---------------|---------------|
| Page switching | `pages[state.activePage]` map → renders correct page |
| Mobile drawer | `mobileNavOpen` local state; hamburger button in sticky mobile header |
| Overlay backdrop | Rendered when `mobileNavOpen === true`; click closes menu |
| Escape to close | `keydown` listener added when `mobileNavOpen === true` |
| Auto-close on resize | `window.matchMedia("(min-width: 1024px)")` listener |
| Body scroll lock | Sets `document.body.style.overflow = "hidden"` while menu is open |
| Safe-area padding | All edges use `env(safe-area-inset-*)` in Tailwind classes |

---

## 5. State Management

**File:** `src/context/AppContext.jsx`

### 5.1 Initial State

```js
{
  transactions: INITIAL_TRANSACTIONS,  // 47 seed rows from mockData.js
  role: "viewer",                      // "viewer" | "admin"
  filters: {
    search: "",                        // text search string
    category: "all",                   // category name or "all"
    type: "all",                       // "income" | "expense" | "all"
    month: "all"                       // "YYYY-MM" string or "all"
  },
  activePage: "goals",                 // page key (see navigation map above)
}
```

> **Note:** The default `activePage` is `"goals"`, not `"overview"`.

### 5.2 Reducer Actions

| Action type | Payload | Effect |
|-------------|---------|--------|
| `SET_ROLE` | `"viewer"` \| `"admin"` | Updates `state.role` |
| `SET_PAGE` | Page key string | Updates `state.activePage` |
| `SET_FILTER` | Partial `filters` object | Shallow-merges into `state.filters` |
| `RESET_FILTERS` | — | Restores `filters` to initial defaults |
| `ADD_TRANSACTION` | Transaction fields (no `id`) | Prepends row with `id: Date.now()`; persists full array to `localStorage` |
| `EDIT_TRANSACTION` | Full transaction including `id` | Replaces matching row; persists to `localStorage` |
| `DELETE_TRANSACTION` | `id` (number) | Removes matching row; persists to `localStorage` |
| `LOAD_FROM_STORAGE` | Transaction array | Replaces `state.transactions`; used once on mount |

### 5.3 localStorage Hydration

On `AppProvider` mount, a `useEffect` runs:

```js
const saved = localStorage.getItem("fd_transactions");
if (saved) {
  try {
    dispatch({ type: "LOAD_FROM_STORAGE", payload: JSON.parse(saved) });
  } catch {} // silently ignores corrupted data
}
```

If `fd_transactions` exists and is valid JSON, it replaces the in-memory seed list. Invalid JSON is silently ignored and the seed data remains.

### 5.4 Custom Hook

```js
export function useApp() {
  return useContext(AppContext);
}
// Usage: const { state, dispatch } = useApp();
```

---

## 6. Data Model

### 6.1 Transaction Object

| Field | Type | Constraints |
|-------|------|------------|
| `id` | `number` | Stable identifier; seed rows use sequential integers; new rows use `Date.now()` |
| `date` | `string` | ISO format `YYYY-MM-DD`; month filters use `date.slice(0, 7)` |
| `description` | `string` | Free text; used as primary search target |
| `category` | `string` | Should be one of `CATEGORIES` (enforced by form; open string in storage) |
| `type` | `"income"` \| `"expense"` | Drives all aggregation and chart rendering |
| `amount` | `number` | Positive number; modal validation rejects `NaN` and values `<= 0` |

### 6.2 Seed Data (`src/data/mockData.js`)

- **`CATEGORIES`** — array of 10 strings used in dropdowns and filters:
  `"Food & Dining"`, `"Transport"`, `"Shopping"`, `"Entertainment"`, `"Healthcare"`, `"Utilities"`, `"Salary"`, `"Freelance"`, `"Investment"`, `"Other"`

- **`INITIAL_TRANSACTIONS`** — 47 mock rows spanning January–March 2026 with realistic Indian commerce contexts (INR amounts, local merchant/service names)

- **`CATEGORY_COLORS`** — hex color map used by Recharts charts and legend chips:

| Category | Color |
|----------|-------|
| Food & Dining | `#f59e0b` |
| Transport | `#3b82f6` |
| Shopping | `#8b5cf6` |
| Entertainment | `#ec4899` |
| Healthcare | `#10b981` |
| Utilities | `#6366f1` |
| Salary | `#22c55e` |
| Freelance | `#14b8a6` |
| Investment | `#f97316` |
| Other | `#94a3b8` |

### 6.3 localStorage Contract

| Key | Value | Notes |
|-----|-------|-------|
| `fd_transactions` | JSON array of transaction objects | Written on every ADD, EDIT, or DELETE; read once on app boot |

---

## 7. Utility Functions

### 7.1 `src/utils/helpers.js`

#### `formatCurrency(amount: number): string`

Formats a number as Indian Rupee using `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })`.

```js
formatCurrency(82000) // → "₹82,000"
```

#### `formatDate(dateStr: string): string`

Formats a `YYYY-MM-DD` string as a short locale date: `"DD Mon YYYY"`.

```js
formatDate("2026-03-01") // → "01 Mar 2026"
```

#### `getMonthLabel(dateStr: string): string`

Returns a short month + year label from a date string.

```js
getMonthLabel("2026-03-01") // → "Mar 2026"
```

#### `getSummary(transactions): { income, expenses, balance }`

Reduces an array of transactions to total income, total expenses, and the difference.

```js
const { income, expenses, balance } = getSummary(state.transactions);
```

#### `getMonthlyData(transactions): MonthlyEntry[]`

Groups transactions by `YYYY-MM`, computes per-month income and expenses, sorts chronologically, and adds a human-readable `label` and `balance` field.

**Returns:** `Array<{ month: string, income: number, expenses: number, label: string, balance: number }>`

Used by Dashboard (bar chart, area chart) and Insights (expense trend chart).

#### `getCategoryBreakdown(transactions): CategoryEntry[]`

Filters to expense transactions, totals by category, and returns sorted descending by value.

**Returns:** `Array<{ name: string, value: number }>`

Used by Dashboard (pie chart) and Insights (bar chart).

#### `getInsights(transactions): InsightsResult`

Derives actionable analytics:

| Field | Description |
|-------|-------------|
| `topCategory` | `{ name, value }` of the highest-spend category |
| `monthComparison` | `{ diff, pct, increased, current, previous }` comparing last two months' expenses |
| `avgExpense` | Mean expense transaction amount across all expense rows |
| `byCategory` | Same array as `getCategoryBreakdown` |

`monthComparison` is `null` when fewer than two months of data exist.

#### `applyFilters(transactions, filters): Transaction[]`

Applies the global filter state to a transaction array. Checks (in order):
1. **search** — case-insensitive substring match on `description` or `category`
2. **category** — exact match unless `"all"`
3. **type** — exact match unless `"all"`
4. **month** — `date.startsWith(filters.month)` unless `"all"`

#### `getUniqueMonths(transactions): string[]`

Returns distinct `YYYY-MM` strings from all transaction dates, sorted newest-first. Used to populate the month filter dropdown.

---

### 7.2 `src/utils/exportTransactions.js`

#### `downloadTransactionsCsv(rows: Transaction[]): void`

Serializes the given rows to CSV format (columns: `id`, `date`, `description`, `category`, `type`, `amount`) and triggers a browser file download.

- Fields containing commas, double-quotes, or newlines are wrapped in double-quotes per RFC 4180.
- File includes a UTF-8 BOM (`\uFEFF`) for correct Excel rendering.
- Filename pattern: `financeos-transactions-YYYY-MM-DD.csv`

#### `downloadTransactionsJson(rows: Transaction[]): void`

Serializes the given rows to formatted JSON and triggers a browser file download.

- Filename pattern: `financeos-transactions-YYYY-MM-DD.json`

Both functions use a `triggerDownload` helper that creates an `<a>` element with an object URL, clicks it programmatically, and revokes the URL to free memory.

---

## 8. Components

### `src/components/MainHeader.jsx`

Rendered at the top of every page inside the main content area.

| Element | Description |
|---------|-------------|
| Date label | Today's date formatted as `"Weekday, Month Day, Year"` |
| Notifications button | Icon button (bell); UI-only, no functionality |
| Search input | Text input with search icon; currently decorative (no global search dispatch) |

### `src/components/Sidebar.jsx`

Props: `mobileOpen: boolean`, `onNavigate: () => void`

| Section | Description |
|---------|-------------|
| Logo | "FinanceOS" wordmark in Manrope font |
| Navigation | 7 nav items; active item highlighted with `bg-sidebar-active`; each calls `dispatch({ type: "SET_PAGE" })` then `onNavigate?.()` to close mobile drawer |
| Logout button | UI-only; no auth action |
| User chip | Avatar gradient circle, name "Chinmay J", "View profile" button (UI-only) |

The sidebar is `position: fixed` on all breakpoints. On mobile it slides in/out via CSS transform transition controlled by the `mobileOpen` prop. On desktop (`lg:`) it is permanently visible (`lg:translate-x-0`).

### `src/components/SummaryCard.jsx`

A reusable metric display card used on the Dashboard page.

Typical props: `label`, `value`, `icon`, `trend`, `highlight` (exact prop API depends on Dashboard usage).

### `src/components/TransactionModal.jsx`

A modal dialog for adding and editing transactions. Used only when `state.role === "admin"`.

| Feature | Detail |
|---------|--------|
| Mode | Determined by whether an existing transaction is passed as a prop |
| Fields | Date (`<input type="date">`), Description (`<input type="text">`), Category (`<select>` from `CATEGORIES`), Type (`<select>`: income / expense), Amount (`<input type="number">`) |
| Validation | Required: date, description; Amount must be a positive number (`> 0` and not `NaN`) |
| Submit | Dispatches `ADD_TRANSACTION` (new) or `EDIT_TRANSACTION` (existing) |
| Close | Escape key or cancel button |

### `src/components/SkeletonLoader.jsx`

A pulsing placeholder that mimics the Dashboard layout during the simulated ~900 ms load state. Contains skeleton blocks matching the summary cards, charts, and recent-transactions list positions.

---

## 9. Pages

### 9.1 Dashboard (`src/pages/Dashboard.jsx`)

Page key: `"overview"`

**Data source:** `state.transactions` (all transactions, no context filters applied)

**Load behavior:** Uses a local `loaded` state initialized to `false`. A `useEffect` sets it to `true` after a ~900 ms `setTimeout`, during which `<PageSkeleton />` is rendered.

**Content sections:**

| Section | Component / Library | Data |
|---------|--------------------|----|
| Summary cards | `SummaryCard` × 4 | `getSummary()`: balance, income, expenses, savings rate |
| Monthly bar chart | Recharts `BarChart` | `getMonthlyData()`: income + expenses bars per month |
| Balance trend | Recharts `AreaChart` | `getMonthlyData()`: cumulative balance area |
| Spending breakdown | Recharts `PieChart` (donut) | `getCategoryBreakdown()` with `CATEGORY_COLORS` |
| Recent transactions | Custom list | Last 6 transactions sorted by date descending |

All charts have custom `<Tooltip>` components formatting values with `formatCurrency`. Empty states are shown when the data arrays are empty.

### 9.2 Transactions (`src/pages/Transactions.jsx`)

Page key: `"transactions"`

**Filters (bound to context):** Search text, type, category, month — all dispatched via `SET_FILTER`.

**Sort (local state):** `sortBy` (`"date"` | `"amount"` | `"description"`) and `sortDir` (`"asc"` | `"desc"`). Clicking an active column header toggles direction; clicking a new column sets it and defaults to `"desc"`.

**Table columns:** Date, Description, Category, Type badge, Amount, Actions (Admin only)

**Admin actions:**
- **Add Transaction** button — opens `TransactionModal` in add mode
- **Edit** (row action) — opens `TransactionModal` pre-filled with the row
- **Delete** (row action) — calls `window.confirm`, then dispatches `DELETE_TRANSACTION`

**Export buttons:** Call `downloadTransactionsCsv` / `downloadTransactionsJson` with the current filtered + sorted rows.

**Empty state:** Displayed when the filtered list is empty, with a prompt to adjust filters.

### 9.3 Insights (`src/pages/Insights.jsx`)

Page key: `"expenses"`

**Data source:** `state.transactions` (all transactions)

**Stat cards:**

| Card | Computation |
|------|------------|
| Top spending category | `getInsights().topCategory`; shows name, amount, percentage of total expenses |
| Month-on-month change | `getInsights().monthComparison`; shows `pct`% with up/down indicator |
| Savings rate | `((income - expenses) / income) * 100`; color-coded with guidance text |

**Charts:**

| Chart | Type | Data |
|-------|------|------|
| Spending by category | Recharts `BarChart` (horizontal) | `getCategoryBreakdown()` |
| Monthly expense trend | Recharts `BarChart` (vertical) | `getMonthlyData()` (expenses column) |

**Observations:** A list of 4 auto-generated text insights derived from the same aggregates (e.g. top category, savings rate, month-on-month comparison).

### 9.4 Goals (`src/pages/Goals.jsx`)

Page key: `"goals"`

| Section | Description |
|---------|-------------|
| Savings goal card | A `SemiGauge` sub-component renders a donut-arc progress chart showing progress toward a monthly savings target |
| Date range selector | Dropdown to scope goal period |
| Adjust goal button | UI-only; no persistence |
| Savings comparison chart | Recharts `AreaChart` overlaying current-month vs. previous-month savings |
| Category budget cards | 6 cards (one per category subset) with progress bars and "Adjust" buttons |

Goal amounts and progress values are static/hardcoded; no reducer actions back this page.

### 9.5 Balances (`src/pages/Balances.jsx`)

Page key: `"balances"`

Renders three cards computed from `getSummary(state.transactions)`:

| Card | Value | Hint |
|------|-------|------|
| Total balance | `income - expenses` | "Across accounts" |
| Available | `Math.max(0, balance)` | "Ready to spend" |
| Monthly flow | `income - expenses` | "Income − expenses" |

### 9.6 Settings (`src/pages/Settings.jsx`)

Page key: `"settings"`

Contains a segmented role toggle (Viewer / Admin). Clicking a segment dispatches `SET_ROLE`. The active segment is highlighted with `bg-primary`. This is functionally equivalent to the role toggle in the Sidebar.

### 9.7 PlaceholderPage (`src/pages/PlaceholderPage.jsx`)

Props: `title: string`, `description?: string`

A reusable "coming soon" shell used for the Bills page. Renders the title, an optional description paragraph, and a dashed-border placeholder content box.

---

## 10. Styling and Theming

### 10.1 Tailwind CSS v4 Setup

Tailwind v4 is integrated via the `@tailwindcss/vite` Vite plugin (no `tailwind.config.js`). The single import in `src/index.css` enables all utilities:

```css
@import "tailwindcss";
```

### 10.2 Design Tokens (`@theme` in `src/index.css`)

All custom tokens are declared inside the `@theme` block and automatically become Tailwind utility classes:

#### Colors

| Token | Value | Usage class |
|-------|-------|-------------|
| `--color-background` | `#eef1f4` | `bg-background` |
| `--color-surface` | `#eef1f4` | `bg-surface` |
| `--color-surface-container-low` | `#e8ebef` | `bg-surface-container-low` |
| `--color-surface-container-lowest` | `#ffffff` | `bg-surface-container-lowest` |
| `--color-on-surface` | `#1f2933` | `text-on-surface` |
| `--color-on-surface-variant` | `#6b7280` | `text-on-surface-variant` |
| `--color-primary` | `#2a9d8f` (teal) | `bg-primary`, `text-primary` |
| `--color-primary-container` | `#3dbfb0` | `bg-primary-container` |
| `--color-primary-fixed-dim` | `#238b7f` | `bg-primary-fixed-dim` |
| `--color-on-primary` | `#ffffff` | `text-on-primary` |
| `--color-sidebar` | `#161a1d` | `bg-sidebar` |
| `--color-sidebar-muted` | `#9ca3af` | `text-sidebar-muted` |
| `--color-sidebar-active` | `#2a9d8f` | `bg-sidebar-active` |
| `--color-error` | `#c45a58` | `text-error` |
| `--color-error-container` | `#fce8e6` | `bg-error-container` |
| `--color-outline-variant` | `#c5cdd3` | `border-outline-variant` |
| `--color-secondary-container` | `#d5f5f0` | `bg-secondary-container` |
| `--color-tertiary-container` | `#e8f7f5` | `bg-tertiary-container` |

#### Typography

| Token | Value | Usage class |
|-------|-------|-------------|
| `--font-sans` | Inter, system-ui, sans-serif | `font-sans` (body default) |
| `--font-display` | Manrope, system-ui, sans-serif | `font-display` (headings) |

#### Spacing / Shape

| Token | Value | Usage class |
|-------|-------|-------------|
| `--radius-lg` | `1rem` | `rounded-lg` |
| `--radius-xl` | `1.5rem` | `rounded-xl` |

#### Shadows

| Token | Value | Usage class |
|-------|-------|-------------|
| `--shadow-ambient` | `0 24px 32px -4px rgb(44 52 55 / 0.06)` | `shadow-ambient` |
| `--shadow-ambient-hover` | `0 28px 40px -4px rgb(44 52 55 / 0.08)` | `shadow-ambient-hover` |

### 10.3 Custom Utilities (`@utility` in `src/index.css`)

| Utility class | Description |
|--------------|-------------|
| `ghost-border` | Subtle inset border using `color-mix` with `outline-variant` at 15% opacity |
| `glass-float` | Frosted-glass background (88% white + backdrop-blur) |
| `text-display-md` | Display/hero heading: 2.25rem, 700, Manrope, -0.02em tracking |
| `text-headline-lg` | Large section heading: 1.75rem, 700, Manrope |
| `text-headline-page` | Fluid page title: `clamp(1.375rem, 1.15rem + 1.1vw, 1.75rem)`, Manrope |
| `text-title-lg` | Card title: 1.375rem, 600, Manrope |
| `text-body-md` | Body text: 1rem, 400 |
| `text-label-md` | Secondary label: 0.875rem, 500 |
| `text-label-sm` | Caption / meta text: 0.75rem, 500 |

### 10.4 Component Classes (`@layer components` in `src/index.css`)

| Class | Description |
|-------|-------------|
| `.input-editorial` | Styled text input: white background, rounded-2xl, subtle inset border that brightens on focus |
| `.btn-primary-gradient` | Teal gradient button with hover brightness effect |

### 10.5 `src/App.css`

Contains additional layout helpers and component-specific rules that supplement the Tailwind utilities used in JSX.

---

## 11. Build Configuration

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- **`@vitejs/plugin-react`** — JSX transform, Fast Refresh
- **`@tailwindcss/vite`** — Tailwind v4 CSS compilation, no PostCSS config needed
- No environment variables are required for the default mock + localStorage flow

### `eslint.config.js`

Uses the ESLint flat config format (v9+) with:
- `@eslint/js` recommended rules
- `eslint-plugin-react-hooks` (recommended)
- `eslint-plugin-react-refresh` (only-export-components rule)

---

## 12. File Structure

```
finance-dashboard/
├── index.html                   # Vite entry HTML, #root mount point
├── vite.config.js               # Build config: React + Tailwind plugins
├── eslint.config.js             # ESLint flat config (v9 format)
├── package.json                 # Dependencies and npm scripts
├── package-lock.json
├── README.md                    # Quick start, features, project overview
├── DOCUMENTATION.md             # This file — full technical reference
├── public/                      # Static assets served as-is
└── src/
    ├── main.jsx                 # React root: createRoot + StrictMode
    ├── App.jsx                  # AppProvider wrapper + Layout component
    ├── index.css                # @import tailwindcss + @theme tokens + @utility
    ├── App.css                  # App-level supplementary styles
    ├── context/
    │   └── AppContext.jsx       # Global state: useReducer + Context + useApp hook
    ├── data/
    │   └── mockData.js          # CATEGORIES, CATEGORY_COLORS, INITIAL_TRANSACTIONS
    ├── components/
    │   ├── MainHeader.jsx       # Page-top bar with date, search, notifications
    │   ├── Sidebar.jsx          # Navigation drawer + role toggle + user chip
    │   ├── SummaryCard.jsx      # Reusable metric display card
    │   ├── TransactionModal.jsx # Add / edit form modal (Admin only)
    │   └── SkeletonLoader.jsx   # Pulsing Dashboard load placeholder
    ├── pages/
    │   ├── Dashboard.jsx        # Overview: summary cards + 3 charts + recent transactions
    │   ├── Transactions.jsx     # CRUD table: filter, sort, search, export
    │   ├── Insights.jsx         # Expense analytics: stat cards + charts + observations
    │   ├── Goals.jsx            # Savings goals + category budget cards
    │   ├── Balances.jsx         # Balance summary cards
    │   ├── Settings.jsx         # Role preference toggle
    │   └── PlaceholderPage.jsx  # Generic "coming soon" shell
    └── utils/
        ├── helpers.js           # Pure functions: formatting, aggregation, filtering
        └── exportTransactions.js # CSV and JSON download helpers
```

---

## 13. Assumptions and Limitations

- **No backend or API** — the app is entirely client-side; there is no network layer.
- **Roles are UI-only** — switching Viewer / Admin has no security implications; any user can switch freely.
- **Balance is cumulative** — computed as all-time income minus all-time expenses across every loaded transaction, not a per-period or per-account closing balance.
- **Seed data spans Jan–Mar 2026** — analytics that compare two months of data (e.g. month-on-month in Insights) require transactions in at least two distinct calendar months.
- **localStorage persistence** — transaction mutations survive page refresh but are scoped to the browser profile. Clearing site data resets to the seed.
- **Goals and Bills are static** — no reducer actions or persistence back these pages; values are hardcoded for demonstration.
- **MainHeader search** — the search input in the top bar is decorative and does not dispatch any filter action. Transaction search is on the Transactions page only.
- **Logout button** — visible in the Sidebar but has no authentication action.

---

## 14. Troubleshooting and Common Patterns

### Transactions reset to seed data after refresh

Check the browser's DevTools → Application → Local Storage for the key `fd_transactions`. If it is missing or contains invalid JSON, the app falls back to the seed. Use the JSON export on the Transactions page to back up your data before clearing site storage.

### How to add a new page

1. Create `src/pages/MyPage.jsx` with a default export.
2. Import it in `src/App.jsx` and add it to the `pages` object: `mypage: MyPage`.
3. Add a nav item to the `NAV` array in `src/components/Sidebar.jsx` with `id: "mypage"`.
4. No routing config is needed — the context handles the rest.

### How to add a new transaction field

1. Add the field to the transaction object shape in `src/data/mockData.js` seed rows.
2. Add the form input to `src/components/TransactionModal.jsx`.
3. Update any relevant utility functions in `src/utils/helpers.js`.
4. The field will automatically persist to `localStorage` on the next mutation.

### How to change the default currency

Replace the `"en-IN"` locale and `"INR"` currency code in `formatCurrency` inside `src/utils/helpers.js`. All chart tooltips and card values use this function.

### Charts show no data

Ensure `state.transactions` is non-empty and contains at least one `"expense"` transaction for spending charts, or at least two months of data for the monthly comparison in Insights.

### Tailwind classes not applying

Tailwind v4 scans `src/**/*.{jsx,js}` automatically via the Vite plugin. Ensure class names are complete strings (not dynamically assembled with template literals using variables) so the scanner can detect them.

---

## 15. Related Documentation

- **[README.md](./README.md)** — project overview, quick start, feature list, design notes, and author
- **[Recharts documentation](https://recharts.org/en-US/)** — reference for all chart components used (BarChart, AreaChart, PieChart, Cell, Tooltip, ResponsiveContainer)
- **[Tailwind CSS v4 docs](https://tailwindcss.com/docs)** — utility reference and `@theme` configuration
- **[Vite documentation](https://vitejs.dev/)** — build tool configuration and plugin API
- **[React Context API](https://react.dev/reference/react/createContext)** — reference for the context + useReducer pattern used in AppContext
