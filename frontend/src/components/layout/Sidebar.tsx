import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  Factory, FileBarChart, Settings, LogOut, ChevronDown, X,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { logout as logoutApi } from '../../api/auth.api';
import Modal from '../common/Modal';

interface MenuItem {
  label: string;
  path?: string;
  icon: typeof LayoutDashboard;
  permission?: string; // kalau kosong, berarti semua role boleh lihat
  submenu?: { label: string; path: string; permission?: string }[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Master Data',
    icon: Package,
    permission: 'master-data.view',
    submenu: [
      { label: 'Supplier', path: '/master-data/suppliers' },
      { label: 'Warehouse', path: '/master-data/warehouses' },
      { label: 'Material', path: '/master-data/materials' },
    ],
  },
  {
    label: 'Procurement',
    icon: ShoppingCart,
    permission: 'purchase-order.view',
    submenu: [
      { label: 'Purchase Order', path: '/procurement/purchase-orders' },
    ],
  },
  { label: 'Inventory', path: '/inventory/stock-opnames', icon: Warehouse, permission: 'stock-opname.view' },
  { label: 'Production', path: '/production/requests', icon: Factory, permission: 'production-request.view' },
  { label: 'Reports', path: '/reports', icon: FileBarChart, permission: 'report.view' },
  {
    label: 'Settings',
    icon: Settings,
    permission: 'user.manage',
    submenu: [
      { label: 'Manajemen User', path: '/settings/users' },
    ],
  },
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
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [openMenu, setOpenMenu] = useState<string | null>('Master Data');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => localStorage.getItem('sidebar-collapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Filter menu: cuma tampilkan item yang permission-nya dipunyai user (atau gak butuh permission sama sekali)
  const visibleMenuItems = menuItems.filter((item) => !item.permission || hasPermission(item.permission));

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
    if (isCollapsed) return;
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) onClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleNavClick();
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (next) setOpenMenu(null);
      return next;
    });
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-espresso/50 z-30 md:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen bg-roast border-r border-black/20
          flex flex-col z-40 transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${isCollapsed ? 'md:w-[76px]' : 'md:w-64'} w-64
        `}
      >
        <div className={`p-5 border-b border-white/10 flex items-center ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'md:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-caramel/20 flex items-center justify-center shrink-0">
              <span className="text-caramel text-sm font-bold">☕</span>
            </div>
            <div>
              <h1 className="font-display text-base font-medium text-latte leading-tight">WMS Coffee</h1>
              <button onClick={handleProfileClick} className="text-[11px] text-latte/50 hover:text-caramel transition">
                {user?.name}
              </button>
            </div>
          </div>

          {isCollapsed && (
            <button
              onClick={handleProfileClick}
              className="hidden md:flex w-9 h-9 rounded-full bg-caramel/20 text-caramel items-center justify-center text-sm font-semibold"
              title={user?.name}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>
          )}

          <button onClick={onClose} className="md:hidden text-latte/50 hover:text-latte">
            <X size={20} />
          </button>
        </div>

        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center gap-2 mx-3 mt-3 px-3 py-2 rounded-lg text-xs font-medium text-latte/40 hover:text-latte hover:bg-white/5 transition"
        >
          {isCollapsed ? <PanelLeftOpen size={15} /> : <><PanelLeftClose size={15} /><span>Perkecil</span></>}
        </button>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {visibleMenuItems.map((item) => {
            if (item.submenu) {
              // Filter submenu juga, kalau tiap sub-item punya permission spesifik
              const visibleSubmenu = item.submenu.filter((sub) => !sub.permission || hasPermission(sub.permission));

              if (visibleSubmenu.length === 0) return null;

              const isOpenSub = openMenu === item.label;
              const isActiveGroup = visibleSubmenu.some((sub) => location.pathname.startsWith(sub.path));

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isCollapsed ? 'md:justify-center' : 'justify-between'
                    } ${isActiveGroup ? 'text-caramel bg-white/5' : 'text-latte/60 hover:bg-white/5 hover:text-latte'}`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon size={17} className="shrink-0" />
                      <span className={isCollapsed ? 'md:hidden' : ''}>{item.label}</span>
                    </span>
                    <ChevronDown size={14} className={`transition-transform ${isOpenSub ? 'rotate-180' : ''} ${isCollapsed ? 'md:hidden' : ''}`} />
                  </button>

                  {isOpenSub && !isCollapsed && (
                    <div className="ml-9 mt-0.5 space-y-0.5 animate-page-in">
                      {visibleSubmenu.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              isActive ? 'bg-caramel/15 text-caramel font-medium' : 'text-latte/45 hover:bg-white/5 hover:text-latte/80'
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
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isCollapsed ? 'md:justify-center' : ''
                  } ${isActive ? 'bg-caramel/15 text-caramel' : 'text-latte/60 hover:bg-white/5 hover:text-latte'}`
                }
              >
                <item.icon size={17} className="shrink-0" />
                <span className={isCollapsed ? 'md:hidden' : ''}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            title={isCollapsed ? 'Keluar' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-clay/80 hover:bg-clay/10 hover:text-clay w-full transition-colors ${
              isCollapsed ? 'md:justify-center' : ''
            }`}
          >
            <LogOut size={17} className="shrink-0" />
            <span className={isCollapsed ? 'md:hidden' : ''}>Keluar</span>
          </button>
        </div>
      </aside>

      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Konfirmasi Keluar">
        <p className="text-sm text-espresso/60 mb-6">Apakah Anda yakin ingin keluar dari akun ini?</p>
        <div className="flex gap-2">
          <button
            onClick={() => setIsLogoutModalOpen(false)}
            className="flex-1 border border-espresso/15 text-espresso py-2 rounded-lg text-sm font-medium hover:bg-espresso/5"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex-1 bg-clay text-white py-2 rounded-lg text-sm font-medium hover:bg-clay/90 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {isLoggingOut ? 'Memproses...' : 'Ya, Keluar'}
          </button>
        </div>
      </Modal>
    </>
  );
}