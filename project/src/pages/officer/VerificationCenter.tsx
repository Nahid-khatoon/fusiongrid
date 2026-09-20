import {
  ShieldCheck, CheckCircle2, Database, KeyRound, Landmark,
  GraduationCap, Clock, FileText, ArrowRight, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';

interface VerificationCenterProps {
  navigate: (to: string) => void;
}

const deptIcons: Record<string, typeof Building2> = {
  'Identity Service': ShieldCheck,
  'Revenue Department': Landmark,
  'Education Department': GraduationCap,
  'Data Quality Engine': Database,
  'Consent Manager': KeyRound,
};

export function VerificationCenter({ navigate }: VerificationCenterProps) {
  const { applications, auditEvents } = useApp();

  const verificationEvents = auditEvents.filter((e) => e.type === 'verify' || e.type === 'consent');

  const activeApps = applications.filter(
    (a) => a.status === 'under_verification' || a.status === 'processing' || a.status === 'submitted'
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Verification Center</h1>
            <p className="text-sm text-muted-foreground">
              Cross-department verification results and request tracking
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Verifications', value: verificationEvents.length, icon: ShieldCheck, color: 'text-blue-600 bg-blue-50' },
          { label: 'All Passed', value: verificationEvents.length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Active Requests', value: activeApps.length, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Request IDs Tracked', value: applications.filter((a) => a.requestId).length, icon: KeyRound, color: 'text-purple-600 bg-purple-50' },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-border/60 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{m.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Verification Results */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-base">Verification Results</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Database className="h-3 w-3" />
                  Data received through FusionGrid
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationEvents.map((evt) => {
                  const Icon = deptIcons[evt.actor] ?? ShieldCheck;
                  return (
                    <div key={evt.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{evt.action}</span>
                          <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Passed
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{evt.detail}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground/60">
                          <span>By: {evt.actor}</span>
                          <span>·</span>
                          <span>{evt.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request IDs */}
        <div className="space-y-6">
          <Card className="border-border/60 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                Request IDs
              </CardTitle>
              <CardDescription>FusionGrid interoperability request tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {applications.filter((a) => a.requestId).map((app) => (
                  <div
                    key={app.id}
                    className="cursor-pointer rounded-lg border bg-card p-3 transition-all hover:shadow-md"
                    onClick={() => navigate(`/officer/review/${app.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold">{app.requestId}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{app.serviceName}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">{app.id}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Verifications */}
          <Card className="border-border/60 animate-fade-in-up delay-100">
            <CardHeader>
              <CardTitle className="text-base">Active Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeApps.map((app) => (
                  <div key={app.id} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{app.serviceName}</span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{app.id}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {app.workflowStages?.find((ws) => ws.status === 'current')?.label ?? 'Processing'}
                    </p>
                  </div>
                ))}
                {activeApps.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active verifications.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-xs text-amber-700">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            Prototype Integration / Mock Government Department API
          </div>
        </div>
      </div>
    </div>
  );
}
