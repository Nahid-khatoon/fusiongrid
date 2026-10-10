import { useState, useMemo } from 'react';
import {
  ScrollText, Search, Filter, CheckCircle2, XCircle, Ban,
  ArrowRight, User, ShieldCheck, Settings, Shield,
  Lock, Hash, Terminal, Sparkles,
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

const roleConfig: Record<Role, { label: string; icon: typeof User; color: string; bg: string; border: string }> = {
  citizen: { label: 'Citizen', icon: User, color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]' },
  officer: { label: 'Officer', icon: ShieldCheck, color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  admin: { label: 'Admin', icon: Settings, color: 'text-[#38241B]', bg: 'bg-[#F5EBDD]', border: 'border-[#D8C2AA]' },
};

const resultConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  success: { label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  failure: { label: 'Rejected', icon: XCircle, color: 'text-rose-800', bg: 'bg-rose-100', border: 'border-rose-300' },
  denied: { label: 'Access Denied', icon: Ban, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]' },
};

export function AuditLogs({ navigate }: AuditLogsProps) {
  const { auditEvents } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');

  const allLogs = useMemo(() => {
    let persistedEvents = auditEvents;

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
        // Ignore malformed localStorage
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Lock className="h-3.5 w-3.5" />
              TAMPER-EVIDENT APPEND-ONLY MERKLE LOG
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Cryptographic Audit & Compliance Ledger
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Permanent, tamper-evident audit trail capturing every authentication attempt, consent token modification,
              inter-departmental data lookup, and statutory approval determination across Maharashtra nodes.
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

      {/* Filter and Search Bar */}
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
              Showing <strong className="text-[#38241B]">{filtered.length}</strong> of {allLogs.length} audit records
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 border-t border-[#D8C2AA]/60">
            <FilterSection label="Security Principal Role">
              {(['all', 'citizen', 'officer', 'admin'] as const).map((r) => (
                <FilterChip
                  key={r}
                  active={roleFilter === r}
                  onClick={() => setRoleFilter(r)}
                  label={r === 'all' ? 'All Roles' : roleConfig[r].label}
                />
              ))}
            </FilterSection>

            <FilterSection label="Verification Outcome">
              {['all', 'success', 'failure', 'denied'].map((r) => (
                <FilterChip
                  key={r}
                  active={resultFilter === r}
                  onClick={() => setResultFilter(r)}
                  label={r === 'all' ? 'All Outcomes' : resultConfig[r].label}
                />
              ))}
            </FilterSection>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden border-[#D8C2AA] bg-[#FFF8ED] shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8C2AA] bg-[#F5EBDD] text-[11px] font-bold text-[#755C49] uppercase tracking-wider">
                  <th className="px-6 py-4">Log Identifier / Time</th>
                  <th className="px-6 py-4">Security Actor</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Action Executed</th>
                  <th className="hidden px-6 py-4 lg:table-cell">Event Payload / Scope</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C2AA]/50">
                {filtered.map((log) => {
                  const rCfg = roleConfig[log.role as Role] ?? roleConfig.citizen;
                  const resCfg = resultConfig[log.result] ?? resultConfig.success;
                  const RoleIcon = rCfg.icon;
                  const ResultIcon = resCfg.icon;

                  return (
                    <tr key={log.id} className="transition-colors hover:bg-[#F5EBDD]/60">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-[#6F4028]">{log.id}</span>
                        <div className="mt-0.5 font-mono text-[11px] text-[#755C49]">{log.timestamp}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-[#38241B]">{log.actor}</span>
                        <div className="text-[10px] text-[#755C49]">{log.purpose}</div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn('gap-1 text-xs font-bold', rCfg.border, rCfg.bg, rCfg.color)}>
                          <RoleIcon className="h-3 w-3" />
                          {rCfg.label}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-[#38241B]">{log.action}</span>
                      </td>

                      <td className="hidden px-6 py-4 lg:table-cell text-[#755C49] max-w-sm truncate leading-relaxed">
                        {log.data}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn('gap-1 text-xs font-bold', resCfg.border, resCfg.bg, resCfg.color)}>
                          <ResultIcon className="h-3 w-3" />
                          {resCfg.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-xs text-[#755C49]">
              <ScrollText className="mx-auto h-12 w-12 text-[#755C49]/30 mb-3" />
              No audit records match the current filter selection.
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
