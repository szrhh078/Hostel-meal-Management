/** Minimal, spreadsheet-safe CSV export (UTF-8 BOM so Bangla names open correctly in Excel). */
const cell = (v: string | number): string => {
  let s = String(v);
  // Neutralise spreadsheet formula injection in text cells (numbers are left untouched).
  if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const toCsv = (rows: (string | number)[][]): string => rows.map(r => r.map(cell).join(',')).join('\r\n');
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const blob = new Blob(['\uFEFF' + toCsv(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
