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
    <div className="bg-cream rounded-2xl border border-espresso/8 p-4 sm:p-6 shadow-sm shadow-espresso/[0.02]">
      <h3 className="text-xs font-medium text-espresso/55 tracking-wide uppercase mb-4">
        Tren Stok Masuk & Keluar (14 Hari Terakhir)
      </h3>

      {isLoading ? (
        <div className="h-64 rounded-lg animate-shimmer" />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data ?? []}>
            <CartesianGrid strokeDasharray="4 4" stroke="#EDE2D3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#2A1810', fillOpacity: 0.4 }}
              tickFormatter={(value) => value.slice(5)}
              axisLine={{ stroke: '#EDE2D3' }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#2A1810', fillOpacity: 0.4 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: '#FFFBF5',
                border: '1px solid rgba(42,24,16,0.1)',
                borderRadius: 10,
                fontSize: 12,
                fontFamily: 'Manrope Variable, sans-serif',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Manrope Variable, sans-serif' }} />
            <Line type="monotone" dataKey="stock_in" name="Stok Masuk" stroke="#B4703A" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="stock_out" name="Stok Keluar" stroke="#B5502F" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}