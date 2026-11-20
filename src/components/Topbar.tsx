import { ChevronLeft, ChevronRight, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme';
import LiveClock from './LiveClock';
import { currentPeriod, periodLabel, shiftMonth } from '../lib/period';
type Props = { title: string; onMenu: () => void; initials: string; onProfile: () => void; period: string; onPeriod: (p: string) => void; showPeriod?: boolean };
export default function Topbar({ title, onMenu, initials, onProfile, period, onPeriod, showPeriod = true }: Props) {
  const { theme, toggleTheme } = useTheme();
  return <header className="topbar">
    <div className="topbar-left"><button className="icon-button menu-button" aria-label="Open menu" onClick={onMenu}><Menu size={20} /></button><div><div className="breadcrumb">Workspace <span>/</span> <strong>{title}</strong></div><h1>{title}</h1></div></div>
    <div className="topbar-actions">
      <LiveClock />
      {showPeriod && <div className="period-picker" role="group" aria-label="Billing month">
        <button aria-label="Previous month" onClick={() => onPeriod(shiftMonth(period, -1))}><ChevronLeft size={15} /></button>
        <span>{periodLabel(period)}</span>
        <button aria-label="Next month" disabled={period >= currentPeriod()} onClick={() => onPeriod(shiftMonth(period, 1))}><ChevronRight size={15} /></button>
      </div>}
      <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
      <button className="top-avatar" onClick={onProfile} aria-label="Open profile">{initials}</button>
    </div>
  </header>;
}
