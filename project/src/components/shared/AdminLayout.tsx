import { useState, useEffect, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Network,
  Activity,
  Database,
  ScrollText,
  HeartPulse,
  BarChart3,
  Plug,
  FileBarChart,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  Radio,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Users,
} from 'lucide-react';
import { FusionGridLogo } from '@/components/shared/FusionGridLogo';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (to: string) => void;
  children: ReactNode;
}

const navItems = [
  { label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Officer Management', icon: Users, path: '/admin/officers' },
  { label: 'Dept. Integrations', icon: Network, path: '/admin/integrations' },
  { label: 'API Gateway Monitor', icon: Activity, path: '/admin/api-monitor' },
  { label: 'Data Quality Engine', icon: Database, path: '/admin/data-quality' },
  { label: 'Audit Logs & Ledger', icon: ScrollText, path: '/admin/audit' },
  { label: 'System Health', icon: HeartPulse, path: '/admin/system-health' },
  { label: 'Analytics & Trends', icon: BarChart3, path: '/admin/analytics' },
  { label: 'System Connectors', icon: Plug, path: '/admin/connectors' },
  { label: 'Data Standards & Schemas', icon: FileBarChart, path: '/admin/data-standards' },
  { label: 'Event Stream Bus', icon: Radio, path: '/admin/event-stream' },
];

export function AdminLayout({ currentPath, navigate, children }: AdminLayoutProps) {
  const { user, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) =>
    currentPath === path || (path !== '/admin' && currentPath.startsWith(path + '/'));

  const getPageTitle = () => {
    const matched = navItems.find((n) => isActive(n.path));
    return matched ? matched.label : 'Admin Control Center';
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#2B1B14] text-[#FFF9F0]">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#4A2E22] px-5 bg-[#21140F]">
        <button onClick={() => navigate('/')} className="flex items-center">
          <FusionGridLogo size="sm" variant="dark" />
        </button>
      </div>

      {/* Admin Credential Card */}
      <div className="border-b border-[#4A2E22] p-4 bg-[#2B1B14]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6F4028] font-bold text-[#FFF9F0] shadow-md shadow-[#C58B55]/20 ring-1 ring-[#C58B55]/40">
            <Settings className="h-5 w-5 text-[#FFF9F0]" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#C58B55] ring-2 ring-[#2B1B14]" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#FFF9F0]">
              {user?.name || 'Nahid Shams'}
            </p>
            <p className="truncate font-mono text-[11px] text-[#C58B55]">
              {user?.id || 'MH-ADM-ROOT-001'} • Nahid Shams
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[#4A2E22] bg-[#21140F] px-2.5 py-1.5 text-[11px] text-[#E8D5BF]">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C58B55]" />
            Administrator: Nahid Shams
          </span>
          <span className="font-mono text-[10px] text-emerald-400">mTLS Verified</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 scrollbar-thin">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C58B55]">
          Platform Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-[#6F4028] to-[#4A2E22] text-[#FFF9F0] shadow-md shadow-[#2B1B14] border-l-4 border-[#C58B55] font-bold'
                  : 'text-[#E8D5BF] hover:bg-[#38241B] hover:text-[#FFF9F0]'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-[#C58B55]' : 'text-[#D8C2AA] group-hover:text-[#FFF9F0]'
                )}
              />
              <span className="flex-1 truncate text-left">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-[#C58B55]" />}
            </button>
          );
        })}

        {/* System Simulation Tag */}
        <div className="mt-4 rounded-xl border border-[#4A2E22] bg-[#21140F]/80 p-3 text-xs text-[#E8D5BF] shadow-inner">
          <div className="flex items-center gap-1.5 font-bold text-[#C58B55]">
            <Terminal className="h-3.5 w-3.5 text-[#C58B55]" />
            SIH Simulation Engine
          </div>
          <p className="mt-1 text-[11px] text-[#D8C2AA] leading-relaxed">
            Connected to 5 mock department nodes via simulated REST/gRPC connectors.
          </p>
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-[#4A2E22] p-3 bg-[#21140F]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#D8C2AA] transition-colors hover:bg-[#38241B] hover:text-[#FFF9F0]"
        >
          <LogOut className="h-4 w-4 text-[#C58B55]" />
          <span>Exit Admin Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5EBDD]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[#4A2E22] bg-[#2B1B14] shadow-xl lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[#21140F]/60 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 shadow-2xl lg:hidden animate-slide-in-right bg-[#2B1B14]">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#D8C2AA] bg-[#FFF8ED] px-4 shadow-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-[#38241B] hover:bg-[#EAD8C2] lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-[#755C49] hover:text-[#6F4028] transition-colors"
              >
                Control Center
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-[#D8C2AA]" />
              <span className="font-bold text-[#38241B]">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Admin Identity Display in Navigation Bar */}
            <div className="flex items-center gap-2 rounded-full border border-[#D8C2AA] bg-[#FFF8ED] px-3.5 py-1 text-xs font-bold text-[#2B1B14] shadow-xs">
              <ShieldCheck className="h-4 w-4 text-[#C58B55]" />
              <span className="hidden sm:inline text-[#786453]">Admin:</span>
              <span className="text-[#6F4028] font-bold">Nahid Shams</span>
            </div>

            {/* Live Gateway Telemetry Chip */}
            <div className="hidden items-center gap-2 rounded-full border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-1 text-xs font-semibold text-[#6F4028] lg:flex shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#C58B55] animate-pulse" />
              <span>Gateway: 99.99%</span>
              <span className="text-[#D8C2AA]">•</span>
              <span className="font-mono text-[11px] text-[#755C49]">18ms</span>
            </div>

            <button
              onClick={() => navigate('/')}
              className="hidden items-center gap-1.5 rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-1.5 text-xs font-semibold text-[#38241B] transition-colors hover:bg-[#EAD8C2] hover:text-[#6F4028] md:flex"
            >
              Public Site
              <ExternalLink className="h-3 w-3 text-[#C58B55]" />
            </button>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-[#F5EBDD]">{children}</main>
      </div>
    </div>
  );
}
