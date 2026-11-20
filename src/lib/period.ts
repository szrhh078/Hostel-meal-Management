/** Date helpers. All dates are plain `YYYY-MM-DD` strings so time zones never shift a record. */
const pad = (n: number) => String(n).padStart(2, '0');

export const todayISO = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const currentPeriod = (): string => todayISO().slice(0, 7);

export const daysInMonth = (period: string): number => {
  const [y, m] = period.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

export const monthBounds = (period: string) => ({
  start: `${period}-01`,
  end: `${period}-${pad(daysInMonth(period))}`,
  days: daysInMonth(period),
});

export const shiftMonth = (period: string, delta: number): string => {
  const [y, m] = period.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
};

export const addDays = (date: string, delta: number): string => {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + delta));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
};

export const periodLabel = (period: string): string =>
  new Date(`${period}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
