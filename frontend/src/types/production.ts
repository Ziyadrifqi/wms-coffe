export interface ProductionRequestItem {
  id: string;
  material: { id: string; name: string };
  qty_requested: number;
  qty_fulfilled: number;
}

export interface ProductionRequest {
  id: string;
  request_number: string;
  warehouse: { id: string; name: string };
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  request_date: string;
  notes: string | null;
  requested_by: string;
  approved_by: string | null;
  items: ProductionRequestItem[];
  created_at: string;
}