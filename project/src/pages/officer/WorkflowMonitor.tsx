import {
  Activity,
  CheckCircle2,
  Clock,
  Circle,
  SkipForward,
  Database,
  Building2,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { workflowEventLog } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface WorkflowMonitorProps {
  navigate: (to: string) => void;
}

const stageStatusConfig = {
  done: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border border-emerald-300', label: 'Completed' },
  current: { icon: Clock, color: 'bg-[#C58B55]/25 text-[#6F4028] border border-[#C58B55] ring-2 ring-[#C58B55]/30 animate-pulse', label: 'In Progress' },
  pending: { icon: Circle, color: 'bg-[#F5EBDD] text-[#755C49] border border-[#D8C2AA]', label: 'Pending' },
  skipped: { icon: SkipForward, color: 'bg-[#F5EBDD] text-[#755C49] border border-[#D8C2AA]', label: 'Skipped' },
};

export function WorkflowMonitor({ navigate }: WorkflowMonitorProps) {
  const { applications } = useApp();

  const appsWithWorkflows = applications.filter((a) => a.workflowStages && a.workflowStages.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Activity className="h-3.5 w-3.5" />
              FINITE STATE MACHINE (FSM) BUS
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Live Inter-Department Workflow Monitor
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Deterministic finite state execution across participating department pipelines.
              Visualizes step transitions, active bottlenecks, and statutory SLA handshakes.
            </p>
          </div>

          <Button
            onClick={() => navigate('/officer/queue')}
            className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-md border-0 self-start md:self-auto"
          >
            Application Queue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Workflows Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8C2AA] pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#38241B]">Active Department Pipelines</h2>
            <p className="text-xs text-[#755C49]">Sequential stages executing across state databases</p>
          </div>
          <span className="font-mono text-xs text-[#6F4028] font-bold">
            {appsWithWorkflows.length} Active Finite State Automata
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {appsWithWorkflows.map((app) => {
            const currentStage = app.workflowStages!.find((ws) => ws.status === 'current');
            const completedCount = app.workflowStages!.filter((ws) => ws.status === 'done').length;
            const totalCount = app.workflowStages!.length;
            const progress = Math.round((completedCount / totalCount) * 100);

            return (
              <Card
                key={app.id}
                className="group cursor-pointer border-[#D8C2AA] bg-[#FFF8ED] shadow-sm transition-all hover:border-[#6F4028] hover:shadow-xl overflow-hidden"
                onClick={() => navigate(`/officer/review/${app.id}`)}
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#6F4028] via-[#C58B55] to-emerald-600" />
                <CardHeader className="border-b border-[#D8C2AA]/60 bg-[#F5EBDD] pb-3 pt-5 px-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#6F4028] group-hover:underline">{app.id}</span>
                        <Badge variant="outline" className="text-[10px] font-bold border-[#6F4028]/30 bg-[#6F4028]/10 text-[#6F4028]">
                          {progress}% Complete
                        </Badge>
                      </div>
                      <CardTitle className="mt-1 text-base font-bold text-[#38241B]">{app.serviceName}</CardTitle>
                    </div>
                    <span className="text-xs text-[#755C49] font-mono font-bold">{completedCount}/{totalCount} stages</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Pipeline Horizontal Dots */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-2">
                    {app.workflowStages!.map((stage, idx) => {
                      const cfg = stageStatusConfig[stage.status];
                      const Icon = cfg.icon;
                      return (
                        <div key={stage.id} className="flex items-center gap-1.5">
                          <div
                            className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs', cfg.color)}
                            title={`${stage.label} (${cfg.label})`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          {idx < app.workflowStages!.length - 1 && (
                            <div className={cn('h-1 w-5 shrink-0 rounded-full', stage.status === 'done' ? 'bg-emerald-500' : 'bg-[#D8C2AA]')} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Current Active Stage info */}
                  {currentStage ? (
                    <div className="flex items-center gap-3 rounded-xl border border-[#C58B55]/40 bg-[#C58B55]/10 p-3.5 text-xs">
                      <Clock className="h-4 w-4 text-[#6F4028] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#38241B] truncate">Current In-Flight Stage: {currentStage.label}</p>
                        <p className="text-[11px] text-[#755C49] truncate mt-0.5">{currentStage.department} · Statutory Timeout: {currentStage.duration}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                      <p className="font-bold text-emerald-950">All pipeline verification stages successfully finalized</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Event Log */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="h-4 w-4 text-[#6F4028]" />
              <div>
                <CardTitle className="text-base font-bold text-[#38241B]">Workflow State Transition Ledger</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">Immutable chronological record of all state transitions</CardDescription>
              </div>
            </div>
            <span className="font-mono text-xs text-[#755C49] font-bold">Entries: {workflowEventLog.length}</span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {workflowEventLog.map((evt) => {
              const cfg = stageStatusConfig[evt.status as keyof typeof stageStatusConfig] ?? stageStatusConfig.pending;
              const Icon = cfg.icon;
              return (
                <div key={evt.id} className="flex items-start gap-3.5 rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-3.5 text-xs transition-colors hover:border-[#6F4028]">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cfg.color)}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#38241B]">{evt.stage}</span>
                      <span className="font-mono text-[10px] text-[#755C49]">{evt.timestamp}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[#755C49] text-xs">
                      <span>Application: <strong className="font-mono text-[#6F4028]">{evt.applicationId}</strong></span>
                      <span>•</span>
                      <span>Nodal Node: <strong className="text-[#38241B]">{evt.department}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
