import {
  Target,
  Eye,
  ShieldCheck,
  Layers,
  GitBranch,
  Server,
  KeyRound,
  FileSearch,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Database,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const principles = [
  {
    icon: ShieldCheck,
    title: 'Zero Trust Security',
    desc: 'Every data exchange is TLS 1.3 encrypted, logged immutably, and strictly bound to a purpose-limited consent token.',
    color: 'text-[#6F4028] bg-[#F5EBDD] border-[#D8C2AA]',
  },
  {
    icon: Layers,
    title: 'Interoperability Mesh',
    desc: 'Canonical JSON-LD data standards enable seamless communication across heterogeneous legacy databases without vendor lock-in.',
    color: 'text-[#C58B55] bg-[#FFF8ED] border-[#D8C2AA]',
  },
  {
    icon: GitBranch,
    title: 'Zero System Replacement',
    desc: 'FusionGrid connects existing department portals via non-invasive REST/gRPC adapters rather than costly rip-and-replace overhauls.',
    color: 'text-[#6F4028] bg-[#EAD8C2] border-[#D8C2AA]',
  },
  {
    icon: KeyRound,
    title: 'Citizen Data Sovereignty',
    desc: 'Citizens own their personal records. Consent is purpose-bound, time-delimited, and revocable on demand under DPDP guidelines.',
    color: 'text-[#38241B] bg-[#F5EBDD] border-[#D8C2AA]',
  },
];

const platformComponents = [
  {
    icon: Server,
    title: 'API Gateway & Protocol Router',
    desc: 'High-throughput secure ingress handling token authentication, rate limiting, and request routing across 5 departmental nodes.',
    tag: 'Core Router',
  },
  {
    icon: KeyRound,
    title: 'Consent Manager Engine',
    desc: 'Enforces the full lifecycle of citizen consent artifacts: request, grant, scope definition, inspection, and real-time revocation.',
    tag: 'DPDP Aligned',
  },
  {
    icon: GitBranch,
    title: 'Workflow Orchestrator',
    desc: 'Coordinates multi-department verification pipelines, managing state transitions, automatic retries, and strict SLA compliance.',
    tag: 'State Engine',
  },
  {
    icon: FileSearch,
    title: 'Cryptographic Audit Ledger',
    desc: 'Tamper-evident logging of every inter-departmental data access event with SHA-256 integrity proofs for independent auditability.',
    tag: 'Tamper-Evident',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Monitoring Telemetry',
    desc: 'Live operational visibility into inter-departmental API health, percentile latencies, throughput, and error rates.',
    tag: 'Operations',
  },
  {
    icon: Database,
    title: 'Canonical Schema Standards',
    desc: 'Unified semantic models reconciling legacy schemas (Aadhaar e-KYC, Mahabhulekh, DigiLocker, ABHA, PFMS) without conflict.',
    tag: 'Semantic Mesh',
  },
];

export function AboutPage() {
  return (
    <div className="overflow-hidden bg-[#F5EBDD] text-[#38241B]">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF8ED] via-[#F5EBDD] to-[#EFE3D3] border-b border-[#D8C2AA] py-20 text-[#38241B] sm:py-24">
        <div className="pointer-events-none absolute inset-0 hero-grid-pattern opacity-40" />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#C58B55]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-12 h-96 w-96 rounded-full bg-[#6F4028]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C2AA] bg-[#FFF8ED] px-3.5 py-1.5 text-xs font-semibold text-[#6F4028] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#C58B55]" />
              Interoperability Architecture · SIH 2026 Prototype
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#38241B] leading-tight">
              Bridging Government Systems for{' '}
              <span className="text-[#C58B55]">
                Every Citizen
              </span>
            </h1>
            <p className="mt-6 text-base text-[#755C49] sm:text-lg sm:leading-relaxed">
              FusionGrid connects disparate government departments through secure, consent-based
              data sharing, common canonical standards, and unified workflow orchestration — delivering
              seamless digital public infrastructure without replacing existing systems.
            </p>
          </div>
        </div>
      </section>

      {/* 2. SIH Prototype Callout */}
      <div className="mx-auto -mt-6 max-w-4xl px-4 sm:px-6">
        <div className="relative rounded-2xl border border-[#E8D5BF] bg-[#FFF9F0] p-4.5 shadow-luxury">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[#C58B55]" />
            <p className="text-xs text-[#38241B] sm:text-sm">
              <strong className="font-bold text-[#6F4028]">SIH 2026 Prototype Notice:</strong> This project is a
              demonstration prototype showcasing cross-department interoperability. All connected
              department APIs, citizen credentials, and verification queries are simulated with fictional data.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* 3. Problem / Solution / Benefits Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* The Problem */}
          <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] border border-[#E8D5BF] shadow-xs">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4 font-display text-xl font-bold text-[#38241B]">The Problem</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#755C49] leading-relaxed">
                Government systems are digitized but isolated in functional silos. Each department
                (Revenue, Education, Health, Social Welfare) operates its own independent portal with
                proprietary database schemas. Citizens must repeatedly upload identical proofs of income,
                identity, and education across portals, leading to slow processing, manual re-verification,
                and high application friction.
              </p>
            </CardContent>
          </Card>

          {/* The Solution */}
          <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] border border-[#E8D5BF] shadow-xs">
                <GitBranch className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4 font-display text-xl font-bold text-[#38241B]">The Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#755C49] leading-relaxed">
                FusionGrid implements an interoperability mesh without replacing legacy applications.
                Through standardized REST and gRPC adapters, heterogeneous department records are transformed
                into a canonical data model. A centralized Consent Manager ensures citizens explicitly authorize
                each data exchange, while an automated workflow engine resolves verification dependencies in parallel.
              </p>
            </CardContent>
          </Card>

          {/* Key Benefits */}
          <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#C58B55] border border-[#E8D5BF] shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="mt-4 font-display text-xl font-bold text-[#38241B]">Measurable Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-xs text-[#755C49]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6F4028]" />
                  <span><strong className="text-[#38241B]">Zero Paper Re-submission</strong> — data shared with explicit user consent.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6F4028]" />
                  <span><strong className="text-[#38241B]">Instant API Verification</strong> — automated cross-checks replace office visits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6F4028]" />
                  <span><strong className="text-[#38241B]">Unified Journey Tracking</strong> — single dashboard across all departments.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6F4028]" />
                  <span><strong className="text-[#38241B]">DPDP Act Compliance</strong> — purpose-bound, revocable consent lifecycle.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 4. Mission & Vision */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF9F0] shadow-luxury-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF9F0]/10 text-[#C58B55] border border-white/10 shadow-xs">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-black text-[#FFF9F0]">Our Mission</h3>
            <p className="mt-3 text-xs text-[#E8D5BF] leading-relaxed">
              To eliminate redundant administrative hurdles and fragmented service delivery by establishing
              a sovereign, secure, consent-driven interoperability layer between citizens and government
              departments — dramatically reducing SLA turnaround times and ensuring every citizen’s public
              journey is connected end-to-end.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#E8D5BF] bg-[#FFF9F0] p-8 text-[#38241B] shadow-luxury">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#C58B55] border border-[#E8D5BF] shadow-xs">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-black text-[#38241B]">Our Vision</h3>
            <p className="mt-3 text-xs text-[#755C49] leading-relaxed">
              A transparent, citizen-first governance framework where a citizen submits verified
              credentials once, grants consent with complete confidence, and receives public welfare
              entitlements without friction, setting a global benchmark for modern digital public infrastructure.
            </p>
          </div>
        </div>

        {/* 5. Core Architectural Principles */}
        <div className="mt-20">
          <div className="text-center">
            <Badge variant="outline" className="mb-2 border-[#D8C2AA] bg-[#FFF9F0] text-[#6F4028] font-semibold">
              Design Philosophy
            </Badge>
            <h2 className="font-display text-3xl font-black tracking-tight text-[#38241B]">Core Architectural Principles</h2>
            <p className="mt-3 text-sm text-[#755C49] max-w-xl mx-auto">
              Engineered for enterprise security, statutory compliance, and zero institutional disruption.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <Card
                  key={p.title}
                  className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] hover:border-[#6F4028] hover:shadow-luxury-lg transition-all duration-300 shadow-luxury"
                >
                  <CardContent className="p-6">
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border ${p.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-[#38241B]">{p.title}</h3>
                    <p className="mt-2 text-xs text-[#755C49] leading-relaxed">{p.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 6. Platform Components */}
        <div className="mt-20">
          <div className="text-center">
            <Badge variant="outline" className="mb-2 border-[#D8C2AA] bg-[#FFF8ED] text-[#6F4028]">
              System Anatomy
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#38241B]">Six Interconnected Components</h2>
            <p className="mt-3 text-sm text-[#755C49] max-w-xl mx-auto">
              How the FusionGrid platform coordinates secure, cross-department data exchange.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platformComponents.map((c) => {
              const Icon = c.icon;
              return (
                <Card
                  key={c.title}
                  className="group rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] hover:border-[#6F4028] hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300 shadow-luxury"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] group-hover:bg-[#6F4028] group-hover:text-[#FFF9F0] transition-colors shadow-xs">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-[#EAD8C2] px-2.5 py-0.5 text-[10px] font-bold text-[#38241B]">
                        {c.tag}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-[#38241B] group-hover:text-[#6F4028] transition-colors">{c.title}</h3>
                    <p className="mt-2 text-xs text-[#755C49] leading-relaxed">{c.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 7. What FusionGrid Is NOT */}
        <div className="mt-20">
          <div className="rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF9F0] shadow-luxury-lg sm:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF9F0]/10 text-[#C58B55] border border-white/10 shadow-xs">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black text-[#FFF9F0]">What FusionGrid Is Not</h3>
                <p className="mt-1 text-xs text-[#E8D5BF]">
                  Clarifying institutional boundaries and statutory autonomy.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#E8D5BF]/20 bg-[#FFF9F0]/5 p-5 shadow-xs">
                    <div className="font-bold text-[#C58B55] text-sm">Not a Replacement Portal</div>
                    <p className="mt-1.5 text-xs text-[#E8D5BF] leading-relaxed">
                      FusionGrid does not replace departmental databases or state portals; it acts strictly
                      as a secure interoperability bridge connecting them.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#E8D5BF]/20 bg-[#FFF9F0]/5 p-5 shadow-xs">
                    <div className="font-bold text-[#C58B55] text-sm">Not a Centralized Data Store</div>
                    <p className="mt-1.5 text-xs text-[#E8D5BF] leading-relaxed">
                      FusionGrid does not warehouse citizen records permanently. It facilitates ephemeral,
                      encrypted exchanges bound to single transactions.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#E8D5BF]/20 bg-[#FFF9F0]/5 p-5 shadow-xs">
                    <div className="font-bold text-[#C58B55] text-sm">Not an Approval Override</div>
                    <p className="mt-1.5 text-xs text-[#E8D5BF] leading-relaxed">
                      Statutory officers retain complete authority over final approvals and rejections.
                      FusionGrid orchestrates verification workflows and SLA tracking.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#E8D5BF]/20 bg-[#FFF9F0]/5 p-5 shadow-xs">
                    <div className="font-bold text-[#C58B55] text-sm">Fictional Demonstration</div>
                    <p className="mt-1.5 text-xs text-[#E8D5BF] leading-relaxed">
                      As an SIH 2026 prototype, all departmental endpoints are simulated in a safe,
                      sandboxed demonstration environment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
