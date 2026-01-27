import { LayoutDashboard, FilePlus, FileText, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export type Route = 'dashboard' | 'invoices' | 'new-invoice' | 'edit-invoice' | 'users' | 'settings';

interface LayoutProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  children: React.ReactNode;
}

const navItems: { route: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { route: 'new-invoice', label: 'New Invoice', icon: FilePlus },
  { route: 'invoices', label: 'Invoices', icon: FileText },
  { route: 'users', label: 'Team', icon: Users },
  { route: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ currentRoute, onNavigate, children }: LayoutProps) {
  const { currentUser, logout, companySettings } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const activeRoute = currentRoute === 'edit-invoice' ? 'invoices' : currentRoute;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[72px]' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 gap-3">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            {companySettings?.logoData ? (
              <img src={companySettings.logoData} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-sm">Q</span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{companySettings?.name || 'QNS'}</p>
              <p className="text-[11px] text-gray-400 truncate">{companySettings?.tagline || 'Padel Courts'}</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = activeRoute === item.route;
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={20} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-2 border-t border-gray-100">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && 'Collapse'}
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-green-700 text-xs font-semibold">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{currentUser?.email}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
