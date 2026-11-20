import { useMemo, useState, type FormEvent } from 'react';
import { Download, LoaderCircle, Pencil, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import type { BazarEntry } from '../types';
import { money, shortDate, timeLabel } from '../lib/format';
import { downloadCsv } from '../lib/csv';
import { monthBounds, periodLabel, todayISO } from '../lib/period';

export const BAZAR_CATEGORIES = ['Rice & grains', 'Vegetables', 'Fish & meat', 'Eggs & dairy', 'Spices & oil', 'Fruits', 'Gas & fuel', 'Other'];
type Payload = { date: string; item: string; category: string; quantity: number; unit: string; amount: number; purchasedBy: string; notes: string };
type Props = { period: string; entries: BazarEntry[]; canEdit: boolean; onSave: (p: Payload, id?: string) => Promise<void>; onDelete: (id: string) => Promise<void> };
type Form = Omit<Payload, 'quantity' | 'amount'> & { quantity: string; amount: string };

const blank = (period: string): Form => {
  const { start, end } = monthBounds(period);
  const today = todayISO();
  return { date: today >= start && today <= end ? today : end, item: '', category: BAZAR_CATEGORIES[0], quantity: '1', unit: 'kg', amount: '', purchasedBy: '', notes: '' };
};

export default function Bazar({ period, entries, canEdit, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Form | null>(null);
  const [editing, setEditing] = useState<BazarEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const bounds = monthBounds(period);
  const total = entries.reduce((s, e) => s + e.amount, 0);
  const today = todayISO();
  const todayTotal = entries.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
  const shown = useMemo(() => entries.filter(e => filter === 'All' || e.category === filter), [entries, filter]);

  const open = (e?: BazarEntry) => {
    setEditing(e ?? null); setError('');
    setForm(e ? { date: e.date, item: e.item, category: e.category, quantity: String(e.quantity), unit: e.unit, amount: String(e.amount), purchasedBy: e.purchasedBy, notes: e.notes } : blank(period));
  };
  const submit = async (ev: FormEvent) => {
    ev.preventDefault(); if (!form) return;
    const quantity = Number(form.quantity), amount = Number(form.amount);
    if (!(quantity > 0) || !(amount > 0)) { setError('Quantity and amount must be greater than zero.'); return; }
    setBusy(true); setError('');
    try { await onSave({ ...form, item: form.item.trim(), quantity, amount }, editing?.id); setForm(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save purchase.'); }
    finally { setBusy(false); }
  };
  const remove = async (e: BazarEntry) => {
    if (!confirm(`Delete “${e.item}” (${money(e.amount)}) from the bazar ledger? This changes the meal rate.`)) return;
    try { await onDelete(e.id); } catch (err) { alert(err instanceof Error ? err.message : 'Could not delete purchase.'); }
  };
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm(f => f && { ...f, [k]: e.target.value });

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div><h2>Daily bazar</h2><p className="muted">Food purchases for {periodLabel(period)}. These costs drive the meal rate.</p></div>
        <div className="title-actions">
          <button className="outline-button" disabled={!entries.length} onClick={() => downloadCsv(`bazar-${period}.csv`, [['Date', 'Time recorded', 'Item', 'Category', 'Quantity', 'Unit', 'Amount', 'Purchased by', 'Notes'], ...entries.map(e => [e.date, timeLabel(e.recordedAt), e.item, e.category, e.quantity, e.unit, e.amount, e.purchasedBy, e.notes])])}><Download size={15} /> Export CSV</button>
          {canEdit && <button className="primary-button" onClick={() => open()}><Plus size={17} /> Add purchase</button>}
        </div>
      </div>
      <div className="meal-stats">
        <div className="panel mini-summary"><span>Total bazar this month</span><strong>{money(total)}</strong></div>
        <div className="panel mini-summary"><span>Spent today</span><strong>{money(todayTotal)}</strong></div>
        <div className="panel mini-summary"><span>Purchases</span><strong>{entries.length}</strong></div>
      </div>
      <div className="panel table-panel">
        <div className="table-toolbar">
          <div className="table-count"><strong>Purchase ledger</strong><span>{shown.length} records</span></div>
          <select className="toolbar-select" aria-label="Filter by category" value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All</option>{BAZAR_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>DATE &amp; TIME</th><th>ITEM</th><th>CATEGORY</th><th>QTY</th><th>BOUGHT BY</th><th>AMOUNT</th>{canEdit && <th>ACTIONS</th>}</tr></thead>
            <tbody>{shown.map(e => (
              <tr key={e.id}>
                <td><strong>{shortDate(e.date)}</strong><small className="cell-sub">{timeLabel(e.recordedAt) || '—'}</small></td>
                <td><div className="transaction-name"><div className="activity-icon activity-expense"><ShoppingBasket size={15} /></div><strong>{e.item}</strong></div></td>
                <td>{e.category}</td><td>{e.quantity} {e.unit}</td><td>{e.purchasedBy || '—'}</td>
                <td className="amount-expense">{money(e.amount, 2)}</td>
                {canEdit && <td><div className="row-actions"><button className="dots-button" title="Edit" aria-label={`Edit ${e.item}`} onClick={() => open(e)}><Pencil size={15} /></button><button className="dots-button danger-action" title="Delete" aria-label={`Delete ${e.item}`} onClick={() => void remove(e)}><Trash2 size={15} /></button></div></td>}
              </tr>))}</tbody>
          </table>
          {shown.length === 0 && <div className="empty-state">No purchases recorded for this month yet.</div>}
        </div>
      </div>
      {form && (
        <Modal title={editing ? 'Edit purchase' : 'Add bazar purchase'} subtitle="Only food & kitchen purchases belong here — rent and utilities go in Finance." error={error} onClose={() => setForm(null)} onSubmit={submit} busy={busy} submitLabel={busy ? <LoaderCircle size={15} className="spin" /> : 'Save purchase'}>
          <label>Date<input type="date" min={bounds.start} max={bounds.end} value={form.date} onChange={set('date')} required /></label>
          <label>Item<input value={form.item} onChange={set('item')} minLength={2} maxLength={160} placeholder="e.g. Miniket rice" required /></label>
          <label>Category<select value={form.category} onChange={set('category')}>{BAZAR_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label>
          <div className="form-row"><label>Quantity<input type="number" min="0.01" step="0.01" value={form.quantity} onChange={set('quantity')} required /></label><label>Unit<input value={form.unit} onChange={set('unit')} required /></label></div>
          <label>Total amount<input type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} required /></label>
          <label>Purchased by <span className="optional">Optional</span><input value={form.purchasedBy} onChange={set('purchasedBy')} /></label>
          <label>Notes <span className="optional">Optional</span><input value={form.notes} onChange={set('notes')} /></label>
        </Modal>
      )}
    </div>
  );
}
