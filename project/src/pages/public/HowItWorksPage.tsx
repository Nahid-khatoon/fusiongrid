import { useState } from 'react';
import {
  User,
  Grid3x3,
  Lock,
  Network,
  ShieldCheck,
  Cpu,
  FileSearch,
  CheckCircle2,
  Bell,
  History,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HowItWorksProps {
  navigate: (to: string) => void;
}

const workflowStages = [
  {
    step: '01',
    title: 'Citizen Login',
    subtitle: 'Authentication & Session Initiation',
    desc: 'Citizen authenticates securely via the FusionGrid portal. Identity is verified against the UIDAI e-KYC connector with a time-bound session token.',
    actor: 'Citizen',
    system: 'Auth & Identity Gateway',
    icon: User,
    color: 'text-[#6F4028] bg-[#F5EBDD] border-[#D8C2AA]',
  },
  {
    step: '02',
    title: 'Service Selection',
    subtitle: 'Unified Service Catalog',
    desc: 'Citizen selects a welfare scheme or service (e.g., MahaScholarship). The system automatically loads eligibility criteria and required data scopes.',
    actor: 'Citizen',
    system: 'Master Catalog Engine',
    icon: Grid3x3,
    color: 'text-[#C58B55] bg-[#FFF8ED] border-[#D8C2AA]',
  },
  {
    step: '03',
    title: 'Granular Consent',
    subtitle: 'Purpose-Bound Authorization',
    desc: 'Citizen grants explicit, revocable consent specifying which departments (Revenue, Education, Health) can exchange data strictly for this application.',
    actor: 'Citizen',
    system: 'DPDP Consent Manager',
    icon: Lock,
    color: 'text-[#6F4028] bg-[#EAD8C2] border-[#D8C2AA]',
  },
  {
    step: '04',
    title: 'API Gateway Ingress',
    subtitle: 'Security & Protocol Routing',
    desc: 'The central FusionGrid API Gateway verifies the digital consent token, enforces rate-limiting, and routes encrypted queries via mTLS to target departments.',
    actor: 'System',
    system: 'FusionGrid API Gateway',
    icon: Network,
    color: 'text-[#38241B] bg-[#F5EBDD] border-[#D8C2AA]',
  },
  {
    step: '05',
    title: 'Department Verification',
    subtitle: 'Cross-Department API Calls',
    desc: 'Target departments verify credentials in real-time: Revenue verifies annual income, Education verifies university enrollment, and Identity checks biometric hash.',
    actor: 'Departments',
    system: '5 Department Connectors',
    icon: ShieldCheck,
    color: 'text-[#C58B55] bg-[#FFF8ED] border-[#D8C2AA]',
  },
  {
    step: '06',
    title: 'Application Processing',
    subtitle: 'Data Standardization & Validation',
    desc: 'Heterogeneous departmental payloads are normalized into canonical JSON-LD models. The Data Quality Engine validates values and flags any discrepancies.',
    actor: 'System',
    system: 'Canonical Workflow Engine',
    icon: Cpu,
    color: 'text-[#6F4028] bg-[#F5EBDD] border-[#D8C2AA]',
  },
  {
    step: '07',
    title: 'Officer Review',
    subtitle: 'Statutory Verification',
    desc: 'The application enters the officer queue. The designated officer reviews auto-verified credentials, DigiLocker certificates, and automated audit logs.',
    actor: 'Government Officer',
    system: 'Officer Console & Queue',
    icon: FileSearch,
    color: 'text-[#C58B55] bg-[#EAD8C2] border-[#D8C2AA]',
  },
  {
    step: '08',
    title: 'Approval or Rejection',
    subtitle: 'Decision & State Transition',
    desc: 'Officer executes statutory action: Approve, Reject (with mandatory reason), or Request Additional Information. State transitions atomically in database.',
    actor: 'Government Officer',
    system: 'State Machine Engine',
    icon: CheckCircle2,
    color: 'text-[#6F4028] bg-[#FFF8ED] border-[#D8C2AA]',
  },
  {
    step: '09',
    title: 'Citizen Notification',
    subtitle: 'Instant Proactive Alerts',
    desc: 'The shared Event Bus triggers instant citizen notification across portal notifications, SMS simulation, and downloadable digital certificate.',
    actor: 'Citizen & System',
    system: 'Event Stream & Alert Bus',
    icon: Bell,
    color: 'text-[#C58B55] bg-[#F5EBDD] border-[#D8C2AA]',
  },
  {
    step: '10',
    title: 'Application Tracking',
    subtitle: 'Immutable Audit Trail',
    desc: 'The complete lifecycle is sealed in the cryptographic audit ledger. Citizen and auditors can review every step, actor timestamp, and verified proof.',
    actor: 'Citizen & Auditors',
    system: 'Cryptographic Audit Ledger',
    icon: History,
    color: 'text-[#38241B] bg-[#FFF8ED] border-[#D8C2AA]',
  },
];

export function HowItWorksPage({ navigate }: HowItWorksProps) {
  const [selectedStage, setSelectedStage] = useState<number>(0);

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
              <Zap className="h-3.5 w-3.5 text-[#C58B55]" />
              End-to-End Interoperability Lifecycle
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#38241B] leading-tight">
              From Application to Approval in{' '}
              <span className="text-[#C58B55]">
                Ten Unified Stages
              </span>
            </h1>
            <p className="mt-6 text-base text-[#755C49] sm:text-lg sm:leading-relaxed">
              Explore how FusionGrid bridges citizen actions, cross-department API verification,
              officer review, and immutable audit logs without requiring legacy system replacements.
            </p>
          </div>
        </div>
      </section>

      {/* Main Visual Stepper Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Interactive Stage Selector Bar */}
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex min-w-max items-center gap-2 rounded-2xl border border-[#E8D5BF] bg-[#FFF9F0] p-2.5 shadow-luxury">
            {workflowStages.map((stage, i) => {
              const Icon = stage.icon;
              const isSelected = selectedStage === i;
              return (
                <button
                  key={stage.step}
                  onClick={() => setSelectedStage(i)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200',
                    isSelected
                      ? 'bg-[#6F4028] text-[#FFF9F0] shadow-md font-bold'
                      : 'text-[#755C49] hover:bg-[#E8D5BF]/40 hover:text-[#38241B]'
                  )}
                >
                  <span className={cn('font-mono text-[11px]', isSelected ? 'text-[#C58B55]' : 'opacity-60')}>
                    {stage.step}
                  </span>
                  <Icon className="h-3.5 w-3.5" />
                  <span>{stage.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Highlighted Stage Spotlight Card */}
        <div className="mb-16 rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF9F0] shadow-luxury-lg sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-[#C58B55]">
                  STAGE {workflowStages[selectedStage].step} OF 10
                </span>
                <span className="text-[#E8D5BF]/40">•</span>
                <span className="rounded-lg bg-[#FFF9F0]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#FFF9F0] border border-white/10">
                  {workflowStages[selectedStage].actor}
                </span>
              </div>

              <h2 className="mt-3.5 font-display text-2xl font-black sm:text-3xl text-[#FFF9F0]">
                {workflowStages[selectedStage].title}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#C58B55]">
                {workflowStages[selectedStage].subtitle}
              </p>

              <p className="mt-4 text-xs text-[#E8D5BF] sm:text-sm leading-relaxed">
                {workflowStages[selectedStage].desc}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-[#E8D5BF]">
                <span className="flex items-center gap-1.5 text-[#FFF9F0] font-semibold">
                  <Cpu className="h-4 w-4 text-[#C58B55]" />
                  Engine: {workflowStages[selectedStage].system}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center lg:col-span-4 border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pl-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#6F4028] text-[#FFF9F0] shadow-lg border border-[#C58B55]/30">
                {(() => {
                  const Icon = workflowStages[selectedStage].icon;
                  return <Icon className="h-10 w-10 text-[#C58B55]" />;
                })()}
              </div>
              <div className="mt-4 text-center">
                <span className="font-mono text-3xl font-black text-[#FFF9F0]">
                  {workflowStages[selectedStage].step}
                </span>
                <p className="text-[11px] text-[#E8D5BF]">Sequence Index</p>
              </div>
            </div>
          </div>
        </div>

        {/* 10 Connected Stages Grid */}
        <div className="relative">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold tracking-tight text-[#38241B]">Full Sequential Pipeline</h3>
            <span className="text-xs text-[#755C49] font-medium">10 Micro-Services Coordinated</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
            {workflowStages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.step}
                  onClick={() => setSelectedStage(i)}
                  className={cn(
                    'group relative cursor-pointer rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury-lg',
                    selectedStage === i
                      ? 'border-[#6F4028] bg-[#FFF9F0] shadow-luxury-lg ring-2 ring-[#6F4028]/20'
                      : 'border-[#E8D5BF] bg-[#FFF9F0] hover:border-[#6F4028] shadow-luxury'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-xs ${stage.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#6F4028]">{stage.step}</span>
                          <span className="text-xs text-[#755C49] font-semibold">· {stage.actor}</span>
                        </div>
                        <h4 className="font-display text-base font-bold text-[#38241B] group-hover:text-[#6F4028] transition-colors">
                          {stage.title}
                        </h4>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#EAD8C2] px-2.5 py-0.5 text-[10px] font-bold text-[#38241B]">
                      {stage.system}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-[#755C49] leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-10 text-[#FFF9F0] shadow-luxury-lg sm:p-14">
          <h3 className="font-display text-2xl font-black text-[#FFF9F0] sm:text-3xl">Experience the Complete Journey</h3>
          <p className="mt-3 text-xs text-[#E8D5BF] max-w-xl mx-auto sm:text-sm leading-relaxed">
            Log in to the citizen portal to submit an application and watch the live verification
            execute across Revenue, Education, and Identity departments.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3.5 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="gap-2 bg-[#C58B55] text-[#2B1B14] hover:bg-[#b07844] border-0 shadow-luxury font-bold"
            >
              <User className="h-4 w-4" />
              Citizen Portal Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/services')}
              className="gap-2 border-white/20 bg-white/10 text-[#FFF9F0] hover:bg-white/20 font-semibold"
            >
              Browse Services
              <ArrowRight className="h-4 w-4 text-[#C58B55]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
