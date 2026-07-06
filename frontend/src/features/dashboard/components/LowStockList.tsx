import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { dashboardApi } from '../../../api/dashboard.api';

interface Props {
  warehouseId?: string;
}

export default function LowStockList({ warehouseId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-low-stock', warehouseId],
    queryFn: () => dashboardApi.getLowStock(warehouseId).then((res) => res.data.data),
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <AlertTriangle size={16} className="text-yellow-500" />
        Stok Menipis
      </h3>

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {data.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-400">{item.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-red-600 font-medium">{item.current_stock} {item.unit}</p>
                <p className="text-xs text-gray-400">min. {item.min_stock} {item.unit}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Semua stok material aman.</p>
      )}
    </div>
  );
}