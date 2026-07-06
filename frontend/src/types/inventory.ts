export interface StockOpnameItem {
  id: string;
  material: { id: string; name: string };
  qty_system: number;
  qty_actual: number;
  qty_difference: number;
  notes: string | null;
}

export interface StockOpname {
  id: string;
  opname_number: string;
  warehouse: { id: string; name: string };
  status: 'draft' | 'in_progress' | 'completed';
  opname_date: string;
  created_by: string;
  items: StockOpnameItem[];
  created_at: string;
}