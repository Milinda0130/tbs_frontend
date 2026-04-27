import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FlaskConical, 
  Package, 
  Building2, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  Bell,
  HelpCircle,
  User,
  Menu,
  X,
  Camera,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-md mb-1',
        isActive
          ? 'bg-surface_container text-primary border-r-4 border-primary'
          : 'text-on_surface_variant hover:bg-surface_container_low hover:text-on_surface'
      )
    }
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </NavLink>
);

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-surface_container_lowest border-r border-outline_variant flex flex-col shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between lg:justify-start gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-on_surface leading-tight">Campus</h1>
              <p className="text-xs text-on_surface_variant font-semibold">Inventory</p>
              <p className="text-[10px] text-outline uppercase tracking-wider">Science Faculty</p>
            </div>
          </div>
          <button className="lg:hidden p-2 text-on_surface_variant" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/practical-sessions" icon={FlaskConical} label="Practical Sessions" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/media-inventory" icon={Camera} label="Media Inventory" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/equipment-returns" icon={RotateCcw} label="Checkouts" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/waste" icon={Trash2} label="Waste Logs" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/inventory" icon={Package} label="Asset Inventory" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/buildings" icon={Building2} label="Lab Buildings" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/reports" icon={BarChart3} label="Reports" onClick={() => setIsSidebarOpen(false)} />
        </nav>

        <div className="p-4 mt-auto border-t border-outline_variant">
          <SidebarItem to="/settings" icon={Settings} label="Settings" onClick={() => setIsSidebarOpen(false)} />
          <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-on_surface_variant hover:bg-red-50 hover:text-error transition-all rounded-md w-full">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-surface_container_lowest border-b border-outline_variant flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-on_surface_variant" onClick={toggleSidebar}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden md:block w-64 lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2 bg-surface_container_low border border-outline_variant rounded-md text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button className="md:hidden p-2 text-on_surface_variant hover:bg-surface_container transition-all rounded-full">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-on_surface_variant hover:bg-surface_container transition-all rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface_container_lowest"></span>
            </button>
            <button className="hidden sm:flex p-2 text-on_surface_variant hover:bg-surface_container transition-all rounded-full">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="hidden sm:block h-8 w-px bg-outline_variant mx-2"></div>
            <button className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-surface_dim flex items-center justify-center border border-outline_variant">
                <User className="w-5 h-5 text-on_surface_variant" />
              </div>
              <span className="hidden lg:block text-sm font-semibold text-on_surface">Admin</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
