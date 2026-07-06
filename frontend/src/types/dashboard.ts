export interface DashboardKpis {
  total_materials: number;
  low_stock_count: number;
  expiring_soon_count: number;
  expired_count: number;
  pending_po_count: number;
  pending_production_count: number;
}

export interface StockTrendPoint {
  date: string;
  stock_in: number;
  stock_out: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  unit: string | null;
}

export interface ExpiringStockItem {
  material: string;
  warehouse: string;
  qty: number;
  batch_number: string | null;
  expiry_date: string;
  is_expired: boolean;
}

export interface RecentActivityItem {
  material: string;
  warehouse: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  qty: number;
  created_by: string;
  created_at: string;
}