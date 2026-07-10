import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, Clock, XCircle, ShoppingCart, Factory, AlertCircle } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard.api';
import { warehouseApi } from '../../api/masterData.api';
import { useAuthStore } from '../../stores/authStore';
import KpiCard from './components/KpiCard';
import StockTrendChart from './components/StockTrendChart';
import LowStockList from './components/LowStockList';
import ExpiringStockList from './components/ExpiringStockList';
import ActivityFeed from './components/ActivityFeed';
import type { Warehouse } from '../../types/masterData';

export default function DashboardPage() {
  const [warehouseId, setWarehouseId] = useState<string>('');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses-all'],
    queryFn: () => warehouseApi.list({ per_page: 100, is_active: true }).then((res) => res.data.data as Warehouse[]),
  });

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['dashboard-kpis', warehouseId],
    queryFn: () => dashboardApi.getKpis(warehouseId || undefined).then((res) => res.data.data),
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl font-medium text-espresso">Dashboard</h1>

        <select
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          className="px-3.5 py-2.5 bg-cream border border-espresso/12 rounded-lg text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-caramel/40"
        >
          <option value="">Semua Gudang</option>
          {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {user?.must_change_password && (
        <div className="bg-honey-light border border-honey/20 text-honey text-sm rounded-lg p-4 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            Anda masih menggunakan password sementara. Segera ganti demi keamanan akun Anda.
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="bg-honey text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-honey/90 whitespace-nowrap transition"
          >
            Ganti Sekarang
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl h-[72px] animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard label="Total Material Aktif" value={kpis?.total_materials ?? 0} icon={Package} />
          <KpiCard label="Stok Menipis" value={kpis?.low_stock_count ?? 0} icon={AlertTriangle} tone="warning" />
          <KpiCard label="Akan Kadaluarsa" value={kpis?.expiring_soon_count ?? 0} icon={Clock} tone="warning" />
          <KpiCard label="Sudah Kadaluarsa" value={kpis?.expired_count ?? 0} icon={XCircle} tone="danger" />
          <KpiCard label="PO Menunggu Approval" value={kpis?.pending_po_count ?? 0} icon={ShoppingCart} />
          <KpiCard label="Request Produksi Pending" value={kpis?.pending_production_count ?? 0} icon={Factory} />
        </div>
      )}

      <div className="mb-6">
        <StockTrendChart warehouseId={warehouseId || undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LowStockList warehouseId={warehouseId || undefined} />
        <ExpiringStockList warehouseId={warehouseId || undefined} />
      </div>

      <ActivityFeed warehouseId={warehouseId || undefined} />
    </div>
  );
}