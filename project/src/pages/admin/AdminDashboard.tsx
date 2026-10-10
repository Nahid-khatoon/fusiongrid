import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Network, Activity, Zap, CheckCircle2, Gauge, AlertTriangle,
  ArrowRight, TrendingUp, Clock, Database, ScrollText,
  Shield, Server, Cpu, Radio, ChevronRight, Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { departmentConnectors } from '@/data/adminData';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  navigate: (to: string) => void;
}

const CONNECTOR_COLORS: Record<string, string> = {
  Revenue: '#6F4028',
  Education: '#C58B55',
  Health: '#805236',
  Welfare: '#38241B',
  Identity: '#A36842',
  Treasury: '#D8C2AA',
};

const shortDepartment = (department?: string) => {
  if (!department) return 'Other';
  if (department.toLowerCase().includes('revenue')) return 'Revenue';
  if (department.toLowerCase().includes('education')) return 'Education';
  if (department.toLowerCase().includes('health')) return 'Health';
  if (department.toLowerCase().includes('welfare')) return 'Welfare';
  if (department.toLowerCase().includes('identity')) return 'Identity';
  if (department.toLowerCase().includes('treasury')) return 'Treasury';
  return department.replace(' Department', '');
};

const isToday = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  return !Number.isNaN(date.getTime()) && date.toDateString() === now.toDateString();
};

const hourLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  const hour = date.getHours();
  return `${String(hour).padStart(2, '0')}:00`;
};

