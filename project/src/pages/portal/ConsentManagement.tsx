import { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Building2,
  GraduationCap,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Info,
  Shield,
  Eye,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';

const departmentIcons: Record<string, typeof Building2> = {
  'Revenue Department': Building2,
  'Education Department': GraduationCap,
  'Identity Service': ShieldCheck,
  'Health Department': ShieldCheck,
  'Social Welfare': Building2,
};

export function ConsentManagement() {
  const { consents, revokeConsent } = useApp();
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const activeConsents = consents.filter((c) => c.status === 'granted');
  const revokedConsents = consents.filter((c) => c.status === 'revoked');

  const targetConsentObj = consents.find((c) => c.id === revokeTarget);

  const handleRevoke = () => {
    if (revokeTarget) {
      revokeConsent(revokeTarget);
      setRevokeTarget(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <KeyRound className="h-3.5 w-3.5" />
              DIGITAL PERSONAL DATA PROTECTION (DPDP) ACT 2023
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Citizen Consent & Data Governance Console
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              In accordance with Section 6 of the DPDP Act, you possess sovereign ownership over your personal data.
              Every inter-departmental query requires your explicit, purpose-bound, and revocable consent.
            </p>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <div className="rounded-2xl border border-[#D8C2AA]/30 bg-white/5 p-4 text-right backdrop-blur-md">
              <span className="block font-mono text-[10px] text-[#C58B55]">ACTIVE TOKEN GRANTS</span>
              <span className="font-display text-2xl font-bold text-[#FFF8ED]">{activeConsents.length} Encrypted Tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* DPDP Governance Principles Strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Purpose-Limitation Guarantee',
            desc: 'Tokens can ONLY be used for verifying scheme eligibility. Cross-purposing is architecturally blocked.',
            icon: Lock,
            pill: 'Strict Boundary',
          },
          {
            title: 'Granular Attribute Scoping',
            desc: 'Departments receive strictly the minimum fields required (e.g. income threshold, not full bank history).',
            icon: FileCheck,
            pill: 'Data Minimization',
          },
          {
            title: 'Instant Cryptographic Revocation',
            desc: 'Revoking consent invalidates the JWT authorization token at the gateway with zero delay.',
            icon: ShieldAlert,
            pill: 'Real-time Cut-off',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm hover:border-[#6F4028] transition-all">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5EBDD] text-[#6F4028] border border-[#D8C2AA]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-xs text-[#38241B]">{item.title}</h3>
                    <Badge variant="outline" className="border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028] text-[9px] font-bold">
                      {item.pill}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-[#755C49] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Consents */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#D8C2AA] pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#38241B]">
              Active Consent Authorizations ({activeConsents.length})
            </h2>
            <p className="text-xs text-[#755C49]">
              Department connectors authorized to perform automated verification on your behalf
            </p>
          </div>
          <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Cryptographically Bound via FusionGrid Gateway
          </span>
        </div>

        <div className="space-y-4">
          {activeConsents.map((consent, i) => {
            const Icon = departmentIcons[consent.department] ?? ShieldCheck;
            return (
              <Card
                key={consent.id}
                className="group border-[#D8C2AA] bg-[#FFF8ED] transition-all duration-200 hover:border-[#6F4028] hover:shadow-lg animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="h-1 w-full bg-gradient-to-r from-[#6F4028] via-[#C58B55] to-emerald-500" />
                <CardContent className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] border border-[#D8C2AA] group-hover:bg-[#6F4028] group-hover:text-[#FFF8ED] transition-colors shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-display text-base font-bold text-[#38241B]">
                            {consent.department}
                          </h3>
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold px-2 py-0.5">
                            Active Grant
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[10px] border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]">
                            Token ID: {consent.id.slice(0, 12)}…
                          </Badge>
                        </div>

                        <p className="text-xs text-[#755C49]">
                          <strong>Authorized Query Scope:</strong>{' '}
                          <span className="font-mono text-[#38241B] font-semibold bg-[#F5EBDD] px-2 py-0.5 rounded border border-[#D8C2AA]/60">
                            {consent.dataScope}
                          </span>
                        </p>

                        <p className="text-xs text-[#755C49]">
                          <strong>Stated Statutory Purpose:</strong> {consent.purpose}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-[#755C49] pt-1">
                          <span className="flex items-center gap-1 text-[#6F4028] font-semibold">
                            <Clock className="h-3 w-3" /> Granted on{' '}
                            {new Date(consent.requestedAt).toLocaleDateString('en-IN', {
                              dateStyle: 'medium',
                            })}
                          </span>
                          {consent.applicationId && (
                            <span>• Bound to App Ref: <strong className="text-[#38241B]">{consent.applicationId}</strong></span>
                          )}
                          <span>• Protocol: OAuth 2.0 Mutual TLS</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 border-t border-[#D8C2AA] pt-4 lg:border-t-0 lg:pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 hover:text-rose-900 font-bold shadow-xs"
                        onClick={() => setRevokeTarget(consent.id)}
                      >
                        <ShieldAlert className="h-3.5 w-3.5 mr-1 text-rose-600" />
                        Revoke Consent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {activeConsents.length === 0 && (
            <Card className="border-[#D8C2AA] bg-[#FFF8ED]">
              <CardContent className="py-16 text-center text-[#755C49]">
                <Lock className="mx-auto h-12 w-12 text-[#755C49]/40 mb-3" />
                <h4 className="font-bold text-[#38241B] text-base">No Active Consent Tokens</h4>
                <p className="text-xs text-[#755C49] max-w-md mx-auto mt-1">
                  When you apply for a state scheme or service, all requested data access permissions will appear here with full control to revoke anytime.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Revoked Consents Ledger */}
      {revokedConsents.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="border-b border-[#D8C2AA] pb-3">
            <h2 className="font-display text-base font-bold text-[#38241B]">
              Revocation Audit Ledger ({revokedConsents.length})
            </h2>
            <p className="text-xs text-[#755C49]">
              Permanent cryptographic log of terminated data access permissions
            </p>
          </div>

          <div className="space-y-3">
            {revokedConsents.map((consent) => (
              <Card key={consent.id} className="border-[#D8C2AA] bg-[#F5EBDD]/60 opacity-85">
                <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#38241B]">{consent.department}</span>
                      <Badge variant="outline" className="border-[#D8C2AA] bg-[#FFF8ED] text-[#755C49] text-[10px]">
                        Access Severed
                      </Badge>
                    </div>
                    <p className="text-[#755C49] mt-0.5">
                      Scope: {consent.dataScope} · Stated Purpose: {consent.purpose}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[11px] text-red-700 font-semibold block">
                      Gateway Route Terminated
                    </span>
                    <span className="text-[10px] text-[#755C49]">DPDP Audit Trace Logged</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Revocation Confirmation Dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="max-w-md rounded-3xl border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] p-6 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 text-red-700 mb-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700 border border-red-300">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-[#38241B]">
                  Revoke Departmental Consent?
                </DialogTitle>
                <DialogDescription className="text-xs text-[#755C49]">
                  Target: {targetConsentObj?.department ?? 'Department'}
                </DialogDescription>
              </div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 space-y-1.5 mt-3">
              <p className="font-semibold">Statutory Consequences of Revocation:</p>
              <p className="text-[11px] leading-relaxed">
                Revoking consent immediately halts the gateway connector from accessing your verified records.
                Any active scholarship or scheme application relying on this verification may be placed on temporary hold until re-authorized.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setRevokeTarget(null)}
              className="border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2] font-semibold"
            >
              Keep Consent Active
            </Button>
            <Button
              className="bg-red-700 hover:bg-red-800 text-white font-bold border-0 shadow-md"
              onClick={handleRevoke}
            >
              Confirm Immediate Revocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
