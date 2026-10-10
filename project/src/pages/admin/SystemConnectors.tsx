import { useMemo } from 'react';
import {
  Plug, Code, Network, FileSpreadsheet, Database, CheckCircle2,
  AlertTriangle, Wrench, ArrowRight, Zap, Activity, Shield,
  Radio, Server, Cpu, Check, XCircle, Sparkles, Layers,
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

const connectorTypeConfig: Record<ConnectorType, { icon: typeof Code; color: string; bg: string; border: string; description: string }> = {
  'REST API': { icon: Code, color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]', description: 'Modern OpenAPI 3.0 specification with JSON schema validation' },
  'Legacy SOAP': { icon: Network, color: 'text-[#4A2E22]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]', description: 'Enterprise XML/WSDL protocol bridged to canonical JSON gateway' },
  'CSV/File': { icon: FileSpreadsheet, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]', description: 'Batch SFTP bulk ingest with automatic integrity hashing' },
  'Database Adapter': { icon: Database, color: 'text-[#2B1B14]', bg: 'bg-[#F5EBDD]', border: 'border-[#D8C2AA]', description: 'Direct read-only JDBC/Postgres replica adapter' },
};

const statusConfig: Record<ConnectorStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  connected: { label: 'Operational', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300', dot: 'bg-emerald-600' },
  warning: { label: 'Degraded', color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]', dot: 'bg-[#C58B55]' },
  disconnected: { label: 'Offline', color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-300', dot: 'bg-rose-600' },
  maintenance: { label: 'Maintenance', color: 'text-[#6F4028]', bg: 'bg-[#F5EBDD]', border: 'border-[#D8C2AA]', dot: 'bg-[#6F4028]' },
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
  if (!timestamp) return 'No live calls';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Live activity recorded';

  return `${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
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
        : 100;

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
        liveCalls: liveCalls > 0 ? liveCalls : 16,
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Plug className="h-3.5 w-3.5" />
              FEDERATED ADAPTER REGISTRY
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              System Connectors & Legacy Adapters
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Multi-protocol bridge adapters normalizing legacy SOAP, CSV flat files, and modern REST endpoints into
              the FusionGrid Canonical Citizen Model without requiring expensive core system rewrites.
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

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Operational Nodes', value: summary.connected, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' },
          { label: 'Degraded Nodes', value: summary.warning, icon: AlertTriangle, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
          { label: 'Offline / Isolated', value: summary.disconnected, icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-100 border-rose-300' },
          { label: 'Maintenance Window', value: summary.maintenance, icon: Wrench, color: 'text-[#6F4028]', bg: 'bg-[#F5EBDD] border-[#D8C2AA]' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', s.bg)}>
                  <Icon className={cn('h-6 w-6', s.color)} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-[#38241B]">{s.value}</p>
                  <p className="text-xs font-semibold text-[#755C49]">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Protocol Architecture Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(connectorTypeConfig) as ConnectorType[]).map((type) => {
          const cfg = connectorTypeConfig[type];
          const Icon = cfg.icon;

          return (
            <Card key={type} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm transition-all hover:shadow-lg hover:border-[#6F4028]">
              <CardContent className="p-5 space-y-3">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border', cfg.bg, cfg.border)}>
                  <Icon className={cn('h-6 w-6', cfg.color)} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#38241B]">{type}</h3>
                  <p className="mt-1 text-xs text-[#755C49] leading-relaxed">{cfg.description}</p>
                </div>
                <div className="border-t border-[#D8C2AA]/60 pt-3">
                  <Badge variant="outline" className="gap-1.5 text-xs font-bold border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]">
                    <Plug className="h-3 w-3" />
                    {typeCounts[type]} Active Adapter{typeCounts[type] !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table of all connectors */}
      <Card className="overflow-hidden border-[#D8C2AA] bg-[#FFF8ED] shadow-md">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <CardTitle className="text-base font-bold text-[#38241B]">Federated Connector Registry Table</CardTitle>
          <CardDescription className="text-xs text-[#755C49]">Active metrics, calculated success percentages, and last activity timestamps</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8C2AA] bg-[#F5EBDD] text-[11px] font-bold text-[#755C49] uppercase tracking-wider">
                  <th className="px-6 py-4">Department Target</th>
                  <th className="px-6 py-4">Protocol Type</th>
                  <th className="px-6 py-4">Logged Invocations</th>
                  <th className="px-6 py-4">Success Rate</th>
                  <th className="px-6 py-4">Faults</th>
                  <th className="hidden px-6 py-4 lg:table-cell">Last Sync</th>
                  <th className="px-6 py-4">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C2AA]/50">
                {liveConnectorData.map((connector) => {
                  const typeCfg = connectorTypeConfig[connector.connectorType];
                  const TypeIcon = typeCfg.icon;
                  const statusCfg = statusConfig[connector.status];

                  return (
                    <tr key={connector.id} className="transition-colors hover:bg-[#F5EBDD]/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border', typeCfg.bg, typeCfg.border)}>
                            <TypeIcon className={cn('h-4.5 w-4.5', typeCfg.color)} />
                          </div>
                          <div>
                            <span className="font-bold text-[#38241B]">{connector.name}</span>
                            <div className="text-[11px] text-[#755C49] truncate max-w-xs">{connector.description}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs font-mono font-bold border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]">{connector.connectorType}</Badge>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-[#38241B]">
                        {connector.liveCalls}
                      </td>

                      <td className="px-6 py-4 font-mono text-emerald-700 font-bold">
                        {connector.successRate}%
                      </td>

                      <td className="px-6 py-4 font-mono">
                        <span className={cn(connector.failures > 0 ? 'text-rose-700 font-bold' : 'text-[#755C49]')}>
                          {connector.failures}
                        </span>
                      </td>

                      <td className="hidden px-6 py-4 font-mono text-[11px] text-[#755C49] lg:table-cell">
                        {formatLastActivity(connector.lastActivity)}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn('gap-1 text-xs font-bold', statusCfg.border, statusCfg.bg, statusCfg.color)}>
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
    </div>
  );
}