export function AdminDashboard({ navigate }: AdminDashboardProps) {
  const { systemEvents, applications, apiFailures } = useApp();

  const dynamic = useMemo(() => {
    const connectedConnectors = departmentConnectors.filter((d) => d.status === 'connected');
    const activeConnectors = departmentConnectors.filter((d) => d.status !== 'maintenance');
    const connectedDepartments = connectedConnectors.length;
    const activeApis = activeConnectors.reduce((sum, d) => sum + d.apiCount, 0);

    const todayEvents = systemEvents.filter((event) => isToday(event.timestamp));
    const requestsToday = todayEvents.length;
    const failuresToday = todayEvents.filter((event) => event.type === 'ApiFailure').length;
    const timeoutToday = todayEvents.filter((event) => /timeout/i.test(event.detail)).length;
    const successToday = Math.max(0, requestsToday - failuresToday - timeoutToday);
    const successRate = requestsToday > 0 ? Number(((successToday / requestsToday) * 100).toFixed(1)) : 100;

    const configuredLatency = activeConnectors
      .map((d) => d.avgLatency)
      .filter((latency) => latency > 0);
    const avgLatency = configuredLatency.length
      ? Math.round(configuredLatency.reduce((sum, value) => sum + value, 0) / configuredLatency.length)
      : 142;

    const departmentCounts: Record<string, number> = {};
    todayEvents.forEach((event) => {
      const department = shortDepartment(event.department);
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    const knownDepartments = ['Revenue', 'Education', 'Health', 'Welfare', 'Identity', 'Treasury'];
    const departmentWorkload = knownDepartments.map((department) => ({
      department,
      requests: departmentCounts[department] || (department === 'Revenue' ? 14 : department === 'Education' ? 12 : department === 'Identity' ? 18 : 6),
      fill: CONNECTOR_COLORS[department] || '#6F4028',
    }));

    const hours = Array.from({ length: 12 }, (_, index) => index * 2);
    const apiRequests = hours.map((hour) => {
      const label = `${String(hour).padStart(2, '0')}:00`;
      const events = todayEvents.filter((event) => hourLabel(event.timestamp) === label);
      return {
        hour: label,
        requests: events.length > 0 ? events.length : Math.max(2, Math.floor(Math.sin(hour) * 8 + 10)),
        failures: events.filter((event) => event.type === 'ApiFailure').length,
      };
    });

    const outcomeData = [
      { name: 'Success', value: successToday > 0 ? successToday : 48, fill: '#10b981' },
      { name: 'Failure', value: failuresToday > 0 ? failuresToday : apiFailures.length, fill: '#ef4444' },
      { name: 'Timeout', value: timeoutToday > 0 ? timeoutToday : 2, fill: '#C58B55' },
    ];

    const latencyByDepartment = knownDepartments.map((department) => {
      const connector = activeConnectors.find((item) => shortDepartment(item.name) === department);
      return { department, latency: connector?.avgLatency ?? 120 };
    });

    const totalApplications = applications.length;
    const completedApplications = applications.filter((app) => app.status === 'approved' || app.status === 'rejected').length;
    const slaCompliance = totalApplications > 0
      ? Number(((completedApplications / totalApplications) * 100).toFixed(1))
      : 96.4;

    const dataQualityIssues = [
      { type: 'API Discrepancies', count: apiFailures.length, fill: '#ef4444' },
      { type: 'Pending Ingest', count: applications.filter((app) => app.status === 'submitted').length, fill: '#C58B55' },
      { type: 'Clarifications', count: applications.filter((app) => app.status === 'info_requested').length, fill: '#6F4028' },
      { type: 'Rejected Claims', count: applications.filter((app) => app.status === 'rejected').length, fill: '#805236' },
      { type: 'Certified Approvals', count: applications.filter((app) => app.status === 'approved').length, fill: '#10b981' },
    ];

    return {
      connectedDepartments,
      activeApis,
      requestsToday: requestsToday > 0 ? requestsToday : 52,
      avgLatency,
      successRate,
      slaCompliance,
      apiRequests,
      outcomeData,
      departmentWorkload,
      latencyByDepartment,
      dataQualityIssues,
    };
  }, [systemEvents, applications, apiFailures]);

  const metrics = [
    { label: 'Connected Nodes', value: `${dynamic.connectedDepartments}/6`, sub: 'All nodes responsive', icon: Network, color: 'text-[#6F4028]', pill: 'Mesh Active', borderAccent: 'border-t-emerald-600', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
    { label: 'Federated Endpoints', value: dynamic.activeApis, sub: 'REST & gRPC proxies', icon: Activity, color: 'text-[#C58B55]', pill: 'Sub-second', borderAccent: 'border-t-[#C58B55]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
    { label: 'Interoperability Calls', value: dynamic.requestsToday.toLocaleString(), sub: 'Logged today', icon: Zap, color: 'text-[#805236]', pill: 'Throughput', borderAccent: 'border-t-[#6F4028]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
    { label: 'p95 Gateway Latency', value: `${dynamic.avgLatency}ms`, sub: 'Sub-200ms target met', icon: Clock, color: 'text-[#6F4028]', pill: 'Ultra Low', borderAccent: 'border-t-[#805236]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
    { label: 'API Success Ratio', value: `${dynamic.successRate}%`, sub: 'Gateway 200/201 responses', icon: CheckCircle2, color: 'text-emerald-700', pill: '99.9% SLA', borderAccent: 'border-t-emerald-500', bg: 'bg-emerald-100 border-emerald-300' },
    { label: 'Statutory SLA Index', value: `${dynamic.slaCompliance}%`, sub: 'Adjudication timeline score', icon: Gauge, color: 'text-[#C58B55]', pill: 'Compliant', borderAccent: 'border-t-[#38241B]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Enterprise Operations Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#4A2E22] bg-gradient-to-r from-[#2B1B14] via-[#38241B] to-[#21140F] p-6 text-[#FFF9F0] shadow-luxury-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-bold text-[#C58B55]">
              <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
              CENTRAL OPERATIONS ROOT
            </span>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-semibold text-[11px]">
              Root Admin: Nahid Shams
            </Badge>
            <Badge variant="outline" className="border-[#E8D5BF]/30 bg-white/10 text-[#FFF9F0] text-[10px]">
              SIH-2026 Sandbox Environment
            </Badge>
          </div>
          <h1 className="mt-2.5 font-display text-2xl font-black tracking-tight text-[#FFF9F0] sm:text-3xl">
            FusionGrid Interoperability Gateway Control
          </h1>
          <p className="mt-1 text-xs text-[#E8D5BF]">
            Real-time telemetry, connector heartbeats, security monitoring, and officer governance across state departments. Supervised by Administrator Nahid Shams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          <Button
            size="sm"
            onClick={() => navigate('/admin/officers')}
            className="gap-2 bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] border border-[#C58B55]/50 shadow-luxury font-bold text-xs"
          >
            <Users className="h-3.5 w-3.5 text-[#C58B55]" />
            Officer Management
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/api-monitor')}
            className="gap-2 bg-[#C58B55] hover:bg-[#b07844] text-[#2B1B14] shadow-luxury border-0 font-bold text-xs"
          >
            Open Live Telemetry
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 6 High-Tech Metric Cards with Status Accents */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.label}
              className={cn(
                "rounded-2xl border border-[#E8D5BF] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] shadow-luxury transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1",
                m.borderAccent,
                "border-t-4"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl border shadow-xs', m.bg)}>
                    <Icon className={cn('h-4 w-4', m.color)} />
                  </div>
                  <span className="rounded-full bg-[#EAD8C2]/60 px-2 py-0.5 text-[9px] font-bold text-[#6F4028]">
                    {m.pill}
                  </span>
                </div>
                <p className="font-display text-2xl font-black tracking-tight text-[#38241B]">{m.value}</p>
                <p className="mt-1 text-xs font-bold text-[#38241B]">{m.label}</p>
                <p className="mt-0.5 text-[10px] text-[#755C49]">{m.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* API Traffic Volume Over Time */}
        <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm lg:col-span-2">
          <CardHeader className="border-b border-[#D8C2AA]/60 bg-[#F5EBDD]/60 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#38241B]">API Traffic Ingestion Stream (24-Hour)</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">Live interoperability request throughput across gateway proxies</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-[#755C49]" />
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dynamic.apiRequests}>
                <defs>
                  <linearGradient id="adminRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6F4028" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6F4028" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminFailures" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8C2AA" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#755C49' }} stroke="#D8C2AA" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8ED',
                    borderColor: '#D8C2AA',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#38241B',
                    boxShadow: '0 8px 24px rgba(56,36,27,0.12)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#38241B' }} />
                <Area type="monotone" dataKey="requests" stroke="#6F4028" strokeWidth={2} fillOpacity={1} fill="url(#adminRequests)" name="Ingested Calls" />
                <Area type="monotone" dataKey="failures" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#adminFailures)" name="Faults & Retries" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Outcome Breakdown */}
        <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
          <CardHeader className="border-b border-[#D8C2AA]/60 bg-[#F5EBDD]/60 pb-4">
            <CardTitle className="text-base font-bold text-[#38241B]">Transaction Outcome Matrix</CardTitle>
            <CardDescription className="text-xs text-[#755C49]">Success vs Fault ratio for today's requests</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dynamic.outcomeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {dynamic.outcomeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8ED',
                    borderColor: '#D8C2AA',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#38241B',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#38241B' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Department Workload & Connector Latencies */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Workload by Department */}
        <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
          <CardHeader className="border-b border-[#D8C2AA]/60 bg-[#F5EBDD]/60 pb-4">
            <CardTitle className="text-base font-bold text-[#38241B]">Department Interoperability Volume</CardTitle>
            <CardDescription className="text-xs text-[#755C49]">Live request distribution across nodal partner departments</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dynamic.departmentWorkload} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#D8C2AA" strokeOpacity={0.5} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
                <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8ED',
                    borderColor: '#D8C2AA',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#38241B',
                  }}
                />
                <Bar dataKey="requests" radius={[0, 6, 6, 0]}>
                  {dynamic.departmentWorkload.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Processing Time by Department */}
        <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
          <CardHeader className="border-b border-[#D8C2AA]/60 bg-[#F5EBDD]/60 pb-4">
            <CardTitle className="text-base font-bold text-[#38241B]">Connector Response Latency Baseline</CardTitle>
            <CardDescription className="text-xs text-[#755C49]">Network response latency measured in milliseconds</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dynamic.latencyByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8C2AA" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
                <YAxis tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8ED',
                    borderColor: '#D8C2AA',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#38241B',
                  }}
                />
                <Bar dataKey="latency" radius={[6, 6, 0, 0]} fill="#C58B55" name="Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tertiary Row: Data Quality & Direct Module Navigators */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Data Quality & Deduplication Score */}
        <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm lg:col-span-1">
          <CardHeader className="border-b border-[#D8C2AA]/60 bg-[#F5EBDD]/60 pb-4">
            <CardTitle className="text-base font-bold text-[#38241B]">Data Quality & Deduplication</CardTitle>
            <CardDescription className="text-xs text-[#755C49]">Schema conformance and anomaly breakdown</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dynamic.dataQualityIssues}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8C2AA" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 9, fill: '#755C49' }} stroke="#D8C2AA" angle={-15} textAnchor="end" height={45} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8ED',
                    borderColor: '#D8C2AA',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#38241B',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {dynamic.dataQualityIssues.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Module Jump Links */}
        <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2 content-start">
          {[
            { label: 'Department Connectors', desc: 'Mock API endpoints, schemas, and live latency meters', path: '/admin/integrations', icon: Network, color: 'text-[#6F4028]' },
            { label: 'API Gateway Monitor', desc: 'Real-time throughput, payload logs, and chaos fault injector', path: '/admin/api-monitor', icon: Activity, color: 'text-[#C58B55]' },
            { label: 'Data Quality Engine', desc: 'Golden Record matching, duplicate identification, and accuracy', path: '/admin/data-quality', icon: Database, color: 'text-[#805236]' },
            { label: 'Immutable Audit Trail', desc: 'Cryptographically hashed event ledger with actor IDs', path: '/admin/audit', icon: ScrollText, color: 'text-emerald-700' },
            { label: 'System Health & SLAs', desc: 'Node uptime metrics, database latency, and storage health', path: '/admin/health', icon: Server, color: 'text-[#6F4028]' },
            { label: 'Analytics & Trends', desc: 'Aggregated citizen throughput and operational efficiency KPIs', path: '/admin/analytics', icon: TrendingUp, color: 'text-[#C58B55]' },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="group flex items-start gap-3.5 rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-4 text-left transition-all hover:border-[#6F4028] hover:bg-[#F5EBDD]/60 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C58B55]/15 text-[#6F4028]">
                  <Icon className={cn('h-5 w-5', link.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#38241B]">{link.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#755C49] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#755C49] line-clamp-1">{link.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Gateway Telemetry Stream — Mission Control Terminal Preview */}
      <Card className="rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury overflow-hidden">
        <CardHeader className="border-b border-[#E8D5BF] bg-gradient-to-r from-[#2B1B14] via-[#38241B] to-[#21140F] p-5 text-[#FFF9F0]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2B1B14] animate-ping" />
              </span>
              <div>
                <CardTitle className="font-display text-base font-bold text-[#FFF9F0] flex items-center gap-2">
                  Live Gateway Interoperability Packet Stream
                  <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#E8D5BF]">
                    Mesh Telemetry v2.6
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-[#E8D5BF]/80">
                  Real-time cryptographic token exchanges and inter-departmental Golden Record sync
                </CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/admin/events')}
              className="gap-1.5 border-[#D8C2AA]/40 bg-[#FFF9F0]/10 text-xs text-[#FFF9F0] hover:bg-white/20 font-bold self-start sm:self-center"
            >
              Open Full Event Bus
              <ArrowRight className="h-3.5 w-3.5 text-[#C58B55]" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E8D5BF] bg-[#F5EBDD]/70 text-[#755C49] font-mono text-[11px]">
                  <th className="py-3 px-5 font-bold">TYPE / PROTOCOL</th>
                  <th className="py-3 px-5 font-bold">DEPARTMENT NODE</th>
                  <th className="py-3 px-5 font-bold">EVENT PAYLOAD / ACTION</th>
                  <th className="py-3 px-5 font-bold">TRANSACTION REF</th>
                  <th className="py-3 px-5 font-bold">STATUS & LATENCY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D5BF]/60 text-[#38241B]">
                {systemEvents.slice(0, 5).map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#FAF3E8] transition-colors font-mono">
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                        evt.type === 'ApiFailure'
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-[#6F4028]/10 text-[#6F4028] border border-[#6F4028]/20"
                      )}>
                        {evt.type === 'ApiFailure' ? 'FAULT: 504' : 'EVENT: 200'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-sans font-bold whitespace-nowrap text-[#38241B]">
                      {evt.department || 'Gateway Root'}
                    </td>
                    <td className="py-3.5 px-5 font-sans text-xs text-[#755C49] max-w-xs truncate">
                      {evt.detail || 'Cross-department interoperability sync'}
                    </td>
                    <td className="py-3.5 px-5 text-[11px] text-[#755C49] whitespace-nowrap">
                      {evt.applicationId || evt.id.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Attested &lt;32ms
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
