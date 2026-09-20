import {
  FileText, CheckCircle2, Clock, Bell, ArrowRight, MapPin,
  ShieldCheck, TrendingUp, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';

interface DashboardProps {
  navigate: (to: string) => void;
}

export function CitizenDashboard({ navigate }: DashboardProps) {
  const { applications, notifications, unreadCount, citizenProfile, user } = useApp();

  const citizenName = citizenProfile?.full_name || user?.name || 'Citizen';
  const citizenId = user?.id ? `${user.id.slice(0, 8)}…` : '—';
  const district = citizenProfile?.district || '—';

  // Draft records are temporary records created while a citizen is
  // filling an application. They must not appear on the dashboard.
  const submittedApplications = applications.filter(
    (app) => app.status !== 'draft'
  );

  const activeCount = submittedApplications.filter(
    (a) => a.status === 'under_verification' || a.status === 'processing' || a.status === 'submitted'
  ).length;

  const completedCount = submittedApplications.filter(
    (a) => a.status === 'approved'
  ).length;

  const pendingActions = notifications.filter((n) => n.type === 'action' && !n.read).length;

  const metrics = [
    { label: 'Active Applications', value: activeCount, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Actions', value: pendingActions, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Notifications', value: unreadCount, icon: Bell, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Welcome back, {citizenName.split(' ')[0]}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-mono text-xs">{citizenId}</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {district}
          </span>
          <span className="flex items-center gap-1 text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Profile
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-border/60 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                    <p className="mt-1 font-display text-3xl font-bold">{m.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${m.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Applications + Quick Actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Applications */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your Applications</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/portal/applications')} className="gap-1 text-muted-foreground">
              View all
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {submittedApplications.map((app, i) => (
              <Card
                key={app.id}
                className="cursor-pointer border-border/60 transition-all hover:shadow-md animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/portal/applications/${app.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold">{app.serviceName}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{app.id}</p>
                      {app.requestId && (
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground/70">Request: {app.requestId}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-2">
                        <Progress value={app.progress} className="h-2 w-24" />
                        <span className="text-sm font-semibold">{app.progress}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {submittedApplications.length === 0 && (
              <Card className="border-border/60">
                <CardContent className="py-10 text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No submitted applications yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-5">
              <h3 className="font-display font-semibold">Quick Actions</h3>
              <div className="mt-3 space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/portal/services')}>
                  <FileText className="h-4 w-4" />
                  Apply for New Service
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/portal/consent')}>
                  <ShieldCheck className="h-4 w-4" />
                  Manage Consents
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/portal/notifications')}>
                  <Bell className="h-4 w-4" />
                  View Notifications
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Recent Notifications</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/portal/notifications')} className="text-xs">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-2.5">
                  <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-muted' : 'bg-primary'}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Impact card */}
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <h3 className="font-display text-sm font-semibold">Your Impact</h3>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                With FusionGrid, you've saved an estimated <span className="font-semibold text-foreground">3 duplicate submissions</span> and <span className="font-semibold text-foreground">12 days</span> in processing time.
              </p>
              <Button variant="ghost" size="sm" className="mt-3 gap-1 px-0 text-accent hover:text-accent" onClick={() => navigate('/portal/history')}>
                See details
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
