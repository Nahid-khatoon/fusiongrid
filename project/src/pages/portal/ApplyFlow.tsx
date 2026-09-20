import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Lock, ShieldCheck, Clock,
  User, FileText, KeyRound, Database, Building2, GraduationCap,
  Landmark, HeartPulse, Users, Loader2, XCircle, AlertCircle,
  Eye, EyeOff, Sparkles, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/context/AppContext';
import { services, verificationSteps } from '@/data/mockData';
import type { Application, ConsentRecord, TimelineStep, DataAccessRecord } from '@/types';
import { cn } from '@/lib/utils';
import { DocumentUploadStep } from '@/components/shared/DocumentUploadStep';
import { supabase } from '@/lib/supabase';

interface ApplyFlowProps {
  serviceId: string;
  navigate: (to: string) => void;
}

const consentTemplates: ConsentRecord[] = [
  {
    id: 'ct-revenue',
    department: 'Revenue Department',
    dataScope: 'Income Information',
    purpose: 'Scholarship income verification',
    requestedAt: new Date().toISOString(),
    status: 'granted',
  },
  {
    id: 'ct-education',
    department: 'Education Department',
    dataScope: 'Enrollment Information',
    purpose: 'Scholarship enrollment verification',
    requestedAt: new Date().toISOString(),
    status: 'granted',
  },
  {
    id: 'ct-identity',
    department: 'Identity Service',
    dataScope: 'Identity Verification',
    purpose: 'Application identity verification',
    requestedAt: new Date().toISOString(),
    status: 'granted',
  },
];

const departmentIcons: Record<string, typeof Landmark> = {
  'Revenue Department': Landmark,
  'Education Department': GraduationCap,
  'Identity Service': ShieldCheck,
};

