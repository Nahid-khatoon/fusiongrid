import { useMemo, useState } from 'react';
import {
  Network, CheckCircle2, AlertTriangle, XCircle, Wrench,
  ArrowRight, Activity, Clock, Zap, Code, Database, FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { departmentConnectors } from '@/data/adminData';
import type { ConnectorStatus, ConnectorType } from '@/types';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface DepartmentIntegrationsProps {
  navigate: (to: string) => void;
}

const statusConfig: Record<ConnectorStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  connected: { label: 'Connected', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  warning: { label: 'Warning', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  disconnected: { label: 'Disconnected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  maintenance: { label: 'Maintenance', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
};

const connectorTypeIcons: Record<ConnectorType, typeof Code> = {
  'REST API': Code,
  'Legacy SOAP': Network,
  'CSV/File': FileSpreadsheet,
  'Database Adapter': Database,
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const matchesDepartment = (departmentName: string, eventDepartment?: string) => {
  if (!eventDepartment) return false;
  const a = normalize(departmentName);
  const b = normalize(eventDepartment);

  if (a === b || a.includes(b) || b.includes(a)) return true;

  const aliases: Record<string, string[]> = {
    revenuedepartment: ['revenue', 'revenuedepartment'],
    revenue: ['revenue', 'revenuedepartment'],
    educationdepartment: ['education', 'educationdepartment'],
    education: ['education', 'educationdepartment'],
    socialwelfare: ['welfare', 'socialwelfare'],
    healthdepartment: ['health', 'healthdepartment'],
    identityservice: ['identity', 'identityservice'],
    treasurydepartment: ['treasury', 'treasurydepartment'],
    transportdepartment: ['transport', 'transportdepartment'],
  };

  return (aliases[a] ?? []).some((alias) => b.includes(alias)) ||
    (aliases[b] ?? []).some((alias) => a.includes(alias));
};

export function DepartmentIntegrations({ navigate }: DepartmentIntegrationsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const { systemEvents, apiFailures } = useApp();

  const dynamicConnectors = useMemo(() => {
    return departmentConnectors.map((connector) => {
      const relatedEvents = systemEvents.filter((event) =>
        matchesDepartment(connector.name, event.department)
      );

      const recentFailure = apiFailures.find((failure) =>
        matchesDepartment(connector.name, failure.department)
      );

      // Runtime activity comes only from the live AppContext event stream.
      // Do not fall back to the static adminData metrics for these card values.
      const liveCalls = relatedEvents.length;
      const failureCount = relatedEvents.filter((event) => event.type === 'ApiFailure').length;

      let status: ConnectorStatus = connector.status;

      // Live failure state overrides a connected/warning connector. Keep
      // maintenance and disconnected states intact because they are explicit.
      if (connector.status !== 'maintenance' && connector.status !== 'disconnected') {
        if (recentFailure?.isDown || failureCount > 0) {
          status = 'warning';
        } else if (recentFailure?.retryState === 'recovered') {
          status = 'connected';
        }
      }

      // Runtime success rate. When there is no runtime activity, show 0
      // instead of displaying the old static demo percentage.
      const successEvents = relatedEvents.filter((event) => event.type !== 'ApiFailure').length;
      const liveSuccessRate = liveCalls > 0
        ? Number(((successEvents / liveCalls) * 100).toFixed(1))
        : 0;

      const latestEvent = relatedEvents
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      return {
        ...connector,
        status,
        liveCalls,
        successRate: liveSuccessRate,
        failureCount,
        latestActivity: latestEvent?.timestamp ?? null,
      };
    });
  }, [systemEvents, apiFailures]);

  const selectedConnector = dynamicConnectors.find((c) => c.id === selected);

  const statusCounts = useMemo(() => ({
    connected: dynamicConnectors.filter((c) => c.status === 'connected').length,
    warning: dynamicConnectors.filter((c) => c.status === 'warning').length,
    maintenance: dynamicConnectors.filter((c) => c.status === 'maintenance').length,
    disconnected: dynamicConnectors.filter((c) => c.status === 'disconnected').length,
  }), [dynamicConnectors]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Department Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live connector health and integration activity across all government department systems.
        </p>
      </div>

      {/* Dynamic Summary bar */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in-up">
        {(['connected', 'warning', 'maintenance', 'disconnected'] as ConnectorStatus[]).map((s) => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          return (
            <Card key={s} className="border-border/60">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', cfg.bg)}>
                  <Icon className={cn('h-5 w-5', cfg.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts[s]}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conceptual flow diagram */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base">Interoperability Architecture</CardTitle>
          <CardDescription>How legacy and modern systems connect through FusionGrid</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 lg:flex-row lg:justify-between">
            {[
              { label: 'Legacy / Modern System', sub: 'Revenue, Education, Health...', icon: Database, color: 'text-blue-600 bg-blue-50' },
              { label: 'Connector', sub: 'REST, SOAP, CSV, DB', icon: Network, color: 'text-purple-600 bg-purple-50' },
              { label: 'Transformation Layer', sub: 'Field mapping & validation', icon: Zap, color: 'text-amber-600 bg-amber-50' },
              { label: 'FusionGrid Canonical Model', sub: 'Unified citizen record', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            ].map((step, i, arr) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex flex-1 items-center gap-3 lg:flex-col">
                  <div className="flex items-center gap-3 lg:flex-col lg:text-center">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', step.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.sub}</p>
                    </div>
                  </div>
                  {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground lg:rotate-90 lg:mt-2" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connector cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
        {dynamicConnectors.map((connector) => {
          const cfg = statusConfig[connector.status];
          const StatusIcon = cfg.icon;
          const TypeIcon = connectorTypeIcons[connector.connectorType];

          return (
            <Card
              key={connector.id}
              className={cn(
                'cursor-pointer border-border/60 transition-all hover:shadow-md',
                selected === connector.id && 'ring-2 ring-primary'
              )}
              onClick={() => setSelected(selected === connector.id ? null : connector.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{connector.name}</h3>
                      <p className="text-xs text-muted-foreground">{connector.connectorType}</p>
                    </div>
                  </div>

                  <Badge variant="outline" className={cn('gap-1', cfg.border, cfg.bg, cfg.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">{connector.description}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <p className="text-lg font-bold">{connector.liveCalls}</p>
                    <p className="text-[10px] text-muted-foreground">Live Calls</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <p className="text-lg font-bold">{connector.successRate}%</p>
                    <p className="text-[10px] text-muted-foreground">Success</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-2">
                    <p className="text-lg font-bold">{connector.failureCount}</p>
                    <p className="text-[10px] text-muted-foreground">Failures</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last activity: {connector.latestActivity ?? 'No live activity yet'}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected connector detail */}
      {selectedConnector && (
        <Card className="mt-6 border-primary/30 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-base">{selectedConnector.name} — Endpoints</CardTitle>
            <CardDescription>
              Configured endpoints and live connector activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-lg font-bold">{selectedConnector.liveCalls}</p>
                <p className="text-xs text-muted-foreground">Live Calls</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-lg font-bold">{selectedConnector.failureCount}</p>
                <p className="text-xs text-muted-foreground">Failures</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-lg font-bold">{selectedConnector.successRate}%</p>
                <p className="text-xs text-muted-foreground">Live Success Rate</p>
              </div>
            </div>

            <div className="space-y-2">
              {selectedConnector.endpoints.map((ep) => (
                <div key={ep} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <code className="font-mono text-xs font-semibold">{ep}</code>
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedConnector.status === 'warning' || selectedConnector.status === 'disconnected'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    )}
                  >
                    <Activity className="mr-1 h-3 w-3" />
                    {selectedConnector.status === 'maintenance'
                      ? 'Maintenance'
                      : selectedConnector.status === 'disconnected'
                        ? 'Unavailable'
                        : selectedConnector.status === 'warning'
                          ? 'Degraded'
                          : 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
