import {
  History, FileText, KeyRound, Database, CheckCircle2,
  User, ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';

const typeConfig: Record<string, { icon: typeof FileText; color: string }> = {
  submit: { icon: FileText, color: 'bg-blue-100 text-blue-600' },
  consent: { icon: KeyRound, color: 'bg-accent/10 text-accent' },
  access: { icon: Database, color: 'bg-purple-100 text-purple-600' },
  approve: { icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
  reject: { icon: History, color: 'bg-red-100 text-red-600' },
  request_info: { icon: FileText, color: 'bg-amber-100 text-amber-600' },
  forward: { icon: ArrowRight, color: 'bg-cyan-100 text-cyan-600' },
  verify: { icon: CheckCircle2, color: 'bg-teal-100 text-teal-600' },
  profile: { icon: User, color: 'bg-amber-100 text-amber-600' },
};

interface HistoryPageProps {
  navigate: (to: string) => void;
}

export function HistoryPage({ navigate }: HistoryPageProps) {
  const { auditEvents } = useApp();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Activity History</h1>
            <p className="text-sm text-muted-foreground">
              A complete log of your actions across FusionGrid — applications, consents, and data access.
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 h-full w-0.5 bg-border" />

        <div className="space-y-4">
          {auditEvents.map((event, i) => {
            const config = typeConfig[event.type] ?? typeConfig.submit;
            const Icon = config.icon;
            return (
              <div
                key={event.id}
                className="relative flex gap-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background ${config.color} z-10`}>
                  <Icon className="h-5 w-5" />
                </div>
                <Card className="flex-1 border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{event.action}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{event.detail}</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">{event.timestamp}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {event.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
          {auditEvents.length === 0 && (
            <div className="py-12 text-center">
              <History className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No activity yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/portal/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Back to Dashboard
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
