import { useState, useEffect } from 'react';
import {
  Radio, Filter, X, FileCheck, CheckCircle2, XCircle, Lock,
  AlertTriangle, Zap, ArrowRight, Activity,
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

const eventConfig: Record<EventType, { icon: typeof FileCheck; color: string; bg: string; label: string }> = {
  ApplicationSubmitted: { icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Application Submitted' },
  IncomeVerified: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Income Verified' },
  StudentVerified: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Student Verified' },
  ApplicationApproved: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Application Approved' },
  ApplicationRejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Application Rejected' },
  ConsentGranted: { icon: Lock, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Consent Granted' },
  ConsentRevoked: { icon: Lock, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Consent Revoked' },
  ApiFailure: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', label: 'API Failure' },
};

const allEventTypes = Object.keys(eventConfig) as EventType[];

export function EventStream({ navigate: _navigate }: EventStreamProps) {
  const { systemEvents, apiFailures, simulateRevenueFailure, resetRevenueFailure } = useApp();
  const [filter, setFilter] = useState<EventType | 'all'>('all');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      // The event stream auto-updates from context; this just forces re-render
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const filteredEvents = filter === 'all'
    ? systemEvents
    : systemEvents.filter((e) => e.type === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight">Event Stream</h1>
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Fictional Prototype
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time event bus showing all system events — application lifecycle, verification, consent, and API failures.
        </p>
      </div>

      {/* API Failure Simulation Panel */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-amber-600" />
            API Failure Simulation
          </CardTitle>
          <CardDescription>
            Trigger a Revenue API failure to see the automatic retry and queue mechanism. The application is never lost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={simulateRevenueFailure}
              disabled={apiFailures.some((f) => f.department === 'Revenue Department' && f.isDown)}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Simulate Revenue API Failure
            </Button>
            <Button
              onClick={resetRevenueFailure}
              variant="outline"
              size="sm"
              disabled={!apiFailures.some((f) => f.department === 'Revenue Department')}
            >
              Reset Failure State
            </Button>
          </div>

          {apiFailures.length > 0 && (
            <div className="mt-4 space-y-3">
              {apiFailures.map((failure) => (
                <div key={failure.department} className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-900">{failure.department}</span>
                      <Badge variant={failure.isDown ? 'destructive' : 'default'} className={cn(!failure.isDown && 'bg-emerald-100 text-emerald-700')}>
                        {failure.retryState === 'recovered' ? 'Recovered' : failure.isDown ? 'DOWN' : 'OK'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{failure.timestamp}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-red-800">{failure.message}</p>
                  <p className="mt-1 text-sm text-blue-700">{failure.citizenMessage}</p>
                  {failure.requestId && (
                    <p className="mt-1 text-xs text-muted-foreground">Request ID: {failure.requestId} | Endpoint: {failure.endpoint}</p>
                  )}
                  {failure.history.length > 0 && (
                    <div className="mt-3 space-y-1">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <Radio className={cn('h-4 w-4', isLive ? 'text-emerald-500 animate-pulse' : 'text-muted-foreground')} />
          <span className="text-sm font-medium">{isLive ? 'Live' : 'Paused'}</span>
          <Button variant="ghost" size="sm" onClick={() => setIsLive(!isLive)}>
            {isLive ? 'Pause' : 'Resume'}
          </Button>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setFilter('all')}
            className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition-colors', filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
          >
            All
          </button>
          {allEventTypes.map((type) => {
            const cfg = eventConfig[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn('flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors', filter === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
              >
                <Icon className="h-3 w-3" />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Event list */}
      <Card className="border-border/60 animate-fade-in-up">
        <CardContent className="p-0">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No events yet. Trigger an action to see events appear in real-time.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEvents.map((evt) => {
                const cfg = eventConfig[evt.type];
                const Icon = cfg.icon;
                return (
                  <div key={evt.id} className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/30">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cfg.bg)}>
                      <Icon className={cn('h-4 w-4', cfg.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{cfg.label}</span>
                        {evt.department && (
                          <Badge variant="outline" className="text-[10px]">{evt.department}</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{evt.detail}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{evt.timestamp}</span>
                        <span>Actor: {evt.actor}</span>
                        {evt.applicationId && <span>App: {evt.applicationId}</span>}
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
