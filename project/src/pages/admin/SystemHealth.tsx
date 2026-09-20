import { useMemo } from 'react';
import {
  HeartPulse, CheckCircle2, AlertTriangle, XCircle, Wrench,
  Activity, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { systemHealthItems } from '@/data/adminData';
import { useApp } from '@/context/AppContext';
import type { SystemHealthStatus } from '@/types';
import { cn } from '@/lib/utils';

interface SystemHealthProps {
  navigate: (to: string) => void;
}

const statusConfig: Record<SystemHealthStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string; dot: string }> = {
  operational: { label: 'Operational', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  degraded: { label: 'Degraded', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  down: { label: 'Down', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const matchesDepartment = (serviceName: string, eventDepartment?: string) => {
  if (!eventDepartment) return false;
  const a = normalize(serviceName);
  const b = normalize(eventDepartment);
  if (a === b || a.includes(b) || b.includes(a)) return true;

  const aliases: Record<string, string[]> = {
    identityservice: ['identity', 'identityservice'],
    identity: ['identity', 'identityservice'],
    revenuedepartment: ['revenue', 'revenuedepartment'],
    revenue: ['revenue', 'revenuedepartment'],
    educationdepartment: ['education', 'educationdepartment'],
    education: ['education', 'educationdepartment'],
    healthdepartment: ['health', 'healthdepartment'],
    health: ['health', 'healthdepartment'],
    socialwelfare: ['welfare', 'socialwelfare', 'socialwelfaredepartment'],
    welfare: ['welfare', 'socialwelfare', 'socialwelfaredepartment'],
    treasurydepartment: ['treasury', 'treasurydepartment'],
    treasury: ['treasury', 'treasurydepartment'],
    transportdepartment: ['transport', 'transportdepartment'],
    transport: ['transport', 'transportdepartment'],
    consentmanager: ['consent', 'consentmanager'],
    notificationservice: ['notification', 'notificationservice'],
    dataqualityengine: ['dataquality', 'dataqualityengine'],
  };

  return (aliases[a] ?? []).some((alias) => b.includes(alias)) ||
    (aliases[b] ?? []).some((alias) => a.includes(alias));
};

const isFailureEvent = (event: { type?: string; detail?: string }) =>
  event.type === 'ApiFailure' || /fail|error|timeout|down/i.test(event.detail || '');

export function SystemHealth({ navigate }: SystemHealthProps) {
  const { systemEvents, apiFailures } = useApp();

  const healthItems = useMemo(() => {
    return systemHealthItems.map((item) => {
      const relatedEvents = systemEvents.filter((event) =>
        matchesDepartment(item.name, event.department)
      );

      const relatedFailures = apiFailures.filter((failure) =>
        matchesDepartment(item.name, failure.department)
      );

      const failureEvents = relatedEvents.filter(isFailureEvent);
      const activeFailure = relatedFailures.find((failure) => failure.isDown && failure.retryState !== 'recovered');
      const recoveredFailure = relatedFailures.find((failure) => failure.retryState === 'recovered');

      const totalCalls = relatedEvents.length;
      const failedCalls = failureEvents.length + relatedFailures.filter((failure) => failure.retryState !== 'recovered').length;
      const errorRate = totalCalls > 0
        ? Number(Math.min(99.9, (failedCalls / totalCalls) * 100).toFixed(1))
        : item.errorRate;

      let status = item.status as SystemHealthStatus;
      let lastIncident = item.lastIncident;

      if (item.status !== 'maintenance') {
        if (activeFailure) {
          status = 'down';
          lastIncident = `${activeFailure.message} · Retry ${activeFailure.retryState}`;
        } else if (errorRate > 5 || failureEvents.length >= 2) {
          status = 'degraded';
          lastIncident = `${failureEvents.length + relatedFailures.length} failure event(s) recorded`;
        } else if (recoveredFailure) {
          status = 'operational';
          lastIncident = `Recovered · ${recoveredFailure.timestamp}`;
        } else if (totalCalls > 0) {
          status = 'operational';
          lastIncident = `${totalCalls} live event${totalCalls === 1 ? '' : 's'} recorded`;
        }
      }

      const uptime = totalCalls > 0
        ? Number(Math.max(0, 100 - errorRate).toFixed(2))
        : item.uptime;

      return {
        ...item,
        status,
        errorRate,
        uptime,
        lastIncident,
        liveRequests: totalCalls,
        liveFailures: failedCalls,
      };
    });
  }, [systemEvents, apiFailures]);

  const counts = useMemo(() => ({
    operational: healthItems.filter((s) => s.status === 'operational').length,
    degraded: healthItems.filter((s) => s.status === 'degraded').length,
    down: healthItems.filter((s) => s.status === 'down').length,
    maintenance: healthItems.filter((s) => s.status === 'maintenance').length,
  }), [healthItems]);

  const revenueFailure = apiFailures.find((f) => f.department === 'Revenue Department');
  const revenueIsDown = !!revenueFailure?.isDown && revenueFailure.retryState !== 'recovered';

  const latencyData = healthItems
    .filter((s) => s.status !== 'maintenance')
    .map((s) => ({
      name: s.name.split(' ')[0],
      latency: s.latency,
      errorRate: s.errorRate,
    }));

  const overallState: SystemHealthStatus = counts.down > 0
    ? 'down'
    : counts.degraded > 0
      ? 'degraded'
      : 'operational';

  const overallCfg = statusConfig[overallState];
  const OverallIcon = overallCfg.icon;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">System Health</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live health derived from FusionGrid API events, failures, and connector activity.
        </p>
      </div>

      <Card className={cn('mb-6 border-border/60 animate-fade-in-up', overallState !== 'operational' && overallCfg.border)}>
        <CardContent className="flex items-center gap-4 p-5">
          <div className={cn('flex h-14 w-14 items-center justify-center rounded-xl', overallCfg.bg)}>
            <OverallIcon className={cn('h-7 w-7', overallCfg.color)} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">
              {counts.down > 0 ? 'System Down — Active Failure' : counts.degraded > 0 ? 'Some Systems Degraded' : 'All Systems Operational'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {counts.operational} operational · {counts.degraded} degraded · {counts.down} down · {counts.maintenance} maintenance
            </p>
          </div>
        </CardContent>
      </Card>

      {revenueIsDown && (
        <Card className="mb-6 border-red-200 bg-red-50/50 animate-fade-in-up">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-900">Revenue API is DOWN</p>
                <p className="mt-1 text-xs text-red-700">{revenueFailure?.message}</p>
                <p className="mt-1 text-xs text-blue-700">{revenueFailure?.citizenMessage}</p>
                <p className="mt-1 text-xs text-muted-foreground">Request ID: {revenueFailure?.requestId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base">Latency & Error Rate by Service</CardTitle>
          <CardDescription>
            Error rates update from live FusionGrid events. Latency uses the configured service baseline until request-level latency telemetry is recorded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" angle={-20} textAnchor="end" height={60} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" unit="ms" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" unit="%" />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="latency" fill="hsl(210 80% 50%)" radius={[4, 4, 0, 0]} name="Latency (ms)" />
              <Bar yAxisId="right" dataKey="errorRate" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} name="Error Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
        {healthItems.map((item) => {
          const cfg = statusConfig[item.status];
          const liveItem = item as typeof item & { liveRequests: number; liveFailures: number };

          return (
            <Card key={item.id} className={cn('border-border/60', item.status !== 'operational' && cfg.border)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', cfg.bg)}>
                      <HeartPulse className={cn('h-5 w-5', cfg.color)} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.apiCount} API{item.apiCount > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                    <Badge variant="outline" className={cn(cfg.bg, cfg.color)}>{cfg.label}</Badge>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <p className="text-sm font-bold">{item.uptime > 0 ? `${item.uptime}%` : '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Uptime</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <p className="text-sm font-bold">{item.latency > 0 ? `${item.latency}ms` : '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Latency</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <p className={cn('text-sm font-bold', item.errorRate > 5 && 'text-red-600', item.errorRate > 1 && item.errorRate <= 5 && 'text-amber-600')}>
                      {item.errorRate < 100 ? `${item.errorRate}%` : '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Errors</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 min-w-0">
                    <Activity className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.lastIncident}</span>
                  </div>
                  {liveItem.liveRequests > 0 && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {liveItem.liveRequests} live
                    </Badge>
                  )}
                </div>

                {liveItem.liveFailures > 0 && (
                  <p className="mt-2 text-xs text-red-600">
                    {liveItem.liveFailures} live failure{liveItem.liveFailures === 1 ? '' : 's'} recorded
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')} className="gap-1">
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
