import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Calculator, Download, Printer, TrendingUp, Utensils, Wallet } from 'lucide-react';
import type { Settlement as SettlementData } from '../lib/mealMath';
import { money } from '../lib/format';
import { downloadCsv } from '../lib/csv';
import { periodLabel, todayISO } from '../lib/period';
import type { Transaction } from '../types';

type Props = { period: string; hostelName: string; data: SettlementData; transactions: Transaction[] };

export default function Settlement({ period, hostelName, data, transactions }: Props) {
  const { mealRate, rows } = data;
  const today = todayISO();
  const todayPoint = data.daily.find(d => d.date === today);
  // Fixed vs variable split (merged from BachelorCost): food is variable, shared living costs are fixed.
  const living = transactions.filter(t => t.type === 'Expense' && t.date.startsWith(period)).reduce((s, t) => s + t.amount, 0);
  const grand = living + data.totalBazar;
  const foodPct = grand ? Math.round((data.totalBazar / grand) * 100) : 0;
  const costPerMeal = mealRate === null ? '—' : money(mealRate, 2);

  const exportCsv = () => downloadCsv(`meal-settlement-${period}.csv`, [
    [`${hostelName} — meal settlement`, periodLabel(period)],
    ['Total bazar', data.totalBazar], ['Total meals', data.totalMeals], ['Meal rate', mealRate === null ? 'n/a' : mealRate.toFixed(4)], [],
    ['Resident', 'Room', 'Breakfast', 'Lunch', 'Dinner', 'Total meals', 'Meal charge', 'Advance paid', 'Balance (− owes / + credit)'],
    ...rows.map(r => [r.name, r.room, r.breakfast, r.lunch, r.dinner, r.meals, r.charge, r.advance, r.balance]),
    ['TOTAL', '', '', '', '', data.totalMeals, data.totalCharge, data.totalAdvance, round(data.totalCredit - data.totalDue)],
  ]);

  return (
    <div className="page-content settlement">
      <div className="page-title-row">
        <div><h2>Meal settlement</h2><p className="muted">Meal rate and resident statements for {periodLabel(period)}.</p></div>
        <div className="title-actions no-print">
          <button className="outline-button" onClick={exportCsv} disabled={!rows.length}><Download size={15} /> Export CSV</button>
          <button className="primary-button" onClick={() => window.print()}><Printer size={15} /> Print statement</button>
        </div>
      </div>

      {mealRate === null && (
        <div className="info-banner warn"><AlertTriangle size={17} /><span>{data.totalBazar > 0 ? 'Bazar costs exist but no meals were recorded, so a meal rate cannot be calculated yet. Record meals in the Meals page.' : 'No bazar or meals recorded for this month yet.'}</span></div>
      )}

      <div className="stat-row">
        <div className="panel mini-summary hero"><span><Calculator size={13} /> Meal rate</span><strong>{costPerMeal}</strong><small>{money(data.totalBazar)} ÷ {data.totalMeals} meals</small></div>
        <div className="panel mini-summary"><span><Wallet size={13} /> Total bazar</span><strong>{money(data.totalBazar)}</strong><small>Avg {money(data.avgDailyBazar)} / day</small></div>
        <div className="panel mini-summary"><span><Utensils size={13} /> Meals served</span><strong>{data.totalMeals}</strong><small>Avg {data.avgMealsPerDay} / day</small></div>
        <div className="panel mini-summary"><span><TrendingUp size={13} /> Projected month bazar</span><strong>{data.elapsedDays ? money(data.projectedBazar) : '—'}</strong><small>Spent ÷ {data.elapsedDays} days × {data.periodDays}</small></div>
      </div>

      <div className="settle-grid">
        <section className="panel">
          <div className="panel-heading"><div><h3>Daily food cost</h3><p>Bazar spend per day{todayPoint ? ` · today ${money(todayPoint.bazar)}` : ''}</p></div></div>
          <div className="chart-box">{data.daily.length === 0 ? <div className="chart-empty">Daily cost appears once bazar is recorded.</div> : (
            <ResponsiveContainer width="100%" height="100%"><BarChart data={data.daily} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#98a2b3" strokeOpacity={0.25} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#98a2b3', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#98a2b3', fontSize: 11 }} />
              <Tooltip formatter={(v: number) => money(v, 2)} labelFormatter={l => `Day ${l}`} />
              {data.avgDailyBazar > 0 && <ReferenceLine y={data.avgDailyBazar} stroke="#f2a91b" strokeDasharray="4 4" label={{ value: 'avg', fill: '#f2a91b', fontSize: 10, position: 'right' }} />}
              <Bar dataKey="bazar" fill="#0f7a5f" radius={[5, 5, 1, 1]} />
            </BarChart></ResponsiveContainer>)}</div>
        </section>
        <section className="panel">
          <div className="panel-heading"><div><h3>Food vs living costs</h3><p>Living costs are kept out of the meal rate</p></div></div>
          <div className="split-bar" aria-label={`Food ${foodPct}%`}><i style={{ width: `${foodPct}%` }} /></div>
          <ul className="split-list">
            <li><span className="legend-dot blue-dot" />Food / bazar (variable)<strong>{money(data.totalBazar)}</strong></li>
            <li><span className="legend-dot expense-dot" />Rent, utilities & other (fixed)<strong>{money(living)}</strong></li>
          </ul>
          <div className="cat-list">{data.byCategory.slice(0, 5).map(c => (
            <div key={c.category}><span>{c.category}</span><div className="progress-track"><i style={{ width: `${data.totalBazar ? (c.amount / data.totalBazar) * 100 : 0}%` }} /></div><strong>{money(c.amount)}</strong></div>))}</div>
        </section>
      </div>

      <div className="panel table-panel">
        <div className="table-toolbar"><div className="table-count"><strong>Resident statements</strong><span>{rows.length} residents</span></div><span className="muted">Balance: negative = owes · positive = credit</span></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>RESIDENT</th><th>ROOM</th><th>B</th><th>L</th><th>D</th><th>MEALS</th><th>CHARGE</th><th>ADVANCE</th><th>BALANCE</th></tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.residentId}>
                <td><strong>{r.name}</strong></td><td><span className="room-chip">{r.room}</span></td>
                <td>{r.breakfast}</td><td>{r.lunch}</td><td>{r.dinner}</td><td><strong>{r.meals}</strong></td>
                <td>{money(r.charge, 2)}</td><td>{money(r.advance, 2)}</td>
                <td className={r.balance < 0 ? 'balance-due' : 'balance-clear'}>{r.balance < 0 ? '−' : r.balance > 0 ? '+' : ''}{money(Math.abs(r.balance), 2)}</td>
              </tr>))}</tbody>
            {rows.length > 0 && <tfoot><tr><td colSpan={5}><strong>Totals</strong></td><td><strong>{data.totalMeals}</strong></td><td><strong>{money(data.totalCharge, 2)}</strong></td><td><strong>{money(data.totalAdvance, 2)}</strong></td><td><span className="balance-due">Due {money(data.totalDue, 2)}</span> · <span className="balance-clear">Credit {money(data.totalCredit, 2)}</span></td></tr></tfoot>}
          </table>
          {rows.length === 0 && <div className="empty-state">Add residents and record meals to generate statements.</div>}
        </div>
      </div>
      <p className="muted rule-note">Rule: meal rate = daily bazar cost ÷ total meals (breakfast + lunch + dinner). Charge = resident meals × rate; advances are credited against it. Rent, utilities and other living costs are excluded.</p>
    </div>
  );
}
const round = (n: number) => Math.round(n * 100) / 100;
