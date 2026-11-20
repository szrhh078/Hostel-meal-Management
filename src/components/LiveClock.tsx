import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

/** Live date and time shown in the top bar. Ticks every second. */
export default function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const date = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <div className="live-clock" role="timer" aria-label={`${date}, ${time}`}>
      <Clock3 size={16} aria-hidden />
      <div><strong>{time}</strong><span>{date}</span></div>
    </div>
  );
}
