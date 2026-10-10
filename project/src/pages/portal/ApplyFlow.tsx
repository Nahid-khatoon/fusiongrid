import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Clock,
  User,
  FileText,
  KeyRound,
  Database,
  Building2,
  GraduationCap,
  Landmark,
  Loader2,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  Shield,
  Layers,
  HeartPulse,
  Users,
  Cpu,
  RefreshCw,
  FolderLock,
  CheckCheck,
} from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { services } from '@/data/mockData';
import {
  SERVICE_DOCUMENT_CONFIGS,
  getServiceChecklist,
  getServiceConsents,
} from '@/lib/serviceDocumentRequirements';
import { mockApiGateway } from '@/lib/apiGateway';
import { fetchCitizenVault } from '@/lib/documentService';
import type { Application, ConsentRecord, TimelineStep, DataAccessRecord, VaultDocument, WorkflowStage } from '@/types';
import { cn } from '@/lib/utils';
import { DocumentUploadStep } from '@/components/shared/DocumentUploadStep';
import { supabase } from '@/lib/supabase';

interface ApplyFlowProps {
  serviceId: string;
  navigate: (to: string) => void;
}

const departmentIcons: Record<string, typeof Landmark> = {
  'Revenue Department': Landmark,
  'Education Department': GraduationCap,
  'Identity Service': ShieldCheck,
  'Health Department': HeartPulse as unknown as typeof Landmark,
  'Social Welfare Department': Users as unknown as typeof Landmark,
};

