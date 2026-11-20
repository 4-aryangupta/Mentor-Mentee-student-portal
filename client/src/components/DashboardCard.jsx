import { ArrowUpRight } from 'lucide-react';
export default function DashboardCard({ label, value, note, icon: Icon, tone = 'teal' }) {
  return <article className={`metric-card metric-${tone}`}><div className="metric-top"><span>{label}</span>{Icon && <span className="metric-icon"><Icon size={18}/></span>}</div><div className="metric-value">{value ?? '—'}</div><div className="metric-note">{note || 'Current overview'} <ArrowUpRight size={13}/></div></article>;
}
