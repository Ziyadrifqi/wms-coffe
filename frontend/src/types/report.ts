export interface StockMovementReportItem {
  id: string;
  material: string;
  warehouse: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  reference_type: string;
  qty: number;
  qty_before: number;
  qty_after: number;
  notes: string | null;
  created_by: string;
  created_at: string;
}