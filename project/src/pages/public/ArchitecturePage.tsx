import { useState } from 'react';
import {
  Monitor,
  Lock,
  Plug,
  Cpu,
  BarChart3,
  ArrowRight,
  Database,
  Network,
  Fingerprint,
  Landmark,
  GraduationCap,
  HeartPulse,
  Users,
  Terminal,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ArchitecturePageProps {
  navigate: (to: string) => void;
}

const architectureTiers = [
  {
    id: 'presentation',
    tier: 'Tier 1: Presentation & User Experience',
    title: 'Citizen Portal & Consoles',
    desc: 'React 18 single-page application with tailored role-based views for Citizens, Officers, and Admins.',
    components: ['Citizen Self-Service Portal', 'Officer Review Console', 'Admin Operations Control'],
    color: 'border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]',
    icon: Monitor,
  },
  {
    id: 'auth_consent',
    tier: 'Tier 2: Governance & Identity',
    title: 'Authentication & DPDP Consent Layer',
    desc: 'Zero-trust authorization pipeline verifying session tokens and enforcing purpose-bound consent artifacts.',
    components: ['JWT / Supabase Auth', 'Consent Ledger & Verification', 'Role-Based Access Control (RBAC)'],
    color: 'border-[#D8C2AA] bg-[#FFF8ED] text-[#C58B55]',
    icon: Lock,
  },
  {
    id: 'gateway',
    tier: 'Tier 3: Ingress & Core Routing',
    title: 'FusionGrid Central API Gateway',
    desc: 'High-throughput secure protocol router enforcing TLS 1.3 encryption, rate limits, and audit tracking.',
    components: ['Secure Reverse Proxy', 'Token Validation & Rate Limiter', 'mTLS Gateway Mesh'],
    color: 'border-[#D8C2AA] bg-[#EAD8C2] text-[#6F4028]',
    icon: Network,
  },
  {
    id: 'connectors',
    tier: 'Tier 4: Interoperability Adapters (Simulated)',
    title: 'Five Department Connectors',
    desc: 'Non-invasive protocol adapters interfacing legacy state databases via simulated mock APIs.',
    components: [
      'Identity Connector (UIDAI / eKYC [Mock])',
      'Revenue Connector (Mahabhulekh [Mock])',
      'Education Connector (DigiLocker [Mock])',
      'Health Connector (ABHA / FHIR [Mock])',
      'Social Welfare Connector (DBT / PFMS [Mock])',
    ],
    color: 'border-[#D8C2AA] bg-[#F5EBDD] text-[#38241B]',
    icon: Plug,
  },
  {
    id: 'processing',
    tier: 'Tier 5: Orchestration & Semantics',
    title: 'Application Processing Engine',
    desc: 'Transforms heterogeneous departmental responses into canonical data models and manages state transitions.',
    components: ['Canonical Schema Transformer', 'Data Quality Engine', 'Workflow State Machine'],
    color: 'border-[#D8C2AA] bg-[#FFF8ED] text-[#6F4028]',
    icon: Cpu,
  },
  {
    id: 'monitoring',
    tier: 'Tier 6: Observability & Integrity',
    title: 'Audit Logs & Real-Time Monitoring',
    desc: 'Tamper-evident event stream capturing immutable audit events and real-time SLA telemetry.',
    components: ['SHA-256 Cryptographic Ledger', 'SLA Telemetry Monitor', 'Event Stream Bus'],
    color: 'border-[#D8C2AA] bg-[#EAD8C2] text-[#C58B55]',
    icon: BarChart3,
  },
  {
    id: 'persistence',
    tier: 'Tier 7: Data & State Persistence',
    title: 'Supabase Persistence Layer',
    desc: 'PostgreSQL cloud database enforcing Row-Level Security (RLS) policies and real-time subscriptions.',
    components: ['PostgreSQL Relational Storage', 'Row Level Security (RLS)', 'Encrypted Session Store'],
    color: 'border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]',
    icon: Database,
  },
];

const mockDepartmentConnectors = [
  {
    name: 'Identity Connector',
    mockSystem: 'UIDAI / Civil Registry',
    protocol: 'REST / OAuth2',
    icon: Fingerprint,
    tag: 'Simulated API',
    desc: 'Simulates Aadhaar e-KYC token verification, biometric hash matching, and civil registry lookups.',
  },
  {
    name: 'Revenue Connector',
    mockSystem: 'Mahabhulekh Land Records',
    protocol: 'SOAP Bridge & REST',
    icon: Landmark,
    tag: 'Simulated API',
    desc: 'Simulates annual income certificate validation, property tax status, and land parcel coordinates.',
  },
  {
    name: 'Education Connector',
    mockSystem: 'DigiLocker / ABC API',
    protocol: 'REST / JSON-LD',
    icon: GraduationCap,
    tag: 'Simulated API',
    desc: 'Simulates university degree verification, ABC academic credit balances, and bonafide enrollment.',
  },
  {
    name: 'Health Connector',
    mockSystem: 'ABHA State Health Registry',
    protocol: 'FHIR R4 / Webhooks',
    icon: HeartPulse,
    tag: 'Simulated API',
    desc: 'Simulates consent-bound health record linkage, immunization status, and disability certificates.',
  },
  {
    name: 'Social Welfare Connector',
    mockSystem: 'PFMS / DBT Webhook',
    protocol: 'Async Event Stream',
    icon: Users,
    tag: 'Simulated API',
    desc: 'Simulates Direct Benefit Transfer eligibility, bank mandate verification, and scholarship queues.',
  },
];

export function ArchitecturePage({ navigate }: ArchitecturePageProps) {
  const [activeTierId, setActiveTierId] = useState<string>('gateway');

  const selectedTier =
    architectureTiers.find((t) => t.id === activeTierId) || architectureTiers[2];

  return (
    <div className="overflow-hidden bg-[#F5EBDD] text-[#38241B]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9F0] via-[#F5EBDD] to-[#E8D5BF]/30 border-b border-[#E8D5BF] py-20 text-[#38241B] sm:py-24">
        <div className="pointer-events-none absolute inset-0 hero-grid-pattern opacity-40" />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#C58B55]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-12 h-96 w-96 rounded-full bg-[#6F4028]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C2AA] bg-[#FFF9F0] px-3.5 py-1.5 text-xs font-semibold text-[#6F4028] shadow-sm">
              <Network className="h-3.5 w-3.5 text-[#C58B55]" />
              Full-Stack Technical Architecture · SIH 2026
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#38241B] leading-tight">
              The FusionGrid{' '}
              <span className="text-[#C58B55]">
                Interoperability Stack
              </span>
            </h1>
            <p className="mt-6 text-base text-[#755C49] sm:text-lg sm:leading-relaxed">
              Seven interconnected architectural layers bridging citizens to legacy government
              departments without replacing existing infrastructure. All departmental integrations
              are simulated via mock connectors for SIH demonstration.
            </p>
          </div>
        </div>
      </section>

      {/* Prototype Notice */}
      <div className="mx-auto -mt-6 max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl border border-[#E8D5BF] bg-[#FFF9F0] p-4.5 shadow-luxury">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[#C58B55]" />
            <p className="text-xs text-[#38241B] sm:text-sm">
              <strong className="font-bold text-[#6F4028]">Simulated Integration Sandbox:</strong> All five department connectors operate
              against realistic local mock APIs. No actual citizen databases or live government
              servers are contacted.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Tier Diagram Visual Navigator */}
        <div className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-black tracking-tight text-[#38241B]">System Tier Topology</h2>
              <p className="text-xs text-[#755C49] mt-1">
                Click any layer to inspect internal components and protocol details
              </p>
            </div>
            <span className="rounded-full bg-[#EAD8C2] border border-[#D8C2AA] px-3.5 py-1 font-mono text-xs font-bold text-[#6F4028]">
              7 Architectural Tiers
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left list of Tiers */}
            <div className="space-y-3.5 lg:col-span-6">
              {architectureTiers.map((t) => {
                const Icon = t.icon;
                const isSelected = activeTierId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTierId(t.id)}
                    className={cn(
                      'group flex w-full items-center gap-3.5 rounded-2xl border p-4.5 text-left transition-all duration-300 shadow-luxury',
                      isSelected
                        ? 'border-[#6F4028] bg-[#FFF9F0] shadow-luxury-lg ring-2 ring-[#6F4028]/20 translate-x-1'
                        : 'border-[#E8D5BF] bg-[#FFF9F0] hover:border-[#6F4028]'
                    )}
                  >
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs', t.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#755C49]">
                        {t.tier.split(':')[0]}
                      </span>
                      <h4 className="font-display text-sm font-bold text-[#38241B] group-hover:text-[#6F4028] transition-colors">
                        {t.title}
                      </h4>
                      <p className="truncate text-xs text-[#755C49] mt-0.5">{t.desc}</p>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 shrink-0 transition-transform', isSelected ? 'rotate-90 text-[#6F4028]' : 'text-[#755C49]')} />
                  </button>
                );
              })}
            </div>

            {/* Right Tier Detail Inspector Panel */}
            <div className="lg:col-span-6">
              <div className="sticky top-24 rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF9F0] shadow-luxury-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF9F0]/10 text-[#C58B55] border border-white/10 shadow-xs">
                      {(() => {
                        const Icon = selectedTier.icon;
                        return <Icon className="h-5 w-5" />;
                      })()}
                    </div>
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#C58B55] uppercase">
                        {selectedTier.tier}
                      </span>
                      <h3 className="text-xl font-black text-[#FFF9F0]">{selectedTier.title}</h3>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-[#E8D5BF] leading-relaxed sm:text-sm">{selectedTier.desc}</p>

                <div className="mt-6">
                  <h5 className="font-display text-xs font-bold uppercase tracking-wider text-[#C58B55] mb-3">
                    Key Modules & Protocols
                  </h5>
                  <div className="space-y-2.5">
                    {selectedTier.components.map((comp) => (
                      <div
                        key={comp}
                        className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#FFF9F0]/5 px-3.5 py-2.5 text-xs text-[#FFF9F0]"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#C58B55] shrink-0" />
                        <span>{comp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-[#FFF9F0]/5 p-4 text-xs text-[#E8D5BF]">
                  <span className="font-bold block mb-1 text-[#FFF9F0]">Enterprise Assurance:</span>
                  All communication between Tier 1 and Tier 7 conforms to strict stateless token validation and cryptographic audit hashing.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Department Connectors Detailed Section (Mock APIs) */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-2 border-[#D8C2AA] bg-[#FFF9F0] text-[#6F4028] font-semibold">
              Simulated Bridges
            </Badge>
            <h2 className="font-display text-3xl font-black tracking-tight text-[#38241B]">
              Five Department Connectors
            </h2>
            <p className="mt-2 text-sm text-[#755C49] max-w-xl mx-auto">
              How FusionGrid securely communicates with external departmental servers without requiring
              them to modify their internal database schemas.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockDepartmentConnectors.map((c) => {
              const Icon = c.icon;
              return (
                <Card
                  key={c.name}
                  className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] hover:border-[#6F4028] hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300 shadow-luxury"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] shadow-xs">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-[#D8C2AA] bg-[#EAD8C2] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#6F4028]">
                        {c.tag}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-[#38241B]">{c.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-[#6F4028]">{c.mockSystem}</span>
                      <span className="text-[#D8C2AA]">•</span>
                      <span className="font-mono text-[10px] text-[#755C49]">{c.protocol}</span>
                    </div>

                    <p className="mt-3 text-xs text-[#755C49] leading-relaxed">{c.desc}</p>
                  </CardContent>
                </Card>
              );
            })}

            {/* Supabase Persistence Card */}
            <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] hover:border-[#6F4028] hover:shadow-luxury-lg hover:-translate-y-1 transition-all duration-300 shadow-luxury md:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] shadow-xs">
                    <Database className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-[#D8C2AA] bg-[#EAD8C2] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#6F4028]">
                    Live Supabase DB
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-[#38241B]">PostgreSQL & RLS</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-[#6F4028]">Database Core</span>
                  <span className="text-[#D8C2AA]">•</span>
                  <span className="font-mono text-[10px] text-[#755C49]">PostgreSQL 15</span>
                </div>

                <p className="mt-3 text-xs text-[#755C49] leading-relaxed">
                  Persistent application storage, user profile records, and audit events enforced
                  with Row Level Security and automatic session restoration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Explore Live Admin Dashboard CTA */}
        <div className="mt-16 text-center">
          <div className="rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-10 text-[#FFF9F0] shadow-luxury-lg sm:p-14">
            <h3 className="font-display text-2xl font-black text-[#FFF9F0] sm:text-3xl">Inspect Live Telemetry & API Monitor</h3>
            <p className="mt-3 text-xs text-[#E8D5BF] max-w-xl mx-auto sm:text-sm leading-relaxed">
              Sign into the Administrator Control Center to view real-time latency graphs,
              simulated failure recovery tests, and tamper-evident audit logs.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="gap-2 bg-[#C58B55] hover:bg-[#b07844] text-[#2B1B14] border-0 shadow-luxury font-bold"
              >
                <Terminal className="h-4 w-4" />
                Sign in as Admin
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/how-it-works')}
                className="gap-2 border-white/20 bg-white/10 text-[#FFF9F0] hover:bg-white/20 font-semibold"
              >
                View Workflow Sequence
                <ArrowRight className="h-4 w-4 text-[#C58B55]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
