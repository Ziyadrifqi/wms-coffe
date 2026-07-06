import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  Factory, FileBarChart, Settings, LogOut, ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { logout as logoutApi } from '../../api/auth.api';

const masterDataSubmenu = [
  { label: 'Supplier', path: '/master-data/suppliers' },
  { label: 'Warehouse', path: '/master-data/warehouses' },
  { label: 'Material', path: '/master-data/materials' },
];

const procurementSubmenu = [
  { label: 'Purchase Order', path: '/procurement/purchase-orders' },
];

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Master Data', icon: Package, submenu: masterDataSubmenu },
  { label: 'Procurement', icon: ShoppingCart, submenu: procurementSubmenu },
  { label: 'Inventory', path: '/inventory', icon: Warehouse },
  { label: 'Production', path: '/production/requests', icon: Factory },
  { label: 'Reports', path: '/reports', icon: FileBarChart },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const [openMenu, setOpenMenu] = useState<string | null>('Master Data');

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // tetap logout di frontend walau API gagal
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const toggleSubmenu = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">WMS Coffee</h1>
        <p className="text-xs text-gray-500 mt-1">{user?.name}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.submenu) {
            const isOpen = openMenu === item.label;
            const isActiveGroup = item.submenu.some((sub) => location.pathname.startsWith(sub.path));

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActiveGroup ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={18} />
                    {item.label}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.submenu.map((sub) => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block px-3 py-1.5 rounded-md text-sm transition ${
                            isActive
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full transition"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}