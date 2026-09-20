import {
  KeyRound, ShieldCheck, Building2, GraduationCap, Lock,
  Eye, EyeOff, CheckCircle2, XCircle, Clock, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const departmentIcons: Record<string, typeof Building2> = {
  'Revenue Department': Building2,
  'Education Department': GraduationCap,
  'Identity Service': ShieldCheck,
};

export function ConsentManagement() {
  const { consents, revokeConsent } = useApp();
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const activeConsents = consents.filter((c) => c.status === 'granted');
  const revokedConsents = consents.filter((c) => c.status === 'revoked');

  const handleRevoke = () => {
    if (revokeTarget) {
      revokeConsent(revokeTarget);
      setRevokeTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Your Data, Your Control</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage consents you've granted to government departments. All consents are purpose-bound and revocable.
            </p>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <Card className="mb-6 border-accent/20 bg-accent/5 animate-fade-in-up">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-sm font-semibold text-accent">Purpose-Bound Consent</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Each consent you grant is bound to a specific purpose. Departments can only access the
                data you've authorized for that purpose. You can revoke consent at any time — the department
                will no longer be able to access your data for that purpose.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Consents */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Active Consents ({activeConsents.length})</h2>
      </div>

      <div className="space-y-3">
        {activeConsents.map((consent, i) => {
          const Icon = departmentIcons[consent.department] ?? ShieldCheck;
          return (
            <Card
              key={consent.id}
              className="border-border/60 transition-all hover:shadow-md animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{consent.department}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {consent.dataScope} → {consent.purpose}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Granted: {new Date(consent.requestedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </span>
                        {consent.applicationId && (
                          <span className="font-mono">App: {consent.applicationId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => setRevokeTarget(consent.id)}
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {activeConsents.length === 0 && (
          <Card className="border-border/60">
            <CardContent className="p-8 text-center">
              <Lock className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No active consents.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Revoked Consents */}
      {revokedConsents.length > 0 && (
        <>
          <div className="mb-3 mt-8 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-muted-foreground">
              Revoked Consents ({revokedConsents.length})
            </h2>
          </div>
          <div className="space-y-3">
            {revokedConsents.map((consent) => {
              const Icon = departmentIcons[consent.department] ?? ShieldCheck;
              return (
                <Card key={consent.id} className="border-border/40 opacity-60">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold">{consent.department}</h3>
                        <p className="text-sm text-muted-foreground">{consent.dataScope} → {consent.purpose}</p>
                      </div>
                      <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Revoked
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Revoke confirmation dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke Consent?</DialogTitle>
            <DialogDescription>
              Revoking consent means the department will no longer be able to access your data for this
              purpose. This may affect any applications that depend on this consent. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            This action can be reversed by granting consent again during a future application.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRevoke} className="gap-1.5">
              <EyeOff className="h-4 w-4" />
              Revoke Consent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
