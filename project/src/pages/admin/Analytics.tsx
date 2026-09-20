import { useMemo } from 'react';
import {
  BarChart3, TrendingUp, Clock, CheckCircle2, ArrowRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

interface AnalyticsProps {
  navigate: (to: string) => void;
}

const COLORS = {
  success: 'hsl(142 64% 42%)',
  failure: 'hsl(0 72% 51%)',
  timeout: 'hsl(38 92% 50%)',
  primary: 'hsl(210 80% 50%)',
  identity: 'hsl(262 60% 55%)',
  education: 'hsl(142 64% 42%)',
  health: 'hsl(0 72% 51%)',
};

function eventDepartment(event: any): string {
  return event?.department || (
    event?.type === 'IncomeVerified' ? 'Revenue Department' :
    event?.type === 'StudentVerified' ? 'Education Department' :
    event?.type === 'ApiFailure' ? 'Revenue Department' :
    event?.type === 'ApplicationApproved' || event?.type === 'ApplicationRejected' ? 'Application Processing' :
    event?.type === 'ConsentGranted' || event?.type === 'ConsentRevoked' ? 'Consent Manager' :
    'FusionGrid'
  );
}

function shortDepartment(name: string): string {
  return name
    .replace(' Department', '')
    .replace(' Service', '')
    .replace(' Manager', '');
}

export function Analytics({ navigate }: AnalyticsProps) {
  const app = useApp();

  // Keep this tolerant of older AppContext versions.
  const systemEvents = Array.isArray((app as any).systemEvents) ? (app as any).systemEvents : [];
  const apiFailures = Array.isArray((app as any).apiFailures) ? (app as any).apiFailures : [];
  const applications = Array.isArray((app as any).applications) ? (app as any).applications : [];

  const apiTraffic = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return hours.map((hour) => {
      const eventsThisHour = systemEvents.filter((event: any) => {
        const timestamp = event?.timestamp;
        if (!timestamp) return false;
        const date = new Date(timestamp);
        return !Number.isNaN(date.getTime()) && date.getHours() === hour;
      });

      const failuresThisHour = apiFailures.filter((failure: any) => {
        const timestamp = failure?.timestamp;
        if (!timestamp) return false;
        const date = new Date(timestamp);
        return !Number.isNaN(date.getTime()) && date.getHours() === hour;
      });

      const eventFailures = eventsThisHour.filter(
        (event: any) => event?.type === 'ApiFailure'
      ).length;

      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        requests: eventsThisHour.length,
        failures: eventFailures + failuresThisHour.length,
      };
    });
  }, [systemEvents, apiFailures]);

  const departmentWorkload = useMemo(() => {
    const counts = new Map<string, number>();

    systemEvents.forEach((event: any) => {
      const department = shortDepartment(eventDepartment(event));
      counts.set(department, (counts.get(department) || 0) + 1);
    });

    apiFailures.forEach((failure: any) => {
      const department = shortDepartment(failure?.department || 'Unknown');
      counts.set(department, (counts.get(department) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([department, requests]) => ({ department, requests }));
  }, [systemEvents, apiFailures]);

  const outcomes = useMemo(() => {
    let success = 0;
    let failure = 0;
    let timeout = 0;

    systemEvents.forEach((event: any) => {
      if (event?.type === 'ApiFailure' || event?.type === 'ApplicationRejected') {
        failure += 1;
      } else {
        success += 1;
      }
    });

    apiFailures.forEach((failureState: any) => {
      if (failureState?.retryState === 'recovered') {
        success += 1;
      } else if (failureState?.retryState === 'retrying') {
        timeout += 1;
      } else {
        failure += 1;
      }
    });

    // Always return the same object shape so TypeScript/Recharts
    // does not complain about entry.fill.
    return [
      { name: 'Success', value: success, fill: COLORS.success },
      { name: 'Failure', value: failure, fill: COLORS.failure },
      { name: 'Timeout', value: timeout, fill: COLORS.timeout },
    ];
  }, [systemEvents, apiFailures]);

  const workflowActivity = useMemo(() => {
    const byDay = new Map<string, {
      day: string;
      identity: number;
      revenue: number;
      education: number;
      health: number;
    }>();

    systemEvents.forEach((event: any) => {
      if (!event?.timestamp) return;

      const date = new Date(event.timestamp);
      if (Number.isNaN(date.getTime())) return;

      const day = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });

      const department = shortDepartment(eventDepartment(event));
      const row = byDay.get(day) || {
        day,
        identity: 0,
        revenue: 0,
        education: 0,
        health: 0,
      };

      const lower = department.toLowerCase();

      if (lower.includes('identity')) row.identity += 1;
      if (lower.includes('revenue')) row.revenue += 1;
      if (lower.includes('education')) row.education += 1;
      if (lower.includes('health')) row.health += 1;

      byDay.set(day, row);
    });

    return Array.from(byDay.values()).slice(-7);
  }, [systemEvents]);

  const completionTrend = useMemo(() => {
    const total = applications.length;

    const completed = applications.filter((application: any) =>
      ['approved', 'rejected'].includes(application?.status)
    ).length;

    const completion = total
      ? Number(((completed / total) * 100).toFixed(1))
      : 0;

    return [{ period: 'Current', completion }];
  }, [applications]);

  const dataQuality = useMemo(() => {
    return [
      {
        type: 'API Failures',
        count: apiFailures.length,
        fill: COLORS.failure,
      },
      {
        type: 'Rejected',
        count: applications.filter(
          (application: any) => application?.status === 'rejected'
        ).length,
        fill: COLORS.timeout,
      },
      {
        type: 'Pending',
        count: applications.filter(
          (application: any) =>
            ['submitted', 'under_review'].includes(application?.status)
        ).length,
        fill: COLORS.primary,
      },
    ];
  }, [apiFailures, applications]);

  const totalEvents = systemEvents.length + apiFailures.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live analytics generated from FusionGrid workflow events, API failures, and applications.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {totalEvents} live system events recorded
        </p>
      </div>

      {/* API Traffic */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            API / System Traffic (24h)
          </CardTitle>
          <CardDescription>
            Live event and failure volume from the current prototype
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={apiTraffic}>
              <defs>
                <linearGradient id="analyticsReqLive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="analyticsFailLive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.failure} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.failure} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(210 40% 50%)" allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />

              <Area
                type="monotone"
                dataKey="requests"
                stroke={COLORS.primary}
                fill="url(#analyticsReqLive)"
                name="Events"
              />
              <Area
                type="monotone"
                dataKey="failures"
                stroke={COLORS.failure}
                fill="url(#analyticsFailLive)"
                name="Failures"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Workload + Outcomes */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2 animate-fade-in-up">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              Department Workload
            </CardTitle>
            <CardDescription>
              Live events and API failures by department
            </CardDescription>
          </CardHeader>

          <CardContent>
            {departmentWorkload.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentWorkload} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="department" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar
                    dataKey="requests"
                    fill={COLORS.primary}
                    radius={[0, 4, 4, 0]}
                    name="Live Events"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No live department events yet." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              API Call Outcomes
            </CardTitle>
            <CardDescription>
              Calculated from live system events and failure simulations
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={outcomes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(1)}%`
                  }
                >
                  {outcomes.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Activity + Completion */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2 animate-fade-in-up">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Live Workflow Activity
            </CardTitle>
            <CardDescription>
              Events generated by Identity, Revenue, Education and Health services
            </CardDescription>
          </CardHeader>

          <CardContent>
            {workflowActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={workflowActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />

                  <Line type="monotone" dataKey="identity" stroke={COLORS.identity} name="Identity" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="revenue" stroke={COLORS.primary} name="Revenue" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="education" stroke={COLORS.education} name="Education" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="health" stroke={COLORS.health} name="Health" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No workflow activity yet." />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Application Completion
            </CardTitle>
            <CardDescription>
              Completed applications versus total applications
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={completionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke={COLORS.success}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Completion %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Data / Workflow Issues */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-base">
            Live Data / Workflow Issues
          </CardTitle>
          <CardDescription>
            Current API failures and application states from shared prototype state
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataQuality}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 40% 90%)" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Count">
                {dataQuality.map((entry) => (
                  <Cell key={entry.type} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
