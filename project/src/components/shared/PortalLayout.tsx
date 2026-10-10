import { useState, useEffect, type ReactNode } from 'react';
import {
  LayoutDashboard,
  User,
  Grid3x3,
  FileText,
  KeyRound,
  Bell,
  History,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Lock,
  Layers,
  FolderLock,
} from 'lucide-react';
import { FusionGridLogo } from '@/components/shared/FusionGridLogo';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PortalLayoutProps {
  currentPath: string;
  navigate: (to: string) => void;
  children: ReactNode;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/portal/dashboard' },
  { label: 'Profile', icon: User, path: '/portal/profile' },
  { label: 'Services', icon: Grid3x3, path: '/portal/services' },
  { label: 'Document Vault', icon: FolderLock, path: '/portal/vault' },
  { label: 'Applications', icon: FileText, path: '/portal/applications' },
  { label: 'Consent Management', icon: KeyRound, path: '/portal/consent' },
  { label: 'Notifications', icon: Bell, path: '/portal/notifications' },
  { label: 'History & Audit', icon: History, path: '/portal/history' },
];

export function PortalLayout({ currentPath, navigate, children }: PortalLayoutProps) {
  const { user, logout, unreadCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) =>
    currentPath === path || (path !== '/portal' && currentPath.startsWith(path + '/'));

  const getPageTitle = () => {
    const matched = navItems.find((n) => isActive(n.path));
    if (matched) return matched.label;
    if (currentPath.includes('/apply')) return 'Apply for Service';
    if (currentPath.includes('/applications/')) return 'Application Tracking';
    return 'Citizen Portal';
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#2B1B14] text-[#FFF9F0]">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#4A2E22] px-5 bg-[#21140F]">
        <button onClick={() => navigate('/')} className="flex items-center">
          <FusionGridLogo size="sm" variant="dark" />
        </button>
      </div>

      {/* Citizen Identity Card */}
      <div className="border-b border-[#4A2E22] p-4 bg-[#2B1B14]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6F4028] font-bold text-[#FFF9F0] shadow-md shadow-[#C58B55]/20 ring-1 ring-[#C58B55]/40">
            {user?.name?.charAt(0) ?? 'C'}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#2B1B14]" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#FFF9F0]">{user?.name || 'Citizen'}</p>
            <p className="truncate font-mono text-[11px] text-[#C58B55]">
              {user?.id || 'MH-CIT-2026'}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-[#4A2E22] bg-[#21140F] px-2.5 py-1.5 text-[11px] text-[#E8D5BF]">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C58B55]" />
            UIDAI & DigiLocker
          </span>
          <span className="font-bold text-emerald-400">Verified</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 scrollbar-thin">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C58B55]">
          Citizen Services
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
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                    active
                      ? 'bg-[#C58B55] text-[#2B1B14]'
                      : 'bg-[#6F4028] text-[#FFF9F0]'
                  )}
                >
                  {unreadCount}
                </span>
              )}
              {active && <ChevronRight className="h-3.5 w-3.5 text-[#C58B55]" />}
            </button>
          );
        })}

        {/* Quick action card in sidebar */}
        <div className="mt-4 rounded-xl border border-[#4A2E22] bg-[#21140F]/80 p-3 text-xs text-[#E8D5BF] shadow-inner">
          <div className="flex items-center gap-1.5 font-bold text-[#C58B55]">
            <Lock className="h-3.5 w-3.5 text-[#C58B55]" />
            Consent Guard
          </div>
          <p className="mt-1 text-[11px] text-[#D8C2AA] leading-relaxed">
            Your data is only shared with explicit, purpose-limited consent tokens.
          </p>
        </div>
      </nav>

      {/* Logout / Switch */}
      <div className="border-t border-[#4A2E22] p-3 bg-[#21140F]">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#D8C2AA] transition-colors hover:bg-[#38241B] hover:text-[#FFF9F0]"
        >
          <LogOut className="h-4 w-4 text-[#C58B55]" />
          <span>Sign Out</span>
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

      {/* Mobile sidebar overlay */}
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
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#D8C2AA] bg-[#FFF8ED] px-4 shadow-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-[#38241B] hover:bg-[#EAD8C2] lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <button
                onClick={() => navigate('/portal/dashboard')}
                className="text-[#755C49] hover:text-[#6F4028] transition-colors"
              >
                Citizen Portal
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-[#D8C2AA]" />
              <span className="font-bold text-[#38241B]">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Gateway Indicator */}
            <div className="hidden items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#F5EBDD] px-3 py-1 text-xs font-semibold text-[#6F4028] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#C58B55] animate-pulse" />
              Interoperability Mesh: Active
            </div>

            {/* Notification bell */}
            <button
              onClick={() => navigate('/portal/notifications')}
              className="relative rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-2 text-[#6F4028] transition-colors hover:bg-[#EAD8C2]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6F4028] px-1 text-[10px] font-bold text-[#FFF8ED]">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Public site link */}
            <button
              onClick={() => navigate('/')}
              className="hidden items-center gap-1.5 rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-1.5 text-xs font-semibold text-[#38241B] transition-colors hover:bg-[#EAD8C2] hover:text-[#6F4028] md:flex"
            >
              Public Site
              <ExternalLink className="h-3 w-3 text-[#C58B55]" />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-[#F5EBDD]">{children}</main>
      </div>
    </div>
  );
}
