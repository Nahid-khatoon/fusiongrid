import {
  ShieldCheck,
  CheckCircle2,
  Database,
  KeyRound,
  Landmark,
  GraduationCap,
  Clock,
  FileText,
  ArrowRight,
  Building2,
  Shield,
  Cpu,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  Radio,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface VerificationCenterProps {
  navigate: (to: string) => void;
}

const deptIcons: Record<string, typeof Building2> = {
  'Identity Service': ShieldCheck,
  'Revenue Department': Landmark,
  'Education Department': GraduationCap,
  'Data Quality Engine': Database,
  'Consent Manager': KeyRound,
  'Social Welfare': Building2,
};

export function VerificationCenter({ navigate }: VerificationCenterProps) {
  const { applications, auditEvents } = useApp();

  const verificationEvents = auditEvents.filter((e) => e.type === 'verify' || e.type === 'consent' || e.type === 'access');

  const activeApps = applications.filter(
    (a) => a.status === 'under_verification' || a.status === 'processing' || a.status === 'submitted'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              FEDERATED ATTESTATION ENGINE
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Cross-Department Verification Command Center
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Real-time federated attestation stream linking UIDAI Identity, Mahabhulekh Land Revenue,
              Academic Bank of Credits, and automated data quality validation nodes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate('/officer/queue')}
              className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-md border-0"
            >
              Open Application Queue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Attestation Invocations', value: verificationEvents.length > 0 ? verificationEvents.length : 18, icon: ShieldCheck, color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
          { label: 'Attestation Pass Rate', value: '100%', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-300' },
          { label: 'Pending Adjudications', value: activeApps.length, icon: Clock, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
          { label: 'Active Request Tokens', value: applications.filter((a) => a.requestId).length, icon: KeyRound, color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15 border-[#D8C2AA]' },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#755C49]">{m.label}</span>
                    <p className="mt-1 font-display text-2xl font-bold text-[#38241B]">{m.value}</p>
                  </div>
                  <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl border', m.bg)}>
                    <Icon className={cn('h-5 w-5', m.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Split Console: Live Verification Ledger vs Request Tokens */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Verification Stream */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
            <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#38241B]">
                    Federated Verification Event Stream
                  </CardTitle>
                  <CardDescription className="text-xs text-[#755C49]">
                    Cryptographic attestation events emitted during citizen application lifecycle
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ● Real-Time Bus
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3.5">
                {verificationEvents.map((evt) => {
                  const Icon = deptIcons[evt.actor] ?? ShieldCheck;
                  return (
                    <div
                      key={evt.id}
                      className="flex items-start gap-4 rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-4 transition-all hover:border-[#6F4028] hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EBDD] text-[#6F4028] border border-[#D8C2AA]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#38241B]">{evt.action}</span>
                          <span className="rounded bg-emerald-100 border border-emerald-300 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                            ATTESTED
                          </span>
                        </div>
                        <p className="text-xs text-[#755C49] leading-relaxed">{evt.detail}</p>
                        <div className="flex items-center gap-3 font-mono text-[10px] text-[#755C49] pt-1">
                          <span>Source Node: <strong className="text-[#38241B]">{evt.actor}</strong></span>
                          <span>•</span>
                          <span>{evt.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {verificationEvents.length === 0 && (
                  <div className="py-12 text-center text-xs text-[#755C49]">
                    <ShieldCheck className="mx-auto h-10 w-10 text-[#755C49]/30 mb-2" />
                    No verification events recorded in the current session.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Tokens Tracker */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
            <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#6F4028]" />
                <div>
                  <CardTitle className="text-sm font-bold text-[#38241B]">Interoperability Request Tokens</CardTitle>
                  <CardDescription className="text-xs text-[#755C49]">Active gateway correlation tokens</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              {applications.filter((a) => a.requestId).map((app) => (
                <div
                  key={app.id}
                  className="group cursor-pointer rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-3.5 transition-all hover:border-[#6F4028] hover:shadow-md"
                  onClick={() => navigate(`/officer/review/${app.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#6F4028] group-hover:underline">
                      {app.requestId}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#755C49] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#38241B] truncate">{app.serviceName}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#755C49] font-mono">
                    <span>{app.id}</span>
                    <span className="font-semibold text-emerald-700">{app.progress}% ready</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
