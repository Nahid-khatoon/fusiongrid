import { useMemo } from 'react';
import {
  BarChart3, TrendingUp, Clock, CheckCircle2, ArrowRight,
  Shield, Activity, Layers, PieChart as PieChartIcon,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface AnalyticsProps {
  navigate: (to: string) => void;
}

const COLORS = {
  success: '#10b981',
  failure: '#ef4444',
  timeout: '#C58B55',
  primary: '#6F4028',
  darkChocolate: '#2B1B14',
  richMocha: '#4A2E22',
  caramel: '#C58B55',
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
        requests: eventsThisHour.length > 0 ? eventsThisHour.length : Math.max(2, Math.floor(Math.sin(hour) * 8 + 12)),
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
      const department = shortDepartment(failure?.department || 'Revenue');
      counts.set(department, (counts.get(department) || 0) + 1);
    });

    if (counts.size === 0) {
      counts.set('Revenue', 24);
      counts.set('Education', 18);
      counts.set('Identity', 28);
      counts.set('Welfare', 16);
    }

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

    return [
      { name: 'Successful Attestations', value: success > 0 ? success : 48, fill: COLORS.success },
      { name: 'Fault Exceptions', value: failure > 0 ? failure : 2, fill: COLORS.failure },
      { name: 'Timeout Retries', value: timeout > 0 ? timeout : 1, fill: COLORS.timeout },
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

    const entries = Array.from(byDay.values());
    if (entries.length === 0) {
      return [
        { day: '04 Oct', identity: 12, revenue: 10, education: 8, health: 4 },
        { day: '05 Oct', identity: 15, revenue: 12, education: 11, health: 6 },
        { day: '06 Oct', identity: 19, revenue: 16, education: 14, health: 8 },
        { day: '07 Oct', identity: 17, revenue: 15, education: 13, health: 7 },
        { day: '08 Oct', identity: 22, revenue: 19, education: 17, health: 9 },
        { day: '09 Oct', identity: 26, revenue: 21, education: 20, health: 11 },
        { day: '10 Oct', identity: 30, revenue: 25, education: 24, health: 14 },
      ];
    }
    return entries.slice(-7);
  }, [systemEvents]);

  const totalEvents = systemEvents.length + apiFailures.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <BarChart3 className="h-3.5 w-3.5" />
              FEDERATED TELEMETRY INTELLIGENCE
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Cross-Department Platform Analytics & SLA Trends
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Consolidated throughput metrics, departmental load distribution, roundtrip resolution velocity,
              and fault outcome analytics across Maharashtra state public services.
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

      {/* API Traffic Area Chart */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#38241B]">24-Hour Gateway Traffic & Ingestion Volume</CardTitle>
              <CardDescription className="text-xs text-[#755C49]">Live attestation events and synthetic fault volume across 24 hourly buckets</CardDescription>
            </div>
            <Badge variant="outline" className="border-[#D8C2AA] bg-[#FFF8ED] text-[#6F4028] text-xs font-bold">
              ● Telemetry Stream
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={apiTraffic}>
              <defs>
                <linearGradient id="anReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8C2AA" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#755C49' }} stroke="#D8C2AA" />
              <YAxis tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF8ED',
                  borderColor: '#D8C2AA',
                  borderRadius: '14px',
                  fontSize: '12px',
                  color: '#38241B',
                  boxShadow: '0 10px 25px -5px rgba(43, 27, 20, 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#38241B' }} />
              <Area type="monotone" dataKey="requests" stroke={COLORS.primary} strokeWidth={2.5} fill="url(#anReq)" name="Hourly API Calls" />
              <Area type="monotone" dataKey="failures" stroke={COLORS.failure} strokeWidth={2} fill="none" name="Fault Exceptions" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Workload + Call Outcomes */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
          <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
            <CardTitle className="text-base font-bold text-[#38241B]">Departmental Workload Distribution</CardTitle>
            <CardDescription className="text-xs text-[#755C49]">Aggregated call volume by participating state nodal authority</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentWorkload} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#D8C2AA" strokeOpacity={0.6} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
                <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#755C49', fontWeight: 600 }} stroke="#D8C2AA" width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8ED',
                    borderColor: '#D8C2AA',
                    borderRadius: '14px',
                    fontSize: '12px',
                    color: '#38241B',
                  }}
                />
                <Bar dataKey="requests" fill={COLORS.primary} radius={[0, 8, 8, 0]} name="Invocations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
          <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
            <CardTitle className="text-base font-bold text-[#38241B]">Transaction Outcome Breakdown</CardTitle>
            <CardDescription className="text-xs text-[#755C49]">Resolved inter-agency requests vs exceptions & timeouts</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={outcomes}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={4}
                >
                  {outcomes.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} stroke="#FFF8ED" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF8ED',
                    borderColor: '#D8C2AA',
                    borderRadius: '14px',
                    fontSize: '12px',
                    color: '#38241B',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#38241B', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Series Department 7-Day Timeline */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <CardTitle className="text-base font-bold text-[#38241B]">7-Day Multi-Department Verification Velocity</CardTitle>
          <CardDescription className="text-xs text-[#755C49]">Comparative operational throughput across Identity, Revenue, Education, and Health nodes</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={workflowActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8C2AA" strokeOpacity={0.6} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#755C49' }} stroke="#D8C2AA" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF8ED',
                  borderColor: '#D8C2AA',
                  borderRadius: '14px',
                  fontSize: '12px',
                  color: '#38241B',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#38241B', fontWeight: 600 }} />
              <Line type="monotone" dataKey="identity" stroke={COLORS.darkChocolate} name="Identity (UIDAI)" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="revenue" stroke={COLORS.primary} name="Revenue (Land)" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="education" stroke={COLORS.caramel} name="Education (ABC)" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="health" stroke={COLORS.richMocha} name="Health (ABHA)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
