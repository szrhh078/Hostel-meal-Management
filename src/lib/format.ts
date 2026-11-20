export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'AED' | 'SAR' | 'CAD' | 'AUD';
export const CURRENCIES: CurrencyCode[] = ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'CAD', 'AUD'];
const KEY = 'hms-currency';

export const getCurrency = (): CurrencyCode => {
  try { const c = localStorage.getItem(KEY) as CurrencyCode | null; if (c && CURRENCIES.includes(c)) return c; } catch { /* storage unavailable */ }
  return 'BDT';
};
export const setCurrency = (c: CurrencyCode) => { try { localStorage.setItem(KEY, c); } catch { /* ignore */ } };

export const money = (amount: number, decimals = 0): string =>
  new Intl.NumberFormat('en-BD', { style: 'currency', currency: getCurrency(), currencyDisplay: 'narrowSymbol', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);

export const shortDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** Time of day (e.g. 08:42 PM) from a stored timestamp. Empty string when unknown. */
export const timeLabel = (iso?: string): string =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
