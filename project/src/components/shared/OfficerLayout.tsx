import { useState, useEffect, type ReactNode } from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  FileSearch,
  ShieldCheck,
  Gauge,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Building2,
  ExternalLink,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { FusionGridLogo } from '@/components/shared/FusionGridLogo';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { officerInfo } from '@/data/mockData';

interface OfficerLayoutProps {
  currentPath: string;
  navigate: (to: string) => void;
  children: ReactNode;
}

const navItems = [
  { label: 'Officer Dashboard', icon: LayoutDashboard, path: '/officer/dashboard' },
  { label: 'Application Queue', icon: ListOrdered, path: '/officer/queue' },
  { label: 'Application Review', icon: FileSearch, path: '/officer/review' },
  { label: 'Verification Center', icon: ShieldCheck, path: '/officer/verification' },
  { label: 'SLA Monitoring', icon: Gauge, path: '/officer/sla' },
  { label: 'Workflow Monitor', icon: Activity, path: '/officer/workflow' },
];

export function OfficerLayout({ currentPath, navigate, children }: OfficerLayoutProps) {
  const { user, logout, applications } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) =>
    currentPath === path || (path !== '/officer' && currentPath.startsWith(path + '/'));

  const pendingCount = applications.filter(
    (a) => a.status === 'under_verification' || a.status === 'submitted' || a.status === 'processing'
  ).length;

  const getPageTitle = () => {
    const matched = navItems.find((n) => isActive(n.path));
    if (matched) return matched.label;
    if (currentPath.includes('/review/')) return 'Application Review';
    return 'Officer Console';
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#2B1B14] text-[#FFF9F0]">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#4A2E22] px-5 bg-[#21140F]">
        <button onClick={() => navigate('/')} className="flex items-center">
          <FusionGridLogo size="sm" variant="dark" />
        </button>
      </div>

      {/* Officer Credential Card */}
      <div className="border-b border-[#4A2E22] p-4 bg-[#2B1B14]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6F4028] font-bold text-[#FFF9F0] shadow-md shadow-[#C58B55]/20 ring-1 ring-[#C58B55]/40">
            {user?.name?.charAt(0) ?? 'O'}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#C58B55] ring-2 ring-[#2B1B14]" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#FFF9F0]">{user?.name || officerInfo.name}</p>
            <p className="truncate font-mono text-[11px] text-[#C58B55]">
              {user?.id || 'MH-REV-OFF-2026'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[#4A2E22] bg-[#21140F] px-2.5 py-1.5 text-[11px] text-[#E8D5BF]">
          <span className="flex items-center gap-1.5 truncate font-medium">
            <Building2 className="h-3.5 w-3.5 text-[#C58B55] shrink-0" />
            {user?.department || officerInfo.department}
          </span>
          <span className="font-bold text-emerald-400 shrink-0">Level 2</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 scrollbar-thin">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C58B55]">
          Verification & Approvals
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
              {item.label === 'Application Queue' && pendingCount > 0 && (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                    active
                      ? 'bg-[#C58B55] text-[#2B1B14]'
                      : 'bg-[#6F4028] text-[#FFF9F0]'
                  )}
                >
                  {pendingCount}
                </span>
              )}
              {active && <ChevronRight className="h-3.5 w-3.5 text-[#C58B55]" />}
            </button>
          );
        })}

        {/* SLA Notice Card */}
        <div className="mt-4 rounded-xl border border-[#4A2E22] bg-[#21140F]/80 p-3 text-xs text-[#E8D5BF] shadow-inner">
          <div className="flex items-center gap-1.5 font-bold text-[#C58B55]">
            <Clock className="h-3.5 w-3.5 text-[#C58B55]" />
            7-Day Statutory SLA
          </div>
          <p className="mt-1 text-[11px] text-[#D8C2AA] leading-relaxed">
            Revenue & Higher Education verifications are monitored under state SLA guidelines.
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
          <span>Exit Officer Console</span>
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

      {/* Main Content Area */}
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
                onClick={() => navigate('/officer/dashboard')}
                className="text-[#755C49] hover:text-[#6F4028] transition-colors"
              >
                Officer Console
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-[#D8C2AA]" />
              <span className="font-bold text-[#38241B]">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Queue Counter Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-1 text-xs font-bold text-[#6F4028]">
              <AlertCircle className="h-3.5 w-3.5 text-[#C58B55]" />
              <span>Pending Action: {pendingCount}</span>
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

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-[#F5EBDD]">{children}</main>
      </div>
    </div>
  );
}
