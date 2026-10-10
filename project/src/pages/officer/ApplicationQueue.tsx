import { useState, useMemo } from 'react';
import {
  Search, Filter, ArrowRight, FileText, ChevronRight,
  Shield, Clock, AlertTriangle, CheckCircle2, User, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge, SlaBadge } from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';
import type { ApplicationStatus, SlaStatus, QueueItem } from '@/types';
import { cn } from '@/lib/utils';

interface ApplicationQueueProps {
  navigate: (to: string) => void;
}

const statusFilters: (ApplicationStatus | 'all')[] = [
  'all', 'submitted', 'under_verification', 'processing', 'approved', 'info_requested', 'rejected',
];
const statusLabels: Record<string, string> = {
  all: 'All Statuses',
  submitted: 'Submitted',
  under_verification: 'Under Verification',
  processing: 'Processing',
  approved: 'Approved',
  info_requested: 'Info Requested',
  rejected: 'Rejected',
};
const slaFilters: (SlaStatus | 'all')[] = ['all', 'on_track', 'due_soon', 'breached'];
const slaLabels: Record<string, string> = {
  all: 'All SLA Tiers',
  on_track: 'On Track',
  due_soon: 'Due Soon',
  breached: 'Breached',
};

function computeSlaStatus(submittedAt: string, slaDays: number): SlaStatus {
  const submitted = new Date(submittedAt).getTime();
  const deadline = submitted + slaDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const remaining = deadline - now;
  if (remaining < 0) return 'breached';
  if (remaining < 2 * 24 * 60 * 60 * 1000) return 'due_soon';
  return 'on_track';
}

const slaDaysByService: Record<string, number> = {
  'maha-scholarship': 20,
  'income-certificate': 10,
  'student-education-benefit': 15,
  'health-assistance': 7,
  'social-welfare': 30,
};

