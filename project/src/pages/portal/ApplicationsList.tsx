import { useState, useMemo } from 'react';
import { FileText, Search, ArrowRight, Filter, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';
import type { ApplicationStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ApplicationsListProps {
  navigate: (to: string) => void;
}

const statusFilters: (ApplicationStatus | 'all')[] = [
  'all', 'under_verification', 'processing', 'approved', 'rejected', 'info_requested',
];

const labels: Record<string, string> = {
  all: 'All',
  under_verification: 'Under Verification',
  processing: 'Processing',
  approved: 'Approved',
  rejected: 'Rejected',
  info_requested: 'Info Requested',
};

export function ApplicationsList({ navigate }: ApplicationsListProps) {
  const { applications } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchesSearch =
        a.id.toLowerCase().includes(search.toLowerCase()) ||
        a.serviceName.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || a.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [applications, search, filter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track all your applications across departments in one place.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input

            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  filter === s
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {labels[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((app, i) => (
          <Card
            key={app.id}
            className="cursor-pointer border-border/60 transition-all hover:shadow-md animate-fade-in-up"
            style={{ animationDelay: `${i * 0.05}s` }}
            onClick={() => navigate(`/portal/applications/${app.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold">{app.serviceName}</h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">{app.id}</p>
                    {app.requestId && (
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground/70">
                        Request: {app.requestId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Progress value={app.progress} className="h-2 w-20" />
                    <span className="text-sm font-semibold">{app.progress}%</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No applications found.</p>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate('/portal/services')}>
            Apply for a Service
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
