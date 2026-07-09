import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from 'lucide-react';
import { dashboardApi } from '../../../api/dashboard.api';

const typeConfig = {
  in: { icon: ArrowDownCircle, color: 'text-moss', label: 'Masuk' },
  out: { icon: ArrowUpCircle, color: 'text-clay', label: 'Keluar' },
  transfer: { icon: RefreshCcw, color: 'text-caramel', label: 'Transfer' },
  adjustment: { icon: RefreshCcw, color: 'text-honey', label: 'Penyesuaian' },
};

interface Props {
  warehouseId?: string;
}

export default function ActivityFeed({ warehouseId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-recent-activity', warehouseId],
    queryFn: () => dashboardApi.getRecentActivity(10, warehouseId).then((res) => res.data.data),
    refetchInterval: 30000,
  });

  return (
    <div className="bg-cream rounded-2xl border border-espresso/8 p-4 sm:p-6 shadow-sm shadow-espresso/[0.02]">
      <h3 className="text-xs font-medium text-espresso/55 tracking-wide uppercase mb-4 flex items-center gap-2">
        <Activity size={14} className="text-espresso/30" />
        Aktivitas Terbaru
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 rounded-lg animate-shimmer" />)}
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {data.map((item, i) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <div key={i} className="flex items-start gap-3 text-sm">
                <Icon size={16} className={`mt-0.5 shrink-0 ${config.color}`} />
                <div className="min-w-0">
                  <p className="text-espresso">
                    <span className="font-medium">{config.label}</span>{' '}
                    <span className="font-mono">{Math.abs(item.qty)}</span> {item.material}
                  </p>
                  <p className="text-xs text-espresso/35 truncate">
                    {item.warehouse} • oleh {item.created_by} • {new Date(item.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-espresso/35">Belum ada aktivitas.</p>
      )}
    </div>
  );
}