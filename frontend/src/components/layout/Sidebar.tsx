import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse,
  Factory, FileBarChart, Settings, LogOut, ChevronDown, X,
  PanelLeftClose, PanelLeftOpen, Coffee,
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => localStorage.getItem('sidebar-collapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

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
      {isOpen && <div className="fixed inset-0 bg-espresso/50 backdrop-blur-sm z-30 md:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen bg-roast
          flex flex-col z-40 transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${isCollapsed ? 'md:w-[76px]' : 'md:w-64'} w-64
        `}
      >
        {/* Header */}
        <div className={`h-[68px] px-4 flex items-center shrink-0 ${isCollapsed ? 'md:justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'md:hidden' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-caramel/25 to-caramel/10 flex items-center justify-center shrink-0 ring-1 ring-caramel/20">
              <Coffee size={17} className="text-caramel" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[15px] font-semibold text-latte leading-tight truncate">WMS Coffee</h1>
              <span className="text-[11px] text-latte/40">Warehouse System</span>
            </div>
          </div>

          {isCollapsed && (
            <div className="hidden md:flex w-9 h-9 rounded-xl bg-gradient-to-br from-caramel/25 to-caramel/10 items-center justify-center ring-1 ring-caramel/20">
              <Coffee size={17} className="text-caramel" strokeWidth={2} />
            </div>
          )}

          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-latte/50 hover:text-latte hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-px bg-white/[0.06] mx-4" />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-latte/30 uppercase">Menu</p>
          )}

          {menuItems.map((item) => {
            if (item.submenu) {
              const isOpenSub = openMenu === item.label;
              const isActiveGroup = item.submenu.some((sub) => location.pathname.startsWith(sub.path));

              return (
                <div key={item.label} className="relative">
                  {isActiveGroup && (
                    <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-caramel hidden md:block" />
                  )}
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    title={isCollapsed ? item.label : undefined}
                    className={`group flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isCollapsed ? 'md:justify-center' : 'justify-between'
                    } ${isActiveGroup ? 'text-latte bg-white/[0.06]' : 'text-latte/55 hover:bg-white/[0.04] hover:text-latte'}`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${
                        isActiveGroup ? 'bg-caramel/15 text-caramel' : 'text-latte/50 group-hover:text-latte'
                      }`}>
                        <item.icon size={16} />
                      </span>
                      <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 text-latte/30 transition-transform duration-200 ${isOpenSub ? 'rotate-180' : ''} ${isCollapsed ? 'md:hidden' : ''}`}
                    />
                  </button>

                  {isOpenSub && !isCollapsed && (
                    <div className="ml-11 mt-1 space-y-0.5 animate-page-in">
                      {item.submenu.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          onClick={handleNavClick}
                          className={({ isActive }) =>
                            `block px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                              isActive
                                ? 'bg-caramel/10 text-caramel font-medium'
                                : 'text-latte/40 hover:bg-white/[0.04] hover:text-latte/75'
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
                className={({ isActive }) => `
                  group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 ${isCollapsed ? 'md:justify-center' : ''}
                  ${isActive ? 'text-latte bg-white/[0.06]' : 'text-latte/55 hover:bg-white/[0.04] hover:text-latte'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-caramel hidden md:block" />
                    )}
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors ${
                      isActive ? 'bg-caramel/15 text-caramel' : 'text-latte/50 group-hover:text-latte'
                    }`}>
                      <item.icon size={16} />
                    </span>
                    <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="h-px bg-white/[0.06] mx-4" />

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center gap-2 mx-3 my-2 px-3 py-2 rounded-lg text-xs font-medium text-latte/35 hover:text-latte hover:bg-white/[0.04] transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen size={15} /> : <><PanelLeftClose size={15} /><span>Perkecil</span></>}
        </button>

        {/* Profile + logout */}
        <div className="p-3 space-y-1">
          <button
            onClick={handleProfileClick}
            title={isCollapsed ? user?.name : undefined}
            className={`flex items-center gap-3 w-full px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition-colors ${
              isCollapsed ? 'md:justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-caramel/30 to-caramel/10 text-caramel flex items-center justify-center text-xs font-semibold ring-1 ring-caramel/20 shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className={`min-w-0 text-left ${isCollapsed ? 'md:hidden' : ''}`}>
              <p className="text-[13px] font-medium text-latte truncate">{user?.name}</p>
              <p className="text-[11px] text-latte/35">Lihat profil</p>
            </div>
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            title={isCollapsed ? 'Keluar' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-clay/75 hover:bg-clay/10 hover:text-clay w-full transition-colors ${
              isCollapsed ? 'md:justify-center' : ''
            }`}
          >
            <LogOut size={16} className="shrink-0" />
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