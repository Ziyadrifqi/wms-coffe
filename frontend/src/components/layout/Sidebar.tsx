import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  Factory, FileBarChart, Settings, LogOut, ChevronDown, X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import Modal from '../common/Modal';

const masterDataSubmenu = [
  { label: 'Supplier', path: '/master-data/suppliers' },
  { label: 'Warehouse', path: '/master-data/warehouses' },
  { label: 'Material', path: '/master-data/materials' },
];

const procurementSubmenu = [
  { label: 'Purchase Order', path: '/procurement/purchase-orders' },
];

const settingsSubmenu = [
  { label: 'Manajemen User', path: '/settings/users' },
];

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Master Data', icon: Package, submenu: masterDataSubmenu },
  { label: 'Procurement', icon: ShoppingCart, submenu: procurementSubmenu },
  { label: 'Inventory', path: '/inventory/stock-opnames', icon: Warehouse },
  { label: 'Production', path: '/production/requests', icon: Factory },
  { label: 'Reports', path: '/reports', icon: FileBarChart },
  { label: 'Settings', icon: Settings, submenu: settingsSubmenu },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const [openMenu, setOpenMenu] = useState<string | null>('Master Data');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
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

  const handleNavClick = () => {
    if (window.innerWidth < 768) onClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleNavClick();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200
          flex flex-col z-40 transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">WMS Coffee</h1>
            <button
              onClick={handleProfileClick}
              className="text-xs text-gray-500 mt-1 hover:text-blue-600 hover:underline transition text-left"
            >
              {user?.name}
            </button>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.submenu) {
              const isOpenSub = openMenu === item.label;
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
                      className={`transition-transform ${isOpenSub ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpenSub && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.submenu.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={handleNavClick}
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
                onClick={handleNavClick}
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
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full transition"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Keluar"
      >
        <p className="text-sm text-gray-600 mb-6">
          Apakah Anda yakin ingin keluar dari akun ini?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 border border-gray-300 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 bg-red-600 text-white py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {isLoggingOut ? 'Memproses...' : 'Ya, Keluar'}
          </button>
        </div>
      </Modal>
    </>
  );
}