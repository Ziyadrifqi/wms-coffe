import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Exact match — untuk route yang path-nya tetap (list, form "new")
const exactTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/master-data/suppliers': 'Supplier',
  '/master-data/warehouses': 'Warehouse',
  '/master-data/materials': 'Material',
  '/procurement/purchase-orders': 'Purchase Order',
  '/procurement/purchase-orders/new': 'Buat Purchase Order',
  '/procurement/goods-receipts/new': 'Goods Receipt',
  '/production/requests': 'Production Request',
  '/production/requests/new': 'Buat Production Request',
  '/inventory/stock-opnames': 'Stock Opname',
  '/inventory/stock-opnames/new': 'Buat Stock Opname',
  '/login': 'Masuk',
};

// Prefix match — untuk route dengan ID dinamis (urutan dari paling spesifik dulu)
const prefixTitleMap: { prefix: string; title: string }[] = [
  { prefix: '/procurement/purchase-orders/', title: 'Detail Purchase Order' },
  { prefix: '/production/requests/', title: 'Detail Production Request' },
  { prefix: '/inventory/stock-opnames/', title: 'Detail Stock Opname' },
];

export default function PageTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const { pathname } = location;

    if (exactTitleMap[pathname]) {
      document.title = `${exactTitleMap[pathname]} - WMS Coffee`;
      return;
    }

    const matchedPrefix = prefixTitleMap.find((item) => pathname.startsWith(item.prefix));
    if (matchedPrefix) {
      document.title = `${matchedPrefix.title} - WMS Coffee`;
      return;
    }

    document.title = 'WMS Coffee';
  }, [location]);   

  return null;
}