import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Sidebar, { type Page } from './components/Sidebar';
import Topbar from './components/Topbar';
import Overview from './pages/Overview';
import Residents from './pages/Residents';
import Rooms from './pages/Rooms';
import Meals, { type MealSave } from './pages/Meals';
import Bazar from './pages/Bazar';
import Advances from './pages/Advances';
import Settlement from './pages/Settlement';
import Finance from './pages/Finance';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import AuthScreen from './auth/AuthScreen';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { ThemeProvider } from './theme';
import { addDays, currentPeriod, monthBounds, todayISO } from './lib/period';
import { computeSettlement } from './lib/mealMath';
import type { Resident, Room, Transaction, MealEntry, InventoryItem, BazarEntry, MealAdvance } from './types';
import { Building2, LoaderCircle, Plus, RefreshCw } from 'lucide-react';

type Role = 'owner' | 'manager' | 'accountant' | 'resident';
type Hostel = { id: string; name: string; address: string | null; phone: string | null };
type DbResident = { id: string; full_name: string; email: string | null; phone: string | null; room_id: string | null; joined_on: string; status: 'active' | 'pending' | 'inactive' };
type DbRoom = { id: string; room_code: string; floor: string | null; bed_capacity: number };

const PERIOD_PAGES: Page[] = ['Overview', 'Meals', 'Bazar', 'Advances', 'Settlement'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Credit() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} HMS Pro. All rights reserved by Shahriar Zaman.</span>
      <a href="https://shahriarzaman.net" target="_blank" rel="noopener noreferrer">shahriarzaman.net</a>
    </footer>
  );
}

