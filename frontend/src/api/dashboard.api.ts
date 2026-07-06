import axiosClient from './axiosClient';
import type {
  DashboardKpis, StockTrendPoint, LowStockItem, ExpiringStockItem, RecentActivityItem,
} from '../types/dashboard';

export const dashboardApi = {
  getKpis: (warehouseId?: string) =>
    axiosClient.get<{ data: DashboardKpis }>('/dashboard/kpis', { params: { warehouse_id: warehouseId } }),
  getStockTrend: (days = 14, warehouseId?: string) =>
    axiosClient.get<{ data: StockTrendPoint[] }>('/dashboard/stock-trend', {
      params: { days, warehouse_id: warehouseId },
    }),
  getLowStock: (warehouseId?: string) =>
    axiosClient.get<{ data: LowStockItem[] }>('/dashboard/low-stock', { params: { warehouse_id: warehouseId } }),
  getExpiringStock: (days = 7, warehouseId?: string) =>
    axiosClient.get<{ data: ExpiringStockItem[] }>('/dashboard/expiring-stock', {
      params: { days, warehouse_id: warehouseId },
    }),
  getRecentActivity: (limit = 10, warehouseId?: string) =>
    axiosClient.get<{ data: RecentActivityItem[] }>('/dashboard/recent-activity', {
      params: { limit, warehouse_id: warehouseId },
    }),
};