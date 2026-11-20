/**
 * Meal costing engine (pure functions, no I/O — fully unit-tested).
 *
 * Rule: meal rate = daily bazar (food) cost ÷ total meals served in the period.
 *       resident charge = resident meals × meal rate.
 *       balance = advances paid − charge  (negative = resident owes, positive = credit).
 * Rent, utilities and other living costs are NEVER part of the meal rate.
 */
export type MealRow = { residentId?: string; date: string; breakfast: boolean; lunch: boolean; dinner: boolean };
export type BazarRow = { date: string; amount: number; category: string };
export type AdvanceRow = { residentId: string; amount: number };
export type PersonRef = { id: string; name: string; room: string; status?: string };

export type StatementRow = {
  residentId: string; name: string; room: string;
  breakfast: number; lunch: number; dinner: number; meals: number;
  charge: number; advance: number; balance: number;
};
export type DailyPoint = { date: string; day: string; bazar: number; meals: number };
export type Settlement = {
  totalBazar: number; totalMeals: number; mealRate: number | null;
  rows: StatementRow[]; totalCharge: number; totalAdvance: number; totalDue: number; totalCredit: number;
  daily: DailyPoint[]; byCategory: { category: string; amount: number }[];
  elapsedDays: number; periodDays: number; avgDailyBazar: number; projectedBazar: number; avgMealsPerDay: number;
};

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;
export const mealCount = (m: Pick<MealRow, 'breakfast' | 'lunch' | 'dinner'>): number =>
  Number(m.breakfast) + Number(m.lunch) + Number(m.dinner);

type Input = {
  residents: PersonRef[]; meals: MealRow[]; bazar: BazarRow[]; advances: AdvanceRow[];
  start: string; end: string; today: string;
};

const inRange = (d: string, start: string, end: string) => d >= start && d <= end;

export function computeSettlement({ residents, meals, bazar, advances, start, end, today }: Input): Settlement {
  const periodDays = Number(end.slice(8, 10));
  const elapsedDays = today < start ? 0 : today > end ? periodDays : Number(today.slice(8, 10));

  const periodMeals = meals.filter(m => inRange(m.date, start, end));
  const periodBazar = bazar.filter(b => inRange(b.date, start, end));

  const totalBazar = round2(periodBazar.reduce((s, b) => s + b.amount, 0));
  const totalMeals = periodMeals.reduce((s, m) => s + mealCount(m), 0);
  const mealRate = totalMeals > 0 ? totalBazar / totalMeals : null;

  const byId = new Map(residents.map(r => [r.id, r]));
  const acc = new Map<string, StatementRow>();
  const row = (id: string): StatementRow => {
    let r = acc.get(id);
    if (!r) {
      const p = byId.get(id);
      r = { residentId: id, name: p?.name ?? 'Removed resident', room: p?.room ?? '—', breakfast: 0, lunch: 0, dinner: 0, meals: 0, charge: 0, advance: 0, balance: 0 };
      acc.set(id, r);
    }
    return r;
  };

  for (const m of periodMeals) {
    if (!m.residentId) continue;
    const r = row(m.residentId);
    r.breakfast += Number(m.breakfast); r.lunch += Number(m.lunch); r.dinner += Number(m.dinner);
    r.meals += mealCount(m);
  }
  for (const a of advances) row(a.residentId).advance += a.amount;
  // Active residents always appear on the statement, even with no activity yet.
  for (const p of residents) if (p.status === undefined || p.status === 'Active') row(p.id);

  const rows = [...acc.values()].map(r => {
    const charge = mealRate === null ? 0 : round2(r.meals * mealRate);
    const advance = round2(r.advance);
    return { ...r, charge, advance, balance: round2(advance - charge) };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const dailyMap = new Map<string, DailyPoint>();
  const point = (date: string) => {
    let p = dailyMap.get(date);
    if (!p) { p = { date, day: date.slice(8, 10), bazar: 0, meals: 0 }; dailyMap.set(date, p); }
    return p;
  };
  for (const b of periodBazar) point(b.date).bazar = round2(point(b.date).bazar + b.amount);
  for (const m of periodMeals) point(m.date).meals += mealCount(m);

  const catMap = new Map<string, number>();
  for (const b of periodBazar) catMap.set(b.category, (catMap.get(b.category) ?? 0) + b.amount);

  const avgDailyBazar = elapsedDays > 0 ? totalBazar / elapsedDays : 0;
  return {
    totalBazar, totalMeals, mealRate, rows,
    totalCharge: round2(rows.reduce((s, r) => s + r.charge, 0)),
    totalAdvance: round2(rows.reduce((s, r) => s + r.advance, 0)),
    totalDue: round2(rows.filter(r => r.balance < 0).reduce((s, r) => s - r.balance, 0)),
    totalCredit: round2(rows.filter(r => r.balance > 0).reduce((s, r) => s + r.balance, 0)),
    daily: [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    byCategory: [...catMap.entries()].map(([category, amount]) => ({ category, amount: round2(amount) })).sort((a, b) => b.amount - a.amount),
    elapsedDays, periodDays, avgDailyBazar: round2(avgDailyBazar),
    projectedBazar: round2(avgDailyBazar * periodDays),
    avgMealsPerDay: elapsedDays > 0 ? Math.round((totalMeals / elapsedDays) * 10) / 10 : 0,
  };
}
