export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'material' | 'product';
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface Material {
  id: string;
  sku: string;
  name: string;
  category: { id: string; name: string };
  unit: { id: string; name: string; symbol: string };
  min_stock: number;
  is_perishable: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}