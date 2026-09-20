import { Bell, CheckCheck, CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface NotificationsProps {
  navigate: (to: string) => void;
}

const typeConfig = {
  success: { icon: CheckCircle2, color: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200' },
  info: { icon: Info, color: 'bg-blue-500', bg: 'bg-blue-50 border-blue-200' },
  warning: { icon: AlertCircle, color: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200' },
  action: { icon: AlertCircle, color: 'bg-orange-500', bg: 'bg-orange-50 border-orange-200' },
};

export function NotificationsPage({ navigate }: NotificationsProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={markAllNotificationsRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;
          return (
            <Card
              key={n.id}
              className={cn(
                'border-border/60 cursor-pointer transition-all hover:shadow-md animate-fade-in-up',
                !n.read && 'border-l-4 border-l-primary',
                n.type === 'action' && !n.read && 'border-l-orange-500'
              )}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.applicationId) navigate(`/portal/applications/${n.applicationId}`);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white', config.color)}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={cn('text-sm', n.read ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground')}>
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className={cn('mt-1 text-sm', n.read ? 'text-muted-foreground/70' : 'text-muted-foreground')}>
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                        <Clock className="h-3 w-3" />
                        {n.timestamp}
                      </span>
                      {n.type === 'action' && !n.read && (
                        <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
                          Action Required
                        </Badge>
                      )}
                      {n.applicationId && (
                        <span className="font-mono text-xs text-muted-foreground/60">{n.applicationId}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <Card className="border-border/60">
          <CardContent className="p-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No notifications yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
