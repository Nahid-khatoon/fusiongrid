import { useState, useMemo } from 'react';
import {
  ScrollText, Search, Filter, CheckCircle2, XCircle, Ban,
  ArrowRight, User, ShieldCheck, Settings,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminAuditLogs } from '@/data/adminData';
import { useApp } from '@/context/AppContext';
import type { Role } from '@/types';
import { cn } from '@/lib/utils';

interface AuditLogsProps {
  navigate: (to: string) => void;
}

const roleConfig: Record<Role, { label: string; icon: typeof User; color: string; bg: string }> = {
  citizen: { label: 'Citizen', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
  officer: { label: 'Officer', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  admin: { label: 'Admin', icon: Settings, color: 'text-amber-600', bg: 'bg-amber-50' },
};

const resultConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { label: 'Success', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  failure: { label: 'Failure', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  denied: { label: 'Denied', icon: Ban, color: 'text-orange-600', bg: 'bg-orange-50' },
};

export function AuditLogs({ navigate }: AuditLogsProps) {
  const { auditEvents } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');

  const allLogs = useMemo(() => {
    let persistedEvents = auditEvents;

    // Refresh-safe fallback: AppContext normally hydrates these from localStorage.
    // If the context is temporarily empty, read the same persisted store directly.
    if (persistedEvents.length === 0) {
      try {
        const saved = localStorage.getItem('fusiongrid_audit_events');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            persistedEvents = parsed;
          }
        }
      } catch {
        // Ignore malformed localStorage and keep the empty list.
      }
    }

    const liveLogs = persistedEvents.map((ae: any) => ({
      id: ae.id,
      timestamp: ae.timestamp,
      actor: ae.actor,
      role: ae.actorRole,
      action: ae.action,
      data: ae.detail,
      purpose:
        ae.type === 'consent'
          ? 'Consent management'
          : ae.type === 'submit'
            ? 'Application submission'
            : 'Application processing',
      result: 'success' as const,
    }));

    // Keep any intentionally seeded admin logs, but live persisted events are the
    // source of truth for the prototype.
    return [...adminAuditLogs, ...liveLogs];
  }, [auditEvents]);

  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
      const actor = String(log.actor ?? '');
      const action = String(log.action ?? '');
      const data = String(log.data ?? '');

      const query = search.toLowerCase();
      const matchesSearch =
        actor.toLowerCase().includes(query) ||
        action.toLowerCase().includes(query) ||
        data.toLowerCase().includes(query);

      const matchesRole = roleFilter === 'all' || log.role === roleFilter;
      const matchesResult = resultFilter === 'all' || log.result === resultFilter;

      return matchesSearch && matchesRole && matchesResult;
    });
  }, [allLogs, search, roleFilter, resultFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every important action generates an audit event — fully traceable and tamper-evident.
        </p>
      </div>

      <div className="mb-4 space-y-3 animate-fade-in-up">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor, action or data..."
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Role">
            {(['all', 'citizen', 'officer', 'admin'] as const).map((r) => (
              <FilterChip
                key={r}
                active={roleFilter === r}
                onClick={() => setRoleFilter(r)}
                label={r === 'all' ? 'All Roles' : roleConfig[r].label}
              />
            ))}
          </FilterSection>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <FilterSection label="Result">
            {['all', 'success', 'failure', 'denied'].map((r) => (
              <FilterChip
                key={r}
                active={resultFilter === r}
                onClick={() => setResultFilter(r)}
                label={r === 'all' ? 'All Results' : resultConfig[r].label}
              />
            ))}
          </FilterSection>
        </div>
      </div>

      <Card className="border-border/60 animate-fade-in-up">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Role</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Data</th>
                  <th className="hidden px-4 py-3 font-medium xl:table-cell">Purpose</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((log) => {
                  const roleCfg = roleConfig[log.role as Role] ?? roleConfig.admin;
                  const RoleIcon = roleCfg.icon;
                  const resultCfg = resultConfig[log.result];
                  const ResultIcon = resultCfg.icon;

                  return (
                    <tr key={log.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{log.timestamp}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{log.actor}</span>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <Badge variant="outline" className={cn('gap-1', roleCfg.bg, roleCfg.color)}>
                          <RoleIcon className="h-3 w-3" />
                          {roleCfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{log.action}</td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{log.data}</td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">{log.purpose}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('gap-1', resultCfg.bg, resultCfg.color)}>
                          <ResultIcon className="h-3 w-3" />
                          {resultCfg.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <ScrollText className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No audit events match your filters.</p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filtered.length} audit events</span>
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

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
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
