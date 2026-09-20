import {
  ShieldCheck, MapPin, Phone, Calendar, Home, GraduationCap,
  BookOpen, User, IdCard, CheckCircle2, AlertTriangle, Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';

export function CitizenProfile() {
  const { citizenProfile, user } = useApp();

  const fullName = citizenProfile?.full_name || user?.name || 'Citizen';
  const mobile = citizenProfile?.mobile || '—';
  const dob = citizenProfile?.dob || '—';
  const address = citizenProfile?.address || '—';
  const district = citizenProfile?.district || '—';
  const college = citizenProfile?.college || '—';
  const course = citizenProfile?.course || '—';
  const email = user?.email || '—';
  const citizenId = user?.id ? `${user.id.slice(0, 8)}…` : '—';

  const fields = [
    { label: 'Full Name', value: fullName, icon: User },
    { label: 'Email', value: email, icon: Mail },
    { label: 'Citizen ID', value: citizenId, icon: IdCard, mono: true },
    { label: 'Mobile Number', value: mobile ? `+91 ${mobile}` : '—', icon: Phone },
    { label: 'Date of Birth', value: dob !== '—' ? new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—', icon: Calendar },
    { label: 'Address', value: address, icon: Home },
    { label: 'District', value: district, icon: MapPin },
    { label: 'College', value: college, icon: GraduationCap },
    { label: 'Course', value: course, icon: BookOpen },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Citizen Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your verified information — used to pre-fill applications across services.
        </p>
      </div>

      {/* Profile header */}
      <Card className="mb-6 border-primary/10 animate-fade-in-up">
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-lg">
              {fullName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-bold">{fullName}</h2>
                {citizenProfile?.verified && (
                  <Badge variant="outline" className="gap-1.5 border-accent/30 bg-accent/10 text-accent">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{citizenId}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{district}, Maharashtra</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile fields */}
      <Card className="border-border/60 animate-fade-in-up delay-100">
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.label} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{field.label}</p>
                    <p className={`mt-0.5 text-sm font-medium ${field.mono ? 'font-mono' : ''}`}>{field.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Verification status */}
      <Card className="mt-6 border-accent/20 animate-fade-in-up delay-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-accent" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Identity Verification (Aadhaar)', status: 'Verified', date: '2026-01-15' },
              { label: 'Mobile Verification (OTP)', status: 'Verified', date: '2026-01-15' },
              { label: 'Address Verification', status: 'Verified', date: '2026-01-16' },
              { label: 'Education Records', status: 'Verified', date: '2026-02-20' },
              { label: 'Income Records (Revenue Dept.)', status: 'Verified', date: '2026-07-22' },
            ].map((v) => (
              <div key={v.label} className="flex items-center justify-between rounded-lg border bg-card p-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">{v.label}</p>
                    <p className="text-xs text-muted-foreground">Verified on {new Date(v.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                  {v.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prototype notice */}
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-xs text-amber-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        All profile data is fictional SIH prototype data. No real government records are connected.
      </div>
    </div>
  );
}
