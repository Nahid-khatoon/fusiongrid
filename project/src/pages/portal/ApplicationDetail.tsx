import {
  ArrowLeft, FileText, Building2, Database, ShieldCheck,
  CheckCircle2, Clock, Circle, KeyRound, Download, XCircle, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge, TimelineDot } from '@/components/shared/StatusBadge';
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
  const { applications } = useApp();
  const app = applications.find((a) => a.id === applicationId);

  if (!app) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-muted-foreground">Application not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/portal/applications')}>
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/portal/applications')}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground animate-fade-in"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
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
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground/70">
                    Request ID: {app.requestId}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted: {new Date(app.submittedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Progress value={app.progress} className="h-2 w-28" />
                <span className="text-sm font-semibold">{app.progress}%</span>
              </div>
              {app.status === 'approved' && (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Download Certificate
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Officer decision banners */}
      {app.status === 'rejected' && app.rejectionReason && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5 animate-fade-in-up">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">Application Rejected</p>
                <p className="mt-1 text-sm text-muted-foreground">{app.rejectionReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {app.status === 'info_requested' && app.infoRequestReason && (
        <Card className="mb-6 border-orange-300 bg-orange-50/50 animate-fade-in-up">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-orange-700">Action Required: Information Requested</p>
                <p className="mt-1 text-sm text-muted-foreground">{app.infoRequestReason}</p>
                <p className="mt-2 text-xs text-orange-600">Please provide the requested information at the earliest to resume processing.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card className="border-border/60 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-base">Application Timeline</CardTitle>
              <CardDescription>Track your application progress across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {app.timeline.map((step, i) => {
                  const isLast = i === app.timeline.length - 1;
                  return (
                    <div key={step.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <TimelineDot status={step.status} />
                        {!isLast && (
                          <div
                            className={cn(
                              'w-0.5 flex-1',
                              step.status === 'done' ? 'bg-success' : 'bg-muted'
                            )}
                            style={{ minHeight: '2rem' }}
                          />
                        )}
                      </div>
                      <div className={cn('pb-6', isLast && 'pb-0')}>
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            step.status === 'pending' && 'text-muted-foreground'
                          )}
                        >
                          {step.label}
                        </p>
                        {step.timestamp && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{step.timestamp}</p>
                        )}
                        {step.status === 'done' && (
                          <Badge variant="outline" className="mt-1 border-accent/30 bg-accent/10 text-accent">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                        {step.status === 'current' && (
                          <Badge variant="outline" className="mt-1 border-amber-300 bg-amber-50 text-amber-700">
                            <Clock className="mr-1 h-3 w-3" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Data Access History */}
          <Card className="mt-6 border-border/60 animate-fade-in-up delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-primary" />
                Data Access History
              </CardTitle>
              <CardDescription>
                Every time a department accessed your data — fully auditable and transparent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Department</th>
                      <th className="pb-2 pr-4 font-medium">Data Accessed</th>
                      <th className="pb-2 pr-4 font-medium">Purpose</th>
                      <th className="pb-2 pr-4 font-medium">Timestamp</th>
                      <th className="pb-2 font-medium">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {app.dataAccess.map((da) => {
                      const Icon = departmentIcons[da.department] ?? Building2;
                      return (
                        <tr key={da.id} className="border-b last:border-0">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-medium">{da.department}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{da.data}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{da.purpose}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{da.timestamp}</td>
                          <td className="py-3">
                            <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                              {da.result}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Departments + Consents */}
        <div className="space-y-6">
          {/* Departments involved */}
          <Card className="border-border/60 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-base">Departments Involved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {app.departments.map((dept, i) => {
                  const Icon = departmentIcons[dept] ?? Building2;
                  return (
                    <div key={dept} className="flex items-center gap-2.5 rounded-lg border bg-card p-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{dept}</span>
                      <CheckCircle2 className="ml-auto h-4 w-4 text-accent" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Consents granted */}
          <Card className="border-border/60 animate-fade-in-up delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" />
                Consents Granted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {app.consents.map((c) => (
                  <div key={c.id} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.department}</span>
                      <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                        {c.status === 'granted' ? 'Active' : c.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.dataScope}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Purpose: {c.purpose}</p>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full gap-1.5"
                onClick={() => navigate('/portal/consent')}
              >
                <KeyRound className="h-3.5 w-3.5" />
                Manage Consents
              </Button>
            </CardContent>
          </Card>

          {/* Prototype notice */}
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-xs text-amber-700">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            Prototype Integration / Mock Government Department API
          </div>
        </div>
      </div>
    </div>
  );
}
