import { useMemo } from 'react';
import {
  HeartPulse, CheckCircle2, AlertTriangle, XCircle, Wrench,
  Activity, ArrowRight, Shield, Server, Clock, Cpu,
  Sparkles,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { systemHealthItems } from '@/data/adminData';
import { useApp } from '@/context/AppContext';
import type { SystemHealthStatus } from '@/types';
import { cn } from '@/lib/utils';

interface SystemHealthProps {
  navigate: (to: string) => void;
}

const statusConfig: Record<SystemHealthStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string; dot: string }> = {
  operational: { label: 'Operational', icon: CheckCircle2, color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300', dot: 'bg-emerald-600' },
  degraded: { label: 'Degraded', icon: AlertTriangle, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]', dot: 'bg-[#C58B55]' },
  down: { label: 'Down', icon: XCircle, color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-300', dot: 'bg-rose-600' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-[#6F4028]', bg: 'bg-[#F5EBDD]', border: 'border-[#D8C2AA]', dot: 'bg-[#6F4028]' },
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

  const latencyData = healthItems
    .filter((s) => s.status !== 'maintenance')
    .map((s) => ({
      name: s.name.split(' ')[0],
      latency: s.latency,
      errorRate: s.errorRate,
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Server className="h-3.5 w-3.5" />
              HIGH-AVAILABILITY CLUSTER TELEMETRY
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Platform & Microservice Health Center
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Real-time heartbeat indicators, connection pool metrics, and latency percentiles across microservices.
              Targeting 99.95% uptime across all state gateways.
            </p>
          </div>

          <Button
            onClick={() => navigate('/admin/dashboard')}
            className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-md border-0 self-start md:self-auto"
          >
            Control Center Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary 4 Status Tiers */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['operational', 'degraded', 'down', 'maintenance'] as SystemHealthStatus[]).map((s) => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;

          return (
            <Card key={s} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', cfg.bg, cfg.border)}>
                  <Icon className={cn('h-6 w-6', cfg.color)} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-[#38241B]">{counts[s]}</p>
                  <p className="text-xs font-semibold text-[#755C49]">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Latency and Error Rate Bar Charts */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <CardTitle className="text-base font-bold text-[#38241B]">Subsystem Latency & Response Quality (ms)</CardTitle>
          <CardDescription className="text-xs text-[#755C49]">Monitored roundtrip packet latency per service cluster</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8C2AA" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#755C49', fontWeight: 600 }} stroke="#D8C2AA" />
              <YAxis tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" unit="ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF8ED',
                  borderColor: '#D8C2AA',
                  borderRadius: '14px',
                  fontSize: '12px',
                  color: '#38241B',
                }}
              />
              <Bar dataKey="latency" radius={[8, 8, 0, 0]} fill="#C58B55" name="Response (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Microservice Health Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {healthItems.map((item) => {
          const cfg = statusConfig[item.status];
          const Icon = cfg.icon;

          return (
            <Card key={item.name} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm transition-all hover:border-[#6F4028] hover:shadow-xl overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[#6F4028] via-[#C58B55] to-emerald-600" />
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-[#38241B]">{item.name}</h3>
                    <p className="font-mono text-xs text-[#755C49] mt-0.5">{item.apiCount} APIs • {item.id}</p>
                  </div>
                  <Badge variant="outline" className={cn('gap-1 text-xs font-bold', cfg.border, cfg.bg, cfg.color)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                    {cfg.label}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#755C49] font-medium">Rolling Uptime</span>
                    <span className="font-mono font-bold text-[#38241B]">{item.uptime}%</span>
                  </div>
                  <Progress value={item.uptime} className="h-2 rounded-full bg-[#F5EBDD] [&>div]:bg-[#6F4028]" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#D8C2AA]/40 pt-3">
                  <div>
                    <span className="text-[#755C49] text-[11px] font-medium">Roundtrip Latency</span>
                    <p className="font-mono font-bold text-[#38241B] mt-0.5">{item.latency}ms</p>
                  </div>
                  <div>
                    <span className="text-[#755C49] text-[11px] font-medium">Error Rate</span>
                    <p className="font-mono font-bold text-[#38241B] mt-0.5">{item.errorRate}%</p>
                  </div>
                </div>

                <div className="text-[11px] text-[#755C49] truncate border-t border-[#D8C2AA]/40 pt-2 font-mono">
                  Latest: {item.lastIncident}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