function Workspace() {
  const { user, loading, signOut, refreshUser } = useAuth();
  const [page, setPage] = useState<Page>('Overview');
  const [period, setPeriod] = useState(currentPeriod());
  const [mobileOpen, setMobileOpen] = useState(false);

  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [role, setRole] = useState<Role>('resident');
  const [hostelLoading, setHostelLoading] = useState(false);
  const [hostelName, setHostelName] = useState('');
  const [hostelAddress, setHostelAddress] = useState('');
  const [hostelPhone, setHostelPhone] = useState('');
  const [setupBusy, setSetupBusy] = useState(false);
  const [error, setError] = useState('');

  const [residents, setResidents] = useState<Resident[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [bazar, setBazar] = useState<BazarEntry[]>([]);
  const [advances, setAdvances] = useState<MealAdvance[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const canEdit = role !== 'resident';
  const displayName = String(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account');
  const initials = displayName.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();

  const loadWorkspace = useCallback(async () => {
    if (!user || !supabase) return;
    setHostelLoading(true); setError('');
    try {
      const q: any = supabase.from('hostel_members').select('hostel_id, role, hostels(id,name,address,phone)');
      const { data, error } = await q.eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle();
      if (error) throw error;
      setHostel(((data as any)?.hostels as Hostel | undefined) ?? null);
      setRole(((data as any)?.role as Role | undefined) ?? 'resident');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load your hostel.'); }
    finally { setHostelLoading(false); }
  }, [user]);
  useEffect(() => { void loadWorkspace(); }, [loadWorkspace, refreshKey]);

  const loadData = useCallback(async () => {
    if (!hostel || !supabase) return;
    setDataLoading(true); setError('');
    try {
      const { start, end } = monthBounds(period);
      const today = todayISO();
      const weekStart = addDays(today, -6);
      // Meals cover the selected month AND the last 7 days so the Overview chart always works.
      const mealFrom = weekStart < start ? weekStart : start;
      const mealTo = today > end ? today : end;
      const h = hostel.id;
      const [rr, ro, tr, mr, br, ar, ir] = await Promise.all([
        supabase.from('residents').select('id,full_name,email,phone,room_id,joined_on,status').eq('hostel_id', h).order('created_at', { ascending: false }),
        supabase.from('rooms').select('id,room_code,floor,bed_capacity').eq('hostel_id', h).order('room_code'),
        supabase.from('transactions').select('id,title,category,amount,type,transaction_date,status').eq('hostel_id', h).order('transaction_date', { ascending: false }),
        supabase.from('meal_entries').select('id,resident_id,meal_date,breakfast,lunch,dinner').eq('hostel_id', h).gte('meal_date', mealFrom).lte('meal_date', mealTo),
        supabase.from('daily_bazar').select('id,bazar_date,item_name,category,quantity,unit,amount,purchased_by,notes,created_at').eq('hostel_id', h).gte('bazar_date', start).lte('bazar_date', end).order('bazar_date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('meal_advances').select('id,resident_id,payment_date,amount,payment_method,reference,notes,created_at').eq('hostel_id', h).gte('payment_date', start).lte('payment_date', end).order('payment_date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('inventory_items').select('id,item_name,category,quantity,unit,reorder_level').eq('hostel_id', h).order('item_name'),
      ]);
      for (const r of [rr, ro, tr, mr, br, ar, ir]) if (r.error) throw r.error;

      const roomRows = (ro.data ?? []) as DbRoom[];
      const resRows = (rr.data ?? []) as DbResident[];
      const counts = new Map<string, number>();
      for (const r of resRows) if (r.room_id) counts.set(r.room_id, (counts.get(r.room_id) || 0) + 1);
      const nameOf = new Map(resRows.map(r => [r.id, r.full_name]));

      setRooms(roomRows.map(r => ({ id: r.id, name: r.room_code, beds: r.bed_capacity, occupied: counts.get(r.id) || 0, floor: r.floor || 'Unspecified' })));
      setResidents(resRows.map(r => ({ id: r.id, name: r.full_name, email: r.email || '', phone: r.phone || '', room: roomRows.find(x => x.id === r.room_id)?.room_code || 'Unassigned', joined: r.joined_on, status: cap(r.status) as Resident['status'], balance: 0 })));
      setTransactions((tr.data ?? []).map((t: any) => ({ id: t.id, title: t.title, category: t.category, amount: Number(t.amount), type: t.type === 'income' ? 'Income' : 'Expense', date: t.transaction_date, status: t.status === 'pending' ? 'Pending' : 'Paid' })));
      setMeals((mr.data ?? []).map((m: any) => ({ id: m.id, resident: nameOf.get(m.resident_id) || 'Unknown resident', residentId: m.resident_id, date: m.meal_date, breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner })));
      setBazar((br.data ?? []).map((b: any) => ({ id: b.id, date: b.bazar_date, item: b.item_name, category: b.category, quantity: Number(b.quantity), unit: b.unit, amount: Number(b.amount), purchasedBy: b.purchased_by || '', notes: b.notes || '', recordedAt: b.created_at })));
      setAdvances((ar.data ?? []).map((a: any) => ({ id: a.id, residentId: a.resident_id, resident: nameOf.get(a.resident_id) || 'Removed resident', date: a.payment_date, amount: Number(a.amount), method: a.payment_method, reference: a.reference || '', notes: a.notes || '', recordedAt: a.created_at })));
      setInventory((ir.data ?? []).map((i: any) => ({ id: i.id, name: i.item_name, category: i.category, quantity: Number(i.quantity), unit: i.unit, reorderLevel: Number(i.reorder_level) })));
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load hostel records.'); }
    finally { setDataLoading(false); }
  }, [hostel, period]);
  useEffect(() => { void loadData(); }, [loadData, refreshKey]);

  const settlement = useMemo(() => {
    const { start, end } = monthBounds(period);
    return computeSettlement({
      residents: residents.map(r => ({ id: r.id, name: r.name, room: r.room, status: r.status })),
      meals, bazar, advances, start, end, today: todayISO(),
    });
  }, [residents, meals, bazar, advances, period]);

  const need = () => { if (!supabase || !hostel) throw new Error('No active hostel.'); return { db: supabase, hostelId: hostel.id }; };
  const done = async <T,>(p: PromiseLike<{ error: { message: string } | null } & T>) => { const r = await p; if (r.error) throw new Error(r.error.message); await loadData(); };

  const createHostel = async (e: FormEvent) => {
    e.preventDefault(); if (!supabase) return;
    setSetupBusy(true); setError('');
    try {
      const { data, error } = await supabase.rpc('create_hostel', { hostel_name: hostelName.trim(), hostel_address: hostelAddress.trim() || undefined, hostel_phone: hostelPhone.trim() || undefined });
      if (error) throw error;
      setHostel({ id: data, name: hostelName.trim(), address: hostelAddress || null, phone: hostelPhone || null });
      setRole('owner'); setHostelName(''); setHostelAddress(''); setHostelPhone(''); setRefreshKey(v => v + 1);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not create hostel.'); }
    finally { setSetupBusy(false); }
  };

  const addResident = async (r: Omit<Resident, 'id' | 'joined' | 'status' | 'balance'>) => {
    const { db, hostelId } = need();
    const room = rooms.find(x => x.name === r.room);
    if (room && room.occupied >= room.beds) throw new Error('This room is full. Choose another room or increase its capacity.');
    await done(db.from('residents').insert({ hostel_id: hostelId, full_name: r.name, email: r.email || null, phone: r.phone || null, room_id: room?.id ?? null }));
  };
  const updateResident = async (id: string, patch: Partial<Resident>) => {
    const { db, hostelId } = need();
    const room = patch.room ? rooms.find(x => x.name === patch.room) : undefined;
    const current = residents.find(r => r.id === id);
    if (room && room.occupied >= room.beds && current?.room !== room.name) throw new Error('This room is full. Choose another room or increase its capacity.');
    const payload: any = {};
    if (patch.name !== undefined) payload.full_name = patch.name;
    if (patch.email !== undefined) payload.email = patch.email || null;
    if (patch.phone !== undefined) payload.phone = patch.phone || null;
    if (patch.status !== undefined) payload.status = patch.status.toLowerCase();
    if (patch.room !== undefined) payload.room_id = room?.id ?? null;
    await done(db.from('residents').update(payload).eq('id', id).eq('hostel_id', hostelId));
  };
  const deleteResident = async (id: string) => { const { db, hostelId } = need(); await done(db.from('residents').delete().eq('id', id).eq('hostel_id', hostelId)); };

  const addRoom = async (r: { code: string; floor: string; capacity: number }) => { const { db, hostelId } = need(); await done(db.from('rooms').insert({ hostel_id: hostelId, room_code: r.code, floor: r.floor || null, bed_capacity: r.capacity })); };
  const updateRoom = async (id: string, r: { code: string; floor: string; capacity: number }) => { const { db, hostelId } = need(); await done(db.from('rooms').update({ room_code: r.code, floor: r.floor || null, bed_capacity: r.capacity }).eq('id', id).eq('hostel_id', hostelId)); };
  const deleteRoom = async (id: string) => { const { db, hostelId } = need(); await done(db.from('rooms').delete().eq('id', id).eq('hostel_id', hostelId)); };

  const saveMeals = async (rows: MealSave[]) => {
    const { db, hostelId } = need();
    if (!user || !rows.length) return;
    await done(db.from('meal_entries').upsert(rows.map(m => ({ hostel_id: hostelId, resident_id: m.residentId, meal_date: m.date, breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner, created_by: user.id })), { onConflict: 'hostel_id,resident_id,meal_date' }));
  };

  const saveBazar = async (p: Omit<BazarEntry, 'id' | 'recordedAt'>, id?: string) => {
    const { db, hostelId } = need();
    const row = { hostel_id: hostelId, bazar_date: p.date, item_name: p.item, category: p.category, quantity: p.quantity, unit: p.unit, amount: p.amount, purchased_by: p.purchasedBy.trim() || null, notes: p.notes.trim() || null };
    await done(id ? db.from('daily_bazar').update(row).eq('id', id).eq('hostel_id', hostelId) : db.from('daily_bazar').insert({ ...row, created_by: user?.id ?? null }));
  };
  const deleteBazar = async (id: string) => { const { db, hostelId } = need(); await done(db.from('daily_bazar').delete().eq('id', id).eq('hostel_id', hostelId)); };

  const saveAdvance = async (p: { residentId: string; date: string; amount: number; method: string; reference: string; notes: string }, id?: string) => {
    const { db, hostelId } = need();
    const row = { hostel_id: hostelId, resident_id: p.residentId, payment_date: p.date, amount: p.amount, payment_method: p.method, reference: p.reference.trim() || null, notes: p.notes.trim() || null };
    await done(id ? db.from('meal_advances').update(row).eq('id', id).eq('hostel_id', hostelId) : db.from('meal_advances').insert({ ...row, received_by: user?.id ?? null }));
  };
  const deleteAdvance = async (id: string) => { const { db, hostelId } = need(); await done(db.from('meal_advances').delete().eq('id', id).eq('hostel_id', hostelId)); };

  const saveTransaction = async (t: { title: string; category: string; amount: number; type: 'income' | 'expense'; date: string; status: 'paid' | 'pending' }, id?: string) => {
    const { db, hostelId } = need();
    const payload = { hostel_id: hostelId, title: t.title, category: t.category, amount: t.amount, type: t.type, transaction_date: t.date, status: t.status, created_by: user?.id ?? null };
    await done(id ? db.from('transactions').update(payload).eq('id', id).eq('hostel_id', hostelId) : db.from('transactions').insert(payload));
  };
  const deleteTransaction = async (id: string) => { const { db, hostelId } = need(); await done(db.from('transactions').delete().eq('id', id).eq('hostel_id', hostelId)); };

  const saveInventory = async (i: { name: string; category: string; quantity: number; unit: string; reorderLevel: number }, id?: string) => {
    const { db, hostelId } = need();
    const payload = { hostel_id: hostelId, item_name: i.name, category: i.category, quantity: i.quantity, unit: i.unit, reorder_level: i.reorderLevel };
    await done(id ? db.from('inventory_items').update(payload).eq('id', id).eq('hostel_id', hostelId) : db.from('inventory_items').insert(payload));
  };
  const deleteInventory = async (id: string) => { const { db, hostelId } = need(); await done(db.from('inventory_items').delete().eq('id', id).eq('hostel_id', hostelId)); };

  const updateHostel = async (patch: { name: string; address: string; phone: string }) => {
    const { db } = need();
    const { error } = await db.from('hostels').update({ name: patch.name, address: patch.address || null, phone: patch.phone || null, updated_at: new Date().toISOString() }).eq('id', hostel!.id);
    if (error) throw error;
    setHostel({ ...hostel!, name: patch.name, address: patch.address || null, phone: patch.phone || null });
  };
  const updateProfile = async (name: string) => {
    if (!supabase) throw new Error('Supabase unavailable.');
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (error) throw error;
    await refreshUser();
  };

  if (loading || hostelLoading) return <div className="auth-loading"><LoaderCircle className="spin" size={28} /><span>Preparing your secure workspace…</span></div>;
  if (!isSupabaseConfigured || !supabase) return <div className="auth-loading">Supabase configuration is missing. Check your environment file.</div>;
  if (!user) return <AuthScreen />;
  if (!hostel) return (
    <main className="onboarding-screen">
      <form className="onboarding-card" onSubmit={createHostel}>
        <div className="brand-mark"><Building2 size={23} /></div>
        <span className="auth-eyebrow">WELCOME TO HMS PRO</span>
        <h1>Create your hostel workspace</h1>
        <p>Set up your hostel once. Your account will automatically become its Owner.</p>
        {error && <div className="auth-message error">{error}</div>}
        <label>Hostel name<input value={hostelName} onChange={e => setHostelName(e.target.value)} placeholder="e.g. Bachelor Gang Hostel" minLength={2} required /></label>
        <label>Address <span className="optional">Optional</span><input value={hostelAddress} onChange={e => setHostelAddress(e.target.value)} placeholder="Hostel address" /></label>
        <label>Contact number <span className="optional">Optional</span><input value={hostelPhone} onChange={e => setHostelPhone(e.target.value)} placeholder="+880…" /></label>
        <button className="auth-submit" disabled={setupBusy}>{setupBusy ? 'Creating workspace…' : 'Create my hostel'}<Plus size={17} /></button>
        <button type="button" className="text-action onboarding-signout" onClick={() => void signOut()}>Sign out</button>
      </form>
    </main>
  );

  return (
    <div className="app-shell">
      <Sidebar active={page} onChange={setPage} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} userName={displayName} userEmail={user.email ?? ''} initials={initials} onSignOut={signOut} hostelName={hostel.name} />
      <main className="main-area">
        <Topbar title={page === 'Profile' ? 'My profile' : page} onMenu={() => setMobileOpen(true)} initials={initials} onProfile={() => setPage('Profile')} period={period} onPeriod={setPeriod} showPeriod={PERIOD_PAGES.includes(page)} />
        <div className="environment-banner">
          <span className="connection-dot connected" />Connected · {hostel.name} · Signed in as {cap(role)}
          <button onClick={() => setRefreshKey(v => v + 1)}><RefreshCw size={13} /> Refresh</button>
        </div>
        {error && <div className="global-error" role="alert">{error}</div>}
        {dataLoading && <div className="loading-strip"><LoaderCircle size={15} className="spin" /> Syncing your hostel records…</div>}
        {page === 'Overview' && <Overview residents={residents} transactions={transactions} rooms={rooms} meals={meals} mealRate={settlement.mealRate} hostelName={hostel.name} onNavigate={setPage} />}
        {page === 'Residents' && <Residents residents={residents} rooms={rooms} onAdd={addResident} onUpdate={updateResident} onDelete={deleteResident} />}
        {page === 'Rooms' && <Rooms rooms={rooms} onAdd={addRoom} onUpdate={updateRoom} onDelete={deleteRoom} />}
        {page === 'Meals' && <Meals period={period} meals={meals} residents={residents} canEdit={canEdit} onSave={saveMeals} />}
        {page === 'Bazar' && <Bazar period={period} entries={bazar} canEdit={canEdit} onSave={saveBazar} onDelete={deleteBazar} />}
        {page === 'Advances' && <Advances period={period} advances={advances} residents={residents.filter(r => r.status !== 'Inactive')} canEdit={canEdit} onSave={saveAdvance} onDelete={deleteAdvance} />}
        {page === 'Settlement' && <Settlement period={period} hostelName={hostel.name} data={settlement} transactions={transactions} />}
        {page === 'Finance' && <Finance transactions={transactions} onSave={saveTransaction} onDelete={deleteTransaction} />}
        {page === 'Inventory' && <Inventory items={inventory} onSave={saveInventory} onDelete={deleteInventory} />}
        {page === 'Settings' && <Settings userEmail={user.email ?? ''} userName={displayName} hostel={hostel} onHostelUpdated={loadWorkspace} onUpdateHostel={updateHostel} />}
        {page === 'Profile' && <Settings userEmail={user.email ?? ''} userName={displayName} hostel={hostel} onHostelUpdated={loadWorkspace} onUpdateHostel={updateHostel} profileOnly onSaveProfile={updateProfile} />}
        <Credit />
      </main>
    </div>
  );
}
export default function App() { return <ThemeProvider><AuthProvider><Workspace /></AuthProvider></ThemeProvider>; }
