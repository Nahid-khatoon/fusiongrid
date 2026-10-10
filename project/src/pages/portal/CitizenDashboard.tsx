import {
  FileText,
  CheckCircle2,
  Clock,
  Bell,
  ArrowRight,
  MapPin,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Lock,
  FolderLock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';

interface DashboardProps {
  navigate: (to: string) => void;
}

export function CitizenDashboard({ navigate }: DashboardProps) {
  const { applications, notifications, unreadCount, citizenProfile, user } = useApp();

  const citizenName = citizenProfile?.full_name || user?.name || 'Citizen';
  const citizenId = user?.id ? `${user.id.slice(0, 10)}…` : 'Information not available';
  const district = citizenProfile?.district || 'Information not available';

  // Exclude draft records from the active dashboard
  const submittedApplications = applications.filter((app) => app.status !== 'draft');

  const activeCount = submittedApplications.filter(
    (a) =>
      a.status === 'under_verification' ||
      a.status === 'processing' ||
      a.status === 'submitted'
  ).length;

  const completedCount = submittedApplications.filter((a) => a.status === 'approved').length;

  const pendingActions = notifications.filter((n) => n.type === 'action' && !n.read).length;

  const metrics = [
    {
      label: 'Active Applications',
      value: activeCount,
      icon: FileText,
      pill: 'Live In-Flight',
      borderAccent: 'border-t-[#6F4028]',
      color: 'text-[#6F4028] bg-[#F5EBDD] border-[#D8C2AA]',
    },
    {
      label: 'Approved & Certified',
      value: completedCount,
      icon: CheckCircle2,
      pill: '100% Verified',
      borderAccent: 'border-t-emerald-600',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Pending Actions',
      value: pendingActions,
      icon: Clock,
      pill: pendingActions > 0 ? 'Urgent Response' : 'Zero Delay',
      borderAccent: 'border-t-[#C58B55]',
      color: 'text-[#C58B55] bg-[#FFF8ED] border-[#D8C2AA]',
    },
    {
      label: 'Security & Alerts',
      value: unreadCount,
      icon: Bell,
      pill: 'DPDP Logged',
      borderAccent: 'border-t-[#38241B]',
      color: 'text-[#38241B] bg-[#EAD8C2] border-[#D8C2AA]',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#4A2E22] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-6 sm:p-8 text-[#FFF9F0] shadow-luxury-lg">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 hero-grid-pattern opacity-15" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#FFF9F0]/10 px-3.5 py-1 text-xs font-bold text-[#FFF9F0] mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#C58B55]" />
              Citizen Sovereign Control Center
            </div>
            <h1 className="font-display text-2xl font-black tracking-tight text-[#FFF9F0] sm:text-3xl">
              Welcome back, {citizenProfile?.full_name ? citizenProfile.full_name.split(' ')[0] : user?.name || 'Citizen'}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#E8D5BF]">
              <span className="font-mono bg-[#21140F] px-2.5 py-1 rounded-lg border border-[#4A2E22] text-[#FFF9F0] shadow-inner">
                ID: {citizenId}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#C58B55]" />
                {district !== 'Information not available' ? `${district}, Maharashtra` : 'District not set'}
              </span>
              <span className="flex items-center gap-1 text-[#FFF9F0] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C58B55]" />
                {citizenProfile?.verified ? 'DigiLocker & UIDAI Verified' : 'Verification pending'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate('/portal/services')}
              className="gap-2 bg-[#C58B55] hover:bg-[#b07844] text-[#2B1B14] shadow-luxury border-0 font-bold"
            >
              <FileText className="h-4 w-4" />
              Apply for Service
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/portal/vault')}
              className="gap-2 border-[#E8D5BF]/40 bg-[#FFF9F0]/10 text-[#FFF9F0] hover:bg-[#FFF9F0]/20 font-semibold"
            >
              <FolderLock className="h-4 w-4 text-[#C58B55]" />
              Document Vault
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/portal/consent')}
              className="gap-2 border-[#E8D5BF]/40 bg-[#FFF9F0]/10 text-[#FFF9F0] hover:bg-[#FFF9F0]/20 font-semibold"
            >
              <Lock className="h-4 w-4 text-[#C58B55]" />
              Manage Consents
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid with Luxury Border Accents & Status Pills */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.label}
              className={`rounded-2xl border border-[#E8D5BF] ${m.borderAccent} border-t-4 bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1 hover:border-[#6F4028] shadow-luxury animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-[#EAD8C2]/60 px-2.5 py-0.5 text-[10px] font-bold text-[#6F4028]">
                      {m.pill}
                    </span>
                    <p className="mt-2.5 font-display text-3xl font-black text-[#38241B]">
                      {m.value}
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#755C49]">
                      {m.label}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-xs ${m.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Applications + Quick Actions Columns */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Applications Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8C2AA] pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#38241B]">
                Your Service Applications
              </h2>
              <p className="text-xs text-[#755C49]">
                Real-time tracking of inter-departmental verification & approvals
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/portal/applications')}
              className="gap-1 text-xs text-[#6F4028] hover:bg-[#EAD8C2] font-semibold"
            >
              View All Applications
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3.5">
            {submittedApplications.map((app) => (
              <Card
                key={app.id}
                className="group cursor-pointer rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] transition-all duration-300 hover:border-[#6F4028] hover:shadow-luxury-lg hover:-translate-y-0.5 shadow-luxury"
                onClick={() => navigate(`/portal/applications/${app.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-bold text-[#38241B] group-hover:text-[#6F4028] transition-colors">
                          {app.serviceName}
                        </h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[#755C49]">
                        <span>App ID: {app.id}</span>
                        {app.requestId && <span>• Req: {app.requestId}</span>}
                        {app.submittedAt && <span>• Submitted: {app.submittedAt}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center gap-2 w-32 sm:w-28">
                        <Progress value={app.progress} className="h-2 flex-1 bg-[#E8D5BF]" />
                        <span className="font-mono text-xs font-bold text-[#38241B]">
                          {app.progress}%
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-[#6F4028] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Track Details <ArrowRight className="h-3 w-3 text-[#C58B55]" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {submittedApplications.length === 0 && (
              <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury">
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-[#755C49]/40" />
                  <h4 className="mt-3 font-bold text-[#38241B] text-sm">
                    No Submitted Applications Yet
                  </h4>
                  <p className="mt-1 text-xs text-[#755C49] max-w-sm mx-auto">
                    Ready to apply? Choose a state government service to experience automated
                    cross-department verification.
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 gap-2 bg-[#6F4028] hover:bg-[#805236] text-[#FFF9F0] border-0 shadow-luxury font-semibold"
                    onClick={() => navigate('/portal/services')}
                  >
                    Browse Services
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-5">
          {/* Recent Alerts Card */}
          <Card className="rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] shadow-luxury">
            <CardHeader className="pb-3 border-b border-[#E8D5BF]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#38241B]">
                  <Bell className="h-4 w-4 text-[#6F4028]" />
                  Recent Alerts
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/portal/notifications')}
                  className="text-xs h-7 px-2 text-[#6F4028] hover:bg-[#E8D5BF]/40 font-semibold"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-2.5">
                  <div
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.read ? 'bg-[#D8C2AA]' : 'bg-[#6F4028] ring-2 ring-[#C58B55] animate-pulse'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#38241B]">{n.title}</p>
                    <p className="truncate text-[10px] text-[#755C49] mt-0.5">{n.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sovereign Citizen ROI & Interoperability Score Widget */}
          <div className="rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#FFF9F0] via-[#FAF3E8] to-[#F5EBDD] p-6 shadow-luxury">
            <div className="flex items-center justify-between border-b border-[#E8D5BF] pb-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6F4028] text-[#FFF9F0] shadow-xs">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-[#38241B]">Sovereign Citizen ROI</h3>
                  <p className="text-[10px] text-[#755C49]">Interoperability Dividends</p>
                </div>
              </div>
              <span className="rounded-full bg-[#EAD8C2] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#6F4028]">
                98% Frictionless
              </span>
            </div>

            {/* Score Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#38241B]">Cross-Agency Efficiency</span>
                <span className="font-mono text-[#6F4028]">98 / 100</span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-[#E8D5BF] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#6F4028] to-[#C58B55] w-[98%]" />
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl border border-[#E8D5BF] bg-[#FFF9F0] p-2.5 text-xs">
                <span className="flex items-center gap-2 text-[#755C49]">
                  <Clock className="h-3.5 w-3.5 text-[#6F4028]" />
                  Processing Time Saved
                </span>
                <span className="font-mono font-bold text-[#38241B]">12 Est. Days</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#E8D5BF] bg-[#FFF9F0] p-2.5 text-xs">
                <span className="flex items-center gap-2 text-[#755C49]">
                  <MapPin className="h-3.5 w-3.5 text-[#C58B55]" />
                  Physical Visits Avoided
                </span>
                <span className="font-mono font-bold text-[#38241B]">3 Trips</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#E8D5BF] bg-[#FFF9F0] p-2.5 text-xs">
                <span className="flex items-center gap-2 text-[#755C49]">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  DigiLocker Reused Docs
                </span>
                <span className="font-mono font-bold text-[#38241B]">4 Records</span>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#E8D5BF] flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 px-0 text-xs font-bold text-[#6F4028] hover:bg-transparent hover:text-[#805236]"
                onClick={() => navigate('/portal/history')}
              >
                Inspect Audit Ledger
                <ArrowRight className="h-3.5 w-3.5 text-[#C58B55]" />
              </Button>
              <Button
                size="sm"
                className="h-7 text-[11px] bg-[#6F4028] hover:bg-[#805236] text-[#FFF9F0] border-0 shadow-xs font-semibold px-2.5"
                onClick={() => navigate('/portal/services')}
              >
                Apply More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
