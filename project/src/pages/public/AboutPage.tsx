import {
  Target, Eye, ShieldCheck, Layers, GitBranch, Server, KeyRound,
  FileSearch, BarChart3, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const principles = [
  { icon: ShieldCheck, title: 'Security First', desc: 'Every data exchange is encrypted, logged, and bound to a specific purpose with citizen consent.' },
  { icon: Layers, title: 'Interoperability', desc: 'Common data standards enable seamless communication between heterogeneous government systems.' },
  { icon: GitBranch, title: 'No Replacement', desc: 'FusionGrid does not replace existing portals. It connects them through secure APIs and orchestration.' },
  { icon: KeyRound, title: 'Citizen Control', desc: 'Citizens own their data. Consent is purpose-bound, revocable, and transparent at every step.' },
];

const components = [
  { icon: Server, title: 'API Gateway', desc: 'Unified entry point for all departmental APIs with authentication, rate limiting, and routing.' },
  { icon: KeyRound, title: 'Consent Manager', desc: 'Manages citizen consent for data sharing — request, grant, deny, and revoke lifecycle.' },
  { icon: GitBranch, title: 'Workflow Orchestrator', desc: 'Coordinates multi-department verification workflows with state management and retry logic.' },
  { icon: FileSearch, title: 'Audit & Logging', desc: 'Immutable audit trail of every data access, consent change, and workflow event.' },
  { icon: BarChart3, title: 'Monitoring Dashboard', desc: 'Real-time visibility into API health, SLA compliance, and processing metrics.' },
  { icon: ShieldCheck, title: 'Data Standards', desc: 'Common schemas for identity, income, enrollment, and health data across departments.' },
];

export function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
          About FusionGrid
        </Badge>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Bridging government services for every citizen
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          FusionGrid — meaning "Great Bridge" — is the Government of Maharashtra's interoperability
          platform that connects disparate government departments through secure APIs, consent-based
          data sharing, and unified workflow orchestration.
        </p>
      </div>

      {/* Prototype disclaimer */}
      <div className="mx-auto mt-6 max-w-2xl">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              <strong>SIH 2026 Prototype — Fictional Demonstration.</strong> All department APIs, citizen
              data, and metrics are simulated. No real government systems are connected.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Problem / Solution / Benefits */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="mt-4">The Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Government systems are digitized but fragmented. Each department — Revenue, Education, Health,
              Social Welfare — runs its own portal with its own data formats, login, and verification process.
              Citizens submit the same information repeatedly, visit multiple offices, and have no way to
              track applications across departments. Officers manually re-verify data that another department
              has already confirmed. Processing is slow, duplicative, and opaque.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <GitBranch className="h-6 w-6" />
            </div>
            <CardTitle className="mt-4">The Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              FusionGrid provides interoperability without replacement. Instead of replacing existing systems,
              it connects them through secure API connectors, transforms heterogeneous data into a common
              canonical model, and orchestrates cross-department verification workflows. Citizens submit
              data once, grant purpose-bound consent per department, and track everything from a single
              dashboard. Departments keep their systems — FusionGrid bridges them.
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="mt-4">The Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span><strong>Fewer repeated submissions</strong> — data is reused across departments with consent</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span><strong>Faster processing</strong> — automated verification replaces manual cross-checks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span><strong>Unified tracking</strong> — one timeline across all departments</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span><strong>Better coordination</strong> — departments share data through common standards</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span><strong>Citizen control</strong> — consent is revocable and purpose-bound at every step</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Mission & Vision */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="border-primary/10">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <CardTitle className="mt-4">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To eliminate redundant paperwork and fragmented service delivery by creating a single,
              secure, consent-driven bridge between citizens and government departments — reducing
              processing times, improving transparency, and ensuring every citizen's journey is
              connected end-to-end.
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Eye className="h-6 w-6" />
            </div>
            <CardTitle className="mt-4">Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              A Maharashtra where a citizen submits information once, grants consent with confidence,
              and receives services across departments through a unified, transparent, and accountable
              digital infrastructure — setting the standard for citizen-centric governance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Principles */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight">Core Principles</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="border-border/60">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Platform Components */}
      <div className="mt-16">
        <h2 className="font-display text-2xl font-bold tracking-tight">Platform Components</h2>
        <p className="mt-2 text-muted-foreground">
          FusionGrid is built on six interconnected components that enable secure, interoperable service delivery.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} className="border-border/60 transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{c.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* What FusionGrid is NOT */}
      <div className="mt-16">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-amber-900">What FusionGrid Is Not</h3>
                <ul className="mt-3 space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    FusionGrid does <strong>not replace</strong> existing government portals — it connects them.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    FusionGrid does <strong>not store</strong> citizen data permanently — it facilitates consent-based exchange.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    FusionGrid does <strong>not bypass</strong> departmental approval authority — it orchestrates workflows.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    This is a <strong>fictional SIH prototype</strong> — no real government APIs are connected.
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
