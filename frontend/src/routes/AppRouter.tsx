import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPage from '../features/dashboard/DashboardPage';
import SupplierPage from '../features/master-data/suppliers/SupplierPage';
import WarehousePage from '../features/master-data/warehouses/WarehousePage';
import MaterialPage from '../features/master-data/materials/MaterialPage';
import PurchaseOrderPage from '../features/procurement/purchase-orders/PurchaseOrderPage';
import PurchaseOrderFormPage from '../features/procurement/purchase-orders/PurchaseOrderFormPage';
import PurchaseOrderDetailPage from '../features/procurement/purchase-orders/PurchaseOrderDetailPage';
import GoodsReceiptFormPage from '../features/procurement/goods-receipts/GoodsReceiptFormPage';
import ProductionRequestPage from '../features/production/ProductionRequestPage';
import ProductionRequestFormPage from '../features/production/ProductionRequestFormPage';
import ProductionRequestDetailPage from '../features/production/ProductionRequestDetailPage';
import StockOpnamePage from '../features/inventory/stock-opname/StockOpnamePage';
import StockOpnameFormPage from '../features/inventory/stock-opname/StockOpnameFormPage';
import StockOpnameDetailPage from '../features/inventory/stock-opname/StockOpnameDetailPage';
import UserPage from '../features/settings/users/UserPage';
import ProfilePage from '../features/profile/ProfilePage';
import ReportsPage from '../features/reports/ReportsPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import PrivateRoute from './PrivateRoute';
import PageTitleUpdater from '../components/common/PageTitleUpdater';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <PageTitleUpdater />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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

            <Route path="/production/requests" element={<ProductionRequestPage />} />
            <Route path="/production/requests/new" element={<ProductionRequestFormPage />} />
            <Route path="/production/requests/:id" element={<ProductionRequestDetailPage />} />

            <Route path="/inventory/stock-opnames" element={<StockOpnamePage />} />
            <Route path="/inventory/stock-opnames/new" element={<StockOpnameFormPage />} />
            <Route path="/inventory/stock-opnames/:id" element={<StockOpnameDetailPage />} />

            <Route path="/reports" element={<ReportsPage />} />

            <Route path="/settings/users" element={<UserPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}