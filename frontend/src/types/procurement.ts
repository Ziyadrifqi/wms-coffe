export interface PurchaseOrderItem {
  id: string;
  material: { id: string; name: string };
  qty_ordered: number;
  qty_received: number;
  unit_price: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: { id: string; name: string };
  warehouse: { id: string; name: string };
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  order_date: string;
  expected_date: string | null;
  total_amount: number;
  notes: string | null;
  created_by: string;
  approved_by: string | null;
  items: PurchaseOrderItem[];
  created_at: string;
}

export interface GoodsReceiptItem {
  id: string;
  material: { id: string; name: string };
  qty_received: number;
  expiry_date: string | null;
  batch_number: string | null;
}

export interface GoodsReceipt {
  id: string;
  gr_number: string;
  purchase_order: { id: string; po_number: string };
  warehouse: { id: string; name: string };
  received_by: string;
  receipt_date: string;
  status: string;
  notes: string | null;
  items: GoodsReceiptItem[];
  created_at: string;
}