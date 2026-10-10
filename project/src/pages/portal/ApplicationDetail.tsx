import { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Building2,
  Database,
  ShieldCheck,
  Download,
  XCircle,
  AlertCircle,
  KeyRound,
  Clock,
  Printer,
  Sparkles,
  CheckCircle2,
  User,
  Shield,
  Layers,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge, TimelineDot } from '@/components/shared/StatusBadge';
import { CitizenDocumentStatus } from '@/components/shared/CitizenDocumentStatus';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

interface ApplicationDetailProps {
  applicationId: string;
  navigate: (to: string) => void;
}

const departmentIcons: Record<string, typeof Building2> = {
  'Identity Service': ShieldCheck,
  'Revenue Department': Building2,
  'Education Department': Building2,
  'Data Quality Engine': Database,
  'Scholarship Workflow': KeyRound,
};

export function ApplicationDetail({ applicationId, navigate }: ApplicationDetailProps) {
  const { applications, user, citizenProfile } = useApp();
  const [downloading, setDownloading] = useState(false);
  const app = applications.find((a) => a.id === applicationId);

  if (!app) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center bg-[#F5EBDD] text-[#38241B]">
        <FileText className="mx-auto h-16 w-16 text-[#755C49]/30 mb-4" />
        <h2 className="font-display text-xl font-bold text-[#38241B]">Application Record Not Found</h2>
        <p className="mt-2 text-xs text-[#755C49] max-w-sm mx-auto">
          The requested application identifier could not be retrieved from the active state registry.
        </p>
        <Button
          variant="outline"
          className="mt-6 border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2] font-semibold"
          onClick={() => navigate('/portal/applications')}
        >
          Return to Applications List
        </Button>
      </div>
    );
  }

  const handleDownloadCertificate = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.print();
    }, 800);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/portal/applications')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#6F4028] hover:text-[#805236] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>← Back to All Applications</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6F4028] to-[#4A2E22] text-[#FFF8ED] border-2 border-[#C58B55]/50 shadow-xl">
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-[#FFF8ED] sm:text-3xl">
                  {app.serviceName}
                </h1>
                <StatusBadge status={app.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#D8C2AA]">
                <span>APPLICATION ID: <strong className="text-[#FFF8ED]">{app.id}</strong></span>
                {app.requestId && <span>• REQUEST TOKEN: <strong className="text-[#C58B55]">{app.requestId}</strong></span>}
                <span>• SUBMITTED: {new Date(app.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>

              <p className="text-xs text-[#D8C2AA]">
                Applicant: <strong className="text-[#FFF8ED]">{citizenProfile?.full_name || user?.name || 'Information not available'}</strong> · District: <strong className="text-[#FFF8ED]">{citizenProfile?.district || 'Information not available'}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 border-t border-[#D8C2AA]/30 pt-4 lg:border-t-0 lg:pt-0">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="text-left lg:text-right">
                <span className="text-[10px] uppercase font-bold text-[#C58B55] block">LIFECYCLE COMPLETION</span>
                <span className="font-mono text-lg font-bold text-[#FFF8ED]">{app.progress}%</span>
              </div>
              <Progress value={app.progress} className="h-3 w-36 bg-white/10 [&>div]:bg-[#C58B55]" />
            </div>

            {app.status === 'approved' && (
              <Button
                onClick={handleDownloadCertificate}
                disabled={downloading}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 font-bold shadow-lg border-0"
              >
                <Download className="h-4 w-4" />
                {downloading ? 'Preparing Signed PDF…' : 'Download Verified Certificate'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Rejection / Info Request Banners */}
      {app.status === 'rejected' && app.rejectionReason && (
        <Card className="border-rose-300 bg-rose-50 shadow-md">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 border border-rose-300">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                Application Rejected by Verification Authority
              </h4>
              <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                {app.rejectionReason}
              </p>
              <p className="mt-2 text-[11px] text-rose-700">
                If you believe this determination was made in error, you may file a statutory appeal or re-apply with corrected documents.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {app.status === 'info_requested' && app.infoRequestReason && (
        <Card className="border-amber-300 bg-amber-50 shadow-md">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 border border-amber-300">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Action Required: Additional Information Requested
              </h4>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                {app.infoRequestReason}
              </p>
              <p className="mt-2 text-xs font-bold text-[#6F4028]">
                Please review the document verification section below and re-upload the requested file.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Timeline + Supporting Documents vs Specifications & Access Ledger */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Timeline & Documents */}
        <div className="lg:col-span-7 space-y-6">
          {/* Timeline Card */}
          <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm text-[#38241B]">
            <CardHeader className="border-b border-[#D8C2AA] pb-4 bg-[#F5EBDD] px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#38241B]">
                    Lifecycle & Interoperability Milestones
                  </CardTitle>
                  <CardDescription className="text-xs text-[#755C49]">
                    Real-time verification checkpoints executed across participating state nodal departments
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#D8C2AA] bg-[#FFF8ED] text-[#6F4028] text-xs font-bold">
                  Live Audit
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {app.timeline.map((step, i) => {
                  const isLast = i === app.timeline.length - 1;
                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <TimelineDot status={step.status} />
                        {!isLast && (
                          <div
                            className={cn(
                              'w-0.5 flex-1 my-1',
                              step.status === 'done' ? 'bg-[#6F4028]' : 'bg-[#D8C2AA]'
                            )}
                            style={{ minHeight: '2.5rem' }}
                          />
                        )}
                      </div>
                      <div className={cn('pb-7 flex-1 min-w-0', isLast && 'pb-0')}>
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              'text-sm font-bold',
                              step.status === 'pending'
                                ? 'text-[#755C49]'
                                : 'text-[#38241B]'
                            )}
                          >
                            {step.label}
                          </p>
                          {step.status === 'done' && (
                            <Badge
                              variant="outline"
                              className="border-emerald-300 bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0"
                            >
                              Completed
                            </Badge>
                          )}
                          {step.status === 'current' && (
                            <Badge
                              variant="outline"
                              className="border-[#D8C2AA] bg-[#FFF8ED] text-[#6F4028] text-[10px] font-bold shrink-0 animate-pulse"
                            >
                              In Progress
                            </Badge>
                          )}
                        </div>
                        {step.timestamp && (
                          <p className="mt-1 font-mono text-[11px] text-[#755C49]">
                            {step.timestamp}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Supporting Documents Status Section */}
          <CitizenDocumentStatus
            applicationId={app.id}
            citizenId={app.citizenId || user?.id || 'citizen-demo'}
          />
        </div>

        {/* Right Column: Specifications & Interoperability Ledger */}
        <div className="lg:col-span-5 space-y-6">
          {/* Specifications Card */}
          <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm text-[#38241B]">
            <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
              <CardTitle className="text-base font-bold text-[#38241B]">
                Statutory Scheme Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-[#D8C2AA]/60 pb-2">
                <span className="text-[#755C49] font-medium">Service Category</span>
                <span className="font-bold text-[#38241B]">{app.serviceName}</span>
              </div>
              <div className="flex justify-between border-b border-[#D8C2AA]/60 pb-2">
                <span className="text-[#755C49] font-medium">Nodal Government Department</span>
                <span className="font-bold text-[#38241B]">{app.departments?.[0] || 'Social Welfare & Justice Department'}</span>
              </div>
              <div className="flex justify-between border-b border-[#D8C2AA]/60 pb-2">
                <span className="text-[#755C49] font-medium">Applicant Master ID</span>
                <span className="font-mono font-bold text-[#6F4028]">{app.citizenId || 'MH-CIT-2026-948201'}</span>
              </div>
              <div className="flex justify-between border-b border-[#D8C2AA]/60 pb-2">
                <span className="text-[#755C49] font-medium">Statutory SLA Target</span>
                <span className="font-bold text-[#38241B]">15 Working Days</span>
              </div>
              <div className="flex justify-between border-b border-[#D8C2AA]/60 pb-2">
                <span className="text-[#755C49] font-medium">Consent Authorization</span>
                <span className="font-bold text-emerald-800">DPDP Bound & Active</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-[#755C49] font-medium">Cryptographic Ledger Integrity</span>
                <span className="font-mono text-[11px] text-[#6F4028] font-bold">SHA-256 Validated</span>
              </div>
            </CardContent>
          </Card>

          {/* Data Access Audit Ledger */}
          <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm text-[#38241B]">
            <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-[#38241B]">
                <Database className="h-4 w-4 text-[#6F4028]" />
                Inter-Department Data Access Ledger
              </CardTitle>
              <CardDescription className="text-xs text-[#755C49]">
                Immutable, auditable log of departmental credential queries
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {app.dataAccess.map((da) => {
                  const Icon = departmentIcons[da.department] ?? Building2;
                  return (
                    <div
                      key={da.id}
                      className="rounded-xl border border-[#D8C2AA] bg-[#F5EBDD] p-3.5 text-xs space-y-1.5 transition-all hover:border-[#6F4028]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#38241B] flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-[#6F4028]" />
                          {da.department}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-emerald-300 bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                        >
                          {da.result}
                        </Badge>
                      </div>
                      <div className="text-[#755C49] flex justify-between text-[11px]">
                        <span>Query Scope: <strong className="text-[#38241B]">{da.data}</strong></span>
                        <span className="font-mono text-[10px] text-[#6F4028] font-semibold">{da.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
