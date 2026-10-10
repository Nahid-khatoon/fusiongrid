import {
  FileText, Clock, AlertTriangle, CheckCircle2, ArrowRight,
  Building2, TrendingUp, Shield, BarChart3, PieChart as PieChartIcon,
  Activity, ChevronRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
  AreaChart, Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface OfficerDashboardProps {
  navigate: (to: string) => void;
}

const SLA_DAYS_BY_SERVICE: Record<string, number> = {
  'mahascholarship': 20,
  'income-certificate': 10,
  'social-welfare-scheme': 30,
  'health-assistance-scheme': 7,
  'health-assistance': 7,
  'student-education-benefit': 15,
};

const DEFAULT_SLA_DAYS = 15;

const COLORS = {
  submitted: '#6F4028',
  verification: '#C58B55',
  processing: '#805236',
  approved: '#059669',
  info: '#A27048',
  rejected: '#DC2626',
};

function normalize(value?: string) {
  return (value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
}

function getSlaDays(serviceName?: string, serviceId?: string) {
  return SLA_DAYS_BY_SERVICE[normalize(serviceId)] ??
    SLA_DAYS_BY_SERVICE[normalize(serviceName)] ??
    DEFAULT_SLA_DAYS;
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getLastActivityDate(app: any) {
  const timeline = Array.isArray(app.timeline) ? app.timeline : [];
  const timestamps = timeline
    .map((item: any) => parseDate(item?.timestamp))
    .filter((date: Date | null): date is Date => date !== null);

  const submitted = parseDate(app.submittedAt);
  if (submitted) timestamps.push(submitted);

  if (!timestamps.length) return null;

  return timestamps.reduce((latest: Date, current: Date): Date =>
    current.getTime() > latest.getTime() ? current : latest
  );
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function daysBetween(start?: string, end?: Date | null) {
  const submitted = parseDate(start);
  if (!submitted || !end) return null;

  const milliseconds = end.getTime() - submitted.getTime();
  if (milliseconds < 0) return null;

  return Number((milliseconds / (1000 * 60 * 60 * 24)).toFixed(1));
}

function getDepartment(app: any, fallbackDepartment: string) {
  const departments = Array.isArray(app.departments) ? app.departments : [];
  const lastDepartment = departments.length
    ? departments[departments.length - 1]
    : undefined;

  return lastDepartment || app.department || fallbackDepartment || 'Social Welfare';
}

export function OfficerDashboard({ navigate }: OfficerDashboardProps) {
  const { applications, user } = useApp();

  const officerName = user?.name || 'Officer';
  const department = user?.department || 'Social Welfare Department';

  const submittedApplications = applications.filter(
    (app) => app.status !== 'draft'
  );

  const pendingApps = submittedApplications.filter(
    (app) =>
      app.status === 'under_verification' ||
      app.status === 'processing' ||
      app.status === 'submitted' ||
      app.status === 'info_requested'
  );

  const now = new Date();

  const slaStats = pendingApps.reduce(
    (result, app) => {
      const submitted = parseDate(app.submittedAt);
      if (!submitted) return result;

      const deadline = new Date(submitted);
      deadline.setDate(deadline.getDate() + getSlaDays(app.serviceName, app.serviceId));

      if (deadline.getTime() < now.getTime()) {
        result.breaches += 1;
      } else if (isSameDay(deadline, now)) {
        result.dueToday += 1;
      }

      return result;
    },
    { dueToday: 0, breaches: 0 }
  );

  const completedToday = submittedApplications.filter((app) => {
    if (app.status !== 'approved' && app.status !== 'rejected') return false;
    const lastActivity = getLastActivityDate(app);
    return !!lastActivity && isSameDay(lastActivity, now);
  }).length;

  const metrics = [
    {
      label: 'Pending Queue',
      value: pendingApps.length,
      subtext: 'Awaiting officer adjudication',
      icon: FileText,
      pill: 'Active Caseload',
      borderAccent: 'border-t-[#6F4028]',
      color: 'text-[#6F4028]',
      bg: 'bg-[#F5EBDD] border-[#D8C2AA]',
    },
    {
      label: 'Due Today',
      value: slaStats.dueToday,
      subtext: 'Critical SLA target',
      icon: Clock,
      pill: 'High Priority',
      borderAccent: 'border-t-[#C58B55]',
      color: 'text-[#C58B55]',
      bg: 'bg-[#FFF8ED] border-[#D8C2AA]',
    },
    {
      label: 'SLA Breached',
      value: slaStats.breaches,
      subtext: 'Urgent priority escalation',
      icon: AlertTriangle,
      pill: slaStats.breaches > 0 ? 'Urgent Escalation' : 'Zero Breaches',
      borderAccent: 'border-t-red-600',
      color: 'text-red-700',
      bg: 'bg-red-100 border-red-300',
    },
    {
      label: 'Processed Today',
      value: completedToday,
      subtext: 'Approvals & rejections',
      icon: CheckCircle2,
      pill: 'Discharged Today',
      borderAccent: 'border-t-emerald-600',
      color: 'text-emerald-700',
      bg: 'bg-emerald-100 border-emerald-300',
    },
  ];

  const applicationsByStatus = (() => {
    const statuses = [
      { key: 'under_verification', name: 'Under Verification', fill: COLORS.verification },
      { key: 'processing', name: 'Processing', fill: COLORS.processing },
      { key: 'approved', name: 'Approved', fill: COLORS.approved },
      { key: 'info_requested', name: 'Info Requested', fill: COLORS.info },
      { key: 'submitted', name: 'Submitted', fill: COLORS.submitted },
      { key: 'rejected', name: 'Rejected', fill: COLORS.rejected },
    ];

    return statuses
      .map((item) => ({
        name: item.name,
        value: submittedApplications.filter((app) => app.status === item.key).length,
        fill: item.fill,
      }))
      .filter((item) => item.value > 0);
  })();

  const processingTimeData = (() => {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);

    const completedRecent = submittedApplications.filter((app) => {
      if (app.status !== 'approved' && app.status !== 'rejected') return false;

      const lastActivity = getLastActivityDate(app);
      return !!lastActivity && lastActivity >= cutoff && lastActivity <= now;
    });

    const serviceMap = new Map<string, { total: number; count: number }>();

    completedRecent.forEach((app) => {
      const lastActivity = getLastActivityDate(app);
      const duration = daysBetween(app.submittedAt, lastActivity);
      if (duration === null) return;

      const service = app.serviceName || 'Service';
      const current = serviceMap.get(service) || { total: 0, count: 0 };
      current.total += duration;
      current.count += 1;
      serviceMap.set(service, current);
    });

    return Array.from(serviceMap.entries()).map(([service, data]) => ({
      service: service.length > 18 ? `${service.slice(0, 18)}…` : service,
      processingDays: Number((data.total / data.count).toFixed(1)),
      applications: data.count,
    }));
  })();

  const slaComplianceData = (() => {
    const result: Array<{ day: string; compliance: number; total: number }> = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - offset);
      day.setHours(0, 0, 0, 0);

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const dayApps = submittedApplications.filter((app) => {
        const submitted = parseDate(app.submittedAt);
        return !!submitted && submitted >= day && submitted < nextDay;
      });

      let compliant = 0;

      dayApps.forEach((app) => {
        const submitted = parseDate(app.submittedAt);
        if (!submitted) return;

        const deadline = new Date(submitted);
        deadline.setDate(deadline.getDate() + getSlaDays(app.serviceName, app.serviceId));

        const lastActivity = getLastActivityDate(app);

        if (app.status === 'approved' || app.status === 'rejected') {
          if (lastActivity && lastActivity.getTime() <= deadline.getTime()) compliant += 1;
        } else if (deadline.getTime() >= now.getTime()) {
          compliant += 1;
        }
      });

      result.push({
        day: day.toLocaleDateString('en-IN', { weekday: 'short' }),
        compliance: dayApps.length
          ? Number(((compliant / dayApps.length) * 100).toFixed(1))
          : 0,
        total: dayApps.length,
      });
    }

    return result;
  })();

  const departmentWorkload = (() => {
    const counts = new Map<string, number>();

    pendingApps.forEach((app) => {
      const name = getDepartment(app, department);
      counts.set(name, (counts.get(name) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, applications]) => ({
        department: name.replace(' Department', ''),
        applications,
      }))
      .sort((a, b) => b.applications - a.applications);
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 bg-[#F5EBDD] text-[#38241B]">
      {/* Officer Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#D8C2AA] bg-gradient-to-br from-[#38241B] via-[#4A2B1B] to-[#21140F] p-6 text-[#FFF8ED] shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#D8C2AA]/40 bg-[#FFF8ED]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#FFF8ED]">
                <Shield className="h-3 w-3 text-[#C58B55]" />
                VERIFICATION CONSOLE
              </span>
              <span className="rounded-full bg-[#FFF8ED]/10 px-2.5 py-0.5 text-[11px] text-[#D8C2AA]">
                {department}
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Officer Operations Dashboard
            </h1>
            <p className="mt-1 text-xs text-[#D8C2AA]">
              Welcome back, <span className="font-semibold text-[#FFF8ED]">{officerName}</span>. Zero backlog target active for SIH 2026.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              onClick={() => navigate('/officer/queue')}
              className="gap-2 bg-[#6F4028] text-[#FFF8ED] hover:bg-[#805236] shadow-md border-0"
            >
              Open Application Queue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row — Elevated with Luxury Status Pills & Top Accent Borders */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.label}
              className={`rounded-2xl border border-[#E8D5BF] ${m.borderAccent} border-t-4 bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] shadow-luxury transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1 hover:border-[#6F4028] text-[#38241B]`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-[#EAD8C2]/60 px-2.5 py-0.5 text-[10px] font-bold text-[#6F4028]">
                      {m.pill}
                    </span>
                    <p className="mt-2.5 font-display text-3xl font-black text-[#38241B]">{m.value}</p>
                    <p className="mt-1 text-xs font-bold text-[#38241B]">{m.label}</p>
                    <p className="mt-0.5 text-[11px] text-[#755C49]">{m.subtext}</p>
                  </div>
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border shadow-xs', m.bg)}>
                    <Icon className={cn('h-6 w-6', m.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      {/* Charts Grid — High-Contrast Header Ribbons & SVG Gradients */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications by Status */}
        <Card className="rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#38241B] overflow-hidden">
          <CardHeader className="border-b border-[#E8D5BF] pb-4 bg-gradient-to-r from-[#F5EBDD] via-[#FFF9F0] to-[#F5EBDD]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base font-bold text-[#38241B]">Applications by Lifecycle Status</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">Live distribution across verification pipeline stages</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#FFF9F0] px-2.5 py-1 text-[11px] font-semibold text-[#6F4028]">
                <PieChartIcon className="h-3.5 w-3.5" />
                <span>Live Stream</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {applicationsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={applicationsByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {applicationsByStatus.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.fill} stroke="#FFF9F0" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF9F0',
                      borderColor: '#D8C2AA',
                      color: '#38241B',
                      borderRadius: '14px',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(56,36,27,0.12)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', color: '#755C49', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-xs text-[#755C49]">
                No application data logged in queue.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Time (Days) — With Caramel to Chocolate Gradient */}
        <Card className="rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#38241B] overflow-hidden">
          <CardHeader className="border-b border-[#E8D5BF] pb-4 bg-gradient-to-r from-[#F5EBDD] via-[#FFF9F0] to-[#F5EBDD]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base font-bold text-[#38241B]">Average Turnaround Latency (Days)</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">Mean resolution duration for cases finalized in last 7 days</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#FFF9F0] px-2.5 py-1 text-[11px] font-semibold text-[#6F4028]">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>7-Day SLA</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {processingTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={processingTimeData} barGap={4}>
                  <defs>
                    <linearGradient id="officerTurnaroundGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C58B55" />
                      <stop offset="100%" stopColor="#6F4028" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5BF" strokeOpacity={0.6} vertical={false} />
                  <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#755C49' }} stroke="#D8C2AA" />
                  <YAxis tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF9F0',
                      borderColor: '#D8C2AA',
                      color: '#38241B',
                      borderRadius: '14px',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(56,36,27,0.12)',
                    }}
                  />
                  <Bar
                    dataKey="processingDays"
                    name="Average Days"
                    fill="url(#officerTurnaroundGrad)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-xs text-[#755C49]">
                No finalized applications in the current window.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 7-Day SLA Compliance Trend — Upgraded to AreaChart with Caramel Glow Fill */}
        <Card className="rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#38241B] overflow-hidden">
          <CardHeader className="border-b border-[#E8D5BF] pb-4 bg-gradient-to-r from-[#F5EBDD] via-[#FFF9F0] to-[#F5EBDD]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base font-bold text-[#38241B]">7-Day Statutory SLA Compliance Trend</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">Proportion of applications adjudicated within statutory deadline</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#FFF9F0] px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50">
                <Activity className="h-3.5 w-3.5 text-emerald-700" />
                <span>Target: 95%+</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={slaComplianceData}>
                <defs>
                  <linearGradient id="officerSlaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C58B55" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C58B55" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8D5BF" strokeOpacity={0.6} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF9F0',
                    borderColor: '#D8C2AA',
                    color: '#38241B',
                    borderRadius: '14px',
                    fontSize: '12px',
                    boxShadow: '0 8px 24px rgba(56,36,27,0.12)',
                  }}
                  formatter={(value: number, _name, props: any) => [
                    `${value}% (${props?.payload?.total ?? 0} applications)`,
                    'Compliance Ratio',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="compliance"
                  name="SLA Compliance"
                  stroke="#C58B55"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#officerSlaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Workload — Horizontal Bar with Warm Mocha Gradient */}
        <Card className="rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#38241B] overflow-hidden">
          <CardHeader className="border-b border-[#E8D5BF] pb-4 bg-gradient-to-r from-[#F5EBDD] via-[#FFF9F0] to-[#F5EBDD]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base font-bold text-[#38241B]">Cross-Department Workload Caseload</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">Active queue distribution across state nodal bodies</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#FFF9F0] px-2.5 py-1 text-[11px] font-semibold text-[#6F4028]">
                <Building2 className="h-3.5 w-3.5" />
                <span>Inter-Agency</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {departmentWorkload.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departmentWorkload} layout="vertical">
                  <defs>
                    <linearGradient id="officerWorkloadGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6F4028" />
                      <stop offset="100%" stopColor="#C58B55" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5BF" strokeOpacity={0.6} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF9F0',
                      borderColor: '#D8C2AA',
                      color: '#38241B',
                      borderRadius: '14px',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(56,36,27,0.12)',
                    }}
                  />
                  <Bar
                    dataKey="applications"
                    name="Active Cases"
                    fill="url(#officerWorkloadGrad)"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-xs text-[#755C49]">
                No active load in departmental queues.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications Quick Adjudication List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-[#38241B]">Applications Awaiting Officer Adjudication</h2>
            <p className="text-xs text-[#755C49]">Immediate priority items ordered by oldest submission</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/officer/queue')}
            className="gap-1.5 text-xs font-semibold border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]"
          >
            View Full Queue ({pendingApps.length})
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pendingApps.slice(0, 3).map((app) => (
            <Card
              key={app.id}
              className="group cursor-pointer border-[#D8C2AA] bg-[#FFF8ED] shadow-sm transition-all hover:border-[#6F4028] hover:shadow-md text-[#38241B]"
              onClick={() => navigate(`/officer/review/${app.id}`)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-[#6F4028]">{app.id}</span>
                    <h3 className="mt-0.5 font-semibold text-sm text-[#38241B] line-clamp-1">{app.serviceName}</h3>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="flex items-center justify-between border-t border-[#D8C2AA] pt-2.5 text-xs text-[#755C49]">
                  <span>Progress: <strong className="text-[#38241B]">{app.progress}%</strong></span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#6F4028] group-hover:translate-x-0.5 transition-transform">
                    Review
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingApps.length === 0 && (
            <Card className="col-span-full border-[#D8C2AA] bg-[#FFF8ED]">
              <CardContent className="p-8 text-center text-xs text-[#755C49]">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-700 mb-2" />
                No applications are currently awaiting officer action. All queues cleared!
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Operational Summary Callout */}
      <Card className="border-[#D8C2AA] bg-[#F5EBDD] p-5 shadow-sm text-[#38241B]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF8ED] text-[#6F4028] border border-[#D8C2AA]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#38241B]">Officer Shift Summary & Compliance Health</h3>
              <p className="mt-0.5 text-xs text-[#755C49]">
                You have resolved <strong className="text-[#38241B]">{completedToday}</strong> applications today. <strong className="text-[#38241B]">{slaStats.dueToday}</strong> are due before midnight. {slaStats.breaches > 0 && <span className="text-red-700 font-semibold">{slaStats.breaches} breaches require remediation.</span>}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/officer/sla')}
            className="shrink-0 text-xs gap-1.5 border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]"
          >
            Open SLA Monitor
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
