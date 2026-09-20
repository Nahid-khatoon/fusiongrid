import {
  Activity, CheckCircle2, Clock, Circle, SkipForward,
  Database, Building2, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { workflowEventLog } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface WorkflowMonitorProps {
  navigate: (to: string) => void;
}

const stageStatusConfig = {
  done: { icon: CheckCircle2, color: 'bg-success text-success-foreground', label: 'Completed' },
  current: { icon: Clock, color: 'bg-amber-100 text-amber-600 animate-pulse-ring', label: 'In Progress' },
  pending: { icon: Circle, color: 'border-2 border-muted bg-background text-muted-foreground', label: 'Pending' },
  skipped: { icon: SkipForward, color: 'bg-muted text-muted-foreground', label: 'Skipped' },
};

export function WorkflowMonitor({ navigate }: WorkflowMonitorProps) {
  const { applications } = useApp();

  const appsWithWorkflows = applications.filter((a) => a.workflowStages && a.workflowStages.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Workflow Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Real-time workflow events and current stage tracking across all applications
            </p>
          </div>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="mb-6">
        <h2 className="mb-3 font-display text-lg font-semibold">Active Workflows</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {appsWithWorkflows.map((app, i) => {
            const currentStage = app.workflowStages!.find((ws) => ws.status === 'current');
            const completedCount = app.workflowStages!.filter((ws) => ws.status === 'done').length;
            const totalCount = app.workflowStages!.length;
            const progress = Math.round((completedCount / totalCount) * 100);

            return (
              <Card
                key={app.id}
                className="cursor-pointer border-border/60 transition-all hover:shadow-lg animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/officer/review/${app.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{app.serviceName}</CardTitle>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{app.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold">{progress}%</p>
                      <p className="text-xs text-muted-foreground">{completedCount}/{totalCount} stages</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Mini workflow visualization */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
                    {app.workflowStages!.map((stage, idx) => {
                      const cfg = stageStatusConfig[stage.status];
                      const Icon = cfg.icon;
                      return (
                        <div key={stage.id} className="flex items-center gap-1">
                          <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full', cfg.color)}>
                            <Icon className={cn('h-3.5 w-3.5', stage.status === 'pending' && 'h-2 w-2 rounded-full bg-muted-foreground/40')} />
                          </div>
                          {idx < app.workflowStages!.length - 1 && (
                            <div className={cn('h-0.5 w-4 shrink-0', stage.status === 'done' ? 'bg-success' : 'bg-border')} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Current stage */}
                  {currentStage ? (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700">Current Stage: {currentStage.label}</p>
                        <p className="text-xs text-muted-foreground">{currentStage.department} · {currentStage.duration}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 p-2.5">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      <p className="text-xs font-semibold text-accent">All stages completed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Event Log */}
      <Card className="border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-4 w-4 text-primary" />
            Workflow Event Log
          </CardTitle>
          <CardDescription>Chronological log of all workflow events across applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {workflowEventLog.map((evt) => {
              const cfg = stageStatusConfig[evt.status as keyof typeof stageStatusConfig] ?? stageStatusConfig.pending;
              const Icon = cfg.icon;
              return (
                <div key={evt.id} className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', cfg.color)}>
                    <Icon className={cn('h-4 w-4', evt.status === 'pending' && 'h-2 w-2 rounded-full bg-muted-foreground/40')} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{evt.stage}</span>
                      <Badge variant="outline" className={cn(
                        evt.status === 'done' && 'border-accent/30 bg-accent/10 text-accent',
                        evt.status === 'current' && 'border-amber-300 bg-amber-50 text-amber-700',
                        evt.status === 'pending' && 'border-muted text-muted-foreground',
                      )}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {evt.department}
                      </span>
                      <span>·</span>
                      <span>Duration: {evt.duration}</span>
                      <span>·</span>
                      <span>{evt.timestamp}</span>
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">{evt.applicationId}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 text-xs text-amber-700">
        <Activity className="h-3.5 w-3.5 shrink-0" />
        Prototype Integration / Mock Workflow Engine — No real government workflows connected
      </div>
    </div>
  );
}
