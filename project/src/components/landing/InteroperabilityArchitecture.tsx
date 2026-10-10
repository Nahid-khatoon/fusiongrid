import { useState, useEffect } from 'react';
import {
  Network,
  Cpu,
  Fingerprint,
  Landmark,
  GraduationCap,
  HeartPulse,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DepartmentNode {
  id: string;
  name: string;
  subtitle: string;
  legacySystem: string;
  icon: typeof Landmark;
  color: string;
  accentHex: string;
  badge: string;
  protocol: string;
  samplePayload: {
    endpoint: string;
    schema: string;
    consent: string;
    latency: string;
  };
}

const departmentNodes: DepartmentNode[] = [
  {
    id: 'identity',
    name: 'Identity Service',
    subtitle: 'Civil Registry & e-KYC',
    legacySystem: 'UIDAI / Aadhaar Bridge',
    icon: Fingerprint,
    color: 'text-[#6F4028] bg-[#F5EBDD] border-[#E8D5BF]',
    accentHex: '#6F4028',
    badge: 'AES-256',
    protocol: 'REST / OAuth2 Token',
    samplePayload: {
      endpoint: 'GET /v2/identity/verify-kyc',
      schema: 'Aadhaar.eKYC.JSON-LD',
      consent: 'Citizen Token #C-8821 (Active)',
      latency: '12ms',
    },
  },
  {
    id: 'revenue',
    name: 'Revenue Department',
    subtitle: 'Land Records & Income',
    legacySystem: 'Mahabhulekh / ITR Core',
    icon: Landmark,
    color: 'text-[#C58B55] bg-[#F5EBDD] border-[#E8D5BF]',
    accentHex: '#C58B55',
    badge: 'Signed XML',
    protocol: 'SOAP Bridge / gRPC',
    samplePayload: {
      endpoint: 'POST /v1/revenue/income-verify',
      schema: 'Revenue.IncomeCertificate.v2',
      consent: 'Purpose: Scholarship Only',
      latency: '18ms',
    },
  },
  {
    id: 'education',
    name: 'Education Department',
    subtitle: 'Academic Bank & Degrees',
    legacySystem: 'DigiLocker / ABC API',
    icon: GraduationCap,
    color: 'text-[#4A2E22] bg-[#F5EBDD] border-[#E8D5BF]',
    accentHex: '#4A2E22',
    badge: 'URI Verified',
    protocol: 'REST / JSON-LD',
    samplePayload: {
      endpoint: 'GET /v1/digilocker/degree-fetch',
      schema: 'DigiLocker.DegreeSchema.v1',
      consent: 'Time-bound: 30 Days',
      latency: '14ms',
    },
  },
  {
    id: 'health',
    name: 'Health Department',
    subtitle: 'Health Records & Registries',
    legacySystem: 'ABHA / ABDM Gateway',
    icon: HeartPulse,
    color: 'text-[#6F4028] bg-[#F5EBDD] border-[#E8D5BF]',
    accentHex: '#6F4028',
    badge: 'FHIR R4',
    protocol: 'HIP Consent Webhook',
    samplePayload: {
      endpoint: 'POST /v2/abha/consent-verify',
      schema: 'FHIR.Bundle.HealthSummary',
      consent: 'Granular: Immunization Only',
      latency: '19ms',
    },
  },
  {
    id: 'welfare',
    name: 'Social Welfare',
    subtitle: 'DBT & Direct Entitlements',
    legacySystem: 'PFMS / DBT Webhook',
    icon: Users,
    color: 'text-[#2B1B14] bg-[#F5EBDD] border-[#E8D5BF]',
    accentHex: '#2B1B14',
    badge: 'PFMS Sync',
    protocol: 'Async Event Stream',
    samplePayload: {
      endpoint: 'POST /v1/welfare/dbt-trigger',
      schema: 'PFMS.DisbursementPayload.v3',
      consent: 'Bank Link Verified',
      latency: '16ms',
    },
  },
];

const liveTransactions = [
  '⇄ [e-KYC] Identity Service → Gateway (Token SHA-256 Validated)',
  '⇄ [INCOME] Revenue Department → Canonical Schema Transformation',
  '⇄ [DEGREE] Education Department → DigiLocker URI Verified',
  '⇄ [CONSENT] Citizen Consent #CG-8912 Enforced on Health Request',
  '⇄ [DBT] Social Welfare → Direct Benefit Pre-Verification Passed',
];

export function InteroperabilityArchitecture() {
  const [activeDeptId, setActiveDeptId] = useState<string>('identity');
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveTransactions.length);
    }, 3200);
    return () => clearInterval(tickerInterval);
  }, []);

  const activeDept =
    departmentNodes.find((d) => d.id === activeDeptId) || departmentNodes[0];

  return (
    <div className="relative w-full rounded-2xl border border-[#E8D5BF] bg-[#FFF9F0] p-4 shadow-xl sm:p-6 lg:p-7 transition-all duration-300">
      {/* Decorative ambient corner glows */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#C58B55]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-[#6F4028]/12 blur-3xl" />

      {/* Header bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E8D5BF] pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6F4028] to-[#4A2E22] text-[#FFF9F0] shadow-sm">
            <Network className="h-4.5 w-4.5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C58B55] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C58B55]" />
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide text-[#38241B]">
              Interoperability Architecture
            </h3>
            <p className="text-[11px] text-[#786453]">
              Live Cross-Department Secure Data Mesh (SIH 2026 Simulation)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-[#C58B55]/40 bg-[#FFF9F0] text-[11px] font-semibold text-[#6F4028] shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Active Mesh Sync
          </Badge>
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className="flex items-center gap-1 rounded-lg border border-[#E8D5BF] bg-[#FFF9F0] px-2.5 py-1 text-[11px] font-semibold text-[#38241B] transition-colors hover:bg-[#E8D5BF]"
            title="Toggle data flow stream"
          >
            <Activity className={cn('h-3 w-3', isLiveActive ? 'text-[#6F4028]' : 'text-[#786453]')} />
            {isLiveActive ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Central Visual Presentation */}
      <div className="relative">
        {/* Spatial Topology with SVG pipelines */}
        <div className="relative min-h-[460px] w-full overflow-hidden rounded-xl border border-[#E8D5BF] bg-[#F5EBDD]/60 p-4">
          {/* Blueprint grid in illustration container */}
          <div className="pointer-events-none absolute inset-0 hero-grid-pattern opacity-40" />

          {/* SVG Interconnecting Pipelines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6F4028" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#C58B55" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#4A2E22" stopOpacity="0.8" />
              </linearGradient>
              <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connecting paths from 5 departments into central API Gateway (50, 48) */}
            {/* 1. Identity (top-left: 22, 18) */}
            <path
              id="path-identity"
              d="M 22,18 C 32,24 38,36 44,44"
              fill="none"
              stroke={activeDeptId === 'identity' ? '#6F4028' : 'rgba(111, 64, 40, 0.28)'}
              strokeWidth={activeDeptId === 'identity' ? '1.8' : '0.9'}
              strokeDasharray={isLiveActive ? '1.5 2' : 'none'}
              className={isLiveActive ? 'animate-dash-travel' : ''}
            />
            {/* 2. Revenue (top-right: 78, 18) */}
            <path
              id="path-revenue"
              d="M 78,18 C 68,24 62,36 56,44"
              fill="none"
              stroke={activeDeptId === 'revenue' ? '#C58B55' : 'rgba(197, 139, 85, 0.28)'}
              strokeWidth={activeDeptId === 'revenue' ? '1.8' : '0.9'}
              strokeDasharray={isLiveActive ? '1.5 2' : 'none'}
              className={isLiveActive ? 'animate-dash-travel' : ''}
            />
            {/* 3. Education (mid-left: 24, 76) */}
            <path
              id="path-education"
              d="M 24,76 C 32,70 38,58 44,52"
              fill="none"
              stroke={activeDeptId === 'education' ? '#4A2E22' : 'rgba(74, 46, 34, 0.28)'}
              strokeWidth={activeDeptId === 'education' ? '1.8' : '0.9'}
              strokeDasharray={isLiveActive ? '1.5 2' : 'none'}
              className={isLiveActive ? 'animate-dash-travel' : ''}
            />
            {/* 4. Health (mid-right: 76, 76) */}
            <path
              id="path-health"
              d="M 76,76 C 68,70 62,58 56,52"
              fill="none"
              stroke={activeDeptId === 'health' ? '#6F4028' : 'rgba(111, 64, 40, 0.28)'}
              strokeWidth={activeDeptId === 'health' ? '1.8' : '0.9'}
              strokeDasharray={isLiveActive ? '1.5 2' : 'none'}
              className={isLiveActive ? 'animate-dash-travel' : ''}
            />
            {/* 5. Welfare (bottom-center: 50, 86) */}
            <path
              id="path-welfare"
              d="M 50,86 L 50,57"
              fill="none"
              stroke={activeDeptId === 'welfare' ? '#2B1B14' : 'rgba(43, 27, 20, 0.28)'}
              strokeWidth={activeDeptId === 'welfare' ? '1.8' : '0.9'}
              strokeDasharray={isLiveActive ? '1.5 2' : 'none'}
              className={isLiveActive ? 'animate-dash-travel' : ''}
            />

            {/* Flowing animated packet circles */}
            {isLiveActive && (
              <>
                <circle r="1.3" fill="#6F4028" filter="url(#packetGlow)">
                  <animateMotion
                    path="M 22,18 C 32,24 38,36 44,44"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="1.3" fill="#C58B55" filter="url(#packetGlow)">
                  <animateMotion
                    path="M 78,18 C 68,24 62,36 56,44"
                    dur="2.8s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="1.3" fill="#4A2E22" filter="url(#packetGlow)">
                  <animateMotion
                    path="M 24,76 C 32,70 38,58 44,52"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="1.3" fill="#6F4028" filter="url(#packetGlow)">
                  <animateMotion
                    path="M 76,76 C 68,70 62,58 56,52"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="1.3" fill="#2B1B14" filter="url(#packetGlow)">
                  <animateMotion
                    path="M 50,86 L 50,57"
                    dur="2.2s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Return verified packets from Gateway back outwards */}
                <circle r="1.1" fill="#C58B55" filter="url(#packetGlow)">
                  <animateMotion
                    path="M 44,44 C 38,36 32,24 22,18"
                    dur="2.9s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="1.1" fill="#6F4028" filter="url(#packetGlow)">
                  <animateMotion
                    path="M 56,44 C 62,36 68,24 78,18"
                    dur="3.2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </>
            )}
          </svg>

          {/* Department Nodes (Interactive positioned cards) */}
          <div className="relative z-10 flex flex-col justify-between h-full gap-4">
            {/* Top Row: Identity (left) & Revenue (right) */}
            <div className="flex items-start justify-between gap-2">
              {/* Identity Node */}
              <button
                onClick={() => setActiveDeptId('identity')}
                onMouseEnter={() => setActiveDeptId('identity')}
                className={cn(
                  'group flex max-w-[195px] items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-300 sm:max-w-[215px]',
                  activeDeptId === 'identity'
                    ? 'border-[#6F4028] bg-[#FFF9F0] shadow-lg shadow-[#6F4028]/15 ring-2 ring-[#C58B55]/50 scale-[1.03]'
                    : 'border-[#E8D5BF] bg-[#FFF9F0]/95 hover:border-[#6F4028]/60 hover:bg-[#FFF9F0]'
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6F4028]/10 text-[#6F4028] ring-1 ring-[#E8D5BF]">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-xs font-bold text-[#38241B]">Identity Service</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6F4028] animate-pulse" />
                  </div>
                  <p className="truncate text-[10px] text-[#786453]">Civil Registry / e-KYC</p>
                  <span className="mt-0.5 inline-block rounded bg-[#F5EBDD] px-1.5 py-0.2 text-[9px] font-semibold text-[#6F4028] border border-[#E8D5BF]">
                    UIDAI Bridge
                  </span>
                </div>
              </button>

              {/* Revenue Node */}
              <button
                onClick={() => setActiveDeptId('revenue')}
                onMouseEnter={() => setActiveDeptId('revenue')}
                className={cn(
                  'group flex max-w-[195px] items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all duration-300 sm:max-w-[215px]',
                  activeDeptId === 'revenue'
                    ? 'border-[#C58B55] bg-[#FFF9F0] shadow-lg shadow-[#C58B55]/20 ring-2 ring-[#6F4028]/50 scale-[1.03]'
                    : 'border-[#E8D5BF] bg-[#FFF9F0]/95 hover:border-[#C58B55]/60 hover:bg-[#FFF9F0]'
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#C58B55]/15 text-[#C58B55] ring-1 ring-[#E8D5BF]">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-xs font-bold text-[#38241B]">Revenue Dept</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C58B55] animate-pulse" />
                  </div>
                  <p className="truncate text-[10px] text-[#786453]">Land & Income Tax</p>
                  <span className="mt-0.5 inline-block rounded bg-[#F5EBDD] px-1.5 py-0.2 text-[9px] font-semibold text-[#C58B55] border border-[#E8D5BF]">
                    Mahabhulekh
                  </span>
                </div>
              </button>
            </div>

            {/* Center: FusionGrid API Gateway Core Node */}
            <div className="my-2 flex items-center justify-center">
              <div
                className={cn(
                  'relative w-full max-w-[320px] rounded-2xl border p-4 text-center transition-all duration-500 sm:max-w-[340px]',
                  'border-[#C58B55] bg-gradient-to-b from-[#2B1B14] via-[#4A2E22] to-[#2B1B14] text-[#FFF9F0] shadow-2xl shadow-[#2B1B14]/40 backdrop-blur-2xl animate-pulse-glow'
                )}
              >
                {/* Radar pulse rings */}
                <div className="pointer-events-none absolute inset-0 -m-1 rounded-2xl border border-[#C58B55]/30 opacity-60" />

                {/* Central Status Pill */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C58B55]/50 bg-[#C58B55]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#FFF9F0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C58B55] animate-ping" />
                  FUSIONGRID API GATEWAY
                </div>

                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6F4028] via-[#C58B55] to-[#4A2E22] text-white shadow-lg shadow-[#6F4028]/40">
                    <Cpu className="h-6 w-6 animate-pulse text-[#FFF9F0]" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-bold text-[#FFF9F0] tracking-tight">
                      Central Gateway Engine
                    </h4>
                    <p className="text-[11px] text-[#E8D5BF]">
                      Zero-Knowledge Interoperability
                    </p>
                  </div>
                </div>

                {/* Spec tags */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 border-t border-[#6F4028]/60 pt-2.5">
                  <span className="rounded bg-[#2B1B14] px-2 py-0.5 text-[10px] font-mono text-[#E8D5BF] border border-[#6F4028]">
                    TLS 1.3 • AES-256
                  </span>
                  <span className="rounded bg-[#2B1B14] px-2 py-0.5 text-[10px] font-mono text-[#C58B55] border border-[#6F4028]">
                    Consent Enforced
                  </span>
                  <span className="rounded bg-[#2B1B14] px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-[#6F4028]">
                    0 Rip-and-Replace
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Education (left), Welfare (center), Health (right) */}
            <div className="flex flex-wrap items-end justify-between gap-2">
              {/* Education Node */}
              <button
                onClick={() => setActiveDeptId('education')}
                onMouseEnter={() => setActiveDeptId('education')}
                className={cn(
                  'group flex max-w-[175px] items-center gap-2 rounded-xl border p-2 text-left transition-all duration-300 sm:max-w-[195px]',
                  activeDeptId === 'education'
                    ? 'border-[#4A2E22] bg-[#FFF9F0] shadow-lg shadow-[#4A2E22]/20 ring-2 ring-[#C58B55]/50 scale-[1.03]'
                    : 'border-[#E8D5BF] bg-[#FFF9F0]/95 hover:border-[#4A2E22]/60 hover:bg-[#FFF9F0]'
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4A2E22]/15 text-[#4A2E22] ring-1 ring-[#E8D5BF]">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-xs font-bold text-[#38241B]">Education Dept</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4A2E22] animate-pulse" />
                  </div>
                  <p className="truncate text-[9px] text-[#786453]">DigiLocker / ABC</p>
                </div>
              </button>

              {/* Social Welfare Node (Center bottom) */}
              <button
                onClick={() => setActiveDeptId('welfare')}
                onMouseEnter={() => setActiveDeptId('welfare')}
                className={cn(
                  'group flex max-w-[185px] items-center gap-2 rounded-xl border p-2 text-left transition-all duration-300 sm:max-w-[205px]',
                  activeDeptId === 'welfare'
                    ? 'border-[#2B1B14] bg-[#FFF9F0] shadow-lg shadow-[#2B1B14]/20 ring-2 ring-[#C58B55]/50 scale-[1.03]'
                    : 'border-[#E8D5BF] bg-[#FFF9F0]/95 hover:border-[#2B1B14]/60 hover:bg-[#FFF9F0]'
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2B1B14]/12 text-[#2B1B14] ring-1 ring-[#E8D5BF]">
                  <Users className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-xs font-bold text-[#38241B]">Social Welfare</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2B1B14] animate-pulse" />
                  </div>
                  <p className="truncate text-[9px] text-[#786453]">DBT / PFMS Sync</p>
                </div>
              </button>

              {/* Health Node */}
              <button
                onClick={() => setActiveDeptId('health')}
                onMouseEnter={() => setActiveDeptId('health')}
                className={cn(
                  'group flex max-w-[175px] items-center gap-2 rounded-xl border p-2 text-left transition-all duration-300 sm:max-w-[195px]',
                  activeDeptId === 'health'
                    ? 'border-[#6F4028] bg-[#FFF9F0] shadow-lg shadow-[#6F4028]/20 ring-2 ring-[#C58B55]/50 scale-[1.03]'
                    : 'border-[#E8D5BF] bg-[#FFF9F0]/95 hover:border-[#6F4028]/60 hover:bg-[#FFF9F0]'
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6F4028]/12 text-[#6F4028] ring-1 ring-[#E8D5BF]">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-xs font-bold text-[#38241B]">Health Dept</span>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6F4028] animate-pulse" />
                  </div>
                  <p className="truncate text-[9px] text-[#786453]">ABHA / FHIR R4</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Live Active Node Inspector Tray */}
        <div className="mt-3 rounded-xl border border-[#E8D5BF] bg-[#FFF9F0] p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8D5BF]/70 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#786453]">Selected Adapter:</span>
              <span className="text-xs font-bold text-[#38241B] flex items-center gap-1.5">
                <activeDept.icon className="h-3.5 w-3.5 text-[#6F4028]" />
                {activeDept.name}
              </span>
              <span className="rounded bg-[#F5EBDD] px-2 py-0.5 text-[10px] font-mono text-[#6F4028] border border-[#E8D5BF]">
                {activeDept.protocol}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#786453]">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Latency: {activeDept.samplePayload.latency}
              </span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 text-[11px] font-mono sm:grid-cols-2">
            <div className="rounded-lg bg-[#F5EBDD] p-2 border border-[#E8D5BF] text-[#38241B]">
              <span className="text-[10px] text-[#786453] block mb-0.5">MAPPED SCHEMA:</span>
              <span className="text-[#6F4028] font-bold">{activeDept.samplePayload.schema}</span>
            </div>
            <div className="rounded-lg bg-[#F5EBDD] p-2 border border-[#E8D5BF] text-[#38241B]">
              <span className="text-[10px] text-[#786453] block mb-0.5">CONSENT SCOPE:</span>
              <span className="text-emerald-800 font-bold">{activeDept.samplePayload.consent}</span>
            </div>
          </div>
        </div>

        {/* Live Transaction Ticker */}
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[#E8D5BF] bg-[#E8D5BF]/40 px-3 py-1.5 text-[11px] text-[#38241B]">
          <Zap className="h-3.5 w-3.5 shrink-0 text-[#C58B55] animate-pulse" />
          <span className="font-bold text-[#6F4028]">LIVE BUS:</span>
          <span className="truncate font-mono font-medium text-[#38241B]">{liveTransactions[tickerIndex]}</span>
        </div>
      </div>
    </div>
  );
}
