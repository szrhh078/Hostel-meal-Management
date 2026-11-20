import { describe, expect, it } from 'vitest';
import { computeSettlement, mealCount, round2, type MealRow } from '../mealMath';
import { addDays, daysInMonth, monthBounds, shiftMonth } from '../period';
import { toCsv } from '../csv';

const residents = [
  { id: 'a', name: 'Anik', room: '101', status: 'Active' },
  { id: 'b', name: 'Babu', room: '101', status: 'Active' },
  { id: 'c', name: 'Chand', room: '102', status: 'Inactive' },
];
const full = (residentId: string, date: string): MealRow => ({ residentId, date, breakfast: true, lunch: true, dinner: true });
const base = { start: '2026-11-01', end: '2026-11-30', today: '2026-11-10', advances: [], bazar: [], meals: [] as MealRow[], residents };

describe('meal rate rule', () => {
  it('rate = bazar ÷ total meals, charge = meals × rate', () => {
    const r = computeSettlement({ ...base,
      bazar: [{ date: '2026-11-02', amount: 600, category: 'Rice & grains' }, { date: '2026-11-03', amount: 400, category: 'Vegetables' }],
      meals: [full('a', '2026-11-02'), { residentId: 'b', date: '2026-11-02', breakfast: false, lunch: true, dinner: true }] });
    expect(r.totalBazar).toBe(1000);
    expect(r.totalMeals).toBe(5);
    expect(r.mealRate).toBe(200);
    const a = r.rows.find(x => x.residentId === 'a')!, b = r.rows.find(x => x.residentId === 'b')!;
    expect([a.meals, a.charge, b.meals, b.charge]).toEqual([3, 600, 2, 400]);
  });
  it('credits advances: balance = advance − charge (negative = owes)', () => {
    const r = computeSettlement({ ...base, bazar: [{ date: '2026-11-02', amount: 300, category: 'x' }],
      meals: [full('a', '2026-11-02')], advances: [{ residentId: 'a', amount: 1000 }, { residentId: 'b', amount: 50 }] });
    expect(r.rows.find(x => x.residentId === 'a')!.balance).toBe(700);
    expect(r.rows.find(x => x.residentId === 'b')!.balance).toBe(50);
    expect(r.totalCredit).toBe(750);
  });
  it('a resident who owes shows a negative balance and counts in totalDue', () => {
    const r = computeSettlement({ ...base, bazar: [{ date: '2026-11-02', amount: 90, category: 'x' }], meals: [full('a', '2026-11-02')] });
    expect(r.rows.find(x => x.residentId === 'a')!.balance).toBe(-90);
    expect(r.totalDue).toBe(90);
  });
  it('returns a null rate (no divide-by-zero) when no meals were served', () => {
    const r = computeSettlement({ ...base, bazar: [{ date: '2026-11-02', amount: 500, category: 'x' }] });
    expect(r.mealRate).toBeNull();
    expect(r.rows.every(x => x.charge === 0)).toBe(true);
  });
  it('ignores bazar, meals and nothing else outside the period', () => {
    const r = computeSettlement({ ...base,
      bazar: [{ date: '2026-10-31', amount: 999, category: 'x' }, { date: '2026-12-01', amount: 999, category: 'x' }, { date: '2026-11-05', amount: 100, category: 'x' }],
      meals: [full('a', '2026-10-31'), full('a', '2026-11-05')] });
    expect(r.totalBazar).toBe(100);
    expect(r.totalMeals).toBe(3);
  });
  it('lists active residents with no activity, hides inactive ones without meals', () => {
    const r = computeSettlement({ ...base });
    expect(r.rows.map(x => x.name)).toEqual(['Anik', 'Babu']);
  });
  it('keeps an inactive resident on the statement if they ate in the period', () => {
    const r = computeSettlement({ ...base, bazar: [{ date: '2026-11-02', amount: 30, category: 'x' }], meals: [full('c', '2026-11-02')] });
    expect(r.rows.map(x => x.name)).toContain('Chand');
  });
  it('charges never include non-food costs (only bazar rows feed the numerator)', () => {
    const r = computeSettlement({ ...base, bazar: [{ date: '2026-11-02', amount: 100, category: 'x' }], meals: [full('a', '2026-11-02')] });
    expect(r.mealRate).toBeCloseTo(100 / 3, 10);
  });
  it('rounds charges to 2 decimals', () => {
    const r = computeSettlement({ ...base, bazar: [{ date: '2026-11-02', amount: 100, category: 'x' }], meals: [full('a', '2026-11-02')] });
    expect(r.rows.find(x => x.residentId === 'a')!.charge).toBe(100);
    expect(round2(1.005)).toBe(1.01);
  });
});

describe('daily cost analytics (merged from BachelorCost)', () => {
  it('daily average and month-end projection = spent ÷ elapsed × days in month', () => {
    const r = computeSettlement({ ...base, today: '2026-11-10', bazar: [{ date: '2026-11-03', amount: 1000, category: 'x' }] });
    expect(r.elapsedDays).toBe(10);
    expect(r.avgDailyBazar).toBe(100);
    expect(r.projectedBazar).toBe(3000);
  });
  it('past months use the full month; future months have no projection', () => {
    expect(computeSettlement({ ...base, today: '2026-12-15' }).elapsedDays).toBe(30);
    const f = computeSettlement({ ...base, today: '2026-10-15', bazar: [] });
    expect(f.elapsedDays).toBe(0);
    expect(f.projectedBazar).toBe(0);
  });
  it('groups daily points and categories', () => {
    const r = computeSettlement({ ...base, bazar: [{ date: '2026-11-02', amount: 50, category: 'Fish' }, { date: '2026-11-02', amount: 25, category: 'Fish' }, { date: '2026-11-03', amount: 10, category: 'Eggs' }], meals: [full('a', '2026-11-02')] });
    expect(r.daily).toEqual([{ date: '2026-11-02', day: '02', bazar: 75, meals: 3 }, { date: '2026-11-03', day: '03', bazar: 10, meals: 0 }]);
    expect(r.byCategory[0]).toEqual({ category: 'Fish', amount: 75 });
  });
});

describe('helpers', () => {
  it('counts meals', () => expect(mealCount({ breakfast: true, lunch: false, dinner: true })).toBe(2));
  it('handles month boundaries and leap years', () => {
    expect(daysInMonth('2028-02')).toBe(29);
    expect(daysInMonth('2026-02')).toBe(28);
    expect(monthBounds('2026-11')).toEqual({ start: '2026-11-01', end: '2026-11-30', days: 30 });
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('escapes CSV cells and neutralises formula injection', () => {
    expect(toCsv([['a,b', 'say "hi"', '=SUM(A1)', -5]])).toBe('"a,b","say ""hi""",\'=SUM(A1),-5');
  });
});
