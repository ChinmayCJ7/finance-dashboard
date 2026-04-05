# FinanceOS — Finance Dashboard UI

A responsive finance dashboard for viewing income, expenses, and insights. Built as a frontend assignment for Zorvyn FinTech (Job ID: CHHFUL).

**Full technical reference:** [DOCUMENTATION.md](./DOCUMENTATION.md) (architecture, state API, data model, file map).

## Live Preview

Run the app locally using the steps below.

---

## Tech Stack

| Layer       | Choice                         | Notes                                                |
|-------------|--------------------------------|------------------------------------------------------|
| Framework   | React 19 + Vite 8              | Fast dev server, modern React                        |
| Styling     | Tailwind CSS v4 (`@tailwindcss/vite`) | `@import "tailwindcss"` + `@theme` design tokens |
| Charts      | Recharts 3                     | Composable charts aligned with React               |
| State       | Context API + `useReducer`     | Global transactions, role, filters, active page      |
| Persistence | `localStorage`                 | Transaction list survives refresh                  |

---

## Prerequisites

- Node.js 18+
- npm 9+

## Install and run

From the project root (`finance-dashboard`):

```bash
npm install
npm run dev
```

The app serves at **http://localhost:5173**.

### Other scripts

```bash
npm run build    # production build
npm run preview  # preview production build locally
npm run lint     # ESLint
```

---

## Features

### Dashboard

- Summary cards — total balance, income, expenses (plus savings rate callout)
- Monthly bar chart — income vs expenses by month
- Balance trend — area chart of running balance over time
- Spending breakdown — donut chart by category
- Recent transactions — six most recent entries
- Initial skeleton loading state (~900ms) while the overview “loads”

### Transactions

- Table with date, description, category, type, amount
- Search — description or category
- Filters — type (income/expense), category, month
- Sort — date, amount, or description (asc/desc)
- **Admin only** — add, edit, delete with modal form validation
- Empty state when no rows match

### Insights

- Top spending category and share of expenses
- Month-on-month expense change
- Savings rate with short guidance
- Horizontal bar chart — category breakdown
- Monthly expense trend
- Auto-generated plain-English observations

### Layout and roles

- **Viewer / Admin** — toggle in the sidebar; admin can mutate transactions
- **Responsive shell** — sticky mobile header, hamburger menu, overlay and Escape to close, safe-area padding; desktop fixed sidebar (`lg`)
- **In-app navigation** — no React Router; active view driven by context (`dashboard` | `transactions` | `insights`)

### Data

- **Seed data** — 47 mock transactions across January–March 2026 (`src/data/mockData.js`)
- **Persistence** — adds/edits/deletes sync to `localStorage` under `fd_transactions`

---

## Project structure

```
src/
├── main.jsx                 # React root
├── App.jsx                  # Provider, layout, mobile nav, page switcher
├── index.css                # Tailwind import + @theme tokens (fonts, colors)
├── App.css                  # App-level styles
├── context/
│   └── AppContext.jsx       # Reducer: transactions, role, filters, active page
├── data/
│   └── mockData.js          # Categories, colors, INITIAL_TRANSACTIONS
├── components/
│   ├── Sidebar.jsx          # Nav + role switcher
│   ├── SummaryCard.jsx      # Metric cards
│   ├── TransactionModal.jsx # Add/edit form + validation
│   └── SkeletonLoader.jsx   # Dashboard loading skeleton
├── pages/
│   ├── Dashboard.jsx        # Overview + charts
│   ├── Transactions.jsx     # Table + filters
│   └── Insights.jsx         # Analysis + observations
└── utils/
    └── helpers.js           # Summary, aggregates, formatting (e.g. INR)
```

---

## Design notes

- **Tailwind v4** is wired through Vite (`vite.config.js` uses `@tailwindcss/vite`); theme tokens live in `index.css` (`@theme`).
- **Typography** — Inter (body) and Manrope (display) via Google Fonts in CSS.
- **Currency** — `Intl.NumberFormat` for INR-style display.
- **No heavy UI kit** — layout and components are custom, styled with utilities and shared tokens.

---

## Assumptions

- Mock data spans January–March 2026.
- Roles are simulated in the UI only (no auth backend).
- Balance is cumulative income minus expenses over all loaded transactions.

---

## Author

**Chinmay J**  
[cj7.me](https://cj7.me) · [github.com/ChinmayCJ7](https://github.com/ChinmayCJ7)
