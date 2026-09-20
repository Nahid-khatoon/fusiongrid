import { useState, useMemo } from 'react';
import {
  Database, Search, Filter, AlertCircle, Copy, FileX,
  GitBranch, Clock, CheckCircle2, Eye, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dataQualityIssues } from '@/data/adminData';
import type { DataQualityIssueType } from '@/types';
import { cn } from '@/lib/utils';

interface DataQualityProps {
  navigate: (to: string) => void;
}

const issueTypeConfig: Record<DataQualityIssueType, { label: string; icon: typeof AlertCircle; color: string; bg: string }> = {
  missing_field: { label: 'Missing Field', icon: FileX, color: 'text-red-600', bg: 'bg-red-50' },
  invalid_format: { label: 'Invalid Format', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  duplicate: { label: 'Duplicate', icon: Copy, color: 'text-purple-600', bg: 'bg-purple-50' },
  conflict: { label: 'Conflict', icon: GitBranch, color: 'text-blue-600', bg: 'bg-blue-50' },
  outdated: { label: 'Outdated', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: 'text-red-600', bg: 'bg-red-50' },
  reviewing: { label: 'Reviewing', color: 'text-amber-600', bg: 'bg-amber-50' },
  resolved: { label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export function DataQuality({ navigate }: DataQualityProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DataQualityIssueType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return dataQualityIssues.filter((issue) => {
      const matchesSearch = issue.citizenName.toLowerCase().includes(search.toLowerCase()) || issue.citizenId.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || issue.issueType === typeFilter;
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const openCount = dataQualityIssues.filter((i) => i.status === 'open').length;
  const reviewingCount = dataQualityIssues.filter((i) => i.status === 'reviewing').length;
  const resolvedCount = dataQualityIssues.filter((i) => i.status === 'resolved').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Data Quality</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Detect and resolve data quality issues across connected department systems.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4 animate-fade-in-up">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCount}</p>
                <p className="text-xs text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Eye className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviewingCount}</p>
                <p className="text-xs text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <FilterSection label="Issue Type">
            {(['all', 'missing_field', 'invalid_format', 'duplicate', 'conflict', 'outdated'] as const).map((t) => (
              <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} label={t === 'all' ? 'All Types' : issueTypeConfig[t].label} />
            ))}
          </FilterSection>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Status">
            {['all', 'open', 'reviewing', 'resolved'].map((s) => (
              <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} label={s === 'all' ? 'All Status' : statusConfig[s].label} />
            ))}
          </FilterSection>
        </div>
      </div>

      {/* Issue cards */}
      <div className="space-y-3 animate-fade-in-up">
        {filtered.map((issue) => {
          const typeCfg = issueTypeConfig[issue.issueType];
          const TypeIcon = typeCfg.icon;
          const statusCfg = statusConfig[issue.status];
          return (
            <Card key={issue.id} className="border-border/60 transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', typeCfg.bg)}>
                      <TypeIcon className={cn('h-5 w-5', typeCfg.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold">{issue.citizenName}</h3>
                        <Badge variant="outline" className={cn('gap-1', typeCfg.bg, typeCfg.color)}>
                          {typeCfg.label}
                        </Badge>
                        <Badge variant="outline" className={cn('gap-1', statusCfg.bg, statusCfg.color)}>
                          {statusCfg.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-mono">{issue.citizenId}</span>
                        <span>Field: <span className="font-medium">{issue.field}</span></span>
                        <span>Source: <span className="font-medium">{issue.source}</span></span>
                        <span>Detected: {issue.detectedAt}</span>
                      </div>
                    </div>
                  </div>
                  {issue.matchPercentage !== undefined && (
                    <div className="flex flex-col items-end gap-1">
                      <div className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-full border-2 text-sm font-bold',
                        issue.matchPercentage >= 95 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'
                      )}>
                        {issue.matchPercentage}%
                      </div>
                      <span className="text-[10px] text-muted-foreground">Match</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <Database className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No data quality issues match your filters.</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filtered.length} of {dataQualityIssues.length} issues</span>
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')} className="gap-1">
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
