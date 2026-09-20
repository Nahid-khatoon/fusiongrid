import { useState, useEffect, type ReactNode } from 'react';
import {
  LayoutDashboard, User, Grid3x3, FileText, KeyRound, Bell,
  History, LogOut, Menu, X, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { FusionGridLogo } from '@/components/shared/FusionGridLogo';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
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
  { label: 'Applications', icon: FileText, path: '/portal/applications' },
  { label: 'Consent', icon: KeyRound, path: '/portal/consent' },
  { label: 'Notifications', icon: Bell, path: '/portal/notifications' },
  { label: 'History', icon: History, path: '/portal/history' },
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

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-5">
        <button onClick={() => navigate('/')} className="flex items-center">
          <FusionGridLogo size="sm" />
        </button>
      </div>

      {/* User info */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
            {user?.name?.charAt(0) ?? 'C'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.id}</p>
          </div>
        </div>
        <Badge variant="outline" className="mt-3 w-full justify-center gap-1.5 border-accent/30 bg-accent/5 text-accent">
          <ShieldCheck className="h-3 w-3" />
          Verified Citizen
        </Badge>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('h-4.5 w-4.5', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <span className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold',
                  active ? 'bg-primary-foreground text-primary' : 'bg-destructive text-destructive-foreground'
                )}>
                  {unreadCount}
                </span>
              )}
              {active && <ChevronRight className="h-4 w-4" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/20">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-card shadow-xl lg:hidden animate-slide-in-right">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
          <button onClick={() => navigate('/')} className="flex items-center">
            <FusionGridLogo size="sm" />
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-md p-2 text-foreground">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
