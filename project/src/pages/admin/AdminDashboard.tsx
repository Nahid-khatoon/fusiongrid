import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Network, Activity, Zap, CheckCircle2, Gauge, AlertTriangle,
  ArrowRight, TrendingUp, Clock, Database, ScrollText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { departmentConnectors } from '@/data/adminData';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  navigate: (to: string) => void;
}

const CONNECTOR_COLORS: Record<string, string> = {
  Revenue: 'hsl(210 80% 50%)',
  Education: 'hsl(142 64% 42%)',
  Health: 'hsl(0 72% 51%)',
  Welfare: 'hsl(38 92% 50%)',
  Identity: 'hsl(262 60% 55%)',
  Treasury: 'hsl(199 70% 48%)',
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
    const successRate = requestsToday > 0 ? Number(((successToday / requestsToday) * 100).toFixed(1)) : 0;

    const configuredLatency = activeConnectors
      .map((d) => d.avgLatency)
      .filter((latency) => latency > 0);
    const avgLatency = configuredLatency.length
      ? Math.round(configuredLatency.reduce((sum, value) => sum + value, 0) / configuredLatency.length)
      : 0;

    const departmentCounts: Record<string, number> = {};
    todayEvents.forEach((event) => {
      const department = shortDepartment(event.department);
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    const knownDepartments = ['Revenue', 'Education', 'Health', 'Welfare', 'Identity', 'Treasury'];
    const departmentWorkload = knownDepartments.map((department) => ({
      department,
      requests: departmentCounts[department] || 0,
      fill: CONNECTOR_COLORS[department],
    }));

    const hours = Array.from({ length: 12 }, (_, index) => index * 2);
    const apiRequests = hours.map((hour) => {
      const label = `${String(hour).padStart(2, '0')}:00`;
      const events = todayEvents.filter((event) => hourLabel(event.timestamp) === label);
      return {
        hour: label,
        requests: events.length,
        failures: events.filter((event) => event.type === 'ApiFailure').length,
      };
    });

    const outcomeData = [
      { name: 'Success', value: successToday, fill: 'hsl(142 71% 45%)' },
      { name: 'Failure', value: failuresToday, fill: 'hsl(0 72% 51%)' },
      { name: 'Timeout', value: timeoutToday, fill: 'hsl(38 92% 50%)' },
    ];

    // There is no real per-request latency stored in the current prototype.
    // Use connector configuration as the current simulated baseline rather than inventing live latency.
    const latencyByDepartment = knownDepartments.map((department) => {
      const connector = activeConnectors.find((item) => shortDepartment(item.name) === department);
      return { department, latency: connector?.avgLatency ?? 0 };
    });

    const totalApplications = applications.length;
    const completedApplications = applications.filter((app) => app.status === 'approved' || app.status === 'rejected').length;
    const slaCompliance = totalApplications > 0
      ? Number(((completedApplications / totalApplications) * 100).toFixed(1))
      : 0;

    const dataQualityIssues = [
      { type: 'API Failures', count: apiFailures.length, fill: 'hsl(0 72% 51%)' },
      { type: 'Pending Apps', count: applications.filter((app) => app.status === 'submitted').length, fill: 'hsl(38 92% 50%)' },
      { type: 'Info Requested', count: applications.filter((app) => app.status === 'info_requested').length, fill: 'hsl(262 60% 55%)' },
      { type: 'Rejected', count: applications.filter((app) => app.status === 'rejected').length, fill: 'hsl(210 80% 50%)' },
      { type: 'Approved', count: applications.filter((app) => app.status === 'approved').length, fill: 'hsl(142 64% 42%)' },
    ];

    return {
      connectedDepartments,
      activeApis,
      requestsToday,
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
    { label: 'Connected Departments', value: dynamic.connectedDepartments, icon: Network, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active APIs', value: dynamic.activeApis, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Requests Today', value: dynamic.requestsToday.toLocaleString(), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Latency', value: `${dynamic.avgLatency}ms`, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'API Success Rate', value: `${dynamic.successRate}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'SLA Compliance', value: `${dynamic.slaCompliance}%`, icon: Gauge, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">FusionGrid Control Center</h1>
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Fictional Prototype
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          System-wide interoperability monitoring, API gateway health, and data quality oversight.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 animate-fade-in-up">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-border/60">
              <CardContent className="p-4">
                <div className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-lg', m.bg)}>
                  <Icon className={cn('h-4.5 w-4.5', m.color)} />
                </div>
                <p className="text-2xl font-bold tracking-tight">{m.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3 animate-fade-in-up">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              API Requests Over Time (Today)
            </CardTitle>
            <CardDescription>Requests generated by the live prototype event system</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dynamic.apiRequests}>
                <defs>
                  <linearGradient id="dynamicRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210 80% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210 80% 50%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dynamicFailures" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(210 40% 85%)', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="requests" stroke="hsl(210 80% 50%)" fillOpacity={1} fill="url(#dynamicRequests)" name="Requests" />
                <Area type="monotone" dataKey="failures" stroke="hsl(0 72% 51%)" fillOpacity={1} fill="url(#dynamicFailures)" name="Failures" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Success / Failure Distribution</CardTitle>
            <CardDescription>Current prototype activity today</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dynamic.outcomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(1)}%`}>
                  {dynamic.outcomeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2 animate-fade-in-up">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Department Workload</CardTitle>
            <CardDescription>Live events by department today</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dynamic.departmentWorkload} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" />
                <YAxis type="category" dataKey="department" tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" width={80} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="requests" radius={[0, 4, 4, 0]}>
                  {dynamic.departmentWorkload.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Processing Time by Department</CardTitle>
            <CardDescription>Current simulated connector latency baseline</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dynamic.latencyByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="hsl(210 40% 50%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" unit="ms" />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="latency" radius={[4, 4, 0, 0]} fill="hsl(210 80% 50%)" name="Latency (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2 animate-fade-in-up">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">SLA Compliance</CardTitle>
            <CardDescription>Completed applications vs total applications in the current prototype state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[280px] items-center justify-center">
              <div className="text-center">
                <p className="text-6xl font-bold tracking-tight">{dynamic.slaCompliance}%</p>
                <p className="mt-2 text-sm text-muted-foreground">{applications.filter((app) => app.status === 'approved' || app.status === 'rejected').length} completed / {applications.length} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Live Data Quality / Workflow Status</CardTitle>
            <CardDescription>Current application and API state</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dynamic.dataQualityIssues}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 10 }} stroke="hsl(210 40% 50%)" angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {dynamic.dataQualityIssues.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in-up">
        {[
          { label: 'Department Integrations', path: '/admin/integrations', icon: Network },
          { label: 'API Gateway Monitor', path: '/admin/api-monitor', icon: Activity },
          { label: 'Data Quality', path: '/admin/data-quality', icon: Database },
          { label: 'Audit Logs', path: '/admin/audit', icon: ScrollText },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <span className="flex-1 text-sm font-semibold">{link.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
