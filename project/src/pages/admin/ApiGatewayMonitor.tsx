import { useMemo, useState } from 'react';
import {
  Activity, Search, Filter, CheckCircle2, XCircle, Clock,
  ArrowRight, Zap, AlertTriangle, Radio, Shield, Terminal,
  RefreshCw, Cpu, Server, Check, Sparkles, Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import type { ApiCallStatus, EventType, SystemEvent } from '@/types';
import { cn } from '@/lib/utils';

interface ApiGatewayMonitorProps {
  navigate: (to: string) => void;
}

interface LiveApiLog {
  id: string;
  requestId: string;
  source: string;
  destination: string;
  department: string;
  endpoint: string;
  method: 'GET' | 'POST';
  timestamp: string;
  latency?: number;
  status: ApiCallStatus;
}

const statusConfig: Record<ApiCallStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  success: { label: '200 OK', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  failure: { label: '500 Fault', icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300' },
  timeout: { label: '504 Timeout', icon: Clock, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]' },
  pending: { label: 'Processing', icon: Activity, color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]' },
};

const defaultDepartments = [
  'Identity Service',
  'Revenue Department',
  'Education Department',
  'Health Department',
  'Social Welfare',
  'FusionGrid',
  'Consent Manager',
];

const defaultEndpoints = [
  '/api/identity/verify',
  '/api/revenue/income',
  '/api/education/student',
  '/api/health/eligibility',
  '/api/scholarship/apply',
  '/api/applications',
  '/api/consent',
  '/api/notifications',
];

const timeFilters = ['all', 'last_15m', 'last_1h', 'last_3h'];

const eventConfig: Record<string, { department: string; endpoint: string; method: 'GET' | 'POST'; status: ApiCallStatus }> = {
  ApplicationSubmitted: {
    department: 'Social Welfare',
    endpoint: '/api/scholarship/apply',
    method: 'POST',
    status: 'success',
  },
  IncomeVerified: {
    department: 'Revenue Department',
    endpoint: '/api/revenue/income',
    method: 'GET',
    status: 'success',
  },
  StudentVerified: {
    department: 'Education Department',
    endpoint: '/api/education/student',
    method: 'GET',
    status: 'success',
  },
  ApplicationApproved: {
    department: 'Social Welfare',
    endpoint: '/api/applications',
    method: 'POST',
    status: 'success',
  },
  ApplicationRejected: {
    department: 'Social Welfare',
    endpoint: '/api/applications',
    method: 'POST',
    status: 'failure',
  },
  ConsentGranted: {
    department: 'Consent Manager',
    endpoint: '/api/consent',
    method: 'POST',
    status: 'success',
  },
  ConsentRevoked: {
    department: 'Consent Manager',
    endpoint: '/api/consent',
    method: 'POST',
    status: 'success',
  },
  ApiFailure: {
    department: 'Revenue Department',
    endpoint: '/api/revenue/income',
    method: 'GET',
    status: 'failure',
  },
};

const resolveDepartment = (event: SystemEvent, config: { department: string }) => {
  if (!event.department) return config.department;
  return event.department;
};

const toTimestamp = (value: string) => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const buildLiveLog = (event: SystemEvent): LiveApiLog | null => {
  const config = eventConfig[event.type as EventType];
  if (!config) return null;

  const department = resolveDepartment(event, config);

  return {
    id: event.id,
    requestId: `REQ-${event.id.replace(/[^a-zA-Z0-9-]/g, '').slice(-10).toUpperCase()}`,
    source: 'FusionGrid Gateway',
    destination: department,
    department,
    endpoint: config.endpoint,
    method: config.method,
    timestamp: event.timestamp,
    status: config.status,
  };
};

export function ApiGatewayMonitor({ navigate }: ApiGatewayMonitorProps) {
  const {
    systemEvents,
    apiFailures,
    simulateRevenueFailure,
    resetRevenueFailure,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApiCallStatus | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [endpointFilter, setEndpointFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const revenueFailure = apiFailures.find((f) => f.department === 'Revenue Department');

  const allLogs = useMemo<LiveApiLog[]>(() => {
    const eventLogs = systemEvents
      .map(buildLiveLog)
      .filter((log): log is LiveApiLog => log !== null);

    const failureLogs: LiveApiLog[] = apiFailures.map((failure) => {
      const fallbackRequestId = `REQ-${failure.department}-${failure.timestamp}`;

      return {
        id: `failure-${failure.requestId ?? fallbackRequestId}`,
        requestId: failure.requestId ?? fallbackRequestId,
        source: 'FusionGrid Gateway',
        destination: failure.department,
        department: failure.department,
        endpoint: failure.endpoint ?? '/api/revenue/income',
        method: 'GET',
        timestamp: failure.timestamp,
        status: failure.retryState === 'recovered' ? 'success' : 'failure',
      };
    });

    const merged = [...eventLogs, ...failureLogs];
    const seen = new Set<string>();

    return merged
      .filter((log) => {
        const key = `${log.requestId}-${log.status}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => toTimestamp(b.timestamp) - toTimestamp(a.timestamp));
  }, [systemEvents, apiFailures]);

  const departments = useMemo(() => {
    const live = allLogs.map((log) => log.department).filter(Boolean);
    return ['all', ...Array.from(new Set([...defaultDepartments, ...live]))];
  }, [allLogs]);

  const endpoints = useMemo(() => {
    const live = allLogs.map((log) => log.endpoint).filter(Boolean);
    return ['all', ...Array.from(new Set([...defaultEndpoints, ...live]))];
  }, [allLogs]);

  const filtered = useMemo(() => {
    const now = Date.now();

    return allLogs.filter((log) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        log.requestId.toLowerCase().includes(query) ||
        log.endpoint.toLowerCase().includes(query) ||
        log.department.toLowerCase().includes(query) ||
        log.destination.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
      const matchesDept = deptFilter === 'all' || log.department === deptFilter;
      const matchesEndpoint = endpointFilter === 'all' || log.endpoint === endpointFilter;

      let matchesTime = true;
      const timestamp = toTimestamp(log.timestamp);

      if (timeFilter === 'last_15m') {
        matchesTime = timestamp > 0 && now - timestamp < 15 * 60 * 1000;
      } else if (timeFilter === 'last_1h') {
        matchesTime = timestamp > 0 && now - timestamp < 60 * 60 * 1000;
      } else if (timeFilter === 'last_3h') {
        matchesTime = timestamp > 0 && now - timestamp < 3 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesDept && matchesEndpoint && matchesTime;
    });
  }, [allLogs, search, statusFilter, deptFilter, endpointFilter, timeFilter]);

  const stats = useMemo(() => ({
    success: allLogs.filter((log) => log.status === 'success').length,
    failure: allLogs.filter((log) => log.status === 'failure').length,
    timeout: allLogs.filter((log) => log.status === 'timeout').length,
    pending: allLogs.filter((log) => log.status === 'pending').length,
  }), [allLogs]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              API TELEMETRY STREAM
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              API Gateway Real-Time Monitor
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Transparent transaction telemetry, sub-second latency audits, and circuit-breaker chaos fault simulator.
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

      {/* Simulated Interoperability Architecture Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#C58B55]/40 bg-[#FFF9F0] p-4 text-xs shadow-sm">
        <Shield className="h-5 w-5 text-[#C58B55] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[#786453]">
          <span className="font-bold text-[#2B1B14]">
            Simulated Interoperability & Fictional Department Connectors Environment:
          </span>
          <p>
            In accordance with Government of Maharashtra architecture guidelines, all gateway transactions, latency metrics, and connector health indicators below are safely executed through simulated mock adapters (Identity, Revenue, Education, Health, Social Welfare). No real government databases or unauthorized APIs are accessed.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['success', 'failure', 'timeout', 'pending'] as ApiCallStatus[]).map((s) => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;

          return (
            <Card key={s} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', cfg.bg, cfg.border)}>
                  <Icon className={cn('h-6 w-6', cfg.color)} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-[#38241B]">{stats[s]}</p>
                  <p className="text-xs font-semibold text-[#755C49]">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chaos Engineering / Reliability Testing Sandbox */}
      <Card className="border-[#C58B55]/50 bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C58B55]/20 text-[#6F4028] border border-[#D8C2AA]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#38241B]">SIH 2026 Chaos Engineering & Fault Simulation</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">
                  Inject simulated upstream Revenue API outages to verify asynchronous queue isolation and zero data loss
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                onClick={simulateRevenueFailure}
                disabled={!!revenueFailure?.isDown}
                className="text-xs font-bold shadow-md bg-rose-700 hover:bg-rose-800 text-white border-0"
                size="sm"
              >
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                Inject Revenue API Outage
              </Button>

              <Button
                onClick={resetRevenueFailure}
                variant="outline"
                size="sm"
                disabled={!revenueFailure}
                className="text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2] font-semibold"
              >
                Reset Connector State
              </Button>
            </div>
          </div>
        </CardHeader>

        {revenueFailure && (
          <CardContent className="p-6 space-y-3">
            <div className={cn(
              'rounded-2xl border p-4 text-xs transition-all',
              revenueFailure.retryState === 'recovered'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                : 'border-rose-300 bg-rose-50 text-rose-950'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold">
                  {revenueFailure.retryState === 'recovered' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-rose-700" />
                  )}
                  <span>{revenueFailure.message}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-mono text-[10px] font-bold',
                    revenueFailure.retryState === 'recovered' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-rose-300 bg-rose-100 text-rose-800'
                  )}
                >
                  {revenueFailure.retryState === 'recovered' ? 'CIRCUIT RECOVERED' : 'CIRCUIT TRIPPED (ISOLATED)'}
                </Badge>
              </div>

              <p className="mt-2 text-xs text-[#755C49]">
                Affected URI: <code className="font-mono text-[#38241B] font-bold">{revenueFailure.endpoint}</code> · Citizen Request: <code className="font-mono text-[#38241B] font-bold">{revenueFailure.requestId}</code>
              </p>

              {revenueFailure.history.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-[#D8C2AA]/40 pt-2.5 font-mono text-[11px]">
                  {revenueFailure.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#755C49]">
                      <span className="text-[#38241B] font-semibold">{h.timestamp}</span>
                      <ArrowRight className="h-3 w-3 text-[#6F4028]" />
                      <span className="text-[#6F4028]">{h.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filter Bar */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#755C49]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] placeholder:text-[#755C49]/60 rounded-xl"
              />
            </div>
            <div className="text-xs text-[#755C49]">
              Showing <strong className="text-[#38241B]">{Math.min(filtered.length, 30)}</strong> of {filtered.length} logged calls
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-[#D8C2AA]/60">
            <FilterSection label="HTTP Status">
              {(['all', 'success', 'failure', 'timeout', 'pending'] as const).map((s) => (
                <FilterChip
                  key={s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                  label={s === 'all' ? 'All Codes' : statusConfig[s].label}
                />
              ))}
            </FilterSection>

            <FilterSection label="Nodal Authority">
              {departments.slice(0, 5).map((d) => (
                <FilterChip
                  key={d}
                  active={deptFilter === d}
                  onClick={() => setDeptFilter(d)}
                  label={d === 'all' ? 'All Bodies' : d}
                />
              ))}
            </FilterSection>

            <FilterSection label="Time Window">
              {timeFilters.map((t) => (
                <FilterChip
                  key={t}
                  active={timeFilter === t}
                  onClick={() => setTimeFilter(t)}
                  label={t === 'all' ? 'All Time' : t === 'last_15m' ? '15m' : t === 'last_1h' ? '1h' : '3h'}
                />
              ))}
            </FilterSection>
          </div>
        </CardContent>
      </Card>

      {/* Live Transaction Ledger Table */}
      <Card className="overflow-hidden border-[#D8C2AA] bg-[#FFF8ED] shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8C2AA] bg-[#F5EBDD] text-[11px] font-bold text-[#755C49] uppercase tracking-wider">
                  <th className="px-6 py-4">Request Token</th>
                  <th className="px-6 py-4">Destination Nodal Node</th>
                  <th className="px-6 py-4">URI Route</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Gateway Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C2AA]/50">
                {filtered.slice(0, 30).map((log) => {
                  const cfg = statusConfig[log.status];
                  const StatusIcon = cfg.icon;

                  return (
                    <tr key={log.id} className="transition-colors hover:bg-[#F5EBDD]/60">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-[#6F4028]">{log.requestId}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-[#38241B]">{log.destination}</span>
                      </td>

                      <td className="px-6 py-4">
                        <code className="font-mono text-xs text-[#38241B]">{log.endpoint}</code>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-mono text-[10px] font-bold',
                            log.method === 'GET'
                              ? 'border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]'
                              : 'border-emerald-300 bg-emerald-100 text-emerald-800'
                          )}
                        >
                          {log.method}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-[#755C49]">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn('gap-1 text-xs font-bold', cfg.border, cfg.bg, cfg.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-xs text-[#755C49]">
              <Activity className="mx-auto h-12 w-12 text-[#755C49]/30 mb-3" />
              No API events currently match this filter criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#755C49]">
        {label}:
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
        active
          ? 'bg-[#6F4028] text-[#FFF8ED] shadow-sm shadow-[#6F4028]/20'
          : 'bg-[#F5EBDD] text-[#755C49] hover:bg-[#EAD8C2] hover:text-[#38241B]'
      )}
    >
      {label}
    </button>
  );
}
