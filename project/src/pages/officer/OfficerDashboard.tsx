import {
  FileText, Clock, AlertTriangle, CheckCircle2, ArrowRight,
  Building2, TrendingUp,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

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
  submitted: 'hsl(210 80% 50%)',
  verification: 'hsl(38 92% 50%)',
  processing: 'hsl(210 80% 50%)',
  approved: 'hsl(142 64% 42%)',
  info: 'hsl(262 60% 55%)',
  rejected: 'hsl(0 72% 51%)',
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

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
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

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    submitted: 'Submitted',
    under_verification: 'Under Verification',
    processing: 'Processing',
    approved: 'Approved',
    info_requested: 'Info Requested',
    rejected: 'Rejected',
  };

  return labels[status] || status.replace(/_/g, ' ');
}

export function OfficerDashboard({ navigate }: OfficerDashboardProps) {
  const { applications, user } = useApp();

  const officerName = user?.name || 'Officer';
  const department = user?.department || 'Social Welfare Department';

  /*
   * Everything below is derived from the current AppContext application state.
   * There are no chartData/mockData values here.
   */
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
      label: 'Pending Applications',
      value: pendingApps.length,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Due Today',
      value: slaStats.dueToday,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'SLA Breaches',
      value: slaStats.breaches,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: 'Completed Today',
      value: completedToday,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Officer Dashboard
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium">{officerName}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>Officer</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {department}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.label}
              className="border-border/60 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                    <p className="mt-1 font-display text-3xl font-bold">{m.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${m.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Applications by Status */}
        <Card className="border-border/60 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-base">Applications by Status</CardTitle>
            <CardDescription>
              Live distribution of submitted applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applicationsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={applicationsByStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {applicationsByStatus.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No application data yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Time */}
        <Card className="border-border/60 animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle className="text-base">Processing Time (days)</CardTitle>
            <CardDescription>
              Average completion time from applications completed in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processingTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={processingTimeData} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="service"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                  <Bar
                    dataKey="processingDays"
                    name="Average Days"
                    fill="hsl(210 80% 50%)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No completed applications in the last 7 days.
              </div>
            )}
          </CardContent>
        </Card>

        {/* SLA Compliance */}
        <Card className="border-border/60 animate-fade-in-up delay-200">
          <CardHeader>
            <CardTitle className="text-base">SLA Compliance</CardTitle>
            <CardDescription>
              Calculated from actual application SLA deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={slaComplianceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, _name, props: any) => [
                    `${value}% (${props?.payload?.total ?? 0} applications)`,
                    'Compliance',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  name="SLA Compliance"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2.5}
                  dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Workload */}
        <Card className="border-border/60 animate-fade-in-up delay-300">
          <CardHeader>
            <CardTitle className="text-base">Department Workload</CardTitle>
            <CardDescription>
              Active applications grouped by their current department
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departmentWorkload.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={departmentWorkload} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    dataKey="department"
                    type="category"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="applications"
                    name="Active Applications"
                    fill="hsl(210 80% 50%)"
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No active applications yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications Quick View */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Pending Review</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/officer/queue')}
            className="gap-1 text-muted-foreground"
          >
            View Queue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {pendingApps.slice(0, 3).map((app, i) => (
            <Card
              key={app.id}
              className="cursor-pointer border-border/60 transition-all hover:shadow-md animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => navigate(`/officer/review/${app.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold">{app.serviceName}</h3>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{app.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{app.progress}%</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingApps.length === 0 && (
            <Card className="border-border/60">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No applications are currently pending review.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Impact summary */}
      <Card className="mt-6 border-accent/20 bg-accent/5 animate-fade-in-up">
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="font-display text-sm font-semibold">Today's Summary</h3>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            You have reviewed{' '}
            <span className="font-semibold text-foreground">{completedToday}</span>{' '}
            applications today, with{' '}
            <span className="font-semibold text-foreground">{slaStats.dueToday}</span>{' '}
            due today.{' '}
            <span className="font-semibold text-destructive">{slaStats.breaches}</span>{' '}
            applications have breached SLA and require immediate attention.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 gap-1 px-0 text-accent hover:text-accent"
            onClick={() => navigate('/officer/sla')}
          >
            View SLA Report
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
