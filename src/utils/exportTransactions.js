const CSV_COLUMNS = ["id", "date", "description", "category", "type", "amount"];

function escapeCsvField(value) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function transactionsToCsv(rows) {
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(CSV_COLUMNS.map((key) => escapeCsvField(row[key])).join(","));
  }
  return lines.join("\r\n");
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function datedFilename(prefix, ext) {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}.${ext}`;
}

/** Exports the given rows (e.g. current filtered & sorted list) as CSV. */
export function downloadTransactionsCsv(rows) {
  const csv = `\uFEFF${transactionsToCsv(rows)}`;
  triggerDownload(csv, datedFilename("financeos-transactions", "csv"), "text/csv;charset=utf-8;");
}

/** Exports the given rows as formatted JSON. */
export function downloadTransactionsJson(rows) {
  const json = `${JSON.stringify(rows, null, 2)}\n`;
  triggerDownload(json, datedFilename("financeos-transactions", "json"), "application/json;charset=utf-8;");
}
