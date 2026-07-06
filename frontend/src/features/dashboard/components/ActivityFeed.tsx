import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowDownCircle, ArrowUpCircle, RefreshCcw } from 'lucide-react';
import { dashboardApi } from '../../../api/dashboard.api';

const typeConfig = {
  in: { icon: ArrowDownCircle, color: 'text-green-600', label: 'Masuk' },
  out: { icon: ArrowUpCircle, color: 'text-red-600', label: 'Keluar' },
  transfer: { icon: RefreshCcw, color: 'text-blue-600', label: 'Transfer' },
  adjustment: { icon: RefreshCcw, color: 'text-yellow-600', label: 'Penyesuaian' },
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Activity size={16} className="text-gray-400" />
        Aktivitas Terbaru
      </h3>

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {data.map((item, i) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <div key={i} className="flex items-start gap-3 text-sm">
                <Icon size={16} className={`mt-0.5 shrink-0 ${config.color}`} />
                <div className="min-w-0">
                  <p className="text-gray-900">
                    <span className="font-medium">{config.label}</span> {Math.abs(item.qty)} {item.material}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {item.warehouse} • oleh {item.created_by} • {new Date(item.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Belum ada aktivitas.</p>
      )}
    </div>
  );
}