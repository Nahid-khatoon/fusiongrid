import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MapPin,
  Phone,
  Calendar,
  Home,
  GraduationCap,
  BookOpen,
  User,
  IdCard,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Fingerprint,
  Copy,
  Check,
  ExternalLink,
  Shield,
  FileCheck,
  Building2,
  Lock,
  Sparkles,
  Trash2,
  Plus,
  Loader2,
  Cpu,
  Key,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import {
  checkWebAuthnSupport,
  registerBiometricPasskey,
  listUserPasskeys,
  deletePasskey,
  type PasskeyRecord,
  type WebAuthnSupportStatus,
} from '@/lib/webauthnService';
import { cn } from '@/lib/utils';

export function CitizenProfile() {
  const { citizenProfile, user } = useApp();
  const [copiedId, setCopiedId] = useState(false);

  // WebAuthn Passkeys State
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [webAuthnSupport, setWebAuthnSupport] = useState<WebAuthnSupportStatus | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const userId = user?.id || '';

  const refreshPasskeys = () => {
    if (userId) {
      const keys = listUserPasskeys(userId);
      setPasskeys(keys);
    }
  };

  useEffect(() => {
    checkWebAuthnSupport().then((status) => {
      setWebAuthnSupport(status);
    });
    refreshPasskeys();
  }, [userId]);

  const handleEnrollDevice = async () => {
    if (!userId) {
      setEnrollError('User session required to enroll biometric passkey.');
      return;
    }
    setEnrolling(true);
    setEnrollError(null);
    setEnrollSuccess(null);

    const res = await registerBiometricPasskey({
      userId,
      userEmail: user?.email || `${userId}@citizen.fusiongrid.gov.in`,
      userDisplayName: citizenProfile?.full_name || user?.name || 'Verified Citizen',
      userRole: 'citizen',
    });

    setEnrolling(false);

    if (!res.success) {
      setEnrollError(res.error || 'Failed to enroll device passkey.');
      return;
    }

    setEnrollSuccess(`Device successfully registered with ${webAuthnSupport?.platformName || 'Windows Hello'}! You can now use biometric sign-in.`);
    refreshPasskeys();
    setTimeout(() => setEnrollSuccess(null), 5000);
  };

  const handleDeletePasskey = async (credentialId: string) => {
    await deletePasskey(credentialId);
    refreshPasskeys();
  };

  const fullName = citizenProfile?.full_name || user?.name || 'Information not available';
  const mobile = citizenProfile?.mobile || 'Information not available';
  const dob = citizenProfile?.dob || 'Information not available';
  const address = citizenProfile?.address || 'Information not available';
  const district = citizenProfile?.district || 'Information not available';
  const college = citizenProfile?.college || 'Information not available';
  const course = citizenProfile?.course || 'Information not available';
  const email = user?.email || 'Information not available';
  const fullCitizenId = user?.id || 'Information not available';
  const shortCitizenId = fullCitizenId !== 'Information not available' ? `${fullCitizenId.slice(0, 14)}…` : 'Information not available';

  const copyToClipboard = () => {
    if (fullCitizenId !== 'Information not available') {
      navigator.clipboard.writeText(fullCitizenId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const fields = [
    { label: 'Full Legal Name', value: fullName, icon: User, source: 'UIDAI e-KYC' },
    { label: 'Registered Email', value: email, icon: Mail, source: 'SSO Federated Auth' },
    { label: 'Digital Citizen ID', value: fullCitizenId, icon: IdCard, mono: true, source: 'FusionGrid Registry' },
    { label: 'Mobile Number', value: mobile !== 'Information not available' ? `+91 ${mobile}` : 'Information not available', icon: Phone, source: 'Telecom KYC' },
    {
      label: 'Date of Birth',
      value:
        dob !== 'Information not available' && !isNaN(new Date(dob).getTime())
          ? new Date(dob).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          : 'Information not available',
      icon: Calendar,
      source: 'Civil Registration',
    },
    { label: 'Residential Address', value: address, icon: Home, source: 'Land & Revenue Records' },
    { label: 'State District', value: district !== 'Information not available' ? `${district}, Maharashtra` : 'Information not available', icon: MapPin, source: 'Jurisdiction Master' },
    { label: 'Academic Institution', value: college, icon: GraduationCap, source: 'AISHE Directory' },
    { label: 'Degree / Program', value: course, icon: BookOpen, source: 'Academic Bank of Credits' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-6">
            <div className="relative flex h-22 w-22 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6F4028] to-[#4A2E22] text-3xl font-extrabold text-[#FFF8ED] shadow-xl border-2 border-[#C58B55]/50">
              {fullName.charAt(0)}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                <span className={cn(
                  "relative inline-flex h-5 w-5 rounded-full ring-2 ring-[#2B1B14] items-center justify-center text-[10px] text-white",
                  citizenProfile?.verified ? "bg-emerald-500" : "bg-amber-500"
                )}>
                  {citizenProfile?.verified ? "✓" : "!"}
                </span>
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold text-[#FFF8ED] sm:text-3xl">
                  {fullName}
                </h1>
                <Badge className={cn(
                  "text-xs font-semibold px-2.5 py-0.5 border",
                  citizenProfile?.verified
                    ? "bg-[#C58B55]/25 text-[#C58B55] border-[#C58B55]/50"
                    : "bg-amber-500/20 text-amber-200 border-amber-500/40"
                )}>
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                  {citizenProfile?.verified ? "Verified Citizen Record" : "Verification pending"}
                </Badge>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-[#D8C2AA]">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 hover:text-[#C58B55] transition-colors"
                  title="Click to copy ID"
                >
                  <span>Citizen ID: <strong className="text-[#FFF8ED]">{shortCitizenId}</strong></span>
                  {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <span>•</span>
                <span>Jurisdiction: <strong className="text-[#FFF8ED]">{district} Division</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Active Sovereign Token</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
            <div className="rounded-xl border border-[#D8C2AA]/30 bg-white/5 px-4 py-2 backdrop-blur-md text-right">
              <span className="block font-mono text-[10px] text-[#C58B55] uppercase tracking-wider">CANONICAL PROFILE STATE</span>
              <span className="font-semibold text-xs text-[#FFF8ED] flex items-center gap-1.5 justify-end">
                <Sparkles className="h-3.5 w-3.5 text-[#C58B55]" />
                Zero-Redundancy Synchronization
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Interoperability Ribbon */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Unified Master Identity',
            desc: 'Validated against UIDAI Aadhaar Vault & MahaDBT Master Database',
            icon: Fingerprint,
            badge: 'e-KYC Linked',
          },
          {
            title: 'DPDP Consent Guaranteed',
            desc: 'Your data is only accessed with cryptographic, time-bound consent tokens',
            icon: Lock,
            badge: 'Sec. 6 Enforced',
          },
          {
            title: 'Single Source of Truth',
            desc: 'Income, Caste, and Academic credentials automatically pre-fill scheme forms',
            icon: Building2,
            badge: '5 Nodal Connectors',
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
                      {item.badge}
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

      {/* Canonical Identity Fields */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#38241B]">
                Canonical Identity Data Attributes
              </CardTitle>
              <CardDescription className="text-xs text-[#755C49]">
                These standardized attributes automatically populate scheme forms across all state departments
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto">
              ✓ Validated Data Mesh
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div
                  key={field.label}
                  className="group flex flex-col justify-between rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-4 transition-all hover:border-[#6F4028] hover:shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EBDD] text-[#6F4028] group-hover:bg-[#6F4028] group-hover:text-[#FFF8ED] transition-colors border border-[#D8C2AA]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#755C49]">
                          {field.label}
                        </p>
                      </div>
                      <p className={`mt-1 text-xs font-bold text-[#38241B] truncate ${field.mono ? 'font-mono' : ''}`}>
                        {field.value}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#D8C2AA]/50 pt-2 text-[10px] text-[#755C49]">
                    <span>Source: <strong className="text-[#6F4028]">{field.source}</strong></span>
                    <span className="text-emerald-700 font-semibold">Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Inter-Departmental Attestation Badges */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-[#38241B]">
            <ShieldCheck className="h-5 w-5 text-[#6F4028]" />
            Departmental Credential Attestation Records
          </CardTitle>
          <CardDescription className="text-xs text-[#755C49]">
            Cryptographic proof certificates issued by participating government nodes for this citizen
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                dept: 'Unique Identification Authority of India (UIDAI)',
                service: 'Biometric Aadhaar e-KYC Verification',
                protocol: 'SHA-256 HMAC Token Bound',
                validity: 'Valid through 2027',
                status: 'Attested',
              },
              {
                dept: 'Department of Revenue & Land Records',
                service: 'Annual Family Income Verification (Mahabhulekh)',
                protocol: 'Digital Signature XML-DSig',
                validity: 'FY 2025-2026 Certified',
                status: 'Attested',
              },
              {
                dept: 'Directorate of Higher & Technical Education',
                service: 'Academic Bank of Credits (ABC) & Bonafide Enrollment',
                protocol: 'DigiLocker DocRef Validated',
                validity: 'Academic Year 2025-26',
                status: 'Attested',
              },
              {
                dept: 'National Health Authority (ABHA Registry)',
                service: 'Ayushman Bharat Digital Mission Citizen ID',
                protocol: 'FHIR JSON-LD Signed Payload',
                validity: 'Lifetime Sovereign ID',
                status: 'Attested',
              },
            ].map((v) => (
              <div
                key={v.dept}
                className="flex items-start justify-between rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-4 transition-all hover:border-[#6F4028] hover:shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#38241B]">{v.dept}</h4>
                    <p className="mt-0.5 text-[11px] text-[#755C49]">{v.service}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#6F4028]">
                      <span>{v.protocol}</span>
                      <span>•</span>
                      <span className="text-[#755C49]">{v.validity}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {v.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Device Passkeys & Biometric Security Management ── */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-[#38241B]">
                <Fingerprint className="h-5 w-5 text-[#6F4028]" />
                Device Passkeys & Biometric Security (WebAuthn / FIDO2)
              </CardTitle>
              <CardDescription className="text-xs text-[#755C49]">
                Enable fast passwordless login bound to your device hardware security module (Windows Hello, Touch ID, Face ID)
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 text-xs font-bold">
                ✓ {webAuthnSupport?.platformName || 'Platform Authenticator'} Ready
              </Badge>
              <Badge variant="outline" className="border-[#C58B55] bg-[#FFF8ED] text-[#6F4028] text-xs font-bold">
                Zero Biometric Storage
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Action Ribbon */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#D8C2AA] bg-[#F5EBDD] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#38241B] flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-[#C58B55]" />
                <span>{webAuthnSupport?.platformName || 'Windows Hello / Hardware Enclave'}</span>
              </h4>
              <p className="text-[11px] text-[#755C49] leading-relaxed max-w-xl">
                Register your device hardware token to sign into FusionGrid using Windows Hello, fingerprint sensor, or device PIN without entering passwords.
              </p>
            </div>
            <Button
              onClick={handleEnrollDevice}
              disabled={enrolling}
              className="gap-2 bg-[#6F4028] hover:bg-[#805236] text-[#FFF8ED] font-bold text-xs shrink-0 shadow-sm"
            >
              {enrolling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {enrolling ? 'Enrolling Device…' : `Enroll This Device (${webAuthnSupport?.platformName || 'Windows Hello'})`}
            </Button>
          </div>

          {/* Feedback Notices */}
          {enrollSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs text-emerald-900 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{enrollSuccess}</span>
            </div>
          )}

          {enrollError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900 animate-fade-in">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{enrollError}</span>
            </div>
          )}

          {/* Enrolled Passkeys List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#755C49]">
              Enrolled Passkey Credentials ({passkeys.length})
            </h4>

            {passkeys.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {passkeys.map((pk) => (
                  <div
                    key={pk.credentialId}
                    className="flex flex-col justify-between rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-4 transition-all hover:border-[#6F4028] hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EBDD] text-[#6F4028] border border-[#D8C2AA]">
                          <Fingerprint className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-[#38241B]">{pk.deviceName}</h5>
                          <p className="mt-0.5 font-mono text-[10px] text-[#755C49]">
                            Credential: {pk.credentialId.slice(0, 18)}…
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#755C49]">
                            <span>Enrolled: {new Date(pk.createdAt).toLocaleDateString('en-IN')}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">Active Token</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePasskey(pk.credentialId)}
                        className="text-rose-600 hover:text-rose-800 hover:bg-rose-100/50 p-2 h-8 w-8"
                        title="Revoke this device passkey"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D8C2AA] bg-[#F5EBDD]/60 p-6 text-center">
                <Fingerprint className="mx-auto h-8 w-8 text-[#C58B55] opacity-80 mb-2" />
                <h5 className="font-bold text-xs text-[#38241B]">No Device Passkeys Enrolled</h5>
                <p className="mt-1 text-[11px] text-[#755C49] max-w-md mx-auto leading-relaxed">
                  You have not registered a device passkey yet. Click "Enroll This Device" above to enable biometric sign-in with Windows Hello or Touch ID.
                </p>
              </div>
            )}
          </div>

          {/* DPDP Act 2023 Biometric Security & Consent Disclosure */}
          <div className="rounded-xl border border-[#C58B55]/30 bg-[#C58B55]/10 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#6F4028]">
              <ShieldCheck className="h-4 w-4 text-[#C58B55]" />
              <span>Digital Personal Data Protection Act (DPDP) 2023 Compliance</span>
            </div>
            <p className="text-[11px] text-[#38241B] leading-relaxed">
              <strong>Zero Biometric Retention:</strong> Your physical biometric scans (fingerprints, facial geometry) are processed entirely inside your local device's hardware TPM 2.0 or Apple Secure Enclave. State servers, Supabase, and FusionGrid never receive, store, or process raw biometric data. Only asymmetric public-key challenge signatures are utilized.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prototype Notice */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-[#C58B55]/50 bg-[#C58B55]/10 px-5 py-3.5 text-xs text-[#38241B]">
        <AlertTriangle className="h-4 w-4 shrink-0 text-[#C58B55]" />
        <span>
          <strong>SIH 2026 Sandbox Environment:</strong> All biometric and demographic credentials displayed above are simulated mock records for demonstration of state interoperability.
        </span>
      </div>
    </div>
  );
}
