import { useState, type FormEvent } from 'react';
import { HandCoins, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import type { MealAdvance, Resident } from '../types';
import { money, shortDate, timeLabel } from '../lib/format';
import { monthBounds, periodLabel, todayISO } from '../lib/period';

const METHODS = ['Cash', 'bKash', 'Nagad', 'Bank transfer', 'Other'];
type Payload = { residentId: string; date: string; amount: number; method: string; reference: string; notes: string };
type Props = { period: string; advances: MealAdvance[]; residents: Resident[]; canEdit: boolean; onSave: (p: Payload, id?: string) => Promise<void>; onDelete: (id: string) => Promise<void> };
type Form = Omit<Payload, 'amount'> & { amount: string };

export default function Advances({ period, advances, residents, canEdit, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Form | null>(null);
  const [editing, setEditing] = useState<MealAdvance | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bounds = monthBounds(period);
  const total = advances.reduce((s, a) => s + a.amount, 0);
  const payers = new Set(advances.map(a => a.residentId)).size;

  const open = (a?: MealAdvance) => {
    setEditing(a ?? null); setError('');
    const t = todayISO();
    setForm(a ? { residentId: a.residentId, date: a.date, amount: String(a.amount), method: a.method, reference: a.reference, notes: a.notes }
      : { residentId: residents[0]?.id ?? '', date: t >= bounds.start && t <= bounds.end ? t : bounds.end, amount: '', method: 'Cash', reference: '', notes: '' });
  };
  const submit = async (ev: FormEvent) => {
    ev.preventDefault(); if (!form) return;
    const amount = Number(form.amount);
    if (!form.residentId) { setError('Choose a resident.'); return; }
    if (!(amount > 0)) { setError('Amount must be greater than zero.'); return; }
    setBusy(true); setError('');
    try { await onSave({ ...form, amount }, editing?.id); setForm(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save payment.'); }
    finally { setBusy(false); }
  };
  const remove = async (a: MealAdvance) => {
    if (!confirm(`Delete the ${money(a.amount)} payment from ${a.resident}?`)) return;
    try { await onDelete(a.id); } catch (err) { alert(err instanceof Error ? err.message : 'Could not delete payment.'); }
  };
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm(f => f && { ...f, [k]: e.target.value });

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div><h2>Meal advances</h2><p className="muted">Money residents paid in advance for meals in {periodLabel(period)}.</p></div>
        {canEdit && <button className="primary-button" onClick={() => open()} disabled={!residents.length}><Plus size={17} /> Record payment</button>}
      </div>
      <div className="meal-stats">
        <div className="panel mini-summary"><span>Collected this month</span><strong>{money(total)}</strong></div>
        <div className="panel mini-summary"><span>Residents who paid</span><strong>{payers}</strong></div>
        <div className="panel mini-summary"><span>Payments</span><strong>{advances.length}</strong></div>
      </div>
      <div className="panel table-panel">
        <div className="table-toolbar"><div className="table-count"><strong>Payment ledger</strong><span>{advances.length} records</span></div></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>DATE &amp; TIME</th><th>RESIDENT</th><th>METHOD</th><th>REFERENCE</th><th>AMOUNT</th>{canEdit && <th>ACTIONS</th>}</tr></thead>
            <tbody>{advances.map(a => (
              <tr key={a.id}>
                <td><strong>{shortDate(a.date)}</strong><small className="cell-sub">{timeLabel(a.recordedAt) || '—'}</small></td>
                <td><div className="transaction-name"><div className="activity-icon activity-income"><HandCoins size={15} /></div><strong>{a.resident}</strong></div></td>
                <td>{a.method}</td><td>{a.reference || '—'}</td><td className="amount-income">{money(a.amount, 2)}</td>
                {canEdit && <td><div className="row-actions"><button className="dots-button" aria-label={`Edit payment from ${a.resident}`} onClick={() => open(a)}><Pencil size={15} /></button><button className="dots-button danger-action" aria-label={`Delete payment from ${a.resident}`} onClick={() => void remove(a)}><Trash2 size={15} /></button></div></td>}
              </tr>))}</tbody>
          </table>
          {advances.length === 0 && <div className="empty-state">No advance payments recorded for this month.</div>}
        </div>
      </div>
      {form && (
        <Modal title={editing ? 'Edit payment' : 'Record advance payment'} subtitle="Credited against the resident's meal charge in the settlement." error={error} onClose={() => setForm(null)} onSubmit={submit} busy={busy} submitLabel={busy ? <LoaderCircle size={15} className="spin" /> : 'Save payment'}>
          <label>Resident<select value={form.residentId} onChange={set('residentId')} required>{residents.map(r => <option key={r.id} value={r.id}>{r.name}{r.room !== 'Unassigned' ? ` · ${r.room}` : ''}</option>)}</select></label>
          <label>Date<input type="date" min={bounds.start} max={bounds.end} value={form.date} onChange={set('date')} required /></label>
          <label>Amount<input type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} required /></label>
          <label>Method<select value={form.method} onChange={set('method')}>{METHODS.map(m => <option key={m}>{m}</option>)}</select></label>
          <label>Reference <span className="optional">Optional</span><input value={form.reference} onChange={set('reference')} placeholder="Transaction ID / receipt no." /></label>
          <label>Notes <span className="optional">Optional</span><input value={form.notes} onChange={set('notes')} /></label>
        </Modal>
      )}
    </div>
  );
}
