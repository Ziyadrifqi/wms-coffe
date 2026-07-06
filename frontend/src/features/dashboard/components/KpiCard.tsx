import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'default' | 'warning' | 'danger';
}

const toneStyles = {
  default: 'bg-blue-50 text-blue-600',
  warning: 'bg-yellow-50 text-yellow-600',
  danger: 'bg-red-50 text-red-600',
};

export default function KpiCard({ label, value, icon: Icon, tone = 'default' }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toneStyles[tone]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}