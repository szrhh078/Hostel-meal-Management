import { ArrowUpRight, ArrowDownRight, Users, Wallet, Utensils, BedDouble, Plus } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import StatCard from "../components/StatCard";
import { money } from "../lib/format";
import type { CSSProperties } from "react";
import { addDays, todayISO } from "../lib/period";
import type { Resident, Transaction, Room, MealEntry } from "../types";

type Props = { residents: Resident[]; transactions: Transaction[]; rooms: Room[]; meals: MealEntry[]; mealRate: number | null; hostelName: string; onNavigate: (page: "Residents" | "Finance" | "Meals" | "Rooms" | "Settlement" | "Bazar") => void };
export default function Overview({ residents, transactions, rooms, meals: allMeals, mealRate, hostelName, onNavigate }: Props) {
  const monthKey=todayISO().slice(0,7);
  const monthTransactions=transactions.filter(t=>t.date.startsWith(monthKey));
  const byDate=new Map<string,{day:string;income:number;expense:number}>();
  for(const t of monthTransactions){const day=t.date.slice(8,10);const row=byDate.get(t.date)||{day,income:0,expense:0};if(t.type==='Income')row.income+=t.amount;else row.expense+=t.amount;byDate.set(t.date,row)}
  const trend=[...byDate.values()].sort((a,b)=>Number(a.day)-Number(b.day));
  const weekStart=addDays(todayISO(),-6);const mealEntries=allMeals.filter(m=>m.date>=weekStart&&m.date<=todayISO());
  const weekMap=new Map<string,number>();for(const m of mealEntries){const day=new Date(`${m.date}T00:00:00`).toLocaleDateString('en-US',{weekday:'short'});weekMap.set(day,(weekMap.get(day)||0)+Number(m.breakfast)+Number(m.lunch)+Number(m.dinner));}
  const meals=[...weekMap.entries()].map(([name,count])=>({name,meals:count}));
  const income = monthTransactions.filter(t=>t.type==="Income").reduce((s,t)=>s+t.amount,0);
  const expense = monthTransactions.filter(t=>t.type==="Expense").reduce((s,t)=>s+t.amount,0);
  const todayKey=todayISO();const mealsToday=mealEntries.filter(m=>m.date===todayKey).reduce((s,m)=>s+Number(m.breakfast)+Number(m.lunch)+Number(m.dinner),0);
  const occupied = rooms.reduce((s,r)=>s+r.occupied,0), capacity=rooms.reduce((s,r)=>s+r.beds,0);
  return <div className="page-content">
    <div className="welcome-row"><div><p className="eyebrow">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</p><h2>{greeting()}, {hostelName}</h2><p className="muted">Here's what's happening at your hostel today.</p></div><button className="primary-button" onClick={()=>onNavigate("Residents")}><Plus size={17}/> Add resident</button></div>
    <section className="stats-grid">
      <StatCard label="Total residents" value={String(residents.length).padStart(2,"0")} change="Current count" icon={<Users size={19}/>} tone="blue"/>
      <StatCard label="Monthly income" value={money(income)} change="Recorded this month" icon={<Wallet size={19}/>} tone="green"/>
      <div className="clickable-card" onClick={()=>onNavigate("Settlement")} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==="Enter")onNavigate("Settlement")}}><StatCard label="Meal rate" value={mealRate===null?"—":money(mealRate,2)} change={mealRate===null?"No meals yet":"This month · see Settlement"} positive={mealRate!==null} icon={<Utensils size={19}/>} tone="orange"/></div>
      <StatCard label="Room occupancy" value={`${capacity ? Math.round(occupied/capacity*100) : 0}%`} change="Live allocation" icon={<BedDouble size={19}/>} tone="purple"/>
    </section>
    <section className="dashboard-grid">
      <article className="panel revenue-panel"><div className="panel-heading"><div><h3>Financial overview</h3><p>Income and expenses over the month</p></div></div><div className="revenue-summary"><div><span className="legend-dot income-dot"/>Income <strong>{money(income)}</strong></div><div><span className="legend-dot expense-dot"/>Expenses <strong>{money(expense)}</strong></div><div className="net-balance">Net balance <strong>{money(income-expense)}</strong></div></div><div className="chart-wrap">{trend.length===0?<div className="chart-empty">Add finance transactions to see your income and expenses here.</div>:<ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top:10,right:8,left:-18,bottom:0}}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0f7a5f" stopOpacity={0.18}/><stop offset="100%" stopColor="#0f7a5f" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#98a2b3" strokeOpacity={0.25}/><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{fill:"#98a2b3",fontSize:11}}/><YAxis tickLine={false} axisLine={false} tick={{fill:"#98a2b3",fontSize:11}}/><Tooltip/><Area type="monotone" dataKey="income" stroke="#0f7a5f" strokeWidth={2.5} fill="url(#incomeFill)"/><Area type="monotone" dataKey="expense" stroke="#f2a91b" strokeWidth={2.5} fill="none"/></AreaChart></ResponsiveContainer>}</div></article>
      <article className="panel occupancy-panel"><div className="panel-heading"><div><h3>Room occupancy</h3><p>Current bed availability</p></div></div><div className="occupancy-visual"><div className="donut" style={{"--progress":`${capacity ? occupied/capacity*100 : 0}%`} as CSSProperties}><div><strong>{capacity ? Math.round(occupied/capacity*100) : 0}%</strong><span>Occupied</span></div></div></div><div className="occupancy-legend"><div><span className="legend-dot blue-dot"/>Occupied <strong>{occupied} beds</strong></div><div><span className="legend-dot pale-dot"/>Available <strong>{capacity-occupied} beds</strong></div></div><button className="text-action" onClick={()=>onNavigate("Rooms")}>View room details <ArrowUpRight size={15}/></button></article>
    </section>
    <section className="dashboard-grid lower-grid">
      <article className="panel meal-panel"><div className="panel-heading"><div><h3>Daily meal activity</h3><p>Last 7 days</p></div></div><div className="meal-chart">{meals.length===0?<div className="chart-empty">Meal activity will appear here when you start recording meals.</div>:<ResponsiveContainer width="100%" height="100%"><BarChart data={meals} barSize={22}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#98a2b3" strokeOpacity={0.25}/><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill:"#98a2b3",fontSize:11}}/><YAxis hide/><Tooltip/><Bar dataKey="meals" fill="#0f7a5f" radius={[6,6,2,2]}/></BarChart></ResponsiveContainer>}</div><div className="meal-footer"><span><span className="legend-dot blue-dot"/>Meals served</span><strong>{mealsToday} meals</strong><button className="text-action" onClick={()=>onNavigate("Meals")}>Manage meals <ArrowUpRight size={15}/></button></div></article>
      <article className="panel activity-panel"><div className="panel-heading"><div><h3>Recent transactions</h3><p>Latest financial activity</p></div></div><div className="activity-list">{transactions.slice(0,4).map(t=><div className="activity-item" key={t.id}><div className={`activity-icon ${t.type==="Income"?"activity-income":"activity-expense"}`}>{t.type==="Income"?<ArrowDownRight size={17}/>:<ArrowUpRight size={17}/>}</div><div className="activity-main"><strong>{t.title}</strong><span>{t.category} · {t.date}</span></div><div className={`activity-amount ${t.type==="Income"?"amount-income":"amount-expense"}`}>{t.type==="Income"?"+":"−"}{money(t.amount)}</div></div>)}</div><button className="text-action activity-link" onClick={()=>onNavigate("Finance")}>View all transactions <ArrowUpRight size={15}/></button></article>
    </section>
    
  </div>;
}
function greeting(){const h=new Date().getHours();return h<5?'Good night':h<12?'Good morning':h<17?'Good afternoon':h<21?'Good evening':'Good night'}
