import {
  History,
  FileText,
  KeyRound,
  Database,
  CheckCircle2,
  User,
  ArrowRight,
  Clock,
  Shield,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

const typeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  submit: { icon: FileText, color: 'bg-[#F5EBDD] text-[#6F4028] border-[#D8C2AA]', label: 'Scheme Submission' },
  consent: { icon: KeyRound, color: 'bg-[#FFF8ED] text-[#C58B55] border-[#D8C2AA]', label: 'DPDP Consent Grant' },
  access: { icon: Database, color: 'bg-[#EAD8C2] text-[#38241B] border-[#D8C2AA]', label: 'Inter-Dept Data Query' },
  approve: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Statutory Approval' },
  reject: { icon: History, color: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Determination Recorded' },
  request_info: { icon: FileText, color: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Info Request Dispatched' },
  forward: { icon: ArrowRight, color: 'bg-[#FFF8ED] text-[#6F4028] border-[#D8C2AA]', label: 'Inter-Agency Routing' },
  verify: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Automated Attestation' },
  profile: { icon: User, color: 'bg-[#EAD8C2] text-[#6F4028] border-[#D8C2AA]', label: 'Master Profile Sync' },
};

interface HistoryPageProps {
  navigate: (to: string) => void;
}

export function HistoryPage({ navigate }: HistoryPageProps) {
  const { auditEvents } = useApp();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <History className="h-3.5 w-3.5" />
              IMMUTABLE APPEND-ONLY EVENT LOG
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Citizen Personal Activity History
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Every data query by a department, consent modification, and application workflow transition
              is recorded in this immutable audit ledger for complete citizen transparency.
            </p>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <div className="rounded-2xl border border-[#D8C2AA]/30 bg-white/5 p-4 text-right backdrop-blur-md">
              <span className="block font-mono text-[10px] text-[#C58B55]">TOTAL LEDGER RECORDS</span>
              <span className="font-display text-2xl font-bold text-[#FFF8ED]">{auditEvents.length} Events Logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8">
        {/* Continuous Timeline Vertical Line */}
        <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-[#D8C2AA]" />

        <div className="space-y-4">
          {auditEvents.map((event, i) => {
            const config = typeConfig[event.type] ?? typeConfig.submit;
            const Icon = config.icon;
            return (
              <div
                key={event.id}
                className="relative flex items-start gap-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Timeline node icon */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-md -ml-6 sm:-ml-8 ${config.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <Card className="flex-1 border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:border-[#6F4028] transition-all duration-200 shadow-sm hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-sm font-bold text-[#38241B]">{event.action}</h4>
                          <Badge variant="outline" className="text-[10px] font-bold border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]">
                            {config.label}
                          </Badge>
                          {event.applicationId && (
                            <span className="font-mono text-[10px] text-[#755C49] bg-[#F5EBDD] px-2 py-0.5 rounded border border-[#D8C2AA]/60">
                              App: {event.applicationId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#755C49] leading-relaxed">
                          {event.detail}
                        </p>
                      </div>

                      <div className="flex sm:flex-col sm:items-end gap-1 font-mono text-[11px] text-[#755C49] shrink-0 border-t border-[#D8C2AA]/60 pt-2 sm:border-t-0 sm:pt-0">
                        <span className="flex items-center gap-1 text-[#38241B] font-semibold">
                          <Clock className="h-3 w-3 text-[#6F4028]" />
                          {event.timestamp}
                        </span>
                        <span className="text-[#6F4028] text-[10px] font-semibold">
                          Actor: {event.actor} ({event.actorRole})
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {auditEvents.length === 0 && (
            <Card className="border-[#D8C2AA] bg-[#FFF8ED]">
              <CardContent className="py-20 text-center text-[#755C49]">
                <History className="mx-auto h-12 w-12 text-[#755C49]/30 mb-3" />
                <h4 className="font-bold text-[#38241B] text-base">No Ledger Events Recorded</h4>
                <p className="mt-1 text-xs text-[#755C49]">
                  Application and verification transactions will automatically appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="text-center pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/portal/dashboard')}
          className="gap-2 border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2] font-semibold"
        >
          ← Return to Citizen Dashboard
        </Button>
      </div>
    </div>
  );
}
