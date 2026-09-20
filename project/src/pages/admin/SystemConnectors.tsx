import { useMemo } from 'react';
import {
  Plug, Code, Network, FileSpreadsheet, Database, CheckCircle2,
  AlertTriangle, Wrench, ArrowRight, Zap, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { departmentConnectors } from '@/data/adminData';
import { useApp } from '@/context/AppContext';
import type { ConnectorType, ConnectorStatus } from '@/types';
import { cn } from '@/lib/utils';

interface SystemConnectorsProps {
  navigate: (to: string) => void;
}

const connectorTypeConfig: Record<ConnectorType, { icon: typeof Code; color: string; bg: string; description: string }> = {
  'REST API': { icon: Code, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Modern HTTP-based API with JSON payloads' },
  'Legacy SOAP': { icon: Network, color: 'text-purple-600', bg: 'bg-purple-50', description: 'XML-based SOAP protocol bridged to REST' },
  'CSV/File': { icon: FileSpreadsheet, color: 'text-amber-600', bg: 'bg-amber-50', description: 'Scheduled file exchange via SFTP or batch upload' },
  'Database Adapter': { icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Direct database connection with read-only adapter' },
};

const statusConfig: Record<ConnectorStatus, { label: string; color: string; bg: string; dot: string }> = {
  connected: { label: 'Connected', color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  warning: { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  disconnected: { label: 'Disconnected', color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
  maintenance: { label: 'Maintenance', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
};

function getDepartmentName(event: any): string {
  return event.department || (
    event.type === 'IncomeVerified' ? 'Revenue Department' :
    event.type === 'StudentVerified' ? 'Education Department' :
    event.type === 'ApiFailure' ? 'Revenue Department' :
    event.type === 'ConsentGranted' || event.type === 'ConsentRevoked' ? 'Consent Manager' :
    event.type === 'ApplicationApproved' || event.type === 'ApplicationRejected' ? 'Social Welfare' :
    event.type === 'ApplicationSubmitted' ? 'Social Welfare' :
    'FusionGrid'
  );
}

function normalizeDepartment(name: string): string {
  const value = name.toLowerCase();

  if (value.includes('revenue')) return 'Revenue Department';
  if (value.includes('education')) return 'Education Department';
  if (value.includes('social welfare') || value.includes('welfare')) return 'Social Welfare';
  if (value.includes('health')) return 'Health Department';
  if (value.includes('identity')) return 'Identity Service';
  if (value.includes('treasury')) return 'Treasury Department';
  if (value.includes('transport')) return 'Transport Department';
  if (value.includes('land')) return 'Revenue Land Records';
  if (value.includes('consent')) return 'Consent Manager';
  if (value.includes('notification')) return 'Notification Service';

  return name;
}

function formatLastActivity(timestamp?: string): string {
  if (!timestamp) return 'No live activity yet';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Live activity recorded';

  return `Last activity: ${date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function SystemConnectors({ navigate }: SystemConnectorsProps) {
  const { systemEvents, apiFailures } = useApp();

  const liveConnectorData = useMemo(() => {
    const events = systemEvents || [];
    const failures = apiFailures || [];

    return departmentConnectors.map((connector) => {
      const department = normalizeDepartment(connector.name);

      const departmentEvents = events.filter(
        (event: any) => normalizeDepartment(getDepartmentName(event)) === department
      );

      const departmentFailures = failures.filter(
        (failure: any) => normalizeDepartment(failure.department || '') === department
      );

      const successfulEvents = departmentEvents.filter(
        (event: any) => event.type !== 'ApiFailure' && event.type !== 'ApplicationRejected'
      ).length;

      const failedEvents =
        departmentEvents.filter(
          (event: any) => event.type === 'ApiFailure' || event.type === 'ApplicationRejected'
        ).length +
        departmentFailures.length;

      const liveCalls = departmentEvents.length + departmentFailures.length;
      const successRate = liveCalls > 0
        ? Number(((successfulEvents / liveCalls) * 100).toFixed(1))
        : 0;

      const latestEvent = departmentEvents
        .map((event: any) => event.timestamp)
        .filter(Boolean)
        .sort()
        .at(-1);

      const latestFailure = departmentFailures
        .map((failure: any) => failure.timestamp)
        .filter(Boolean)
        .sort()
        .at(-1);

      const lastActivity = [latestEvent, latestFailure]
        .filter(Boolean)
        .sort()
        .at(-1);

      const activeFailure = departmentFailures.some(
        (failure: any) => failure.isDown && failure.retryState !== 'recovered'
      );

      let status: ConnectorStatus = connector.status;

      if (activeFailure) {
        status = 'disconnected';
      } else if (failedEvents > 0) {
        status = 'warning';
      } else if (liveCalls > 0) {
        status = 'connected';
      }

      return {
        ...connector,
        liveCalls,
        failures: failedEvents,
        successRate,
        lastActivity,
        status,
      };
    });
  }, [systemEvents, apiFailures]);

  const typeCounts = useMemo(() => {
    const counts: Record<ConnectorType, number> = {
      'REST API': 0,
      'Legacy SOAP': 0,
      'CSV/File': 0,
      'Database Adapter': 0,
    };

    departmentConnectors.forEach((connector) => {
      counts[connector.connectorType] += 1;
    });

    return counts;
  }, []);

  const summary = useMemo(() => {
    const connected = liveConnectorData.filter((c) => c.status === 'connected').length;
    const warning = liveConnectorData.filter((c) => c.status === 'warning').length;
    const disconnected = liveConnectorData.filter((c) => c.status === 'disconnected').length;
    const maintenance = liveConnectorData.filter((c) => c.status === 'maintenance').length;

    return { connected, warning, disconnected, maintenance };
  }, [liveConnectorData]);

  const totalLiveCalls = liveConnectorData.reduce((sum, c) => sum + c.liveCalls, 0);
  const totalFailures = liveConnectorData.reduce((sum, c) => sum + c.failures, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">System Connectors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live connector health and activity across the FusionGrid interoperability layer.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {totalLiveCalls} live calls · {totalFailures} failures · metrics calculated from shared prototype events
        </p>
      </div>

      {/* Live summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
        <SummaryCard label="Connected" value={summary.connected} icon={CheckCircle2} className="text-emerald-600" />
        <SummaryCard label="Warning" value={summary.warning} icon={AlertTriangle} className="text-amber-600" />
        <SummaryCard label="Disconnected" value={summary.disconnected} icon={AlertTriangle} className="text-red-600" />
        <SummaryCard label="Maintenance" value={summary.maintenance} icon={Wrench} className="text-blue-600" />
      </div>

      {/* Connector type overview */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
        {(Object.keys(connectorTypeConfig) as ConnectorType[]).map((type) => {
          const cfg = connectorTypeConfig[type];
          const Icon = cfg.icon;

          return (
            <Card key={type} className="border-border/60">
              <CardContent className="p-5">
                <div className={cn('mb-3 flex h-12 w-12 items-center justify-center rounded-xl', cfg.bg)}>
                  <Icon className={cn('h-6 w-6', cfg.color)} />
                </div>
                <h3 className="font-display font-semibold">{type}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{cfg.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Plug className="h-3 w-3" />
                    {typeCounts[type]} connector{typeCounts[type] !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conceptual flow */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base">Connector Flow Architecture</CardTitle>
          <CardDescription>
            How data flows from source systems through connectors to the FusionGrid canonical model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            {[
              { label: 'Source System', sub: 'Revenue DB, Education DB, Health CSV...', icon: Database, color: 'text-blue-600 bg-blue-50' },
              { label: 'Connector Layer', sub: 'REST / SOAP / CSV / DB Adapter', icon: Plug, color: 'text-purple-600 bg-purple-50' },
              { label: 'Transformation', sub: 'Field mapping, validation, dedup', icon: Zap, color: 'text-amber-600 bg-amber-50' },
              { label: 'Canonical Model', sub: 'Unified citizen record', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
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
                  {i < arr.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground lg:mt-2 lg:rotate-90" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed live connector table */}
      <Card className="border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base">All Connectors</CardTitle>
          <CardDescription>
            Live calls, calculated success rate, failures and latest activity from the shared event system
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Live Calls</th>
                  <th className="px-4 py-3 font-medium">Success</th>
                  <th className="px-4 py-3 font-medium">Failures</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Last Activity</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {liveConnectorData.map((connector) => {
                  const typeCfg = connectorTypeConfig[connector.connectorType];
                  const TypeIcon = typeCfg.icon;
                  const statusCfg = statusConfig[connector.status];

                  return (
                    <tr key={connector.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', typeCfg.bg)}>
                            <TypeIcon className={cn('h-4 w-4', typeCfg.color)} />
                          </div>
                          <span className="font-medium">{connector.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{connector.connectorType}</Badge>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold">{connector.liveCalls}</span>
                      </td>

                      <td className="px-4 py-3">
                        {connector.liveCalls > 0 ? `${connector.successRate}%` : '—'}
                      </td>

                      <td className="px-4 py-3">
                        <span className={cn(connector.failures > 0 && 'font-semibold text-red-600')}>
                          {connector.failures}
                        </span>
                      </td>

                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        {formatLastActivity(connector.lastActivity)}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('gap-1.5', statusCfg.bg, statusCfg.color)}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
                          {statusCfg.label}
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

      <div className="mt-4 flex items-center justify-end">
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
  className: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40', className)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
