import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPage from '../features/dashboard/DashboardPage';
import SupplierPage from '../features/master-data/suppliers/SupplierPage';
import WarehousePage from '../features/master-data/warehouses/WarehousePage';
import PurchaseOrderPage from '../features/procurement/purchase-orders/PurchaseOrderPage';
import PurchaseOrderFormPage from '../features/procurement/purchase-orders/PurchaseOrderFormPage';
import PurchaseOrderDetailPage from '../features/procurement/purchase-orders/PurchaseOrderDetailPage';
import GoodsReceiptFormPage from '../features/procurement/goods-receipts/GoodsReceiptFormPage';

import MaterialPage from '../features/master-data/materials/MaterialPage';
import PrivateRoute from './PrivateRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/master-data/suppliers" element={<SupplierPage />} />
            <Route path="/master-data/warehouses" element={<WarehousePage />} />
            <Route path="/master-data/materials" element={<MaterialPage />} />

            <Route path="/procurement/purchase-orders" element={<PurchaseOrderPage />} />
            <Route path="/procurement/purchase-orders/new" element={<PurchaseOrderFormPage />} />
            <Route path="/procurement/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="/procurement/goods-receipts/new" element={<GoodsReceiptFormPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}