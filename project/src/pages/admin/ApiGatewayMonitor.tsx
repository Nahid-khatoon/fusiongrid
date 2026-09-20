import { useMemo, useState } from 'react';
import {
  Activity, Search, Filter, CheckCircle2, XCircle, Clock,
  ArrowRight, Zap, AlertTriangle,
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

const statusConfig: Record<ApiCallStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { label: 'Success', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  failure: { label: 'Failure', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  timeout: { label: 'Timeout', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  pending: { label: 'Pending', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
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

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

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
    requestId: `REQ-${event.id.replace(/[^a-zA-Z0-9-]/g, '').slice(-12).toUpperCase()}`,
    source: 'FusionGrid',
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

  /*
   * The old version generated 50 synthetic logs once at module load.
   * This version builds the monitor directly from the AppContext event stream,
   * so the table changes when the citizen/officer/admin workflow generates events.
   */
  const allLogs = useMemo<LiveApiLog[]>(() => {
    const eventLogs = systemEvents
      .map(buildLiveLog)
      .filter((log): log is LiveApiLog => log !== null);

const failureLogs: LiveApiLog[] = apiFailures.map((failure) => {
  const fallbackRequestId = `REQ-${failure.department}-${failure.timestamp}`;

  return {
    id: `failure-${failure.requestId ?? fallbackRequestId}`,
    requestId: failure.requestId ?? fallbackRequestId,
    source: 'FusionGrid',
    destination: failure.department,
    department: failure.department,
    endpoint: failure.endpoint ?? '/api/unknown',
    method: 'GET',
    timestamp: failure.timestamp,
    status: failure.retryState === 'recovered' ? 'success' : 'failure',
  };
});

    // Keep one copy when the same Revenue failure exists in both sources.
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">API Gateway Monitor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live API activity generated by the FusionGrid workflow — filter by status, department, endpoint, and time.
        </p>
      </div>

      {/* Dynamic stats */}
      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in-up">
        {(['success', 'failure', 'timeout', 'pending'] as ApiCallStatus[]).map((s) => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;

          return (
            <Card key={s} className="border-border/60">
              <CardContent className="flex items-center gap-3 p-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', cfg.bg)}>
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats[s]}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live API Failure Panel */}
      <Card className="mb-4 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Reliability Simulation — Revenue API
          </CardTitle>
          <CardDescription>
            Trigger a Revenue API failure to see the retry, queue, and recovery flow in real time.
            The citizen&apos;s application is never lost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={simulateRevenueFailure}
              disabled={!!revenueFailure?.isDown}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Simulate Revenue API Down
            </Button>

            <Button
              onClick={resetRevenueFailure}
              variant="outline"
              size="sm"
              disabled={!revenueFailure}
            >
              Reset
            </Button>
          </div>

          {revenueFailure && (
            <div className="mt-4 space-y-2">
              <div className={cn(
                'rounded-lg border p-3',
                revenueFailure.retryState === 'recovered'
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-red-200 bg-red-50/50'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full',
                      revenueFailure.retryState === 'recovered' ? 'bg-emerald-100' : 'bg-red-100'
                    )}>
                      {revenueFailure.retryState === 'recovered' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </span>
                    <span className="text-sm font-semibold">{revenueFailure.message}</span>
                  </div>

                  <Badge
                    variant={revenueFailure.isDown ? 'destructive' : 'default'}
                    className={cn(!revenueFailure.isDown && 'bg-emerald-100 text-emerald-700')}
                  >
                    {revenueFailure.retryState === 'recovered'
                      ? 'Recovered'
                      : revenueFailure.isDown
                        ? 'DOWN'
                        : 'OK'}
                  </Badge>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Request ID: {revenueFailure.requestId} | Endpoint: {revenueFailure.endpoint}
                </p>

                <div className="mt-2 space-y-1">
                  {revenueFailure.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{h.timestamp}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium">{h.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-4 space-y-3 animate-fade-in-up">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search request, department or endpoint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Status">
            {(['all', 'success', 'failure', 'timeout', 'pending'] as const).map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                label={s === 'all' ? 'All' : statusConfig[s].label}
              />
            ))}
          </FilterSection>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Department">
            {departments.map((d) => (
              <FilterChip
                key={d}
                active={deptFilter === d}
                onClick={() => setDeptFilter(d)}
                label={d === 'all' ? 'All Departments' : d}
              />
            ))}
          </FilterSection>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Endpoint">
            {endpoints.map((e) => (
              <FilterChip
                key={e}
                active={endpointFilter === e}
                onClick={() => setEndpointFilter(e)}
                label={e === 'all' ? 'All Endpoints' : e}
              />
            ))}
          </FilterSection>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Time">
            {timeFilters.map((t) => (
              <FilterChip
                key={t}
                active={timeFilter === t}
                onClick={() => setTimeFilter(t)}
                label={
                  t === 'all'
                    ? 'All Time'
                    : t === 'last_15m'
                      ? 'Last 15 min'
                      : t === 'last_1h'
                        ? 'Last 1 hour'
                        : 'Last 3 hours'
                }
              />
            ))}
          </FilterSection>
        </div>
      </div>

      {/* Live request table */}
      <Card className="border-border/60 animate-fade-in-up">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Request ID</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Source</th>
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Endpoint</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Method</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Latency</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.slice(0, 30).map((log) => {
                  const cfg = statusConfig[log.status];
                  const StatusIcon = cfg.icon;

                  return (
                    <tr key={log.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold">{log.requestId}</span>
                      </td>

                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {log.source}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {log.destination}
                      </td>

                      <td className="hidden px-4 py-3 lg:table-cell">
                        <code className="font-mono text-xs">{log.endpoint}</code>
                      </td>

                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-mono text-xs',
                            log.method === 'GET'
                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                              : 'border-green-200 bg-green-50 text-green-700'
                          )}
                        >
                          {log.method}
                        </Badge>
                      </td>

                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          {typeof log.latency === 'number' ? `${log.latency}ms` : 'Not recorded'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('gap-1', cfg.bg, cfg.color)}>
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
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <Activity className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            {allLogs.length === 0
              ? 'No API activity recorded yet. Start the citizen verification workflow to generate live API events.'
              : 'No API calls match your filters.'}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {Math.min(filtered.length, 30)} of {filtered.length} live calls</span>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
          className="gap-1"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Filter className="h-3 w-3" />
        {label}:
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-all',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  );
}
