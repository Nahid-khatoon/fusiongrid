import { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';
import type { ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ApplicationsListProps {
  navigate: (to: string) => void;
}

const statusFilters: (ApplicationStatus | 'all')[] = [
  'all',
  'under_verification',
  'processing',
  'approved',
  'rejected',
  'info_requested',
];

const labels: Record<string, string> = {
  all: 'All Applications',
  under_verification: 'Under Verification',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
  info_requested: 'Action Required',
};

export function ApplicationsList({ navigate }: ApplicationsListProps) {
  const { applications } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  const submitted = applications.filter((a) => a.status !== 'draft');

  const stats = useMemo(() => {
    return {
      total: submitted.length,
      underVerification: submitted.filter((a) => a.status === 'under_verification' || a.status === 'processing').length,
      approved: submitted.filter((a) => a.status === 'approved').length,
      actionNeeded: submitted.filter((a) => a.status === 'info_requested').length,
    };
  }, [submitted]);

  const filtered = useMemo(() => {
    return submitted.filter((a) => {
      const matchesSearch =
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.serviceName.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || a.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [submitted, search, filter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <FileText className="h-3.5 w-3.5" />
              CITIZEN SCHEME LIFECYCLE TRACKER
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              My Government Applications
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Track real-time statutory review, automated inter-departmental verification checkpoints, and certified decision letters.
            </p>
          </div>

          <Button
            onClick={() => navigate('/portal/services')}
            className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-lg shadow-[#C58B55]/25 border-0"
          >
            <Plus className="h-4 w-4" />
            Apply for New Scheme
          </Button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Submitted', value: stats.total, icon: FileText, color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
          { label: 'In Verification', value: stats.underVerification, icon: Clock, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
          { label: 'Approved & Granted', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' },
          { label: 'Action Required', value: stats.actionNeeded, icon: AlertCircle, color: 'text-rose-700', bg: 'bg-rose-100 border-rose-300' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#755C49]">{s.label}</span>
                  <p className="mt-1 font-display text-2xl font-bold text-[#38241B]">{s.value}</p>
                </div>
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl border', s.bg)}>
                  <Icon className={cn('h-5 w-5', s.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#755C49]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10 pr-4 text-xs rounded-xl shadow-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] focus:border-[#C58B55]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D8C2AA]/60">
            <span className="text-xs font-bold text-[#755C49] mr-1 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter by:
            </span>
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'rounded-full border px-3.5 py-1 text-xs font-semibold transition-all duration-200',
                  filter === s
                    ? 'border-[#6F4028] bg-[#6F4028] text-[#FFF8ED] shadow-sm'
                    : 'border-[#D8C2AA] bg-[#FFF8ED] text-[#755C49] hover:border-[#6F4028] hover:bg-[#EAD8C2] hover:text-[#38241B]'
                )}
              >
                {labels[s]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Applications List Cards */}
      <div className="space-y-4">
        {filtered.map((app, i) => (
          <Card
            key={app.id}
            className="group cursor-pointer border-[#D8C2AA] bg-[#FFF8ED] transition-all duration-300 hover:border-[#6F4028] hover:shadow-xl animate-fade-in-up overflow-hidden"
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => navigate(`/portal/applications/${app.id}`)}
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#6F4028] via-[#C58B55] to-[#805236] opacity-80 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] transition-colors group-hover:bg-[#6F4028] group-hover:text-[#FFF8ED] border border-[#D8C2AA] shadow-sm">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-display text-base font-bold text-[#38241B] group-hover:text-[#6F4028] transition-colors">
                        {app.serviceName}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#755C49]">
                      <span className="font-bold text-[#6F4028]">APP ID: {app.id}</span>
                      {app.requestId && <span>• REQ: {app.requestId}</span>}
                      {app.submittedAt && (
                        <span>• Submitted: {new Date(app.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#755C49]">
                      <span>Nodal Departments:</span>
                      {(app.departments || ['Revenue', 'Education', 'Social Welfare']).map((d) => (
                        <span key={d} className="rounded-md bg-[#F5EBDD] px-2 py-0.5 text-[10px] font-semibold text-[#38241B] border border-[#D8C2AA]/60">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-3 border-t border-[#D8C2AA] pt-4 lg:border-t-0 lg:pt-0">
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold text-[#755C49] block">Verification Progress</span>
                      <span className="font-mono text-xs font-bold text-[#38241B]">{app.progress}% Ready</span>
                    </div>
                    <Progress value={app.progress} className="h-2 w-32 bg-[#F5EBDD] [&>div]:bg-[#6F4028]" />
                  </div>

                  <span className="text-xs font-bold text-[#6F4028] flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    View Complete Journey Timeline <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="border-[#D8C2AA] bg-[#FFF8ED]">
            <CardContent className="py-20 text-center text-[#755C49]">
              <FileText className="mx-auto h-12 w-12 text-[#755C49]/40 mb-3" />
              <h4 className="font-bold text-[#38241B] text-base">No Applications Found</h4>
              <p className="mt-1 text-xs text-[#755C49] max-w-sm mx-auto">
                No active or submitted applications matched your search query. Apply for a welfare scheme to initiate automated state verification.
              </p>
              <Button
                className="mt-5 gap-2 bg-[#6F4028] hover:bg-[#805236] text-[#FFF8ED] font-bold border-0 shadow-md"
                onClick={() => navigate('/portal/services')}
              >
                Explore Available Services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
