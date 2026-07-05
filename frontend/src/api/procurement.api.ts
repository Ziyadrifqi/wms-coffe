import axiosClient from './axiosClient';
import type { PaginatedResponse } from '../types/masterData';
import type { PurchaseOrder, GoodsReceipt } from '../types/procurement';

type QueryParams = Record<string, string | number | boolean | undefined>;

interface PurchaseOrderItemPayload {
  material_id: string;
  qty_ordered: number;
  unit_price: number;
}

interface PurchaseOrderPayload {
  supplier_id: string;
  warehouse_id: string;
  order_date: string;
  expected_date?: string;
  notes?: string;
  items: PurchaseOrderItemPayload[];
}

interface GoodsReceiptItemPayload {
  purchase_order_item_id: string;
  material_id: string;
  qty_received: number;
  expiry_date?: string;
  batch_number?: string;
}

interface GoodsReceiptPayload {
  purchase_order_id: string;
  receipt_date: string;
  notes?: string;
  items: GoodsReceiptItemPayload[];
}

export const purchaseOrderApi = {
  list: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<PurchaseOrder>>('/procurement/purchase-orders', { params }),
  get: (id: string) => axiosClient.get<{ data: PurchaseOrder }>(`/procurement/purchase-orders/${id}`),
  create: (data: PurchaseOrderPayload) => axiosClient.post('/procurement/purchase-orders', data),
  update: (id: string, data: PurchaseOrderPayload) =>
    axiosClient.put(`/procurement/purchase-orders/${id}`, data),
  submit: (id: string) => axiosClient.post(`/procurement/purchase-orders/${id}/submit`),
  approve: (id: string) => axiosClient.post(`/procurement/purchase-orders/${id}/approve`),
  reject: (id: string) => axiosClient.post(`/procurement/purchase-orders/${id}/reject`),
};

export const goodsReceiptApi = {
  list: (params?: QueryParams) =>
    axiosClient.get<PaginatedResponse<GoodsReceipt>>('/procurement/goods-receipts', { params }),
  get: (id: string) => axiosClient.get<{ data: GoodsReceipt }>(`/procurement/goods-receipts/${id}`),
  create: (data: GoodsReceiptPayload) => axiosClient.post('/procurement/goods-receipts', data),
};