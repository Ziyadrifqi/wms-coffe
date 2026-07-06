import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/master-data/suppliers': 'Supplier',
  '/master-data/warehouses': 'Warehouse',
  '/master-data/materials': 'Material',
  '/procurement/purchase-orders': 'Purchase Order',
  '/production/requests': 'Production Request',
};

export default function PageTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const matched = titleMap[location.pathname];
    document.title = matched ? `${matched} - WMS Coffee` : 'WMS Coffee';
  }, [location.pathname]);

  return null;
}