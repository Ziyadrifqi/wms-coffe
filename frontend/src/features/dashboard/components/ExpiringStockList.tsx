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
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <Clock size={16} className="text-orange-500" />
        Akan/Sudah Kadaluarsa (7 Hari)
      </h3>

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
              <div>
                <p className="font-medium text-gray-900">{item.material}</p>
                <p className="text-xs text-gray-400">{item.warehouse} {item.batch_number ? `• Batch ${item.batch_number}` : ''}</p>
              </div>
              <div className="text-right">
                <p className={`font-medium ${item.is_expired ? 'text-red-600' : 'text-orange-600'}`}>
                  {item.qty}
                </p>
                <p className="text-xs text-gray-400">{item.expiry_date}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Tidak ada stok yang mendekati kadaluarsa.</p>
      )}
    </div>
  );
}