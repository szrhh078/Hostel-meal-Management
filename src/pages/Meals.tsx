import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Circle, ChevronLeft, ChevronRight, Info, LoaderCircle } from 'lucide-react';
import type { MealEntry, Resident } from '../types';
import { addDays, monthBounds, todayISO } from '../lib/period';
import { mealCount } from '../lib/mealMath';

type Slot = 'breakfast' | 'lunch' | 'dinner';
export type MealSave = { residentId: string; date: string; breakfast: boolean; lunch: boolean; dinner: boolean };
type Props = { period: string; meals: MealEntry[]; residents: Resident[]; canEdit: boolean; onSave: (rows: MealSave[]) => Promise<void> };
const SLOTS: Slot[] = ['breakfast', 'lunch', 'dinner'];

export default function Meals({ period, meals, residents, canEdit, onSave }: Props) {
  const { start, end } = monthBounds(period);
  const today = todayISO();
  const maxDate = end < today ? end : today;           // no future entries
  const initial = today >= start && today <= end ? today : maxDate;
  const [picked, setPicked] = useState(initial);
  const date = picked >= start && picked <= maxDate ? picked : initial; // stay inside the loaded month
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const active = useMemo(() => residents.filter(r => r.status !== 'Inactive'), [residents]);
  const dayMeals = meals.filter(m => m.date === date);
  const rows = active.map(r => dayMeals.find(m => m.residentId === r.id) ?? { id: `new-${r.id}`, resident: r.name, residentId: r.id, date, breakfast: false, lunch: false, dinner: false });
  const total = dayMeals.reduce((s, m) => s + mealCount(m), 0);

  const run = async (key: string, payload: MealSave[]) => {
    setBusy(key); setError('');
    try { await onSave(payload); } catch (e) { setError(e instanceof Error ? e.message : 'Could not save meal entry.'); } finally { setBusy(null); }
  };
  const toggle = (m: MealEntry, slot: Slot) => run(`${m.residentId}-${slot}`, [{ residentId: m.residentId!, date, breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner, [slot]: !m[slot] }]);
  const markAll = (slot: Slot | 'all', value: boolean) => run(`bulk-${slot}`, rows.map(m => ({
    residentId: m.residentId!, date,
    breakfast: slot === 'breakfast' || slot === 'all' ? value : m.breakfast,
    lunch: slot === 'lunch' || slot === 'all' ? value : m.lunch,
    dinner: slot === 'dinner' || slot === 'all' ? value : m.dinner,
  })));

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div><h2>Meal management</h2><p className="muted">Record who ate which meal. Entries feed the monthly meal rate.</p></div>
        <div className="date-stepper">
          <button className="outline-button" aria-label="Previous day" disabled={date <= start} onClick={() => setPicked(addDays(date, -1))}><ChevronLeft size={15} /></button>
          <label className="outline-button"><CalendarDays size={15} /><input type="date" min={start} max={maxDate} value={date} onChange={e => e.target.value && setPicked(e.target.value)} aria-label="Meal date" /></label>
          <button className="outline-button" aria-label="Next day" disabled={date >= maxDate} onClick={() => setPicked(addDays(date, 1))}><ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="meal-stats">
        <div className="panel mini-summary"><span>Residents</span><strong>{active.length}</strong></div>
        <div className="panel mini-summary"><span>Meals on this day</span><strong>{total}</strong></div>
        <div className="panel mini-summary"><span>Average per resident</span><strong>{(total / (active.length || 1)).toFixed(1)}</strong></div>
      </div>
      {error && <div className="auth-message error" role="alert">{error}</div>}
      <div className="panel table-panel">
        <div className="table-toolbar">
          <div className="table-count"><strong>{date === today ? "Today's" : 'Daily'} meal register</strong><span>{dayMeals.length} saved records</span></div>
          {canEdit && <div className="table-tools">
            {SLOTS.map(s => <button key={s} className="outline-button" disabled={busy !== null || !rows.length} onClick={() => void markAll(s, true)}>All {s}</button>)}
            <button className="outline-button" disabled={busy !== null || !rows.length} onClick={() => void markAll('all', false)}>Clear day</button>
          </div>}
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>RESIDENT</th><th>BREAKFAST</th><th>LUNCH</th><th>DINNER</th><th>TOTAL</th></tr></thead>
            <tbody>{rows.map(m => (
              <tr key={m.residentId}>
                <td><strong>{m.resident}</strong></td>
                {SLOTS.map(slot => (
                  <td key={slot}><button className={m[slot] ? 'meal-yes meal-toggle' : 'meal-no meal-toggle'} aria-pressed={m[slot]} disabled={busy !== null || !canEdit} onClick={() => void toggle(m, slot)}>
                    {busy === `${m.residentId}-${slot}` || busy === `bulk-${slot}` || busy === 'bulk-all' ? <LoaderCircle size={15} className="spin" /> : m[slot] ? <><CheckCircle2 size={15} /> Served</> : <><Circle size={15} /> Not served</>}
                  </button></td>))}
                <td><strong>{mealCount(m)} / 3</strong></td>
              </tr>))}</tbody>
          </table>
          {rows.length === 0 && <div className="empty-state">Add residents before recording meals.</div>}
        </div>
      </div>
      <div className="info-banner"><Info size={17} /><span>One record per resident per day. Past days in the selected month can be corrected; the meal rate in Settlement updates instantly.</span></div>
    </div>
  );
}
