import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'default' | 'warning' | 'danger';
}

const toneStyles = {
  default: 'bg-caramel/10 text-caramel',
  warning: 'bg-honey-light text-honey',
  danger: 'bg-clay-light text-clay',
};

export default function KpiCard({ label, value, icon: Icon, tone = 'default' }: KpiCardProps) {
  return (
    <div className="bg-cream rounded-xl border border-espresso/8 p-4 flex items-center gap-3.5 hover:shadow-md hover:shadow-espresso/5 hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles[tone]}`}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-medium text-espresso leading-tight">{value}</p>
        <p className="text-xs text-espresso/45 truncate">{label}</p>
      </div>
    </div>
  );
}