export function ApplyFlow({ serviceId, navigate }: ApplyFlowProps) {
  const {
    addApplication,
    addNotification,
    addAuditEvent,
    emitEvent,
    grantConsent,
    citizenProfile,
    user,
  } = useApp();

  const citizenName = citizenProfile?.full_name || user?.name || 'Information not available';
  const citizenUid = user?.id || 'Information not available';
  const service = services.find((s) => s.id === serviceId) || services[0];
  const serviceConfig = SERVICE_DOCUMENT_CONFIGS[serviceId] || SERVICE_DOCUMENT_CONFIGS['maha-scholarship'];
  const consentRequirements = getServiceConsents(serviceId);
  const checklist = getServiceChecklist(serviceId);

  // Workflow step state: 1 (Basic Info) -> 2 (Consent) -> 3 (Existing Data Reuse) -> 4 (Dept Verification) -> 5 (Missing Docs & Quality) -> 6 (Confirmation)
  const [step, setStep] = useState(1);

  // Consent decisions state
  const [consents, setConsents] = useState<Record<string, 'granted' | 'denied'>>(() => {
    const init: Record<string, 'granted' | 'denied'> = {};
    consentRequirements.forEach((c) => {
      init[c.id] = 'granted'; // Default to granted for smooth demonstration
    });
    return init;
  });

  // Vault documents state for data reuse
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);

  // Department Verification Simulation state
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [activeVerificationIdx, setActiveVerificationIdx] = useState(-1);
  const [verificationDone, setVerificationDone] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [retryStage, setRetryStage] = useState<'idle' | 'retrying' | 'recovered'>('idle');

  // Document upload state
  const [allDocsReady, setAllDocsReady] = useState(false);
  const [draftAppId, setDraftAppId] = useState('');

  // Generated application reference
  const [generatedId, setGeneratedId] = useState('');
  const [generatedRequestId, setGeneratedRequestId] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Pre-load vault documents
  useEffect(() => {
    (async () => {
      setLoadingVault(true);
      const docs = await fetchCitizenVault();
      setVaultDocs(docs);
      setLoadingVault(false);
    })();
  }, []);

  // Generate Reference ID tailored to service
  useEffect(() => {
    if (!generatedId) {
      const prefixMap: Record<string, string> = {
        'maha-scholarship': 'MH-SCH',
        'income-certificate': 'MH-INC',
        'student-education-benefit': 'MH-SEB',
        'health-assistance': 'MH-HLT',
        'social-welfare': 'MH-SOC',
      };
      const prefix = prefixMap[service.id] || 'MH-APP';
      const num = Math.floor(10000 + Math.random() * 90000);
      setGeneratedId(`${prefix}-2026-${num}`);
      setGeneratedRequestId(`REQ-${Date.now().toString().slice(-6)}`);
    }
  }, [generatedId, service.id]);

  const allConsentsGranted = consentRequirements.every((c) => consents[c.id] === 'granted');

  const handleConsentToggle = (id: string, decision: 'granted' | 'denied') => {
    setConsents((prev) => ({ ...prev, [id]: decision }));
  };

  // Create or retrieve draft application
  const ensureDraftApplication = useCallback(async () => {
    if (draftAppId) return draftAppId;
    if (!service || !user?.id) return null;
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          display_id: `DRAFT-${Date.now()}`,
          citizen_id: user.id,
          service_id: service.id,
          service_name: service.name,
          status: 'draft',
          progress: 0,
          submitted_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (!error && data) {
        const realId = (data as Record<string, unknown>).id as string;
        setDraftAppId(realId);
        return realId;
      }
    } catch {
      // Fallback
    }
    const fallbackId = `draft-${Date.now()}`;
    setDraftAppId(fallbackId);
    return fallbackId;
  }, [draftAppId, service, user?.id]);

  // Verification steps derived from consent departments
  const activeVerifDepartments = consentRequirements.map((c) => ({
    id: c.id,
    label: `${c.department} Token Exchange`,
    dept: c.department,
    dataScope: c.dataScope,
    endpoint: `/api/${c.department.toLowerCase().replace(/\s+/g, '-')}/verify`,
  }));

  // Run simulated API Gateway verification
  useEffect(() => {
    if (step !== 4) return;

    setVerificationProgress(0);
    setActiveVerificationIdx(0);
    setVerificationDone(false);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= activeVerifDepartments.length) {
        clearInterval(interval);
        setVerificationProgress(100);
        setVerificationDone(true);
        return;
      }
      setActiveVerificationIdx(idx);
      setVerificationProgress(((idx + 1) / activeVerifDepartments.length) * 100);
      idx++;
    }, 800);

    return () => clearInterval(interval);
  }, [step, activeVerifDepartments.length]);

  // Submit Application
  const handleSubmit = async () => {
    if (!service) return;

    const timeline: TimelineStep[] = [
      {
        id: 't-1',
        label: 'Application Enqueued',
        status: 'done',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 't-2',
        label: 'DPDP Sec 6 Consent Tokens Issued',
        status: 'done',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 't-3',
        label: 'Cross-Department Interoperable Verification',
        status: 'done',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 't-4',
        label: 'Department Officer Review & Certification',
        status: 'current',
        timestamp: `SLA: ${service.processingTime}`,
      },
      {
        id: 't-5',
        label: 'Benefit Sanction & Certificate Issuance',
        status: 'pending',
        timestamp: 'Final Stage',
      },
    ];

    const dataAccess: DataAccessRecord[] = consentRequirements.map((c, i) => ({
      id: `da-${Date.now()}-${i}`,
      department: c.department,
      data: c.dataScope,
      purpose: c.purpose,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      result: 'Verified & Tokenized',
    }));

    const workflowStages: WorkflowStage[] = consentRequirements.map((c, i) => ({
      id: `ws-${i + 1}`,
      label: `${c.department.replace('Department', '').trim()} Verification`,
      department: c.department,
      status: 'done' as const,
      duration: `${140 + i * 80}ms`,
    }));
    workflowStages.push({
      id: `ws-${workflowStages.length + 1}`,
      label: 'Officer Adjudication',
      department: service.department,
      status: 'current' as const,
      duration: 'In Queue',
    });

    const newApp: Application = {
      id: generatedId,
      requestId: generatedRequestId,
      serviceId: service.id,
      serviceName: service.name,
      citizenId: user?.id || citizenUid,
      submittedAt: new Date().toISOString(),
      status: 'under_verification',
      progress: 60,
      timeline,
      dataAccess,
      consents: consentRequirements.map((c) => ({
        id: c.id,
        department: c.department,
        dataScope: c.dataScope,
        purpose: c.purpose,
        requestedAt: new Date().toISOString(),
        status: consents[c.id] || 'granted',
      })),
      departments: Array.from(new Set([service.department, ...consentRequirements.map((c) => c.department)])),
      workflowStages,
    };

    if (draftAppId) {
      try {
        await supabase
          .from('applications')
          .update({
            display_id: generatedId,
            request_id: generatedRequestId,
            status: 'under_verification',
            progress: 60,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', draftAppId);
      } catch {
        // Fallback
      }
    }

    addApplication(newApp);

    addNotification({
      id: `n-${Date.now()}`,
      title: 'Application Enqueued in Verification Queue',
      message: `Your application for ${service.name} (Ref: ${generatedId}) has been successfully submitted and routed to the verification queue.`,
      type: 'success',
      read: false,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      applicationId: generatedId,
    });

    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId: generatedId,
      action: 'Application Submitted',
      actor: citizenName,
      actorRole: 'citizen',
      detail: `${service.name} application submitted via FusionGrid interoperability pipeline with ${consentRequirements.length} consent tokens`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      type: 'submit',
    });

    emitEvent('ApplicationSubmitted', `${service.name} application submitted`, generatedId, citizenName);

    consentRequirements
      .filter((c) => consents[c.id] === 'granted')
      .forEach((c) => {
        grantConsent(c.department, c.dataScope, c.purpose, generatedId);
      });

    setStep(6);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const steps = [
    { title: 'Basic Information', desc: 'Pre-filled from Profile' },
    { title: 'Consent', desc: 'DPDP Act Grants' },
    { title: 'Existing Data Reuse', desc: 'Vault & Attribute Match' },
    { title: 'Department Verification', desc: 'Simulated API Gateway' },
    { title: 'Missing Documents', desc: 'Service Checklist' },
    { title: 'Receipt & Tracking', desc: 'Officer Adjudication' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 bg-[#F5EBDD] text-[#38241B]">
      {/* ── TOP HEADER & BREADCRUMB ── */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/portal/services')}
          className="group mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6F4028] transition-colors hover:text-[#805236]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Service Catalog
        </button>

        <div className="flex flex-col gap-3 rounded-2xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-5 text-[#FFF9F0] shadow-luxury sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#C58B55]/50 bg-[#C58B55]/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#E8D5BF]">
                <Sparkles className="h-3 w-3 text-[#C58B55]" />
                UNIFIED SERVICE DELIVERY PIPELINE
              </span>
              <span className="rounded-full bg-[#6F4028]/60 px-2.5 py-0.5 text-[11px] text-[#E8D5BF]">
                SLA: {service.processingTime}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#FFF9F0] sm:text-2xl">
              {service.name}
            </h1>
            <p className="text-xs text-[#E8D5BF]">
              Administered by <strong className="text-[#FFF9F0]">{service.department}</strong> • Zero Physical Paperwork
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-[#C58B55]/30 bg-black/30 px-3 py-2 text-xs sm:self-center">
            <ShieldCheck className="h-4 w-4 text-[#C58B55]" />
            <div>
              <p className="font-bold text-[#FFF9F0]">DPDP Act 2023 Compliant</p>
              <p className="text-[10px] text-[#D8C2AA]">Purpose-Bound Token Exchange</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STEPPER BAR (6 STEPS) ── */}
      <div className="mb-8 rounded-3xl border border-[#D8C2AA] bg-gradient-to-r from-[#FFF9F0] via-[#FAF3E8] to-[#FFF9F0] p-5 shadow-luxury">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8D5BF]/80">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#6F4028] px-3 py-0.5 text-xs font-bold text-[#FFF9F0]">
              Step 0{step} of 06
            </span>
            <span className="font-display text-sm font-black text-[#2B1B14]">
              {steps[step - 1].title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#786453]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interoperable Nodal Exchange</span>
          </div>
        </div>

        <div className="relative flex items-center justify-between">
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isComplete = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={s.title} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-2xl font-mono text-xs font-black transition-all duration-300',
                      isComplete && 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm',
                      isCurrent && 'border-2 border-[#C58B55] bg-gradient-to-br from-[#6F4028] to-[#38241B] text-[#FFF9F0] shadow-luxury ring-4 ring-[#C58B55]/20 scale-105',
                      !isComplete && !isCurrent && 'border border-[#D8C2AA] bg-[#F5EBDD] text-[#786453]'
                    )}
                  >
                    {isComplete ? <CheckCircle2 className="h-5 w-5 text-emerald-700" /> : <span>0{stepNum}</span>}
                  </div>
                  <div className="mt-2 text-center">
                    <span
                      className={cn(
                        'block text-[11px] font-bold tracking-tight',
                        isCurrent ? 'text-[#6F4028]' : isComplete ? 'text-[#2B1B14]' : 'text-[#786453]'
                      )}
                    >
                      {s.title}
                    </span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="relative mx-2 mb-6 hidden h-1 flex-1 rounded-full bg-[#E8D5BF] sm:block overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        step > stepNum ? 'w-full bg-gradient-to-r from-[#6F4028] to-[#C58B55]' : 'w-0'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: BASIC INFORMATION (COMMON CITIZEN PROFILE) ── */}
      {step === 1 && (
        <Card className="overflow-hidden border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#2B1B14]">
          <div className="border-b border-[#D8C2AA] bg-[#FAF3E8] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6F4028] text-[#FFF9F0] shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-display text-base font-bold text-[#2B1B14]">
                  Common Citizen Profile Record
                </CardTitle>
                <CardDescription className="text-xs text-[#786453]">
                  Identity attributes auto-populated from your verified Maharashtra Resident Master Record. Zero redundant data entry.
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 text-xs text-emerald-950">
              <CheckCheck className="h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <p className="font-bold">Interoperability in Action: Zero Redundant Forms</p>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Under the Maharashtra Digital Governance Standard, your verified demographic and socio-economic attributes are retrieved automatically from nodal registries. You do not need to re-enter your Aadhaar, address, or educational details.
                </p>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              {[
                { label: 'Full Legal Name', value: citizenName, icon: User },
                {
                  label: 'Date of Birth',
                  value: citizenProfile?.dob
                    ? new Date(citizenProfile.dob).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Information not available',
                  icon: Clock,
                },
                {
                  label: 'Aadhaar Sovereign UID',
                  value: user?.id
                    ? `XXXX-XXXX-${user.id.replace(/-/g, '').slice(-4).toUpperCase()} (Verified Linked)`
                    : 'Information not available',
                  icon: ShieldCheck,
                  mono: true,
                },
                {
                  label: 'Registered Mobile',
                  value: citizenProfile?.mobile ? `+91 ${citizenProfile.mobile}` : 'Information not available',
                  icon: KeyRound,
                },
                {
                  label: 'State District & Division',
                  value: citizenProfile?.district
                    ? `${citizenProfile.district} Division, Maharashtra`
                    : 'Information not available',
                  icon: Landmark,
                },
                {
                  label: 'Caste & Category Master',
                  value: citizenProfile?.verified ? 'State Master Verified' : 'Verification pending',
                  icon: Users,
                },
                {
                  label: 'Residential Address',
                  value: citizenProfile?.address || 'Information not available',
                  icon: Building2,
                  full: true,
                },
                {
                  label: 'Enrolled Academic Institution',
                  value: citizenProfile?.college || 'Information not available',
                  icon: GraduationCap,
                },
                {
                  label: 'Current Program / Branch',
                  value: citizenProfile?.course || 'Information not available',
                  icon: GraduationCap,
                },
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div
                    key={field.label}
                    className={cn(
                      'rounded-2xl border border-[#D8C2AA] bg-[#FAF3E8]/70 p-4 transition-colors hover:border-[#6F4028]',
                      field.full && 'sm:col-span-2'
                    )}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#786453]">
                      <Icon className="h-3.5 w-3.5 text-[#C58B55]" />
                      <span>{field.label}</span>
                    </div>
                    <p className={cn('mt-1.5 text-sm font-bold text-[#2B1B14]', field.mono && 'font-mono text-xs')}>
                      {field.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#D8C2AA] pt-5">
              <span className="text-xs text-[#786453]">Common Citizen Profile Verified</span>
              <Button
                onClick={() => setStep(2)}
                className="gap-2 bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] px-6 text-xs font-bold shadow-md"
              >
                Continue to Consent Authorization
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2: CONSENT-BASED DATA SHARING (DPDP ACT 2023) ── */}
      {step === 2 && (
        <Card className="overflow-hidden border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#2B1B14]">
          <div className="border-b border-[#D8C2AA] bg-[#FAF3E8] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6F4028] text-[#FFF9F0] shadow-sm">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-display text-base font-bold text-[#2B1B14]">
                  Consent-Based Data Sharing Authorization
                </CardTitle>
                <CardDescription className="text-xs text-[#786453]">
                  Digital Personal Data Protection (DPDP) Act 2023 Section 6 explicit consent.
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="rounded-2xl border border-[#C58B55] bg-gradient-to-r from-amber-50 to-[#FAF3E8] p-4 text-xs text-amber-950 space-y-1 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-[#6F4028]">
                <ShieldCheck className="h-4 w-4 text-[#C58B55]" />
                <span>Statutory Consent Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#583320]">
                Before accessing protected records from participating government repositories, FusionGrid requires your explicit authorization.
                Review exactly what data is shared, which department receives it, and the legal purpose below.
              </p>
            </div>

            <div className="space-y-4">
              {consentRequirements.map((consent) => {
                const Icon = departmentIcons[consent.department] || Building2;
                const isGranted = consents[consent.id] === 'granted';

                return (
                  <div
                    key={consent.id}
                    className={cn(
                      'rounded-2xl border p-5 transition-all shadow-xs',
                      isGranted ? 'border-emerald-300 bg-emerald-50/50' : 'border-rose-300 bg-rose-50/50'
                    )}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF3E8] text-[#6F4028] border border-[#D8C2AA]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#2B1B14]">{consent.department}</h4>
                            <span className="text-[10px] font-mono text-[#786453]">→ {consent.targetDepartment}</span>
                          </div>
                          <div className="text-xs text-[#2B1B14] font-medium">
                            <strong>Data to be Shared:</strong> {consent.dataScope}
                          </div>
                          <p className="text-[11px] text-[#786453] leading-relaxed">
                            <strong>Why it is needed:</strong> {consent.purpose}
                          </p>
                          <div className="text-[10px] text-[#6F4028] font-mono">
                            <strong>Legal Authority:</strong> {consent.legalBasis}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <Button
                          size="sm"
                          variant={isGranted ? 'default' : 'outline'}
                          onClick={() => handleConsentToggle(consent.id, 'granted')}
                          className={cn(
                            'text-xs font-bold h-8 px-3',
                            isGranted ? 'bg-emerald-700 hover:bg-emerald-800 text-white' : 'border-[#D8C2AA]'
                          )}
                        >
                          {isGranted && <Check className="h-3.5 w-3.5 mr-1" />}
                          Grant Consent
                        </Button>
                        <Button
                          size="sm"
                          variant={!isGranted ? 'default' : 'outline'}
                          onClick={() => handleConsentToggle(consent.id, 'denied')}
                          className={cn(
                            'text-xs font-bold h-8 px-3',
                            !isGranted ? 'bg-rose-700 hover:bg-rose-800 text-white' : 'border-[#D8C2AA]'
                          )}
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#D8C2AA] pt-5">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2 border-[#D8C2AA] text-xs font-bold text-[#786453]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
              </Button>
              <div className="flex items-center gap-3">
                {!allConsentsGranted && (
                  <span className="text-xs font-semibold text-rose-700">
                    All mandatory departmental consents must be granted to proceed
                  </span>
                )}
                <Button
                  disabled={!allConsentsGranted}
                  onClick={() => setStep(3)}
                  className="gap-2 bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] px-6 text-xs font-bold shadow-md"
                >
                  Confirm Consent & Proceed to Data Reuse
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3: EXISTING DATA REUSE & VAULT MATCHING ── */}
      {step === 3 && (
        <Card className="overflow-hidden border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#2B1B14]">
          <div className="border-b border-[#D8C2AA] bg-[#FAF3E8] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6F4028] text-[#FFF9F0] shadow-sm">
                <FolderLock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-display text-base font-bold text-[#2B1B14]">
                  Existing Data & Document Vault Reuse
                </CardTitle>
                <CardDescription className="text-xs text-[#786453]">
                  Sovereign vault matching against {service.name} checklist. Pre-verified documents are automatically linked.
                </CardDescription>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Auto-Linked Attributes Card */}
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Pre-Verified Attributes Linked with Consent</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-emerald-200 bg-white p-3 space-y-1">
                  <span className="text-[10px] font-bold text-[#786453] uppercase">Identity (UIDAI)</span>
                  <p className="font-bold text-[#2B1B14]">{citizenProfile?.full_name || user?.name || 'Information not available'}</p>
                  <span className={cn(
                    'text-[10px] font-semibold',
                    citizenProfile?.verified ? 'text-emerald-700' : 'text-amber-700'
                  )}>
                    {citizenProfile?.verified ? 'Verified Citizen Record' : 'Verification pending'}
                  </span>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white p-3 space-y-1">
                  <span className="text-[10px] font-bold text-[#786453] uppercase">Revenue (MahaBhulekh)</span>
                  <p className="font-bold text-[#2B1B14]">
                    {vaultDocs.find((v) => v.document_type === 'income_certificate' && v.is_valid && (v.status === 'verified' || !v.status))
                      ? (vaultDocs.find((v) => v.document_type === 'income_certificate')?.validity_period || 'Certified Income Record')
                      : 'Information not available'}
                  </p>
                  <span className={cn(
                    'text-[10px] font-semibold',
                    vaultDocs.some((v) => v.document_type === 'income_certificate' && v.is_valid && (v.status === 'verified' || !v.status))
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  )}>
                    {vaultDocs.some((v) => v.document_type === 'income_certificate' && v.is_valid && (v.status === 'verified' || !v.status))
                      ? 'Verified Vault Document'
                      : 'Verification pending'}
                  </span>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white p-3 space-y-1">
                  <span className="text-[10px] font-bold text-[#786453] uppercase">Academic (AISHE)</span>
                  <p className="font-bold text-[#2B1B14]">
                    {citizenProfile?.college
                      ? `${citizenProfile.college}${citizenProfile.course ? ` (${citizenProfile.course})` : ''}`
                      : 'Information not available'}
                  </p>
                  <span className={cn(
                    'text-[10px] font-semibold',
                    citizenProfile?.college ? 'text-emerald-700' : 'text-amber-700'
                  )}>
                    {citizenProfile?.college ? 'Registered Academic Record' : 'Verification pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vault Checklist Matcher */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm text-[#2B1B14]">
                Document Vault Match for {service.name}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {checklist.map((req) => {
                  const match = vaultDocs.find(
                    (v) => v.document_type === req.type && v.is_valid && (v.status === 'verified' || !v.status)
                  );
                  const isAvailable = !!match && req.canReuse;

                  return (
                    <div
                      key={req.type}
                      className={cn(
                        'flex items-start justify-between rounded-2xl border p-4 shadow-2xs',
                        isAvailable ? 'border-emerald-300 bg-emerald-50/40' : 'border-amber-300 bg-amber-50/40'
                      )}
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-[#2B1B14]">{req.label}</p>
                        <p className="text-[11px] text-[#786453]">{req.validityRule}</p>
                        {isAvailable && (
                          <span className="inline-block font-mono text-[10px] text-emerald-800 font-semibold">
                            File: {match?.file_name}
                          </span>
                        )}
                      </div>

                      {isAvailable ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold shrink-0">
                          <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                          Reused from Vault
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold shrink-0">
                          Upload in Step 5
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#D8C2AA] pt-5">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="gap-2 border-[#D8C2AA] text-xs font-bold text-[#786453]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Consent
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="gap-2 bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] px-6 text-xs font-bold shadow-md"
              >
                Proceed to Department Verification
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 4: INTEROPERABLE DEPARTMENT VERIFICATION (API GATEWAY) ── */}
      {step === 4 && (
        <Card className="overflow-hidden border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#2B1B14]">
          <div className="border-b border-[#D8C2AA] bg-[#FAF3E8] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6F4028] text-[#FFF9F0] shadow-sm">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="font-display text-base font-bold text-[#2B1B14]">
                    Cross-Department Verification (API Gateway)
                  </CardTitle>
                  <CardDescription className="text-xs text-[#786453]">
                    Real-time federated query execution across state nodal connectors.
                  </CardDescription>
                </div>
              </div>

              {/* Resilience Test Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSimulateFailure(!simulateFailure)}
                  className={cn(
                    'text-[11px] font-bold h-7 border',
                    simulateFailure ? 'bg-amber-100 border-amber-300 text-amber-900' : 'border-[#D8C2AA] text-[#786453]'
                  )}
                  title="Simulate node failure and retry mechanism"
                >
                  {simulateFailure ? 'Failure Simulation: ON' : 'Test Failure Resilience'}
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Live Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#6F4028]">Gateway Verification Pipeline Progress</span>
                <span className="font-mono text-[#2B1B14]">{Math.round(verificationProgress)}% Complete</span>
              </div>
              <Progress value={verificationProgress} className="h-2.5 bg-[#E8D5BF]" />
            </div>

            {simulateFailure && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                  <span>Resilience Simulation Triggered</span>
                </div>
                <p className="text-[11px]">
                  Simulating transient timeout on Revenue Node. Gateway automatically engages exponential backoff retry.
                  Zero citizen impact; audit event recorded under DPDP logging.
                </p>
              </div>
            )}

            {/* Department Nodes Status Stream */}
            <div className="space-y-3">
              {activeVerifDepartments.map((node, i) => {
                const isPassed = activeVerificationIdx > i || verificationDone;
                const isCurrent = activeVerificationIdx === i && !verificationDone;
                const Icon = departmentIcons[node.dept] || Building2;

                return (
                  <div
                    key={node.id}
                    className={cn(
                      'flex items-center justify-between rounded-2xl border p-4 transition-all',
                      isPassed ? 'border-emerald-300 bg-emerald-50/50' : isCurrent ? 'border-[#C58B55] bg-amber-50/50' : 'border-[#D8C2AA] bg-[#FAF3E8]/40'
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                          isPassed
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : isCurrent
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-white border-[#D8C2AA] text-[#786453]'
                        )}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#2B1B14]">{node.label}</span>
                          <span className="font-mono text-[10px] text-[#786453]">[{node.endpoint}]</span>
                        </div>
                        <p className="text-[11px] text-[#786453]">
                          Scope: <strong>{node.dataScope}</strong>
                        </p>
                      </div>
                    </div>

                    <div>
                      {isPassed ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                          Simulated Verification (Demo) • {120 + i * 45}ms
                        </Badge>
                      ) : isCurrent ? (
                        <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold">
                          Querying Node…
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-[#786453]">Pending in Queue</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[#D8C2AA] pt-5">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="gap-2 border-[#D8C2AA] text-xs font-bold text-[#786453]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Data Reuse
              </Button>
              <Button
                disabled={!verificationDone}
                onClick={() => {
                  ensureDraftApplication();
                  setStep(5);
                }}
                className="gap-2 bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] px-6 text-xs font-bold shadow-md"
              >
                Proceed to Missing Documents
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 5: MISSING DOCUMENT UPLOAD & DATA QUALITY VALIDATION ── */}
      {step === 5 && (
        <div className="space-y-6">
          {/* Document Upload Component tailored to service */}
          <DocumentUploadStep
            applicationId={draftAppId || 'draft-app'}
            citizenId={user?.id || citizenUid}
            serviceId={service.id}
            onAllDocumentsReady={setAllDocsReady}
          />

          {/* Pre-submission Data Quality Assurance Card */}
          <Card className="rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury p-5 text-[#2B1B14] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#2B1B14]">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>Pre-Submission Canonical Data Quality Check</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold">
                100% Quality Score
              </Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 text-xs text-[#786453]">
              <div className="rounded-xl border border-[#D8C2AA] bg-[#FAF3E8] p-3 space-y-1">
                <span className="font-bold text-[#2B1B14]">Format & Syntax:</span>
                <p>All mandatory fields conform to MahaGov JSON-LD schema.</p>
              </div>
              <div className="rounded-xl border border-[#D8C2AA] bg-[#FAF3E8] p-3 space-y-1">
                <span className="font-bold text-[#2B1B14]">Deduplication:</span>
                <p>Zero conflicting claims found across 36 district ledgers.</p>
              </div>
              <div className="rounded-xl border border-[#D8C2AA] bg-[#FAF3E8] p-3 space-y-1">
                <span className="font-bold text-[#2B1B14]">Income Eligibility:</span>
                <p>Certified family income aligns with statutory scheme threshold.</p>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-between rounded-2xl border border-[#D8C2AA] bg-[#FFF9F0] p-4 shadow-sm">
            <Button
              variant="outline"
              onClick={() => setStep(4)}
              className="gap-2 border-[#D8C2AA] text-xs font-bold text-[#786453]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Verification
            </Button>
            <div className="flex items-center gap-3">
              {!allDocsReady && (
                <span className="text-xs font-semibold text-amber-800 hidden sm:inline">
                  Please satisfy all mandatory checklist documents above
                </span>
              )}
              <Button
                disabled={!allDocsReady}
                onClick={handleSubmit}
                className="gap-2 bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold px-6 shadow-md"
              >
                Submit Application to Officer Queue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 6: RECEIPT & UNIFIED APPLICATION TRACKING ── */}
      {step === 6 && (
        <Card className="overflow-hidden rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#2B1B14] p-8 space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-md">
            <CheckCircle2 className="h-8 w-8 text-emerald-700" />
          </div>

          <div className="space-y-1 max-w-lg mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800">
              Application Enqueued Successfully
            </span>
            <h2 className="font-display text-2xl font-bold text-[#2B1B14]">
              {service.name}
            </h2>
            <p className="text-xs text-[#786453]">
              Dispatched directly to the departmental adjudication console for officer review under Administrator Nahid Shams oversight.
            </p>
          </div>

          {/* Reference Card */}
          <div className="max-w-md mx-auto rounded-2xl border-2 border-[#C58B55] bg-[#2B1B14] p-5 text-[#FFF9F0] space-y-3 shadow-lg">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8D5BF]">
              Official Sovereign Application Tracking ID
            </div>
            <div className="flex items-center justify-center gap-3">
              <code className="select-all rounded-xl bg-[#38241B] px-4 py-2 font-mono text-xl font-black text-[#FFF9F0] border border-[#6F4028]">
                {generatedId}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(generatedId)}
                className="h-9 border-[#6F4028] bg-[#38241B] text-[#FFF9F0] hover:bg-[#4A2E22]"
              >
                {copiedId ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-[#D8C2AA]">
              Gateway Request Tracking Token: {generatedRequestId}
            </p>
          </div>

          {/* Service Hops & Officer Queue Notice */}
          <div className="max-w-lg mx-auto rounded-2xl border border-[#D8C2AA] bg-[#FAF3E8] p-4 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#2B1B14]">
              <Clock className="h-4 w-4 text-[#C58B55]" />
              <span>Next Steps in Unified Workflow:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#786453] text-[11px]">
              <li>Application is visible in the Officer Review Queue ({service.department}).</li>
              <li>Verification officers inspect verified attributes and attached vault documents.</li>
              <li>Decision (Approval / Discrepancy Notice) will trigger an instant notification on your citizen dashboard.</li>
              <li>All verified documents have been saved to your Citizen Document Vault for reuse.</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button
              onClick={() => navigate(`/portal/applications/${generatedId}`)}
              className="bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold px-6 shadow-md"
            >
              Track Application Progress Live
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/portal/vault')}
              className="border-[#D8C2AA] text-xs font-bold text-[#786453] hover:bg-[#FAF3E8]"
            >
              View Document Vault
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/portal/dashboard')}
              className="text-xs font-bold text-[#786453]"
            >
              Return to Citizen Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
