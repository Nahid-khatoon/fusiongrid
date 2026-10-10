import { useMemo, useState } from 'react';
import {
  Network, CheckCircle2, AlertTriangle, XCircle, Wrench,
  ArrowRight, Activity, Clock, Zap, Code, Database, FileSpreadsheet,
  Shield, Radio, ChevronRight, Server, Terminal, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { departmentConnectors } from '@/data/adminData';
import type { ConnectorStatus, ConnectorType } from '@/types';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface DepartmentIntegrationsProps {
  navigate: (to: string) => void;
}

const statusConfig: Record<ConnectorStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  connected: { label: 'Operational', icon: CheckCircle2, color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  warning: { label: 'Latency Degradation', icon: AlertTriangle, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]' },
  disconnected: { label: 'Link Fault', icon: XCircle, color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-300' },
  maintenance: { label: 'Scheduled Window', icon: Wrench, color: 'text-[#6F4028]', bg: 'bg-[#F5EBDD]', border: 'border-[#D8C2AA]' },
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

      const liveCalls = relatedEvents.length;
      const failureCount = relatedEvents.filter((event) => event.type === 'ApiFailure').length;

      let status: ConnectorStatus = connector.status;

      if (connector.status !== 'maintenance' && connector.status !== 'disconnected') {
        if (recentFailure?.isDown || failureCount > 0) {
          status = 'warning';
        } else if (recentFailure?.retryState === 'recovered') {
          status = 'connected';
        }
      }

      const successEvents = relatedEvents.filter((event) => event.type !== 'ApiFailure').length;
      const liveSuccessRate = liveCalls > 0
        ? Number(((successEvents / liveCalls) * 100).toFixed(1))
        : 100;

      const latestEvent = relatedEvents
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      return {
        ...connector,
        status,
        liveCalls: liveCalls > 0 ? liveCalls : 12,
        successRate: liveSuccessRate,
        failureCount,
        latestActivity: latestEvent?.timestamp ?? 'Active sync',
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Network className="h-3.5 w-3.5" />
              INTEGRATION FABRIC & MOCK BRIDGES
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Department Connector & Interface Registry
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Real-time proxy health, protocol translation matrix, and active simulated endpoints connecting
              Revenue, Education, Health, and Social Welfare nodal authorities.
            </p>
          </div>

          <Button
            onClick={() => navigate('/admin/api-monitor')}
            className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-md border-0 self-start md:self-auto"
          >
            Open Live Telemetry
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Fictional Integrations & Simulation Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#C58B55]/40 bg-[#FFF9F0] p-4 text-xs shadow-sm">
        <Shield className="h-5 w-5 text-[#C58B55] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[#786453]">
          <span className="font-bold text-[#2B1B14]">
            Simulated Interoperability Fabric Notice:
          </span>
          <p>
            All department connectors (Identity, Revenue, Education, Health, and Social Welfare) and protocol bridges are safe mock simulations conforming to Open API and DPDP Act standards. No production government databases or unauthorized endpoints are queried.
          </p>
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['connected', 'warning', 'maintenance', 'disconnected'] as ConnectorStatus[]).map((s) => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          return (
            <Card key={s} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', cfg.bg, cfg.border)}>
                  <Icon className={cn('h-6 w-6', cfg.color)} />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-[#38241B]">{statusCounts[s]}</p>
                  <p className="text-xs font-semibold text-[#755C49]">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Topology Pipeline Map */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <CardTitle className="text-base font-bold text-[#38241B]">Interoperability Data Flow Topology</CardTitle>
          <CardDescription className="text-xs text-[#755C49]">Sequential protocol translation layers bridging disparate state systems</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Department Silos', sub: 'Revenue, Education, Health, Treasury', icon: Database, color: 'text-[#6F4028] bg-[#C58B55]/15' },
              { label: 'Protocol Adapters', sub: 'REST, Legacy SOAP, CSV, JDBC Bridge', icon: Network, color: 'text-[#4A2E22] bg-[#C58B55]/15' },
              { label: 'Canonical Normalizer', sub: 'JSON Schema Validation & OGD Standards', icon: Zap, color: 'text-[#C58B55] bg-[#C58B55]/15' },
              { label: 'Unified FusionGrid API', sub: 'Zero-Redundancy Citizen Entity Mesh', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-100' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="rounded-2xl border border-[#D8C2AA] bg-[#FFF8ED] p-4 text-center space-y-2 shadow-sm">
                  <div className={cn('mx-auto flex h-11 w-11 items-center justify-center rounded-2xl', step.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#C58B55] font-bold">LAYER 0{i + 1}</span>
                    <p className="text-xs font-bold text-[#38241B]">{step.label}</p>
                    <p className="mt-0.5 text-[11px] text-[#755C49]">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connector Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dynamicConnectors.map((connector) => {
          const cfg = statusConfig[connector.status];
          const StatusIcon = cfg.icon;
          const TypeIcon = connectorTypeIcons[connector.connectorType];

          return (
            <Card
              key={connector.id}
              className={cn(
                'cursor-pointer border-[#D8C2AA] bg-[#FFF8ED] shadow-sm transition-all hover:border-[#6F4028] hover:shadow-xl overflow-hidden',
                selected === connector.id && 'ring-2 ring-[#6F4028] border-[#6F4028]'
              )}
              onClick={() => setSelected(selected === connector.id ? null : connector.id)}
            >
              <div className="h-1 w-full bg-gradient-to-r from-[#6F4028] via-[#C58B55] to-[#805236]" />
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] border border-[#D8C2AA]">
                      <TypeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#38241B]">{connector.name}</h3>
                      <p className="text-xs font-mono text-[#755C49]">{connector.connectorType}</p>
                    </div>
                  </div>

                  <Badge variant="outline" className={cn('gap-1 text-xs shrink-0 font-bold', cfg.border, cfg.bg, cfg.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>

                <p className="text-xs text-[#755C49] line-clamp-2 leading-relaxed">{connector.description}</p>

                <div className="grid grid-cols-3 gap-2 text-center border-t border-[#D8C2AA]/60 pt-3">
                  <div className="rounded-xl bg-[#F5EBDD] p-2.5">
                    <p className="font-mono text-base font-bold text-[#38241B]">{connector.liveCalls}</p>
                    <p className="text-[10px] text-[#755C49] font-bold">Calls</p>
                  </div>
                  <div className="rounded-xl bg-[#F5EBDD] p-2.5">
                    <p className="font-mono text-base font-bold text-emerald-700">{connector.successRate}%</p>
                    <p className="text-[10px] text-[#755C49] font-bold">Success</p>
                  </div>
                  <div className="rounded-xl bg-[#F5EBDD] p-2.5">
                    <p className="font-mono text-base font-bold text-rose-700">{connector.failureCount}</p>
                    <p className="text-[10px] text-[#755C49] font-bold">Faults</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#755C49] pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#6F4028]" />
                    {connector.latestActivity}
                  </span>
                  <span className="font-bold text-[#6F4028]">
                    {selected === connector.id ? 'Close Details' : 'Inspect Endpoints →'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Connector Detail Inspector */}
      {selectedConnector && (
        <Card className="border-[#6F4028] bg-[#FFF8ED] shadow-xl animate-fade-in-up overflow-hidden">
          <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-[#38241B]">
                  <Terminal className="h-4.5 w-4.5 text-[#6F4028]" />
                  {selectedConnector.name} — Real-Time Interface Inspector
                </CardTitle>
                <CardDescription className="text-xs text-[#755C49]">
                  Active simulated endpoints exposing verified datasets to FusionGrid Gateway
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs font-bold border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B]">
                Avg Latency: {selectedConnector.avgLatency}ms
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="space-y-2">
              {selectedConnector.endpoints.map((ep) => (
                <div key={ep} className="flex items-center justify-between rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-3.5">
                  <code className="font-mono text-xs font-bold text-[#38241B]">{ep}</code>
                  <Badge
                    variant="outline"
                    className="border-emerald-300 bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                  >
                    <Activity className="mr-1 h-3 w-3" />
                    Simulated Ready
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
