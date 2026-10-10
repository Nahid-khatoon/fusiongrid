import { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  FileCheck,
  Workflow,
  Bell,
  TrendingDown,
  Zap,
  Gauge,
  CheckCircle2,
  Building2,
  User,
  Cpu,
  Layers,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prototypeMetrics } from '@/data/mockData';
import { InteroperabilityArchitecture } from '@/components/landing/InteroperabilityArchitecture';
import { cn } from '@/lib/utils';

interface LandingProps {
  navigate: (to: string) => void;
}

const keyCapabilities = [
  {
    icon: Cpu,
    title: 'API Gateway & Connectors',
    description:
      'Standardized REST & gRPC adapters linking legacy departmental databases without rip-and-replace disruption.',
    tag: 'Zero Rip-and-Replace',
    color: 'text-[#6F4028] bg-[#F5EBDD] border-[#D8C2AA]',
  },
  {
    icon: Lock,
    title: 'Consent-Based Data Sharing',
    description:
      'Granular, purpose-bound, and revocable citizen consent tokens ensuring zero unauthorized data access.',
    tag: 'DPDP Act Compliant',
    color: 'text-[#C58B55] bg-[#FFF8ED] border-[#D8C2AA]',
  },
  {
    icon: Layers,
    title: 'Unified Service Delivery',
    description:
      'Single citizen journey orchestrating multi-department verification and clearances seamlessly.',
    tag: 'One Citizen Journey',
    color: 'text-[#6F4028] bg-[#EAD8C2] border-[#D8C2AA]',
  },
  {
    icon: Activity,
    title: 'Audit & Monitoring',
    description:
      'Immutable cryptographic transaction logs and real-time SLA telemetry for transparent digital governance.',
    tag: 'Immutable Ledger',
    color: 'text-[#38241B] bg-[#F5EBDD] border-[#D8C2AA]',
  },
];

const benefits = [
  {
    icon: FileCheck,
    title: 'One-Time Data Submission',
    description:
      'Submit information once. FusionGrid pre-populates verified credentials across departments with citizen consent — eliminating repetitive paperwork.',
  },
  {
    icon: Lock,
    title: 'Secure & Consent-Bound',
    description:
      'Every inter-department exchange is encrypted with AES-256, logged immutably, and tied to an active, citizen-revocable consent purpose.',
  },
  {
    icon: Bell,
    title: 'Unified Journey Tracking',
    description:
      'Track every cross-department application, document verification stage, and SLA milestone from one single citizen control center.',
  },
  {
    icon: Workflow,
    title: 'Automated Cross-Dept Workflows',
    description:
      'Orchestrates automated verification between Identity, Revenue, Education, Health, and Social Welfare without manual inter-office delays.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Submit Once',
    desc: 'Provide your verified credentials once through the citizen portal or linked DigiLocker profile.',
    icon: FileCheck,
  },
  {
    step: '02',
    title: 'Grant Consent',
    desc: 'Authorize specific departments to access purpose-limited data with explicit time boundaries.',
    icon: Lock,
  },
  {
    step: '03',
    title: 'Auto-Verify',
    desc: 'FusionGrid API Gateway orchestrates cross-department validation automatically in milliseconds.',
    icon: Workflow,
  },
  {
    step: '04',
    title: 'Track Unified',
    desc: 'Monitor approvals, download verified certificates, and review cryptographic access logs in real-time.',
    icon: Bell,
  },
];

const metricIcons = [TrendingDown, Zap, Gauge, CheckCircle2];

