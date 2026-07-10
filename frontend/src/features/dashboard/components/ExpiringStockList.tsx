import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { dashboardApi } from '../../../api/dashboard.api';

interface Props {
  warehouseId?: string;
}

export default function ExpiringStockList({ warehouseId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-expiring-stock', warehouseId],
    queryFn: () => dashboardApi.getExpiringStock(7, warehouseId).then((res) => res.data.data),
  });

  return (
    <div className="bg-cream rounded-2xl border border-espresso/8 p-4 sm:p-6 shadow-sm shadow-espresso/[0.02]">
      <h3 className="text-xs font-medium text-espresso/55 tracking-wide uppercase mb-4 flex items-center gap-2">
        <Clock size={14} className="text-honey" />
        Akan/Sudah Kadaluarsa (7 Hari)
      </h3>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-lg animate-shimmer" />)}
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm border-b border-dashed border-espresso/8 py-2.5 last:border-0">
              <div>
                <p className="font-medium text-espresso">{item.material}</p>
                <p className="text-xs text-espresso/35">
                  {item.warehouse} {item.batch_number ? `• Batch ${item.batch_number}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-medium font-mono ${item.is_expired ? 'text-clay' : 'text-honey'}`}>{item.qty}</p>
                <p className="text-xs text-espresso/35 font-mono">{item.expiry_date}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-espresso/35">Tidak ada stok yang mendekati kadaluarsa.</p>
      )}
    </div>
  );
}