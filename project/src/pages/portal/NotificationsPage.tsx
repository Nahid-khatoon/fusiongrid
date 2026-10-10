import { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
  Filter,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface NotificationsProps {
  navigate: (to: string) => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
    label: 'Verified / Granted',
  },
  info: {
    icon: Info,
    color: 'bg-[#F5EBDD] text-[#6F4028] border-[#D8C2AA]',
    dot: 'bg-[#6F4028]',
    label: 'Status Update',
  },
  warning: {
    icon: AlertCircle,
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    dot: 'bg-amber-600',
    label: 'Important Notice',
  },
  action: {
    icon: AlertCircle,
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    dot: 'bg-rose-600',
    label: 'Action Required',
  },
};

export function NotificationsPage({ navigate }: NotificationsProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread' | 'action'>('all');

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.read;
      if (filter === 'action') return n.type === 'action';
      return true;
    });
  }, [notifications, filter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Bell className="h-3.5 w-3.5" />
              CITIZEN TELEMETRY FEED
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Notifications & Interoperability Feed
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''} regarding departmental verifications and application milestones.`
                : 'All your inter-departmental notification alerts are up to date.'}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={markAllNotificationsRead}
              className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-md border-0 self-start md:self-auto"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D8C2AA] pb-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `All Alerts (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'action', label: 'Action Required' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200',
                filter === tab.id
                  ? 'border-[#6F4028] bg-[#6F4028] text-[#FFF8ED] shadow-sm'
                  : 'border-[#D8C2AA] bg-[#FFF8ED] text-[#755C49] hover:border-[#6F4028] hover:bg-[#EAD8C2] hover:text-[#38241B]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#755C49] font-mono">
          Showing {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filtered.map((n, i) => {
          const config = typeConfig[n.type] || typeConfig.info;
          const Icon = config.icon;
          return (
            <Card
              key={n.id}
              className={cn(
                'group cursor-pointer border-[#D8C2AA] bg-[#FFF8ED] transition-all duration-200 hover:border-[#6F4028] hover:shadow-md animate-fade-in-up overflow-hidden',
                !n.read && 'border-l-4 border-l-[#6F4028] bg-[#FFF9F0]'
              )}
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.applicationId) navigate(`/portal/applications/${n.applicationId}`);
              }}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs',
                      config.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3
                          className={cn(
                            'font-display text-sm font-bold',
                            n.read ? 'text-[#38241B]' : 'text-[#2B1B14] font-extrabold'
                          )}
                        >
                          {n.title}
                        </h3>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-[#6F4028] animate-pulse" />
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-[#755C49] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {n.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#755C49] leading-relaxed">
                      {n.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 pt-2">
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] font-bold', config.color)}
                      >
                        {config.label}
                      </Badge>
                      {n.applicationId && (
                        <span className="font-mono text-xs text-[#6F4028] font-bold flex items-center gap-1 group-hover:underline">
                          Inspect Application ({n.applicationId}) <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="border-[#D8C2AA] bg-[#FFF8ED]">
            <CardContent className="py-20 text-center text-[#755C49]">
              <Bell className="mx-auto h-12 w-12 text-[#755C49]/30 mb-3" />
              <h4 className="font-bold text-[#38241B] text-base">No Notifications Found</h4>
              <p className="mt-1 text-xs text-[#755C49] max-w-sm mx-auto">
                No alerts match the selected filter. Real-time updates will automatically appear here as your applications are processed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
