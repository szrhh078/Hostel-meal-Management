import type { ReactNode } from "react";
type Props = { label: string; value: string; change: string; positive?: boolean; icon: ReactNode; tone: string };
export default function StatCard({ label, value, change, positive = true, icon, tone }: Props) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><strong className="stat-value">{value}</strong><div className="stat-foot"><span className={positive ? "trend-up" : "trend-down"}>{change}</span></div></article>;
}