export function LandingPage({ navigate }: LandingProps) {
  const [animatedMetrics, setAnimatedMetrics] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    prototypeMetrics.forEach((m, i) => {
      timers.push(
        setTimeout(() => {
          setAnimatedMetrics((prev) => {
            const next = [...prev];
            let current = 0;
            const interval = setInterval(() => {
              current += 2;
              if (current >= m.value) {
                current = m.value;
                clearInterval(interval);
              }
              next[i] = current;
              return [...next];
            }, 20);
            return next;
          });
        }, 400 + i * 200)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="overflow-hidden bg-[#F5EBDD] text-[#38241B]">
      {/* 1. HERO SECTION: Full-width, visually rich, Chocolate Brown + Cream */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9F0] via-[#F5EBDD] to-[#E8D5BF]/30 border-b border-[#E8D5BF] text-[#38241B]">
        {/* Subtle geometric grid background overlay */}
        <div className="pointer-events-none absolute inset-0 hero-grid-pattern opacity-40" />

        {/* Ambient radial lighting glows */}
        <div className="pointer-events-none absolute -left-48 top-12 h-96 w-96 rounded-full bg-[#C58B55]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-[450px] w-[450px] rounded-full bg-[#6F4028]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#E8D5BF]/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Hero Content & CTAs */}
            <div className="flex flex-col items-start lg:col-span-5 xl:col-span-5 animate-fade-in-up">
              {/* Small Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C2AA] bg-[#FFF9F0] px-3.5 py-1.5 text-xs font-semibold text-[#6F4028] shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C58B55] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6F4028]" />
                </span>
                SIH 2026 | Fictional Demonstration
              </div>

              {/* Main Heading */}
              <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-[#38241B] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.12]">
                One Citizen.{' '}
                <span className="text-[#C58B55] underline decoration-[#C58B55]/30 underline-offset-8">
                  One Journey.
                </span>{' '}
                Connected Government.
              </h1>

              {/* Description */}
              <p className="mt-6 text-base text-[#755C49] sm:text-lg sm:leading-relaxed">
                Connecting government departments through secure interoperability, consent-based
                data sharing, common standards, and unified workflows without replacing existing
                government systems.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/services')}
                  className="group h-12 gap-2 bg-[#6F4028] px-6 font-semibold text-[#FFF9F0] shadow-luxury hover:bg-[#805236] transition-all duration-200 border-0"
                >
                  Explore Services
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="h-12 gap-2 border-[#D8C2AA] bg-[#FFF9F0] px-6 font-semibold text-[#38241B] hover:border-[#6F4028] hover:bg-[#E8D5BF]/40 transition-all duration-200 shadow-sm"
                >
                  <User className="h-4 w-4 text-[#6F4028]" />
                  Citizen Portal
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 w-full border-t border-[#D8C2AA]/80 pt-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-[#755C49]">
                  <span className="flex items-center gap-1.5 text-[#38241B]">
                    <ShieldCheck className="h-4 w-4 text-[#6F4028]" />
                    Secure Integration
                  </span>
                  <span className="text-[#C58B55]">•</span>
                  <span className="flex items-center gap-1.5 text-[#38241B]">
                    <Lock className="h-4 w-4 text-[#C58B55]" />
                    Consent-Based Sharing
                  </span>
                  <span className="text-[#C58B55]">•</span>
                  <span className="flex items-center gap-1.5 text-[#38241B]">
                    <CheckCircle2 className="h-4 w-4 text-[#6F4028]" />
                    Unified Services
                  </span>
                </div>

                {/* Quick Enterprise Metrics Ribbon */}
                <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-[#D8C2AA] bg-gradient-to-r from-[#FFF9F0] via-[#FDF5E8] to-[#FFF9F0] p-4 text-left shadow-luxury">
                  <div className="relative pl-3 border-l-2 border-[#6F4028]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="font-display text-xl font-black text-[#38241B]">5 Depts</div>
                    </div>
                    <div className="text-[11px] font-semibold text-[#755C49]">Active Mesh Nodes</div>
                  </div>
                  <div className="relative pl-3 border-l-2 border-[#C58B55]">
                    <div className="font-display text-xl font-black text-[#6F4028]">0%</div>
                    <div className="text-[11px] font-semibold text-[#755C49]">Zero Rip-and-Replace</div>
                  </div>
                  <div className="relative pl-3 border-l-2 border-[#805236]">
                    <div className="font-display text-xl font-black text-[#C58B55]">&lt;24ms</div>
                    <div className="text-[11px] font-semibold text-[#755C49]">Sub-Second SLA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Custom Interoperability Architecture Illustration */}
            <div className="w-full lg:col-span-7 xl:col-span-7 animate-fade-in delay-200">
              <InteroperabilityArchitecture />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four Key Capabilities */}
      <section className="relative border-b border-[#E8D5BF] bg-[#F5EBDD] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <Badge variant="outline" className="mb-2.5 border-[#D8C2AA] bg-[#FFF9F0] text-[#6F4028] font-semibold">
                Core Capabilities
              </Badge>
              <h2 className="font-display text-2xl font-bold tracking-tight text-[#38241B] sm:text-3xl">
                Four Pillars of Connected Government
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#755C49]">
              Enabling secure interoperability across legacy government systems while ensuring
              statutory compliance and citizen data sovereignty.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {keyCapabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.title}
                  className="group relative rounded-2xl border border-[#E8D5BF] bg-[#FFF9F0] p-6 shadow-luxury transition-all duration-300 hover:-translate-y-1 hover:border-[#6F4028] hover:shadow-luxury-lg animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl border shadow-xs', cap.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-[#D8C2AA] bg-[#F5EBDD] px-2.5 py-0.5 text-[10px] font-bold text-[#6F4028]">
                      {cap.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[#38241B] transition-colors group-hover:text-[#6F4028]">
                    {cap.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#755C49]">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Why FusionGrid - Re-composed into an Asymmetric Architectural Comparison & Value Showcase */}
      <section className="relative border-b border-[#E8D5BF] bg-gradient-to-b from-[#EFE3D3] via-[#F5EBDD] to-[#EFE3D3] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-3 border-[#D8C2AA] bg-[#FFF9F0] text-[#6F4028] font-bold tracking-wide">
              Architectural Paradigm Shift
            </Badge>
            <h2 className="font-display text-3xl font-black tracking-tight text-[#38241B] sm:text-4xl">
              Transforming Fragmented Silos into Sovereign Mesh
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#755C49] leading-relaxed">
              Traditional governance forces citizens to act as manual couriers of their own documents across isolated departments. FusionGrid replaces bureaucratic friction with cryptographic, consent-driven interoperability.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-12 items-stretch">
            {/* Left Flagship Card: Before vs After Paradigm Matrix */}
            <div className="lg:col-span-5 rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-7 text-[#FFF9F0] shadow-luxury-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#C58B55]/30 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2B1B14]" />
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C58B55]">
                      Paradigm Comparison
                    </span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#E8D5BF]">
                    SIH 2026 Sovereign Standard
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                      <span className="text-red-400 font-black">✕</span> Traditional Departmental Silos
                    </p>
                    <p className="mt-1.5 text-xs text-[#E8D5BF]/80 leading-relaxed">
                      Citizens stand in multiple queues, submit redundant physical certificates, and wait 14–21 days for inter-office postal verifications.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#C58B55]/40 bg-[#C58B55]/10 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#C58B55] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#C58B55]" /> FusionGrid Interoperable Mesh
                    </p>
                    <p className="mt-1.5 text-xs text-[#FFF9F0] leading-relaxed">
                      Single consent token fetches golden verified records across Identity, Revenue, and Education via sub-second API proxies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-[#E8D5BF]">
                <span className="font-mono">Result: Zero physical paperwork</span>
                <span className="font-bold text-[#C58B55]">100% DPDP Compliant</span>
              </div>
            </div>

            {/* Right Grid: 4 Elevated Impact Value Cards */}
            <div className="lg:col-span-7 grid gap-5 sm:grid-cols-2">
              {[
                {
                  icon: FileCheck,
                  stat: '85% Faster',
                  title: 'One-Time Data Submission',
                  desc: 'Verified credentials in your sovereign vault pre-populate all state schemes with citizen consent.',
                  badge: 'Zero Redundancy',
                },
                {
                  icon: Lock,
                  stat: '100% Audited',
                  title: 'Granular DPDP Consent',
                  desc: 'Citizens dictate exact data scope and validity duration. Revoke access anytime with cryptographic certainty.',
                  badge: 'Citizen Sovereign',
                },
                {
                  icon: Workflow,
                  stat: '<24ms SLA',
                  title: 'Automated Inter-Agency Mesh',
                  desc: 'High-throughput gRPC and REST connectors query disparate database engines without legacy disruption.',
                  badge: 'Mesh Orchestration',
                },
                {
                  icon: Bell,
                  stat: 'Live Telemetry',
                  title: 'Unified Journey Tracking',
                  desc: 'Real-time visibility into verification micro-steps, officer SLA countdowns, and instant certificate issuance.',
                  badge: 'Single Window',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.title}
                    className="group rounded-3xl border-[#E8D5BF] bg-[#FFF9F0] transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1 hover:border-[#6F4028] shadow-luxury flex flex-col justify-between"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] transition-all duration-300 group-hover:bg-[#6F4028] group-hover:text-[#FFF9F0] shadow-xs">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-[#D8C2AA] bg-[#F5EBDD] px-2.5 py-0.5 text-[10px] font-bold text-[#6F4028]">
                          {item.badge}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="font-display text-xl font-black text-[#6F4028]">{item.stat}</span>
                        <h3 className="mt-1 font-display text-base font-bold text-[#38241B] group-hover:text-[#6F4028] transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs text-[#755C49] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3 border-[#D8C2AA] bg-[#FFF9F0] text-[#6F4028] font-semibold">
            Workflow Architecture
          </Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#38241B] sm:text-4xl">
            From application to approval in four steps
          </h2>
          <p className="mt-3 text-sm text-[#755C49]">
            A frictionless single-window citizen journey orchestrated across multiple government departments.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <Card className="h-full rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] hover:border-[#6F4028] hover:shadow-luxury-lg transition-all duration-300 shadow-luxury">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EBDD] text-[#6F4028] shadow-xs">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-display text-2xl font-black text-[#C58B55]">{s.step}</span>
                    </div>
                    <h3 className="mt-5 font-display font-bold text-[#38241B]">{s.title}</h3>
                    <p className="mt-2.5 text-xs text-[#755C49] leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/how-it-works')}
            className="gap-2 border-[#D8C2AA] bg-[#FFF9F0] text-[#38241B] hover:bg-[#E8D5BF]/40 hover:border-[#6F4028] shadow-sm font-semibold"
          >
            See Detailed Workflow & State Machine
            <ArrowRight className="h-4 w-4 text-[#C58B55]" />
          </Button>
        </div>
      </section>

      {/* 5. Prototype Impact Simulation */}
      <section className="border-y border-[#E8D5BF] bg-gradient-to-b from-[#FFF9F0] via-[#F5EBDD] to-[#F5EBDD] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-3 border-[#D8C2AA] bg-[#FFF9F0] text-[#6F4028] font-semibold">
              Prototype Impact Simulation
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#38241B] sm:text-4xl">
              Measurable improvements for citizens and departments
            </h2>
            <p className="mt-3 text-sm text-[#755C49]">
              Simulated performance metrics based on SIH prototype test scenarios across multi-department service flows.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {prototypeMetrics.map((m, i) => {
              const Icon = metricIcons[i];
              return (
                <Card
                  key={m.label}
                  className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] animate-fade-in-up hover:shadow-luxury-lg hover:border-[#6F4028] transition-all duration-300 shadow-luxury"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CardContent className="p-7 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] shadow-xs">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="font-display text-4xl font-black text-[#38241B] tracking-tight">
                      {animatedMetrics[i]}
                      <span className="text-[#C58B55]">{m.suffix}</span>
                    </div>
                    <p className="mt-2.5 text-xs font-semibold text-[#755C49]">{m.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. High-End CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-10 text-[#FFF9F0] shadow-luxury-lg sm:p-16">
          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-15" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#FFF9F0]/10 px-3.5 py-1 text-xs font-bold text-[#FFF9F0]">
              <Sparkles className="h-3.5 w-3.5 text-[#C58B55]" />
              Connected Citizen Experience
            </div>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-[#FFF9F0] leading-tight">
              Experience Connected Government in Action
            </h2>
            <p className="mt-4 text-[#E8D5BF] leading-relaxed text-sm sm:text-base">
              Log in to the citizen portal to experience the complete end-to-end journey: from
              purpose-limited consent granting, to cross-department verification across Revenue,
              Education, and Social Welfare.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="gap-2 bg-[#C58B55] hover:bg-[#b07844] text-[#2B1B14] shadow-luxury border-0 font-bold"
              >
                <Building2 className="h-4 w-4" />
                Enter Citizen Portal
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/services')}
                className="gap-2 border-[#E8D5BF]/40 bg-[#FFF9F0]/10 text-[#FFF9F0] hover:bg-[#FFF9F0]/20 hover:text-white font-semibold"
              >
                Browse Government Services
                <ArrowRight className="h-4 w-4 text-[#C58B55]" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
