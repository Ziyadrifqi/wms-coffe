import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPage from '../features/dashboard/DashboardPage';
import SupplierPage from '../features/master-data/suppliers/SupplierPage';
import WarehousePage from '../features/master-data/warehouses/WarehousePage';
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
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}