export function ApplicationQueue({ navigate }: ApplicationQueueProps) {
  const { applications, citizenMap } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [slaFilter, setSlaFilter] = useState<SlaStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  const allQueueItems: QueueItem[] = useMemo(() => {
    const submittedApplications = applications.filter(
      (app) => app.status !== 'draft'
    );

    return submittedApplications.map((app) => {
      const currentStage = app.workflowStages?.find((ws) => ws.status === 'current')?.label
        ?? (app.status === 'approved' ? 'Completed'
        : app.status === 'rejected' ? 'Rejected'
        : app.status === 'info_requested' ? 'Info Requested'
        : 'Processing');
      const slaDays = slaDaysByService[app.serviceId] ?? 15;
      const slaStatus = app.status === 'approved' || app.status === 'rejected'
        ? 'on_track' as SlaStatus
        : computeSlaStatus(app.submittedAt, slaDays);
      const daysLeft = Math.ceil(
        (new Date(app.submittedAt).getTime() + slaDays * 86400000 - Date.now()) / 86400000
      );
      const citizenInfo = citizenMap[app.id] ?? { name: 'Information not available', district: '—' };
      return {
        id: `q-${app.id}`,
        applicationId: app.id,
        citizenName: citizenInfo.name,
        citizenId: app.id,
        service: app.serviceName,
        stage: currentStage,
        slaStatus,
        slaRemaining: app.status === 'approved' || app.status === 'rejected'
          ? 'Completed'
          : daysLeft < 0 ? `Overdue ${Math.abs(daysLeft)}d` : `${daysLeft}d left`,
        submittedAt: app.submittedAt,
        status: app.status,
        department: app.departments[0] ?? 'Social Welfare Department',
        district: citizenInfo.district,
      };
    });
  }, [applications, citizenMap]);

  const serviceFilters = useMemo(() => {
    const services = Array.from(new Set(allQueueItems.map((i) => i.service)));
    return ['all', ...services];
  }, [allQueueItems]);

  const filtered = useMemo(() => {
    return allQueueItems.filter((item) => {
      const matchesSearch =
        item.applicationId.toLowerCase().includes(search.toLowerCase()) ||
        item.citizenName.toLowerCase().includes(search.toLowerCase()) ||
        item.service.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSla = slaFilter === 'all' || item.slaStatus === slaFilter;
      const matchesService = serviceFilter === 'all' || item.service === serviceFilter;
      return matchesSearch && matchesStatus && matchesSla && matchesService;
    });
  }, [allQueueItems, search, statusFilter, slaFilter, serviceFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#4A2E22] bg-gradient-to-r from-[#2B1B14] via-[#38241B] to-[#21140F] p-6 text-[#FFF9F0] shadow-luxury-lg sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-bold text-[#C58B55]">
              <Shield className="h-3.5 w-3.5" />
              CENTRAL WORKFLOW REGISTRY
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] text-[#E8D5BF] border border-white/10">
              Total Ingested: {allQueueItems.length}
            </span>
          </div>
          <h1 className="mt-2.5 font-display text-2xl font-black tracking-tight text-[#FFF9F0] sm:text-3xl">
            Department Application Queue
          </h1>
          <p className="mt-1 text-xs text-[#E8D5BF]">
            Adjudicate citizen applications, review verified digital credentials, and issue final determinations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/officer/dashboard')}
            className="border-[#E8D5BF]/30 bg-[#FFF9F0]/10 text-[#FFF9F0] hover:bg-[#FFF9F0]/20 text-xs font-semibold"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#755C49]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs border-[#E8D5BF] bg-[#F5EBDD] text-[#38241B] placeholder:text-[#755C49] rounded-xl focus:border-[#6F4028]"
              />
            </div>
            <div className="text-xs text-[#755C49] font-medium">
              Showing <strong className="text-[#38241B]">{filtered.length}</strong> of {allQueueItems.length} applications
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-[#D8C2AA]/60">
            <FilterSection label="Lifecycle Status">
              {statusFilters.map((s) => (
                <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} label={statusLabels[s]} />
              ))}
            </FilterSection>

            <FilterSection label="SLA Urgency">
              {slaFilters.map((s) => (
                <FilterChip key={s} active={slaFilter === s} onClick={() => setSlaFilter(s)} label={slaLabels[s]} />
              ))}
            </FilterSection>

            <FilterSection label="Service Program">
              {serviceFilters.map((s) => (
                <FilterChip key={s} active={serviceFilter === s} onClick={() => setServiceFilter(s)} label={s === 'all' ? 'All Programs' : s} />
              ))}
            </FilterSection>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card className="overflow-hidden border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8C2AA] bg-[#F5EBDD] text-[11px] font-semibold text-[#755C49] uppercase tracking-wider">
                  <th className="px-5 py-3.5">Application ID</th>
                  <th className="px-5 py-3.5">Applicant Citizen</th>
                  <th className="px-5 py-3.5">Scheme Program</th>
                  <th className="hidden px-5 py-3.5 md:table-cell">Current Stage</th>
                  <th className="px-5 py-3.5">SLA Countdown</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C2AA]/50">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="group cursor-pointer transition-colors hover:bg-[#F5EBDD]/60"
                    onClick={() => navigate(`/officer/review/${item.applicationId}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-[#6F4028] group-hover:underline">
                        {item.applicationId}
                      </div>
                      <span className="text-[10px] text-[#755C49]">
                        {new Date(item.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#38241B]">{item.citizenName}</div>
                      <div className="flex items-center gap-1 text-[11px] text-[#755C49]">
                        <span>{item.district}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-[#38241B] line-clamp-1">{item.service}</div>
                      <div className="text-[10px] text-[#755C49]">{item.department}</div>
                    </td>

                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className="rounded bg-[#F5EBDD] border border-[#D8C2AA]/60 px-2 py-0.5 font-medium text-[#755C49]">
                        {item.stage}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <SlaBadge status={item.slaStatus} />
                        <span className="font-mono text-[11px] text-[#755C49]">({item.slaRemaining})</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1 px-2.5 text-xs text-[#6F4028] group-hover:bg-[#EAD8C2]"
                      >
                        Review
                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="mx-auto h-10 w-10 text-[#755C49]/40" />
              <p className="mt-3 text-sm font-semibold text-[#38241B]">No applications found</p>
              <p className="mt-1 text-xs text-[#755C49]">
                No items match your active search terms or filter criteria.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(''); setStatusFilter('all'); setSlaFilter('all'); setServiceFilter('all'); }}
                className="mt-4 text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755C49]">
        {label}:
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
        active
          ? 'bg-[#6F4028] text-[#FFF8ED] shadow-sm shadow-[#6F4028]/20'
          : 'bg-[#F5EBDD] text-[#755C49] hover:bg-[#EAD8C2] hover:text-[#38241B]'
      )}
    >
      {label}
    </button>
  );
}
