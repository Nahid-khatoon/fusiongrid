import {
  User, FileCheck, Lock, Workflow, Bell, CheckCircle2, ArrowRight,
  ShieldCheck, Database, Server, GitBranch, KeyRound, Eye, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HowItWorksProps {
  navigate: (to: string) => void;
}

const steps = [
  {
    num: '01',
    icon: FileCheck,
    title: 'One-Time Data Submission',
    desc: 'Citizens submit their information once through the FusionGrid portal. This includes identity, address, income, education, and family details — stored securely and ready for reuse.',
    points: ['Profile created and verified', 'Data encrypted at rest', 'Reusable across services'],
  },
  {
    num: '02',
    icon: Lock,
    title: 'Consent-Based Data Sharing',
    desc: 'When applying for a service, citizens see exactly what data each department requests, for what purpose, and can grant or deny consent for each independently.',
    points: ['Per-department consent cards', 'Purpose-bound access', 'Revocable at any time'],
  },
  {
    num: '03',
    icon: Workflow,
    title: 'Interoperability Verification',
    desc: 'FusionGrid orchestrates verification across departments in real-time — Identity, Revenue, Education, Data Quality, and Workflow engines — all through secure APIs.',
    points: ['Identity Service verification', 'Cross-department data checks', 'Data Quality Engine validation'],
  },
  {
    num: '04',
    icon: Bell,
    title: 'Unified Tracking & Notifications',
    desc: 'Citizens track every application from a single dashboard with real-time timelines, department involvement, data access history, and proactive notifications.',
    points: ['Single unified timeline', 'Data access audit trail', 'Real-time notifications'],
  },
];

const architecture = [
  { icon: User, label: 'Citizen', sub: 'FusionGrid Portal' },
  { icon: ShieldCheck, label: 'API Gateway', sub: 'Auth & Routing' },
  { icon: KeyRound, label: 'Consent Manager', sub: 'Purpose-Bound' },
  { icon: GitBranch, label: 'Workflow Engine', sub: 'Orchestration' },
  { icon: Database, label: 'Data Standards', sub: 'Common Schemas' },
  { icon: Server, label: 'Department APIs', sub: 'Revenue · Education · Health' },
];

export function HowItWorksPage({ navigate }: HowItWorksProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
          How It Works
        </Badge>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          The connected citizen journey
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          From a single data submission to cross-department verification and unified tracking —
          here's how FusionGrid bridges every step of the citizen service journey.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-16 space-y-8">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isReversed = i % 2 === 1;
          return (
            <div key={step.num} className="relative">
              <div className={`grid gap-6 lg:grid-cols-2 ${isReversed ? 'lg:[direction:rtl]' : ''}`}>
                {/* Visual side */}
                <div className="lg:[direction:ltr]">
                  <Card className="h-full overflow-hidden border-border/60">
                    <CardContent className="flex h-full flex-col items-center justify-center p-8 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary">
                        <Icon className="h-10 w-10" />
                      </div>
                      <div className="mt-4 font-display text-5xl font-extrabold text-muted/40">
                        {step.num}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Content side */}
                <div className="lg:[direction:ltr]">
                  <Card className="h-full border-border/60">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-xl font-bold">{step.title}</h3>
                      </div>
                      <p className="mt-4 text-muted-foreground">{step.desc}</p>
                      <ul className="mt-4 space-y-2">
                        {step.points.map((p) => (
                          <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                            <CheckCircle2 className="h-4 w-4 text-accent" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="my-4 flex justify-center">
                  <ArrowRight className="h-5 w-5 rotate-90 text-muted-foreground/40" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Architecture Flow */}
      <div className="mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-3">Architecture Flow</Badge>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            How data flows through FusionGrid
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every request passes through six layers — from citizen to department APIs — with consent
            enforced at every step.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {architecture.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={node.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-card shadow-sm">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-semibold">{node.label}</div>
                    <div className="text-[10px] text-muted-foreground">{node.sub}</div>
                  </div>
                </div>
                {i < architecture.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground/40 sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Consent & Security */}
      <div className="mt-20 grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <CardTitle>Consent Lifecycle</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Request', desc: 'Department requests specific data for a stated purpose', icon: Eye },
                { label: 'Grant / Deny', desc: 'Citizen reviews and decides per-department', icon: KeyRound },
                { label: 'Access', desc: 'Data exchanged only within granted scope and purpose', icon: Database },
                { label: 'Revoke', desc: 'Citizen can revoke consent at any time', icon: Lock },
              ].map((phase) => {
                const Icon = phase.icon;
                return (
                  <div key={phase.label} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{phase.label}</div>
                      <div className="text-xs text-muted-foreground">{phase.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle>Security & Audit</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Encrypted Exchange', desc: 'All API calls encrypted end-to-end with mutual TLS', icon: Lock },
                { label: 'Immutable Audit Log', desc: 'Every data access recorded with timestamp and purpose', icon: FileCheck },
                { label: 'SLA Monitoring', desc: 'Real-time tracking of department response times', icon: Clock },
                { label: 'DPDP Compliant', desc: 'Aligned with Digital Personal Data Protection Act', icon: ShieldCheck },
              ].map((phase) => {
                const Icon = phase.icon;
                return (
                  <div key={phase.label} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{phase.label}</div>
                      <div className="text-xs text-muted-foreground">{phase.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <Card className="inline-block border-0 bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-primary-foreground shadow-xl">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-display text-lg font-bold">Ready to explore the citizen journey?</h3>
              <p className="text-sm text-primary-foreground/80">Log in with the demo citizen account to try the full workflow.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-lg bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
