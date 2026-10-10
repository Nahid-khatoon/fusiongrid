import { useState, useEffect } from 'react';
import {
  Radio, Filter, X, FileCheck, CheckCircle2, XCircle, Lock,
  AlertTriangle, Zap, ArrowRight, Activity, Shield, Terminal,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import type { EventType } from '@/types';
import { cn } from '@/lib/utils';

interface EventStreamProps {
  navigate: (to: string) => void;
}

const eventConfig: Record<EventType, { icon: typeof FileCheck; color: string; bg: string; border: string; label: string }> = {
  ApplicationSubmitted: { icon: FileCheck, color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]', label: 'Application Submitted' },
  IncomeVerified: { icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300', label: 'Income Verified' },
  StudentVerified: { icon: CheckCircle2, color: 'text-[#6F4028]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]', label: 'Student Verified' },
  ApplicationApproved: { icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300', label: 'Application Approved' },
  ApplicationRejected: { icon: XCircle, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300', label: 'Application Rejected' },
  ConsentGranted: { icon: Lock, color: 'text-[#6F4028]', bg: 'bg-[#F5EBDD]', border: 'border-[#D8C2AA]', label: 'Consent Authorized' },
  ConsentRevoked: { icon: Lock, color: 'text-[#C58B55]', bg: 'bg-[#C58B55]/15', border: 'border-[#D8C2AA]', label: 'Consent Revoked' },
  ApiFailure: { icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-300', label: 'API Fault / Retry' },
};

const allEventTypes = Object.keys(eventConfig) as EventType[];

export function EventStream({ navigate }: EventStreamProps) {
  const { systemEvents, apiFailures, simulateRevenueFailure, resetRevenueFailure } = useApp();
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      // Auto updates from context
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const filteredEvents = filter === 'all'
    ? systemEvents
    : systemEvents.filter((e) => e.type === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
              EVENT-DRIVEN ARCHITECTURE (EDA)
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Live Interoperability Message & Event Bus
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Real-time asynchronous pub-sub message stream orchestrating scheme applications,
              cross-agency data attestations, and statutory citizen consent token lifecycle.
            </p>
          </div>

          <Button
            onClick={() => navigate('/admin/dashboard')}
            className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-md border-0 self-start md:self-auto"
          >
            Control Center Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Fault Injection Panel */}
      <Card className="border-[#C58B55]/50 bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C58B55]/20 text-[#6F4028] border border-[#D8C2AA]">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-[#38241B]">Reliability Fault Injector & Resiliency Sandbox</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">
                  Inject transient connector faults into the live event loop to evaluate asynchronous queue buffering
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                onClick={simulateRevenueFailure}
                disabled={apiFailures.some((f) => f.department === 'Revenue Department' && f.isDown)}
                className="text-xs font-bold shadow-md bg-rose-700 hover:bg-rose-800 text-white border-0"
                size="sm"
              >
                <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                Inject Revenue API Outage
              </Button>
              <Button
                onClick={resetRevenueFailure}
                variant="outline"
                size="sm"
                disabled={!apiFailures.some((f) => f.department === 'Revenue Department')}
                className="text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2] font-semibold"
              >
                Reset Event Loop
              </Button>
            </div>
          </div>
        </CardHeader>

        {apiFailures.length > 0 && (
          <CardContent className="p-6 space-y-3">
            {apiFailures.map((failure) => (
              <div key={failure.department} className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-700" />
                    <span className="font-bold text-rose-950 text-sm">{failure.department}</span>
                    <Badge variant="outline" className={cn('text-[10px] font-mono font-bold', failure.isDown ? 'border-rose-300 bg-rose-100 text-rose-800' : 'border-emerald-300 bg-emerald-100 text-emerald-800')}>
                      {failure.retryState === 'recovered' ? 'RECOVERED' : failure.isDown ? 'OFFLINE (ISOLATED)' : 'OK'}
                    </Badge>
                  </div>
                  <span className="font-mono text-[11px] text-[#755C49]">{failure.timestamp}</span>
                </div>
                <p className="text-xs text-[#755C49] leading-relaxed">{failure.message}</p>
                {failure.history.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-[#D8C2AA]/40 pt-2.5 font-mono text-[11px]">
                    {failure.history.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-[#755C49]">
                        <span className="text-[#38241B] font-semibold">{h.timestamp}</span>
                        <ArrowRight className="h-3 w-3 text-[#6F4028]" />
                        <span className="text-[#6F4028]">{h.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Filter and Live Controls */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold text-[#38241B]">
                Bus Stream Status: {isLive ? 'Active Polling (1000ms)' : 'Paused'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="h-7 text-xs ml-2 border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2] font-semibold"
              >
                {isLive ? 'Pause Stream' : 'Resume Stream'}
              </Button>
            </div>
            <span className="text-xs text-[#755C49] font-mono">
              Showing <strong className="text-[#38241B]">{filteredEvents.length}</strong> of {systemEvents.length} events
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D8C2AA]/60">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                filter === 'all'
                  ? 'bg-[#6F4028] text-[#FFF8ED] shadow-sm'
                  : 'bg-[#F5EBDD] text-[#755C49] hover:bg-[#EAD8C2] hover:text-[#38241B]'
              )}
            >
              All Events ({systemEvents.length})
            </button>
            {allEventTypes.map((type) => {
              const cfg = eventConfig[type];
              const Icon = cfg.icon;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    filter === type
                      ? 'bg-[#6F4028] text-[#FFF8ED] shadow-sm'
                      : 'bg-[#F5EBDD] text-[#755C49] hover:bg-[#EAD8C2] hover:text-[#38241B]'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Stream List */}
      <Card className="overflow-hidden border-[#D8C2AA] bg-[#FFF8ED] shadow-md">
        <CardContent className="p-0">
          {filteredEvents.length === 0 ? (
            <div className="py-20 text-center text-xs text-[#755C49]">
              <Activity className="mx-auto h-12 w-12 text-[#755C49]/30 mb-3" />
              No events match this criteria on the active message bus.
            </div>
          ) : (
            <div className="divide-y divide-[#D8C2AA]/50">
              {filteredEvents.map((evt) => {
                const cfg = eventConfig[evt.type] ?? eventConfig.ApplicationSubmitted;
                const Icon = cfg.icon;

                return (
                  <div key={evt.id} className="flex items-start gap-4 p-5 transition-colors hover:bg-[#F5EBDD]/50">
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs', cfg.bg, cfg.border)}>
                      <Icon className={cn('h-5 w-5', cfg.color)} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#38241B]">{cfg.label}</span>
                          {evt.department && (
                            <Badge variant="outline" className="text-[10px] font-semibold border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]">
                              {evt.department}
                            </Badge>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-[#755C49]">{evt.timestamp}</span>
                      </div>

                      <p className="text-xs text-[#755C49] leading-relaxed">{evt.detail}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#755C49] pt-1">
                        <span>Actor: <strong className="text-[#38241B]">{evt.actor}</strong></span>
                        {evt.applicationId && (
                          <>
                            <span>•</span>
                            <span>Ref: <strong className="font-mono text-[#6F4028]">{evt.applicationId}</strong></span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-mono text-[10px] text-[#755C49]">ID: {evt.id}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
