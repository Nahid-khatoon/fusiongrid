import {
  Gauge,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  Calendar,
  ChevronRight,
  User,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SlaBadge } from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';
import type { SlaStatus, SlaItem, Application } from '@/types';
import { cn } from '@/lib/utils';

interface SlaMonitoringProps {
  navigate: (to: string) => void;
}

const slaDaysByService: Record<string, number> = {
  'MahaScholarship': 20,
  'Income Certificate': 10,
  'Student Education Benefit': 15,
  'Social Welfare Scheme': 30,
  'Health Assistance Scheme': 7,
};

const defaultSlaDays = 15;

function computeSlaItems(applications: Application[], citizenMap: Record<string, { name: string; district: string }>): SlaItem[] {
  const now = new Date('2026-08-25T00:00:00');

  return applications
    .filter((a) => a.status !== 'approved' && a.status !== 'rejected')
    .map((a) => {
      const totalSlaDays = slaDaysByService[a.serviceName] ?? defaultSlaDays;
      const submitted = new Date(a.submittedAt);
      const slaDeadline = new Date(submitted);
      slaDeadline.setDate(slaDeadline.getDate() + totalSlaDays);
      const diffMs = slaDeadline.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let slaStatus: SlaStatus;
      if (daysRemaining < 0) slaStatus = 'breached';
      else if (daysRemaining <= 2) slaStatus = 'due_soon';
      else slaStatus = 'on_track';

      return {
        applicationId: a.id,
        serviceName: a.serviceName,
        citizenName: citizenMap[a.id]?.name ?? 'Citizen Applicant',
        submittedAt: a.submittedAt,
        slaDeadline: slaDeadline.toISOString(),
        slaStatus,
        daysRemaining,
        totalSlaDays,
      };
    });
}

export function SlaMonitoring({ navigate }: SlaMonitoringProps) {
  const { applications, citizenMap } = useApp();
  const slaItems = computeSlaItems(applications, citizenMap);

  const onTrack = slaItems.filter((s) => s.slaStatus === 'on_track');
  const dueSoon = slaItems.filter((s) => s.slaStatus === 'due_soon');
  const breached = slaItems.filter((s) => s.slaStatus === 'breached');

  const summary = [
    { label: 'On Track (Compliant)', value: onTrack.length, desc: 'Operating safely within statutory timeline', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' },
    { label: 'Due Soon (Target <48h)', value: dueSoon.length, desc: 'Expedited officer review required today', icon: Clock, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
    { label: 'SLA Breached', value: breached.length, desc: 'Statutory citizen charter escalation', icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-100 border-rose-300' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Gauge className="h-3.5 w-3.5" />
              MAHARASHTRA PUBLIC SERVICES GUARANTEE ACT
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Citizen Charter SLA Compliance Monitor
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Statutory resolution time meters for active citizen files. Ensures zero departmental bottlenecks
              and strict adherence to government service delivery SLAs.
            </p>
          </div>

          <Button
            onClick={() => navigate('/officer/queue')}
            className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-md border-0 self-start md:self-auto"
          >
            Review Application Queue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#755C49]">{s.label}</span>
                  <p className="mt-1 font-display text-3xl font-bold text-[#38241B]">{s.value}</p>
                  <p className="mt-1 text-[11px] text-[#755C49]">{s.desc}</p>
                </div>
                <div className={cn('flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border', s.bg)}>
                  <Icon className={cn('h-6 w-6', s.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Breached section */}
      {breached.length > 0 && (
        <Card className="border-rose-300 bg-[#FFF8ED] shadow-md overflow-hidden">
          <CardHeader className="border-b border-rose-200 bg-rose-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-rose-900">
                  SLA Breached Applications ({breached.length})
                </CardTitle>
                <CardDescription className="text-xs text-rose-800">
                  These cases have exceeded statutory resolution limits. Immediate determination required by reviewing officer.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {breached.map((item) => (
              <SlaRow key={item.applicationId} item={item} navigate={navigate} urgent />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Due Soon section */}
      {dueSoon.length > 0 && (
        <Card className="border-[#C58B55] bg-[#FFF8ED] shadow-md overflow-hidden">
          <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C58B55]/20 text-[#6F4028] border border-[#D8C2AA]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#38241B]">
                  Approaching Statutory Deadline within 48 Hours ({dueSoon.length})
                </CardTitle>
                <CardDescription className="text-xs text-[#755C49]">
                  Prioritize these files to maintain departmental 100% SLA compliance score
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {dueSoon.map((item) => (
              <SlaRow key={item.applicationId} item={item} navigate={navigate} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* On Track Section */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#38241B]">
                  On-Track Active Pipeline ({onTrack.length})
                </CardTitle>
                <CardDescription className="text-xs text-[#755C49]">
                  Applications progressing within allocated statutory buffer
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 text-xs font-bold">
              ✓ Compliant
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          {onTrack.map((item) => (
            <SlaRow key={item.applicationId} item={item} navigate={navigate} />
          ))}
          {onTrack.length === 0 && (
            <p className="py-8 text-center text-xs text-[#755C49]">No applications currently in on-track buffer.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SlaRow({ item, navigate, urgent }: { item: SlaItem; navigate: (to: string) => void; urgent?: boolean }) {
  return (
    <div
      onClick={() => navigate(`/officer/review/${item.applicationId}`)}
      className={cn(
        'group cursor-pointer rounded-2xl border p-4.5 transition-all hover:shadow-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        urgent
          ? 'border-rose-300 bg-rose-50/50 hover:border-rose-400'
          : 'border-[#D8C2AA] bg-[#FFF8ED] hover:border-[#6F4028]'
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold border shadow-xs',
          urgent ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-[#F5EBDD] border-[#D8C2AA] text-[#6F4028]'
        )}>
          {item.daysRemaining < 0 ? `-${Math.abs(item.daysRemaining)}d` : `${item.daysRemaining}d`}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#6F4028] group-hover:underline">{item.applicationId}</span>
            <span className="text-xs font-bold text-[#38241B]">{item.serviceName}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#755C49]">
            <span>Applicant: <strong className="text-[#38241B]">{item.citizenName}</strong></span>
            <span>•</span>
            <span>Deadline: <strong className="text-[#38241B]">{new Date(item.slaDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong></span>
            <span>•</span>
            <span>Statutory Cap: {item.totalSlaDays} days</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <SlaBadge status={item.slaStatus} />
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1 text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2] font-semibold"
        >
          Review File
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
