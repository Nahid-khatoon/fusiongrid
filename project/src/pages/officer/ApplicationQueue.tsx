import { useState, useMemo } from 'react';
import { Search, Filter, ArrowRight, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  all: 'All Status',
  submitted: 'Submitted',
  under_verification: 'Under Verification',
  processing: 'Processing',
  approved: 'Approved',
  info_requested: 'Info Requested',
  rejected: 'Rejected',
};
const slaFilters: (SlaStatus | 'all')[] = ['all', 'on_track', 'due_soon', 'breached'];
const slaLabels: Record<string, string> = {
  all: 'All SLA',
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
    // Draft records are temporary records created while a citizen is filling
    // the application form. They must never appear in the officer queue.
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
      const citizenInfo = citizenMap[app.id] ?? { name: 'Unknown', district: '—' };
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
        item.citizenName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesSla = slaFilter === 'all' || item.slaStatus === slaFilter;
      const matchesService = serviceFilter === 'all' || item.service === serviceFilter;
      return matchesSearch && matchesStatus && matchesSla && matchesService;
    });
  }, [allQueueItems, search, statusFilter, slaFilter, serviceFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Application Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All applications across departments — review, approve, or take action.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3 animate-fade-in-up">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input

            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Status">
            {statusFilters.map((s) => (
              <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} label={statusLabels[s]} />
            ))}
          </FilterSection>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="SLA">
            {slaFilters.map((s) => (
              <FilterChip key={s} active={slaFilter === s} onClick={() => setSlaFilter(s)} label={slaLabels[s]} />
            ))}
          </FilterSection>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Service">
            {serviceFilters.map((s) => (
              <FilterChip key={s} active={serviceFilter === s} onClick={() => setServiceFilter(s)} label={s === 'all' ? 'All Services' : s} />
            ))}
          </FilterSection>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/60 animate-fade-in-up">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Application ID</th>
                  <th className="px-4 py-3 font-medium">Citizen</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Service</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Stage</th>
                  <th className="px-4 py-3 font-medium">SLA</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30"
                    onClick={() => navigate(`/officer/review/${item.applicationId}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold">{item.applicationId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">{item.citizenName}</span>
                        <span className="block text-xs text-muted-foreground">{item.district}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{item.service}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{item.stage}</td>
                    <td className="px-4 py-3">
                      <SlaBadge status={item.slaStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No applications match your filters.</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filtered.length} of {allQueueItems.length} applications</span>
        <Button variant="ghost" size="sm" onClick={() => navigate('/officer/dashboard')} className="gap-1">
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Filter className="h-3 w-3" />
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
        'rounded-full border px-3 py-1 text-xs font-medium transition-all',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
    </button>
  );
}
