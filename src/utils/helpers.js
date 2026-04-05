export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function getMonthLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short", year: "numeric",
  });
}

export function getSummary(transactions) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  return { income, expenses, balance: income - expenses };
}

export function getMonthlyData(transactions) {
  const map = {};
  transactions.forEach((t) => {
    const key = t.date.slice(0, 7);
    if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };
    if (t.type === "income") map[key].income += t.amount;
    else map[key].expenses += t.amount;
  });
  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((d) => ({
      ...d,
      label: new Date(d.month + "-01").toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      balance: d.income - d.expenses,
    }));
}

export function getCategoryBreakdown(transactions) {
  const map = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getInsights(transactions) {
  const byCategory = getCategoryBreakdown(transactions);
  const monthly = getMonthlyData(transactions);
  const topCategory = byCategory[0] || null;

  const months = monthly.slice(-2);
  let monthComparison = null;
  if (months.length === 2) {
    const diff = months[1].expenses - months[0].expenses;
    const pct = months[0].expenses > 0
      ? Math.round(Math.abs(diff / months[0].expenses) * 100)
      : 0;
    monthComparison = { diff, pct, increased: diff > 0, current: months[1], previous: months[0] };
  }

  const avgExpense =
    transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0) /
    (transactions.filter((t) => t.type === "expense").length || 1);

  return { topCategory, monthComparison, avgExpense, byCategory };
}

export function applyFilters(transactions, filters) {
  return transactions.filter((t) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!t.description.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q)) return false;
    }
    if (filters.category !== "all" && t.category !== filters.category) return false;
    if (filters.type !== "all" && t.type !== filters.type) return false;
    if (filters.month !== "all" && !t.date.startsWith(filters.month)) return false;
    return true;
  });
}

export function getUniqueMonths(transactions) {
  const months = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort().reverse();
  return months;
}