export function ApplyFlow({ serviceId, navigate }: ApplyFlowProps) {
  const { addApplication, addNotification, addAuditEvent, emitEvent, grantConsent, simulateRevenueFailure, apiFailures, citizenProfile, user } = useApp();
  const citizenName = citizenProfile?.full_name || user?.name || 'Citizen';
  const service = services.find((s) => s.id === serviceId);
  const [step, setStep] = useState(1);
  const [consents, setConsents] = useState<Record<string, 'granted' | 'denied' | undefined>>({});
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [activeVerification, setActiveVerification] = useState(-1);
  const [verificationDone, setVerificationDone] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [generatedRequestId, setGeneratedRequestId] = useState('');
  const [showFailureBanner, setShowFailureBanner] = useState(false);
  const [allDocsReady, setAllDocsReady] = useState(false);
  const [draftAppId, setDraftAppId] = useState('');

  // Step 1: Basic info is pre-filled, just show it
  // Step 2: Documents (upload / reuse from vault)
  // Step 3: Consent
  // Step 4: Verification
  // Step 5: Success

  const allConsentsGranted = consentTemplates.every((c) => consents[c.id] === 'granted');

  const handleConsent = (id: string, decision: 'granted' | 'denied') => {
    setConsents((prev) => ({ ...prev, [id]: decision }));
  };

  // Create a draft application record when entering the Documents step so uploaded docs have a parent
  const ensureDraftApplication = useCallback(async () => {
    if (draftAppId) return draftAppId;
    if (!service || !user?.id) return null;
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
    if (error || !data) {
      console.error('Failed to create draft application:', error);
      return null;
    }
    const realId = (data as Record<string, unknown>).id as string;
    setDraftAppId(realId);
    return realId;
  }, [draftAppId, service, user?.id]);

  // Verification animation
  const startVerification = useCallback(() => {
    setStep(4);
    setVerificationProgress(0);
    setActiveVerification(0);
  }, []);

  useEffect(() => {
    if (step !== 4) return;

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex >= verificationSteps.length) {
        clearInterval(stepInterval);
        setVerificationDone(true);
        setVerificationProgress(100);
        // Generate IDs
        const idNum = Math.floor(Math.random() * 90000 + 10000);
        const reqNum = Math.floor(Math.random() * 900000 + 100000);
        const servicePrefix = service?.id === 'maha-scholarship' ? 'MH-SCH-2026'
          : service?.id === 'income-certificate' ? 'MH-INC-2026'
          : service?.id === 'student-education-benefit' ? 'MH-EDU-2026'
          : service?.id === 'health-assistance' ? 'MH-HLT-2026'
          : 'MH-WEL-2026';
        const newId = `${servicePrefix}-${idNum}`;
        const newReqId = `REQ-MH-2026-${reqNum}`;
        setGeneratedId(newId);
        setGeneratedRequestId(newReqId);
        // Emit verification completion events
        emitEvent('IncomeVerified', `Income verification passed for ${service?.name}`, newId, 'Revenue Department API', 'Revenue Department');
        emitEvent('StudentVerified', `Student enrollment verified for ${service?.name}`, newId, 'Education Department API', 'Education Department');
        addAuditEvent({
          id: `ae-${Date.now()}`,
          applicationId: newId,
          action: 'Income Verified',
          actor: 'Revenue Department API',
          actorRole: 'officer',
          detail: `Income verification passed for ${service?.name}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          type: 'verify',
        });
        addAuditEvent({
          id: `ae-${Date.now() + 1}`,
          applicationId: newId,
          action: 'Student Enrollment Verified',
          actor: 'Education Department API',
          actorRole: 'officer',
          detail: `Student enrollment verified for ${service?.name}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          type: 'verify',
        });
        return;
      }
      setActiveVerification(stepIndex);
      setVerificationProgress(((stepIndex + 1) / verificationSteps.length) * 100);
      stepIndex++;
    }, 800);

    return () => clearInterval(stepInterval);
  }, [step, service?.id, addAuditEvent]);

  const handleSubmit = async () => {
    if (!service) return;

    const timeline: TimelineStep[] = [
      { id: 't1', label: 'Application Submitted', status: 'done', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
      { id: 't2', label: 'Identity Verified', status: 'done', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
      { id: 't3', label: 'Income Verified', status: 'done', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
      { id: 't4', label: 'Student Enrollment Verified', status: 'done', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
      { id: 't5', label: 'Department Review', status: 'current', timestamp: 'In progress' },
      { id: 't6', label: 'Approval', status: 'pending' },
      { id: 't7', label: 'Benefit Disbursement', status: 'pending' },
    ];

    const dataAccess: DataAccessRecord[] = [
      { id: 'da1', department: 'Identity Service', data: 'Identity Verification', purpose: 'Application identity verification', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), result: 'Verified' },
      { id: 'da2', department: 'Revenue Department', data: 'Income Information', purpose: 'Scholarship income verification', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), result: 'Income Verified' },
      { id: 'da3', department: 'Education Department', data: 'Enrollment Information', purpose: 'Scholarship enrollment verification', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }), result: 'Student Verified' },
    ];

    const grantedConsents: ConsentRecord[] = consentTemplates
      .filter((c) => consents[c.id] === 'granted')
      .map((c) => ({ ...c, applicationId: generatedId }));

    const application: Application = {
      id: generatedId,
      serviceId: service.id,
      serviceName: service.name,
      status: 'under_verification',
      progress: 65,
      submittedAt: new Date().toISOString(),
      requestId: generatedRequestId,
      consents: grantedConsents,
      timeline,
      dataAccess,
      departments: ['Identity Service', 'Revenue Department', 'Education Department', 'Data Quality Engine', 'Scholarship Workflow'],
      workflowStages: [
        { id: 'ws1', label: 'Application Created', department: 'FusionGrid Portal', status: 'done', duration: '1 min', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
        { id: 'ws2', label: 'Identity Verification', department: 'Identity Service', status: 'done', duration: '1 min', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
        { id: 'ws3', label: 'Income Verification', department: 'Revenue Department', status: 'done', duration: '1 min', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
        { id: 'ws4', label: 'Education Verification', department: 'Education Department', status: 'done', duration: '1 min', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
        { id: 'ws5', label: 'Data Quality Check', department: 'Data Quality Engine', status: 'done', duration: '1 min', timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) },
        { id: 'ws6', label: 'Officer Review', department: 'Social Welfare Department', status: 'current', duration: 'In progress', timestamp: 'In progress' },
        { id: 'ws7', label: 'Approval', department: 'Social Welfare Department', status: 'pending', duration: '—' },
        { id: 'ws8', label: 'Benefit Disbursement', department: 'Treasury Department', status: 'pending', duration: '—' },
      ],
    };

    const realAppId = await addApplication(application);

    // Re-link draft application documents to the final application UUID,
    // then remove the temporary draft so it does not appear as a separate
    // application in the citizen/officer queues.
    if (draftAppId && realAppId && draftAppId !== realAppId) {
      const { error: relinkError } = await supabase
        .from('application_documents')
        .update({ application_id: realAppId })
        .eq('application_id', draftAppId);

      if (relinkError) {
        console.error('Failed to relink draft documents:', relinkError);
      } else {
        const { error: deleteDraftError } = await supabase
          .from('applications')
          .delete()
          .eq('id', draftAppId)
          .eq('citizen_id', user?.id ?? '');

        if (deleteDraftError) {
          console.error('Failed to remove submitted draft application:', deleteDraftError);
        } else {
          setDraftAppId('');
        }
      }
    }

    addNotification({
      id: `n-${Date.now()}`,
      title: 'Application submitted successfully',
      message: `Your ${service.name} application (${generatedId}) has been submitted and is now under verification. Request ID: ${generatedRequestId}`,
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
      detail: `${service.name} application submitted via FusionGrid portal`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      type: 'submit',
    });

    // Emit ApplicationSubmitted event and grant consents through the event system
    emitEvent('ApplicationSubmitted', `${service.name} application submitted`, generatedId, citizenName);
    consentTemplates
      .filter((c) => consents[c.id] === 'granted')
      .forEach((c) => {
        grantConsent(c.department, c.dataScope, c.purpose, generatedId);
      });

    setStep(5);
  };

  if (!service) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Service not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/portal/services')}>
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  const steps = ['Basic Information', 'Documents', 'Consent', 'Verification', 'Confirmation'];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <button onClick={() => navigate('/portal/services')} className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </button>
        <h1 className="font-display text-2xl font-bold tracking-tight">{service.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{service.department}</p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isComplete = step > stepNum;
            const isCurrent = step === stepNum;
            return (
              <div key={s} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                      isComplete && 'border-success bg-success text-success-foreground',
                      isCurrent && 'border-primary bg-primary text-primary-foreground shadow-md',
                      !isComplete && !isCurrent && 'border-muted bg-background text-muted-foreground'
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{stepNum}</span>
                    )}
                  </div>
                  <span className={cn(
                    'hidden text-xs font-medium sm:block',
                    (isComplete || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn(
                    'mx-2 h-0.5 flex-1 rounded-full transition-all',
                    step > stepNum ? 'bg-success' : 'bg-muted'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card className="border-border/60 animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your profile data has been pre-filled automatically</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Full Name', value: citizenName, icon: User },
                { label: 'Date of Birth', value: citizenProfile?.dob ? new Date(citizenProfile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—', icon: Clock },
                { label: 'Citizen ID', value: user?.id ? `${user.id.slice(0, 8)}…` : '—', icon: FileText, mono: true },
                { label: 'Mobile Number', value: citizenProfile?.mobile ? `+91 ${citizenProfile.mobile}` : '—', icon: KeyRound },
                { label: 'Address', value: citizenProfile?.address || '—', icon: Building2, full: true },
                { label: 'College', value: citizenProfile?.college || '—', icon: GraduationCap },
                { label: 'Course', value: citizenProfile?.course || '—', icon: GraduationCap },
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className={cn('rounded-lg border bg-muted/30 p-3', field.full && 'sm:col-span-2')}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
                    </div>
                    <p className={cn('mt-1.5 text-sm font-medium', field.mono && 'font-mono')}>{field.value}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Data pre-filled from your verified profile — no re-entry required.
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => { ensureDraftApplication(); setStep(2); }} className="gap-2">
                Continue to Documents
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Documents */}
      {step === 2 && (
        <div className="animate-fade-in-up">
          {user?.id && draftAppId && (
            <DocumentUploadStep
              applicationId={draftAppId}
              citizenId={user.id}
              onAllDocumentsReady={setAllDocsReady}
            />
          )}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              disabled={!allDocsReady}
              onClick={() => setStep(3)}
              className="gap-2"
            >
              Continue to Consent
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          {!allDocsReady && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              All required documents must be uploaded or reused before proceeding.
            </div>
          )}
        </div>
      )}

      {/* Step 3: Consent */}
      {step === 3 && (
        <div className="animate-fade-in-up">
          <div className="mb-4">
            <h2 className="font-display text-lg font-semibold">Consent for Data Sharing</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review each department's data request. Grant consent to proceed with verification.
              All consents are purpose-bound and revocable.
            </p>
          </div>

          <div className="space-y-4">
            {consentTemplates.map((consent, i) => {
              const Icon = departmentIcons[consent.department] ?? ShieldCheck;
              const decision = consents[consent.id];
              return (
                <Card
                  key={consent.id}
                  className={cn(
                    'border-border/60 transition-all animate-fade-in-up',
                    decision === 'granted' && 'border-accent/30',
                    decision === 'denied' && 'border-destructive/30'
                  )}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold">{consent.department}</h3>
                          <p className="mt-0.5 text-sm text-muted-foreground">{consent.dataScope} → {consent.purpose}</p>
                        </div>
                      </div>
                      {decision && (
                        <Badge variant="outline" className={cn(
                          decision === 'granted' ? 'border-accent/30 bg-accent/10 text-accent' : 'border-destructive/30 bg-destructive/10 text-destructive'
                        )}>
                          {decision === 'granted' ? 'Allowed' : 'Denied'}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 rounded-lg border bg-muted/30 p-3 text-xs sm:grid-cols-2">
                      <div>
                        <span className="text-muted-foreground">Requested Data: </span>
                        <span className="font-medium">{consent.dataScope}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Purpose: </span>
                        <span className="font-medium">{consent.purpose}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requesting Dept: </span>
                        <span className="font-medium">{consent.department}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Timestamp: </span>
                        <span className="font-mono">{new Date(consent.requestedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant={decision === 'granted' ? 'default' : 'outline'}
                        className={cn('gap-1.5', decision === 'granted' && 'bg-accent hover:bg-accent/90')}
                        onClick={() => handleConsent(consent.id, 'granted')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Allow
                      </Button>
                      <Button
                        size="sm"
                        variant={decision === 'denied' ? 'destructive' : 'outline'}
                        className="gap-1.5"
                        onClick={() => handleConsent(consent.id, 'denied')}
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!allConsentsGranted && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              All consents must be granted to proceed with verification.
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              disabled={!allConsentsGranted}
              onClick={startVerification}
              className="gap-2"
            >
              Start Verification
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Verification */}
      {step === 4 && (
        <Card className="border-border/60 animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Interoperability Verification</CardTitle>
                <CardDescription>
                  FusionGrid is verifying your data across departments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* FusionGrid hub */}
            <div className="mb-6 flex flex-col items-center">
              <div className="flex h-16 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                <div className="text-center">
                  <Database className="mx-auto h-6 w-6" />
                  <span className="mt-0.5 block text-xs font-bold">FusionGrid</span>
                </div>
              </div>
            </div>

            {/* Verification steps */}
            <div className="space-y-3">
              {verificationSteps.map((vs, i) => {
                const isDone = verificationDone || i < activeVerification;
                const isActive = i === activeVerification && !verificationDone;
                const isPending = i > activeVerification && !verificationDone;
                return (
                  <div
                    key={vs.id}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border p-4 transition-all',
                      isDone && 'border-accent/30 bg-accent/5',
                      isActive && 'border-primary/30 bg-primary/5',
                      isPending && 'border-border bg-card'
                    )}
                  >
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all',
                      isDone && 'bg-success text-success-foreground animate-check-pop',
                      isActive && 'bg-primary text-primary-foreground',
                      isPending && 'bg-muted text-muted-foreground'
                    )}>
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isActive ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{vs.label}</span>
                        {isDone && (
                          <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                            {vs.detail}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isDone ? vs.detail : isActive ? 'Verifying...' : 'Pending'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] text-muted-foreground">{vs.apiName}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Verification Progress</span>
                <span className="font-semibold">{Math.round(verificationProgress)}%</span>
              </div>
              <Progress value={verificationProgress} className="h-2" />
            </div>

            {/* API Failure Simulation Panel */}
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-800">Reliability Simulation</p>
                  <p className="text-xs text-muted-foreground">Test how FusionGrid handles a Revenue API failure without losing your application.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-400 text-amber-700 hover:bg-amber-100"
                  disabled={apiFailures.some((f) => f.department === 'Revenue Department' && f.isDown)}
                  onClick={() => {
                    simulateRevenueFailure();
                    setShowFailureBanner(true);
                  }}
                >
                  <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                  Simulate Revenue API Down
                </Button>
              </div>

              {showFailureBanner && apiFailures.some((f) => f.department === 'Revenue Department') && (
                <div className="mt-3 space-y-2">
                  {apiFailures.filter((f) => f.department === 'Revenue Department').map((failure) => (
                    <div key={failure.department} className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full',
                          failure.retryState === 'recovered' ? 'bg-emerald-100' : 'bg-red-100'
                        )}>
                          {failure.retryState === 'recovered' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-red-900">{failure.message}</span>
                      </div>
                      <div className="mt-2 flex items-start gap-2 rounded-md bg-blue-50 px-3 py-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                        <p className="text-sm font-medium text-blue-800">{failure.citizenMessage}</p>
                      </div>
                      {failure.history.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {failure.history.map((h, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">{h.timestamp}</span>
                              <ArrowRight className="h-3 w-3" />
                              <span className="font-medium">{h.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFailureBanner(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>

            {verificationDone && (
              <div className="mt-6 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-semibold text-accent">All verifications passed</p>
                    <p className="text-xs text-accent/80">Request ID: {generatedRequestId}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSubmit} className="gap-2">
                    Submit Application
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <Card className="border-accent/20 animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success animate-check-pop">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-bold">Application Submitted Successfully</h2>
            <p className="mt-2 text-muted-foreground">
              Your {service.name} application has been submitted and is now under department review.
            </p>

            <div className="mx-auto mt-6 max-w-md space-y-3 rounded-lg border bg-muted/30 p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Application ID</span>
                <span className="font-mono text-sm font-bold">{generatedId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Request ID</span>
                <span className="font-mono text-sm font-bold">{generatedRequestId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">Under Verification</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <span className="text-sm font-medium">{new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => navigate(`/portal/applications/${generatedId}`)} className="gap-2">
                Track Application
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/portal/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
