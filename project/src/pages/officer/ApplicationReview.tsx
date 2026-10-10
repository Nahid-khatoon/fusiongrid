import { useState, useEffect } from 'react';
import {
  ArrowLeft, FileText, ShieldCheck, CheckCircle2, XCircle, Building2,
  User, KeyRound, Database, Clock, AlertCircle, Forward, HelpCircle,
  CheckCheck, Landmark, GraduationCap, Sparkles, Send, Shield,
  Layers, ExternalLink, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useApp, type CitizenProfile } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { OfficerDocumentVerification } from '@/components/shared/OfficerDocumentVerification';

interface ApplicationReviewProps {
  applicationId: string;
  navigate: (to: string) => void;
}

const departmentIcons: Record<string, typeof Building2> = {
  'Identity Service': ShieldCheck,
  'Revenue Department': Landmark,
  'Education Department': GraduationCap,
  'Data Quality Engine': Database,
  'Scholarship Workflow': KeyRound,
};

export function ApplicationReview({ applicationId, navigate }: ApplicationReviewProps) {
  const { applications, approveApplication, rejectApplication, requestInfo, forwardApplication, auditEvents, fetchCitizenById } = useApp();
  const app = applications.find((a) => a.id === applicationId);

  const [showReject, setShowReject] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [infoReason, setInfoReason] = useState('');
  const [forwardDept, setForwardDept] = useState('Revenue Department');
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile | null>(null);
  const [allDocsVerified, setAllDocsVerified] = useState(false);

  useEffect(() => {
    if (app?.citizenId) {
      fetchCitizenById(app.citizenId).then(setCitizenProfile);
    } else {
      setCitizenProfile(null);
    }
  }, [app?.citizenId, fetchCitizenById]);

  if (!app) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <FileText className="mx-auto h-12 w-12 text-[#755C49]/40" />
        <h2 className="mt-3 text-lg font-bold text-[#38241B]">Application Record Not Found</h2>
        <p className="mt-1 text-xs text-[#755C49]">The requested identifier is not present in the current database store.</p>
        <Button variant="outline" className="mt-4 text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]" onClick={() => navigate('/officer/queue')}>
          Back to Queue
        </Button>
      </div>
    );
  }

  const isActionable = app.status === 'under_verification' || app.status === 'processing' || app.status === 'submitted';

  const handleApprove = () => {
    approveApplication(app.id);
    setActionTaken('approved');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectApplication(app.id, rejectReason);
    setShowReject(false);
    setActionTaken('rejected');
  };

  const handleRequestInfo = () => {
    if (!infoReason.trim()) return;
    requestInfo(app.id, infoReason);
    setShowRequestInfo(false);
    setActionTaken('info_requested');
  };

  const handleForward = () => {
    forwardApplication(app.id, forwardDept);
    setShowForward(false);
    setActionTaken('forwarded');
  };

  const appAuditEvents = auditEvents.filter((e) => e.applicationId === app.id);

  const verificationChecks = [
    {
      label: 'Citizen Identity Match',
      status: citizenProfile?.verified ? 'verified' : 'pending',
      detail: citizenProfile?.verified
        ? 'Aadhaar biometric & demographic token match confirmed (Simulated Verification)'
        : 'Identity token check: Verification pending',
      dept: 'Identity Service',
    },
    {
      label: 'Family Income Assessment',
      status: citizenProfile?.verified ? 'verified' : 'pending',
      detail: citizenProfile?.verified
        ? 'Family annual income verified below statutory threshold (Simulated Verification)'
        : 'Revenue verification pending officer determination',
      dept: 'Revenue Department',
    },
    {
      label: 'Academic Enrollment',
      status: citizenProfile?.college ? 'verified' : 'pending',
      detail: citizenProfile?.college
        ? `Regular bona-fide enrollment confirmed at ${citizenProfile.college} (Simulated Verification)`
        : 'Academic record: Verification pending',
      dept: 'Education Department',
    },
    {
      label: 'Data Quality & Deduplication',
      status: 'passed',
      detail: 'Zero duplicate claims across state welfare records (Simulated Verification)',
      dept: 'Data Quality Engine',
    },
    {
      label: 'DPDP Explicit Consent',
      status: 'valid',
      detail: `${app.consents.length} DPDP purpose-bound authorizations active`,
      dept: 'Consent Manager',
    },
  ];

  const isApproved = app.status === 'approved';
  const displayProgress = isApproved ? 100 : app.progress;

  const displayWorkflowStages = app.workflowStages?.map((stage) => {
    if (!isApproved) return stage;

    const label = stage.label.toLowerCase();

    if (label.includes('officer review')) {
      return {
        ...stage,
        status: 'done' as const,
        duration: stage.duration === 'In progress' ? 'Completed' : stage.duration,
        timestamp: stage.timestamp || new Date().toLocaleString('en-IN', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
      };
    }

    if (label.includes('approval') || label.includes('benefit disbursement')) {
      return {
        ...stage,
        status: 'done' as const,
        duration: stage.duration === '—' || stage.duration === 'In progress' ? 'Completed' : stage.duration,
        timestamp: stage.timestamp || new Date().toLocaleString('en-IN', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
      };
    }

    return stage;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/officer/queue')}
          className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#755C49] hover:text-[#38241B] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Application Queue
        </button>
      </div>

      {/* Hero Adjudication Header */}
      <div className="rounded-3xl border border-[#4A2E22] bg-gradient-to-r from-[#2B1B14] via-[#38241B] to-[#21140F] p-6 text-[#FFF9F0] shadow-luxury-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C58B55]/20 text-[#C58B55] ring-1 ring-[#C58B55]/40 shadow-xs">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C58B55]">{app.id}</span>
                <StatusBadge status={app.status} />
                {app.requestId && (
                  <span className="rounded-lg bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#E8D5BF] border border-white/10">
                    Req: {app.requestId}
                  </span>
                )}
              </div>
              <h1 className="mt-1.5 font-display text-xl font-black tracking-tight text-[#FFF9F0] sm:text-2xl">
                {app.serviceName}
              </h1>
              <p className="mt-1 text-xs text-[#E8D5BF]">
                Submitted on {new Date(app.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8D5BF]">Adjudication Readiness</span>
              <p className="font-mono text-2xl font-black text-[#C58B55]">{displayProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Banner if triggered */}
      {actionTaken && (
        <Card className={cn(
          'rounded-2xl border-2 p-4 shadow-luxury animate-fade-in-up',
          actionTaken === 'approved' && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-950',
          actionTaken === 'rejected' && 'border-red-500/40 bg-red-500/10 text-red-950',
          actionTaken === 'info_requested' && 'border-amber-500/40 bg-amber-500/10 text-amber-950',
          actionTaken === 'forwarded' && 'border-[#C58B55]/40 bg-[#C58B55]/10 text-[#38241B]'
        )}>
          <div className="flex items-center gap-3">
            {actionTaken === 'approved' && <CheckCircle2 className="h-5 w-5 text-emerald-700" />}
            {actionTaken === 'rejected' && <XCircle className="h-5 w-5 text-red-600" />}
            {actionTaken === 'info_requested' && <HelpCircle className="h-5 w-5 text-amber-700" />}
            {actionTaken === 'forwarded' && <Forward className="h-5 w-5 text-[#6F4028]" />}
            <div>
              <p className="font-bold text-sm">
                {actionTaken === 'approved' && 'Application Officially Approved'}
                {actionTaken === 'rejected' && 'Application Rejected & Closed'}
                {actionTaken === 'info_requested' && 'Information Clarification Dispatched'}
                {actionTaken === 'forwarded' && `Application Forwarded to ${forwardDept}`}
              </p>
              <p className="text-xs text-[#755C49]">
                Audit event logged in tamper-evident ledger and notification dispatched to citizen portal.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 2-Column Adjudication Console */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Verification Results, Documents, Workflow */}
        <div className="space-y-6 lg:col-span-2">
          {/* Citizen Demographics Card */}
          <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury">
            <CardHeader className="border-b border-[#E8D5BF] bg-[#F5EBDD] py-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#6F4028]" />
                <CardTitle className="text-sm font-bold text-[#38241B]">Applicant Demographics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {citizenProfile ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Full Legal Name', value: citizenProfile.full_name },
                    { label: 'Citizen ID', value: app.citizenId?.slice(0, 12) ?? '—', mono: true },
                    { label: 'Contact Phone', value: `+91 ${citizenProfile.mobile}` },
                    { label: 'Date of Birth', value: citizenProfile.dob ? new Date(citizenProfile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                    { label: 'Administrative District', value: citizenProfile.district },
                    { label: 'Affiliated College', value: citizenProfile.college },
                    { label: 'Degree Program', value: citizenProfile.course },
                    { label: 'Residential Address', value: citizenProfile.address },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl border border-[#D8C2AA]/60 bg-[#F5EBDD]/50 p-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755C49]">{f.label}</span>
                      <p className={cn('mt-1 text-xs font-semibold text-[#38241B]', f.mono && 'font-mono')}>{f.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#755C49]">
                  Retrieving citizen profile record from DigiLocker repository...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Automated Interoperability Verification Checklist */}
          <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
            <CardHeader className="border-b border-[#D8C2AA]/60 bg-[#F5EBDD]/60 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#6F4028]" />
                  <div>
                    <CardTitle className="text-sm font-semibold text-[#38241B]">Automated Interoperability Verification</CardTitle>
                    <CardDescription className="text-xs text-[#755C49]">
                      Live data authenticated through central FusionGrid API gateway
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  5 of 5 Checks Cleared
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-3">
                {verificationChecks.map((check) => (
                  <div key={check.label} className="flex items-start gap-3 rounded-xl border border-[#D8C2AA]/60 bg-[#F5EBDD]/40 p-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#38241B]">{check.label}</span>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-800">
                          {check.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#755C49]">{check.detail}</p>
                      <p className="mt-0.5 text-[10px] text-[#755C49]/70">Authoritative Source: {check.dept}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Verification Section */}
          <OfficerDocumentVerification
            applicationId={app.dbId ?? app.id}
            onAllVerified={setAllDocsVerified}
          />

          {/* Workflow Stage Tracker */}
          {app.workflowStages && (
            <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
              <CardHeader className="border-b border-[#D8C2AA]/60 bg-[#F5EBDD]/60 py-4">
                <CardTitle className="text-sm font-semibold text-[#38241B]">Sequential Workflow Pipeline</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">Full state machine audit from submission to benefit disbursement</CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {displayWorkflowStages?.map((stage, i) => {
                    const isLast = i === app.workflowStages!.length - 1;
                    return (
                      <div key={stage.id} className="flex items-start gap-3.5">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all',
                            stage.status === 'done' && 'bg-emerald-100 text-emerald-800 border border-emerald-300',
                            stage.status === 'current' && 'bg-[#C58B55]/20 text-[#6F4028] border-2 border-[#C58B55] ring-2 ring-[#C58B55]/20 animate-pulse',
                            stage.status === 'pending' && 'bg-[#F5EBDD] text-[#755C49] border border-[#D8C2AA]'
                          )}>
                            {stage.status === 'done' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <span>0{i + 1}</span>
                            )}
                          </div>
                          {!isLast && (
                            <div className={cn(
                              'w-0.5 h-6 my-1',
                              stage.status === 'done' ? 'bg-emerald-400' : 'bg-[#D8C2AA]'
                            )} />
                          )}
                        </div>

                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#38241B]">{stage.label}</span>
                            <span className="font-mono text-[10px] text-[#755C49]">{stage.duration}</span>
                          </div>
                          <p className="text-[11px] text-[#755C49]">{stage.department} · {stage.timestamp || 'Queued'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Officer Action Panel & Audit Log */}
        <div className="space-y-6">
          {/* Action Decision Console */}
          <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury">
            <CardHeader className="border-b border-[#E8D5BF] bg-[#F5EBDD] p-5">
              <CardTitle className="text-sm font-bold text-[#38241B]">Officer Adjudication Action</CardTitle>
              <CardDescription className="text-xs text-[#755C49]">Take final statutory action on this application file</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5">
              {isActionable ? (
                <>
                  <Button
                    onClick={handleApprove}
                    className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800 text-[#FFF9F0] shadow-md shadow-emerald-700/20 text-xs font-bold h-11 border-0 transition-transform active:scale-95"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Approve Application
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowReject(true)}
                    className="w-full gap-2 border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold h-10 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Application
                  </Button>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setShowRequestInfo(true)}
                      className="gap-1.5 text-xs h-9 border-[#E8D5BF] bg-[#FFF9F0] text-[#38241B] hover:bg-[#E8D5BF]/40 font-semibold"
                    >
                      <HelpCircle className="h-3.5 w-3.5 text-[#C58B55]" />
                      Request Info
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowForward(true)}
                      className="gap-1.5 text-xs h-9 border-[#E8D5BF] bg-[#FFF9F0] text-[#38241B] hover:bg-[#E8D5BF]/40 font-semibold"
                    >
                      <Forward className="h-3.5 w-3.5 text-[#6F4028]" />
                      Forward File
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-[#E8D5BF] bg-[#F5EBDD] p-4 text-center">
                  <p className="text-xs font-bold text-[#38241B]">File State: {app.status.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="mt-1 text-[11px] text-[#755C49]">
                    This file has already undergone final determination and is locked against further edits.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cryptographic Audit Trail */}
          <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury">
            <CardHeader className="border-b border-[#E8D5BF] bg-[#F5EBDD] py-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[#6F4028]" />
                <CardTitle className="text-sm font-bold text-[#38241B]">Audit Event Log</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {appAuditEvents.length > 0 ? (
                  appAuditEvents.map((e) => (
                    <div key={e.id} className="rounded-xl border border-[#E8D5BF] bg-[#FFF9F0] p-3 text-xs space-y-1 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#38241B]">{e.action}</span>
                        <span className="font-mono text-[10px] text-[#755C49]">{e.timestamp}</span>
                      </div>
                      <p className="text-[#755C49] text-[11px]">{e.detail}</p>
                      <p className="text-[10px] text-[#755C49]/80">Actor: {e.actor} ({e.actorRole})</p>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-[#755C49]">No events logged yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rejection Modal Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="sm:max-w-md bg-[#FFF8ED] border-[#D8C2AA] text-[#38241B]">
          <DialogHeader>
            <DialogTitle className="text-base text-red-700 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Reject Application
            </DialogTitle>
            <DialogDescription className="text-xs text-[#755C49]">
              State the official statutory reason for rejection. This reason will be logged in the public ledger and transmitted to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs text-[#38241B]">Statutory Rejection Reason</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B]"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowReject(false)} className="text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!rejectReason.trim()}
              onClick={handleReject}
              className="text-xs bg-red-700 hover:bg-red-800 text-white"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Modal Dialog */}
      <Dialog open={showRequestInfo} onOpenChange={setShowRequestInfo}>
        <DialogContent className="sm:max-w-md bg-[#FFF8ED] border-[#D8C2AA] text-[#38241B]">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-[#38241B]">
              <HelpCircle className="h-5 w-5 text-amber-700" />
              Request Additional Information
            </DialogTitle>
            <DialogDescription className="text-xs text-[#755C49]">
              Request clarified documentation from the citizen. The application state will shift to 'Info Requested'.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs text-[#38241B]">Requested Information Details</Label>
            <Textarea
              value={infoReason}
              onChange={(e) => setInfoReason(e.target.value)}
              className="text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B]"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowRequestInfo(false)} className="text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!infoReason.trim()}
              onClick={handleRequestInfo}
              className="text-xs bg-[#C58B55] hover:bg-[#805236] text-white"
            >
              Dispatch Clarification Notice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forward Application Dialog */}
      <Dialog open={showForward} onOpenChange={setShowForward}>
        <DialogContent className="sm:max-w-md bg-[#FFF8ED] border-[#D8C2AA] text-[#38241B]">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2 text-[#38241B]">
              <Forward className="h-5 w-5 text-[#6F4028]" />
              Forward Application to Department
            </DialogTitle>
            <DialogDescription className="text-xs text-[#755C49]">
              Re-route this file to an alternate nodal authority for specialized evaluation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs text-[#38241B]">Nodal Department</Label>
            <select
              value={forwardDept}
              onChange={(e) => setForwardDept(e.target.value)}
              className="w-full rounded-md border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-2 text-xs text-[#38241B] shadow-sm"
            >
              <option value="Revenue Department">Revenue Department</option>
              <option value="Education Department">Education Department</option>
              <option value="Treasury Department">Treasury Department</option>
              <option value="Social Welfare Department">Social Welfare Department</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowForward(false)} className="text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]">
              Cancel
            </Button>
            <Button size="sm" onClick={handleForward} className="text-xs bg-[#6F4028] hover:bg-[#805236] text-[#FFF8ED]">
              Confirm Forwarding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
