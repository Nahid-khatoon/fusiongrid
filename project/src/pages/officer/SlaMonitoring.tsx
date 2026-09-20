import {
  Gauge, CheckCircle2, Clock, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SlaBadge } from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';
import type { SlaStatus, SlaItem, Application } from '@/types';
import { cn } from '@/lib/utils';

interface SlaMonitoringProps {
  navigate: (to: string) => void;
}

const slaDaysByService: Record<string, number> = {
  'MahaScholarship': 20,
  'Income Certificate': 10,
  'Student Education Benefit': 15,
  'Social Welfare Scheme': 30,
  'Health Assistance Scheme': 7,
};

const defaultSlaDays = 15;

function computeSlaItems(applications: Application[], citizenMap: Record<string, { name: string; district: string }>): SlaItem[] {
  const now = new Date('2026-08-25T00:00:00');

  return applications
    .filter((a) => a.status !== 'approved' && a.status !== 'rejected')
    .map((a) => {
      const totalSlaDays = slaDaysByService[a.serviceName] ?? defaultSlaDays;
      const submitted = new Date(a.submittedAt);
      const slaDeadline = new Date(submitted);
      slaDeadline.setDate(slaDeadline.getDate() + totalSlaDays);
      const diffMs = slaDeadline.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let slaStatus: SlaStatus;
      if (daysRemaining < 0) slaStatus = 'breached';
      else if (daysRemaining <= 2) slaStatus = 'due_soon';
      else slaStatus = 'on_track';

      return {
        applicationId: a.id,
        serviceName: a.serviceName,
        citizenName: citizenMap[a.id]?.name ?? 'Unknown',
        submittedAt: a.submittedAt,
        slaDeadline: slaDeadline.toISOString(),
        slaStatus,
        daysRemaining,
        totalSlaDays,
      };
    });
}

export function SlaMonitoring({ navigate }: SlaMonitoringProps) {
  const { applications, citizenMap } = useApp();
  const slaItems = computeSlaItems(applications, citizenMap);

  const onTrack = slaItems.filter((s) => s.slaStatus === 'on_track');
  const dueSoon = slaItems.filter((s) => s.slaStatus === 'due_soon');
  const breached = slaItems.filter((s) => s.slaStatus === 'breached');

  const summary = [
    { label: 'On Track', value: onTrack.length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', status: 'on_track' as SlaStatus },
    { label: 'Due Soon', value: dueSoon.length, icon: Clock, color: 'text-amber-600 bg-amber-50', status: 'due_soon' as SlaStatus },
    { label: 'Breached', value: breached.length, icon: AlertTriangle, color: 'text-red-600 bg-red-50', status: 'breached' as SlaStatus },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">SLA Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Track service level agreement compliance across all applications
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {summary.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/60 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                    <p className="mt-1 font-display text-3xl font-bold">{s.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Breached - most urgent */}
      {breached.length > 0 && (
        <div className="mb-6">
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <AlertTriangle className="h-5 w-5" />
                SLA Breached ({breached.length})
              </CardTitle>
              <CardDescription>These applications have exceeded their SLA deadline and require immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {breached.map((item) => (
                <SlaRow key={item.applicationId} item={item} navigate={navigate} urgent />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Due Soon */}
      {dueSoon.length > 0 && (
        <div className="mb-6">
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                <Clock className="h-5 w-5" />
                Due Soon ({dueSoon.length})
              </CardTitle>
              <CardDescription>Applications approaching their SLA deadline within 2 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {dueSoon.map((item) => (
                <SlaRow key={item.applicationId} item={item} navigate={navigate} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* On Track */}
      <div>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              On Track ({onTrack.length})
            </CardTitle>
            <CardDescription>Applications within their SLA timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {onTrack.map((item) => (
              <SlaRow key={item.applicationId} item={item} navigate={navigate} />
            ))}
            {onTrack.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No applications on track.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SlaRow({ item, navigate, urgent }: {
  item: SlaItem;
  navigate: (to: string) => void;
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:shadow-md',
        urgent && 'border-destructive/20 bg-destructive/5'
      )}
      onClick={() => navigate(`/officer/review/${item.applicationId}`)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold">{item.applicationId}</span>
          <SlaBadge status={item.slaStatus} />
        </div>
        <p className="mt-0.5 text-sm font-medium">{item.serviceName}</p>
        <p className="text-xs text-muted-foreground">{item.citizenName}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">SLA Deadline</p>
        <p className="text-sm font-semibold">{new Date(item.slaDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
        <p className={cn(
          'text-xs font-medium',
          item.daysRemaining < 0 ? 'text-destructive' : item.daysRemaining <= 2 ? 'text-amber-600' : 'text-emerald-600'
        )}>
          {item.daysRemaining < 0 ? `Overdue ${Math.abs(item.daysRemaining)}d` : `${item.daysRemaining}d left`}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
