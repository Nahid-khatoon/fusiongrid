import { useState, useEffect } from 'react';
import {
  ArrowLeft, FileText, ShieldCheck, CheckCircle2, XCircle, Building2,
  User, KeyRound, Database, Clock, AlertCircle, Forward, HelpCircle,
  CheckCheck, Landmark, GraduationCap, HeartPulse, Users, Sparkles,
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
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-muted-foreground">Application not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/officer/queue')}>
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
    { label: 'Identity', status: 'verified', detail: 'Aadhaar match confirmed', dept: 'Identity Service' },
    { label: 'Income', status: 'verified', detail: 'Family income ₹4.2L per annum', dept: 'Revenue Department' },
    { label: 'Student Enrollment', status: 'verified', detail: 'B.Tech CE active at COEP', dept: 'Education Department' },
    { label: 'Data Quality', status: 'passed', detail: 'All fields validated and cross-checked', dept: 'Data Quality Engine' },
    { label: 'Consent', status: 'valid', detail: `${app.consents.length} consents active`, dept: 'Consent Manager' },
  ];

  // Keep the workflow display synchronized with the persisted application status.
  // The application can be approved successfully while older workflow-stage data
  // still says "Officer Review / In progress". For an approved application,
  // render the final workflow state as completed and show 100% progress.
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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/officer/queue')}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground animate-fade-in"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Queue
      </button>

      {/* Header */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-bold">{app.serviceName}</h1>
                  <StatusBadge status={app.status} />
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{app.id}</p>
                {app.requestId && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground/70">Request: {app.requestId}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted: {new Date(app.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Progress</p>
              <p className="font-display text-2xl font-bold">{displayProgress}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action taken banner */}
      {actionTaken && (
        <Card className={cn(
          'mb-6 animate-scale-in border-2',
          actionTaken === 'approved' && 'border-accent/40 bg-accent/5',
          actionTaken === 'rejected' && 'border-destructive/40 bg-destructive/5',
          actionTaken === 'info_requested' && 'border-orange-300 bg-orange-50',
          actionTaken === 'forwarded' && 'border-blue-300 bg-blue-50',
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {actionTaken === 'approved' && <CheckCircle2 className="h-5 w-5 text-accent" />}
              {actionTaken === 'rejected' && <XCircle className="h-5 w-5 text-destructive" />}
              {actionTaken === 'info_requested' && <HelpCircle className="h-5 w-5 text-orange-600" />}
              {actionTaken === 'forwarded' && <Forward className="h-5 w-5 text-blue-600" />}
              <div>
                <p className="text-sm font-semibold">
                  {actionTaken === 'approved' && 'Application approved successfully'}
                  {actionTaken === 'rejected' && 'Application rejected'}
                  {actionTaken === 'info_requested' && 'Information requested from citizen'}
                  {actionTaken === 'forwarded' && `Application forwarded to ${forwardDept}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  The citizen has been notified and their tracking page updated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Citizen info + verification */}
        <div className="space-y-6 lg:col-span-2">
          {/* Citizen Information */}
          <Card className="border-border/60 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Citizen Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {citizenProfile ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Name', value: citizenProfile.full_name },
                    { label: 'Citizen ID', value: app.citizenId?.slice(0, 8) ?? '—', mono: true },
                    { label: 'Mobile', value: `+91 ${citizenProfile.mobile}` },
                    { label: 'Date of Birth', value: citizenProfile.dob ? new Date(citizenProfile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                    { label: 'District', value: citizenProfile.district },
                    { label: 'College', value: citizenProfile.college },
                    { label: 'Course', value: citizenProfile.course },
                    { label: 'Address', value: citizenProfile.address },
                  ].map((f) => (
                    <div key={f.label} className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs font-medium text-muted-foreground">{f.label}</p>
                      <p className={cn('mt-1 text-sm font-medium', f.mono && 'font-mono')}>{f.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <User className="mx-auto h-8 w-8 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">Loading citizen information...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Results */}
          <Card className="border-border/60 animate-fade-in-up delay-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Cross-Department Verification
                  </CardTitle>
                  <CardDescription className="mt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Sparkles className="h-3 w-3" />
                      Data received through FusionGrid
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{check.label}</span>
                        <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                          {check.status === 'verified' ? 'Verified' : check.status === 'passed' ? 'Passed' : 'Valid'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{check.detail}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground/60">Source: {check.dept}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Verification */}
          <OfficerDocumentVerification
            applicationId={app.dbId ?? app.id}
            onAllVerified={setAllDocsVerified}
          />

          {/* Workflow Visual */}
          {app.workflowStages && (
            <Card className="border-border/60 animate-fade-in-up delay-200">
              <CardHeader>
                <CardTitle className="text-base">Application Workflow</CardTitle>
                <CardDescription>Each stage with status, department, duration and timestamp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {displayWorkflowStages?.map((stage, i) => {
                    const isLast = i === app.workflowStages!.length - 1;
                    const Icon = departmentIcons[stage.department] ?? Building2;
                    return (
                      <div key={stage.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                            stage.status === 'done' && 'border-success bg-success text-success-foreground',
                            stage.status === 'current' && 'border-amber-400 bg-amber-100 text-amber-600 animate-pulse-ring',
                            stage.status === 'pending' && 'border-muted bg-background text-muted-foreground',
                            stage.status === 'skipped' && 'border-muted bg-muted text-muted-foreground',
                          )}>
                            {stage.status === 'done' ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : stage.status === 'current' ? (
                              <Clock className="h-4 w-4" />
                            ) : stage.status === 'skipped' ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                            )}
                          </div>
                          {!isLast && (
                            <div className={cn('w-0.5 flex-1', stage.status === 'done' ? 'bg-success' : 'bg-border')} style={{ minHeight: '1.5rem' }} />
                          )}
                        </div>
                        <div className={cn('pb-4', isLast && 'pb-0')}>
                          <p className={cn('text-sm font-semibold', stage.status === 'pending' && 'text-muted-foreground')}>
                            {stage.label}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon className="h-3 w-3" />
                              {stage.department}
                            </span>
                            <span>·</span>
                            <span>Duration: {stage.duration}</span>
                            {stage.timestamp && (
                              <>
                                <span>·</span>
                                <span>{stage.timestamp}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Actions + Audit */}
        <div className="space-y-6">
          {/* Officer Actions */}
          <Card className="border-border/60 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-base">Officer Actions</CardTitle>
              <CardDescription>Take action on this application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isActionable ? (
                <>
                  {!allDocsVerified && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Document verification pending — approve after all docs are verified.
                    </div>
                  )}
                  <Button className="w-full gap-2 bg-accent hover:bg-accent/90" onClick={handleApprove} disabled={!allDocsVerified}>
                    <CheckCheck className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button variant="outline" className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setShowReject(true)}>
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button variant="outline" className="w-full gap-2 border-orange-300 text-orange-600 hover:bg-orange-50" onClick={() => setShowRequestInfo(true)}>
                    <HelpCircle className="h-4 w-4" />
                    Request Information
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={() => setShowForward(true)}>
                    <Forward className="h-4 w-4" />
                    Forward
                  </Button>
                </>
              ) : (
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <AlertCircle className="mx-auto h-6 w-6 text-muted-foreground/40" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No actions available — application is {app.status.replace(/_/g, ' ')}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection reason display */}
          {app.rejectionReason && (
            <Card className="border-destructive/30 bg-destructive/5 animate-fade-in-up">
              <CardContent className="p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <XCircle className="h-4 w-4" />
                  Rejection Reason
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{app.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Info request reason display */}
          {app.infoRequestReason && (
            <Card className="border-orange-300 bg-orange-50/50 animate-fade-in-up">
              <CardContent className="p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                  <HelpCircle className="h-4 w-4" />
                  Information Requested
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{app.infoRequestReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Audit Trail */}
          <Card className="border-border/60 animate-fade-in-up delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {appAuditEvents.map((evt) => (
                  <div key={evt.id} className="rounded-lg border bg-card p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{evt.action}</span>
                      <span className="text-[10px] text-muted-foreground">{evt.timestamp}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{evt.detail}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/60">By: {evt.actor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prototype notice */}
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-xs text-amber-700">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            Prototype Integration / Mock Government Department API
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              A reason is required. The citizen will be notified with this reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Rejection Reason</Label>
            <Textarea
              id="reject-reason"

              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            {!rejectReason.trim() && showReject && (
              <p className="text-xs text-destructive">Reason is required to reject.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()} className="gap-1.5">
              <XCircle className="h-4 w-4" />
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Info Dialog */}
      <Dialog open={showRequestInfo} onOpenChange={setShowRequestInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Information</DialogTitle>
            <DialogDescription>
              Specify what information the citizen needs to provide. This will create a pending action on their portal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="info-reason">Information Requested</Label>
            <Textarea
              id="info-reason"

              value={infoReason}
              onChange={(e) => setInfoReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestInfo(false)}>Cancel</Button>
            <Button onClick={handleRequestInfo} disabled={!infoReason.trim()} className="gap-1.5">
              <HelpCircle className="h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forward Dialog */}
      <Dialog open={showForward} onOpenChange={setShowForward}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Forward Application</DialogTitle>
            <DialogDescription>
              Select the department to forward this application to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="forward-dept">Forward To</Label>
            <select
              id="forward-dept"
              value={forwardDept}
              onChange={(e) => setForwardDept(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option>Revenue Department</option>
              <option>Education Department</option>
              <option>Public Health Department</option>
              <option>Social Welfare Department</option>
              <option>Treasury Department</option>
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForward(false)}>Cancel</Button>
            <Button onClick={handleForward} className="gap-1.5">
              <Forward className="h-4 w-4" />
              Forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
