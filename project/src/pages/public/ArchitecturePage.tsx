import {
  Monitor, KeyRound, Lock, Server, GitBranch, Database,
  Radio, Plug, Cpu, BarChart3, ArrowRight, Layers, ShieldCheck,
  FileCheck, Zap, Clock, Network,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ArchitecturePageProps {
  navigate: (to: string) => void;
}

const layers = [
  {
    icon: Monitor,
    label: 'Frontend',
    sub: 'Citizen Portal · Officer Console · Admin Control Center',
    desc: 'React-based single-page application with role-based interfaces for citizens, officers, and administrators. Responsive across desktop, tablet, and mobile.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: KeyRound,
    label: 'Authentication',
    sub: 'Session Management · JWT-Style Tokens · RBAC',
    desc: 'Role-based access control with simulated JWT sessions. Three roles: Citizen, Officer, Admin. Rate-limit simulation prevents API abuse.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Lock,
    label: 'Consent Manager',
    sub: 'Purpose-Bound · Revocable · Per-Department',
    desc: 'Citizens grant or revoke consent for each department independently. Data is only exchanged within the granted scope and stated purpose.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Server,
    label: 'API Gateway',
    sub: 'Routing · Rate Limiting · Request Tracking',
    desc: 'Unified entry point for all departmental APIs. Routes requests, enforces rate limits, tracks request IDs, and logs every call for monitoring.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    icon: GitBranch,
    label: 'Data Transformation',
    sub: 'Schema Mapping · Canonical Model',
    desc: 'Transforms heterogeneous department schemas (full_name, studentName, name) into a unified canonical model (fullName, dateOfBirth, annualIncome).',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: Cpu,
    label: 'Workflow Engine',
    sub: 'State Machine · Retry Logic · SLA Tracking',
    desc: 'Orchestrates multi-department verification workflows. Manages application state transitions, automatic retries on failure, and SLA compliance.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Database,
    label: 'Master Data Management',
    sub: 'Canonical Citizen Record · Source Reconciliation',
    desc: 'Maintains a single canonical citizen record by reconciling data from Revenue, Education, and Social Welfare. Detects conflicts and quality issues.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Radio,
    label: 'Event Bus',
    sub: 'ApplicationSubmitted · IncomeVerified · ApiFailure',
    desc: 'Shared event system that updates application state, creates notifications, generates audit logs, and feeds analytics — all from a single emit.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    icon: Plug,
    label: 'Department Connectors',
    sub: 'REST API · Legacy SOAP · CSV/File · Database Adapter',
    desc: 'Adapters that connect heterogeneous government systems without replacing them. Each connector type handles protocol translation and data extraction.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Network,
    label: 'Legacy / Modern Systems',
    sub: 'Revenue · Education · Health · Social Welfare',
    desc: 'Existing government department systems remain untouched. FusionGrid connects to them through connectors — no replacement required.',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
  },
  {
    icon: BarChart3,
    label: 'Monitoring + Audit',
    sub: 'Real-Time Metrics · Immutable Audit Trail',
    desc: 'Admin Control Center with live API monitoring, system health, data quality dashboards, and a complete audit log of every action and event.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
];

const securityLayers = [
  { icon: KeyRound, label: 'Role-Based Access', desc: 'Citizen, Officer, Admin — each role sees only permitted data and actions' },
  { icon: ShieldCheck, label: 'Session / JWT Auth', desc: 'Simulated JWT tokens with 8-hour expiry and rate-limit tracking' },
  { icon: Lock, label: 'Consent Checks', desc: 'Every data access verified against active citizen consent before proceeding' },
  { icon: FileCheck, label: 'Purpose-Bound Access', desc: 'Data is only used for the stated purpose the citizen approved' },
  { icon: Zap, label: 'Input Validation', desc: 'All citizen inputs validated before submission to the workflow engine' },
  { icon: Clock, label: 'Rate-Limit Simulation', desc: '100 requests per session — API calls rejected when limit is exceeded' },
];

export function ArchitecturePage({ navigate }: ArchitecturePageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
          System Architecture
        </Badge>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          The FusionGrid interoperability stack
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Eleven interconnected layers that bridge citizens to government departments — without replacing
          any existing system. This is the architecture behind the SIH 2026 prototype.
        </p>
      </div>

      {/* Prototype disclaimer */}
      <div className="mx-auto mt-6 max-w-2xl">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>SIH 2026 Prototype — Fictional Demonstration.</strong> All APIs, data, and metrics
              are simulated. No real government systems are connected.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Architecture flow diagram */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight text-center">Layer-by-Layer Flow</h2>
        <p className="mt-2 text-center text-muted-foreground">
          From the citizen's screen to legacy government systems — every request passes through all eleven layers.
        </p>

        <div className="mt-10 space-y-3">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <div key={layer.label}>
                <Card className="border-border/60 transition-all hover:shadow-md animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', layer.bg)}>
                        <Icon className={cn('h-6 w-6', layer.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-muted-foreground">L{String(i + 1).padStart(2, '0')}</span>
                          <h3 className="font-display font-bold">{layer.label}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{layer.sub}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{layer.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {i < layers.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security simulation */}
      <div className="mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-3">Security Simulation</Badge>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Eight security layers simulated
          </h2>
          <p className="mt-3 text-muted-foreground">
            FusionGrid enforces security at every layer — from authentication to audit logging. This prototype
            demonstrates the structure without exposing any real secrets.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {securityLayers.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{s.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Key design decisions */}
      <div className="mt-20">
        <h2 className="font-display text-2xl font-bold tracking-tight text-center">Key Design Decisions</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="border-primary/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <CardTitle>Interoperability Without Replacement</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                FusionGrid never replaces existing government systems. It connects them through adapters —
                REST APIs, SOAP bridges, CSV file exchanges, and database adapters — transforming data into
                a common canonical model. Departments keep their systems; citizens get a unified experience.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Radio className="h-5 w-5" />
                </div>
                <CardTitle>Event-Driven Architecture</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A single event emission updates application state, creates notifications, generates audit
                logs, and feeds analytics dashboards. This ensures every part of the system stays in sync
                without tight coupling between modules.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center">
        <Card className="inline-block border-0 bg-gradient-to-r from-primary to-primary/80 px-8 py-6 text-primary-foreground shadow-xl">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-display text-lg font-bold">Explore the live admin dashboard</h3>
              <p className="text-sm text-primary-foreground/80">Sign in as administrator to see the Control Center in action.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-lg bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90"
            >
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
