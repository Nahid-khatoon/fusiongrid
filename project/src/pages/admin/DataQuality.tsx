import { useState, useMemo } from 'react';
import {
  Database, Search, Filter, AlertCircle, Copy, FileX,
  GitBranch, Clock, CheckCircle2, Eye, ArrowRight,
  Shield, Check, Sparkles, ChevronRight,
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

const issueTypeConfig: Record<DataQualityIssueType, { label: string; icon: typeof AlertCircle; color: string; bg: string; border: string }> = {
  missing_field: { label: 'Missing Attribute', icon: FileX, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300' },
  invalid_format: { label: 'Schema Mismatch', icon: AlertCircle, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]' },
  duplicate: { label: 'Deduplication Alert', icon: Copy, color: 'text-[#6F4028]', bg: 'bg-[#F5EBDD]', border: 'border-[#D8C2AA]' },
  conflict: { label: 'Conflict / Divergence', icon: GitBranch, color: 'text-[#4A2E22]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]' },
  outdated: { label: 'Stale Timestamp', icon: Clock, color: 'text-[#2B1B14]', bg: 'bg-[#F5EBDD]', border: 'border-[#D8C2AA]' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  open: { label: 'Action Required', color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-300' },
  reviewing: { label: 'Under Investigation', color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]' },
  resolved: { label: 'Reconciled', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
};

export function DataQuality({ navigate }: DataQualityProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DataQualityIssueType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return dataQualityIssues.filter((issue) => {
      const matchesSearch =
        issue.citizenName.toLowerCase().includes(search.toLowerCase()) ||
        issue.citizenId.toLowerCase().includes(search.toLowerCase()) ||
        issue.field.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || issue.issueType === typeFilter;
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const openCount = dataQualityIssues.filter((i) => i.status === 'open').length;
  const reviewingCount = dataQualityIssues.filter((i) => i.status === 'reviewing').length;
  const resolvedCount = dataQualityIssues.filter((i) => i.status === 'resolved').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Database className="h-3.5 w-3.5" />
              GOLDEN CITIZEN RECORD RESOLUTION
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Data Quality & Entity Resolution Console
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Algorithmic deduplication engine reconciling conflicting citizen records across Revenue,
              Education, and Social Welfare to guarantee zero double-dipping and authentic entitlement delivery.
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

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Unresolved Discrepancies', value: openCount, sub: 'Requires data officer action', icon: AlertCircle, color: 'text-rose-700', bg: 'bg-rose-100 border-rose-300' },
          { label: 'Active Reconciliations', value: reviewingCount, sub: 'Cross-checking with master UIDAI', icon: Eye, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
          { label: 'Reconciled Entity Records', value: resolvedCount, sub: 'Golden record updated & signed', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#755C49]">{m.label}</span>
                  <p className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#38241B]">{m.value}</p>
                  <p className="mt-1 text-[11px] text-[#755C49] hidden sm:block">{m.sub}</p>
                </div>
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', m.bg)}>
                  <Icon className={cn('h-6 w-6', m.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter and Search */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#755C49]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] placeholder:text-[#755C49]/60 rounded-xl"
              />
            </div>
            <div className="text-xs text-[#755C49]">
              Showing <strong className="text-[#38241B]">{filtered.length}</strong> of {dataQualityIssues.length} anomalies
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-[#D8C2AA]/60">
            <FilterSection label="Discrepancy Category">
              {(['all', 'missing_field', 'invalid_format', 'duplicate', 'conflict', 'outdated'] as const).map((t) => (
                <FilterChip
                  key={t}
                  active={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                  label={t === 'all' ? 'All Types' : issueTypeConfig[t].label}
                />
              ))}
            </FilterSection>

            <FilterSection label="Reconciliation State">
              {['all', 'open', 'reviewing', 'resolved'].map((s) => (
                <FilterChip
                  key={s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                  label={s === 'all' ? 'All States' : statusConfig[s].label}
                />
              ))}
            </FilterSection>
          </div>
        </CardContent>
      </Card>

      {/* Issues Stream Cards */}
      <div className="space-y-4">
        {filtered.map((issue) => {
          const typeCfg = issueTypeConfig[issue.issueType];
          const TypeIcon = typeCfg.icon;
          const statusCfg = statusConfig[issue.status];

          return (
            <Card key={issue.id} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm transition-all hover:border-[#6F4028] hover:shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs', typeCfg.bg, typeCfg.border)}>
                      <TypeIcon className={cn('h-6 w-6', typeCfg.color)} />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-[#38241B]">{issue.citizenName}</h3>
                        <Badge variant="outline" className={cn('text-xs gap-1 font-bold', typeCfg.bg, typeCfg.border, typeCfg.color)}>
                          {typeCfg.label}
                        </Badge>
                        <Badge variant="outline" className={cn('text-xs gap-1 font-bold', statusCfg.bg, statusCfg.border, statusCfg.color)}>
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <p className="text-xs text-[#755C49] leading-relaxed">{issue.description}</p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#755C49] border-t border-[#D8C2AA]/40 pt-2 font-mono text-[11px]">
                        <span>UID: <strong className="text-[#38241B]">{issue.citizenId}</strong></span>
                        <span>•</span>
                        <span>Attribute: <strong className="text-[#6F4028]">{issue.field}</strong></span>
                        <span>•</span>
                        <span>Origin: <strong className="text-[#38241B]">{issue.source}</strong></span>
                        <span>•</span>
                        <span>Detected: {issue.detectedAt}</span>
                      </div>
                    </div>
                  </div>

                  {issue.matchPercentage !== undefined && (
                    <div className="flex flex-col items-center sm:items-end gap-1 shrink-0 self-center sm:self-start">
                      <div className={cn(
                        'flex h-13 w-13 items-center justify-center rounded-2xl border-2 font-mono text-sm font-bold shadow-md',
                        issue.matchPercentage >= 95
                          ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                          : 'border-[#C58B55] bg-[#C58B55]/15 text-[#6F4028]'
                      )}>
                        {issue.matchPercentage}%
                      </div>
                      <span className="text-[10px] uppercase font-bold text-[#755C49]">Confidence</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card className="border-[#D8C2AA] bg-[#FFF8ED]">
            <CardContent className="py-20 text-center text-xs text-[#755C49]">
              <Database className="mx-auto h-12 w-12 text-[#755C49]/30 mb-3" />
              <h4 className="font-bold text-[#38241B] text-base">Zero Data Quality Anomalies</h4>
              <p className="mt-1 text-xs text-[#755C49]">All golden citizen records are properly reconciled.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#755C49]">
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
