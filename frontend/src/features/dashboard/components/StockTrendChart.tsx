import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardApi } from '../../../api/dashboard.api';

interface Props {
  warehouseId?: string;
}

export default function StockTrendChart({ warehouseId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stock-trend', warehouseId],
    queryFn: () => dashboardApi.getStockTrend(14, warehouseId).then((res) => res.data.data),
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Tren Stok Masuk & Keluar (14 Hari Terakhir)</h3>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Memuat grafik...</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value) => value.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="stock_in" name="Stok Masuk" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="stock_out" name="Stok Keluar" stroke="#dc2626" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}