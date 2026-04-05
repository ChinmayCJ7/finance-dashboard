# FinanceOS — Finance Dashboard

A multi-page, mobile-first personal finance dashboard for tracking income, expenses, insights, goals, and balances. Built as a frontend assignment for Zorvyn FinTech (Job ID: CHHFUL).

**Full technical reference:** [DOCUMENTATION.md](./DOCUMENTATION.md) — architecture, state API, data model, all utilities and components.

---

## Quick Start

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/ChinmayCJ7/finance-dashboard.git
cd finance-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser. The app loads with 47 seed transactions covering January–March 2026.

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | Production bundle → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint across the codebase |

---

## Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| UI Framework | React | 19.2.4 | Concurrent features, StrictMode |
| Build Tool | Vite | 8.0.1 | Fast HMR, ESM-native |
| Styling | Tailwind CSS | 4.2.2 | `@tailwindcss/vite` plugin, `@theme` tokens |
| Charts | Recharts | 3.8.1 | Composable React chart components |
| Global State | React Context + `useReducer` | — | No external state library |
| Persistence | `localStorage` | — | `fd_transactions` key |
| Linting | ESLint | 9.39.4 | React Hooks + React Refresh plugins |

---

## Key Features

### Overview (Dashboard)
- Summary cards showing total balance, income, expenses, and savings rate
- Monthly income vs. expenses bar chart
- Running balance area chart over time
- Spending breakdown donut chart by category
- Six most recent transactions list
- Skeleton loading state (~900 ms) on first render

### Transactions
- Full data table with date, description, category, type, and amount columns
- Text search across description and category
- Filter by transaction type (income / expense), category, and month
- Sort by date, amount, or description (ascending / descending toggle)
- **Admin only:** add, edit, and delete transactions via modal form with validation
- Export current filtered and sorted view as **CSV** or **JSON**
- Empty state when no rows match active filters

### Expenses (Insights)
- Highest spending category card with percentage share
- Month-on-month expense change with directional indicator (up/down)
- Savings rate card with plain-English guidance
- Horizontal bar chart of spending by category
- Monthly expense trend bar chart
- Four auto-generated plain-English observations

### Goals
- Savings goal with semi-gauge progress chart
- Date range selector and adjustable goal amount
- Savings comparison area chart (current month vs. previous month)
- Six category budget cards with progress indicators

### Balances
- Three balance summary cards: Total Balance, Available, and Monthly Flow
- Values computed from all loaded transactions

### Settings
- Role toggle: **Viewer** (read-only) or **Admin** (full CRUD)
- Same role toggle is also accessible in the Sidebar

### Bills
- Placeholder page for future recurring-bill management

### Layout and Navigation
- **No React Router** — page switching via `activePage` in global context
- Fixed sidebar on desktop (1024 px and above); hamburger drawer on mobile
- Overlay + Escape key closes mobile menu; body scroll locked when open
- Auto-closes mobile menu when viewport resizes to desktop width
- iOS safe-area padding via `env(safe-area-inset-*)`

---

## Project Structure

```
finance-dashboard/
├── index.html                   # HTML entry point, #root mount
├── vite.config.js               # Vite + React + Tailwind plugins
├── eslint.config.js             # ESLint flat config
├── package.json
└── src/
    ├── main.jsx                 # ReactDOM.createRoot, StrictMode
    ├── App.jsx                  # AppProvider, Layout, mobile nav, page switcher
    ├── index.css                # Tailwind import + @theme design tokens
    ├── App.css                  # Additional component styles
    ├── context/
    │   └── AppContext.jsx       # Reducer: transactions, role, filters, activePage
    ├── data/
    │   └── mockData.js          # CATEGORIES, CATEGORY_COLORS, INITIAL_TRANSACTIONS (47 rows)
    ├── components/
    │   ├── MainHeader.jsx       # Top bar: current date, search input, notifications
    │   ├── Sidebar.jsx          # Navigation drawer + role toggle + user chip
    │   ├── SummaryCard.jsx      # Reusable metric card
    │   ├── TransactionModal.jsx # Add / edit transaction form with validation
    │   └── SkeletonLoader.jsx   # Dashboard loading skeleton
    ├── pages/
    │   ├── Dashboard.jsx        # Overview: charts + summary cards + recent transactions
    │   ├── Transactions.jsx     # Filter, sort, export, CRUD table
    │   ├── Insights.jsx         # Expense analysis and observations
    │   ├── Goals.jsx            # Savings goals and category budgets
    │   ├── Balances.jsx         # Account balance overview
    │   ├── Settings.jsx         # Role preference toggle
    │   └── PlaceholderPage.jsx  # Generic "coming soon" shell (used for Bills)
    └── utils/
        ├── helpers.js           # Aggregation, formatting, filtering utilities
        └── exportTransactions.js # CSV and JSON download helpers
```

---

## Design Notes

- **Tailwind v4** integrates via the `@tailwindcss/vite` plugin — no `tailwind.config.js` needed. All design tokens (colors, fonts, radii, shadows) live under `@theme` in `src/index.css`.
- **Typography** uses Inter (body / `font-sans`) and Manrope (headings / `font-display`) loaded via Google Fonts in `index.css`.
- **Color palette** is a light shell with a teal primary (`#2a9d8f`) and a near-black sidebar (`#161a1d`). All semantic color names map to Tailwind utility classes (e.g. `bg-background`, `text-on-surface`, `bg-primary`).
- **Currency** is formatted with `Intl.NumberFormat("en-IN")` producing Indian Rupee (INR) notation with zero decimal places.
- **No router library** — navigation is driven entirely by `state.activePage` in global context, keeping the bundle small.
- **No heavy UI kit** — all layout and components are hand-crafted with Tailwind utilities and shared `@theme` tokens.

---

## Assumptions and Limitations

- **No backend** — all data is local to the browser. Clearing site data resets transactions to the 47-row seed unless a CSV/JSON export has been saved.
- **Roles are UI-only** — there is no authentication boundary; switching Viewer / Admin is purely cosmetic access control.
- **Balance calculation** is cumulative (total income minus total expenses across all loaded transactions), not a per-account ledger balance.
- **Seed data** spans January–March 2026 with Indian commerce contexts (INR amounts, local merchant names).
- **Insights** that compare two months require at least two calendar months of data in the loaded transaction list.
- **Goals and Bills pages** contain static/placeholder content; no persistence or real goal-tracking logic is implemented.

---

## Author

**Chinmay J**  
[cj7.me](https://cj7.me) · [github.com/ChinmayCJ7](https://github.com/ChinmayCJ7)
