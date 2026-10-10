import { AppProvider, useApp } from '@/context/AppContext';
import { useHashRoute, parseRoute } from '@/hooks/useHashRoute';
import { PublicHeader } from '@/components/shared/PublicHeader';
import { PublicFooter } from '@/components/shared/PublicFooter';
import { PortalLayout } from '@/components/shared/PortalLayout';
import { OfficerLayout } from '@/components/shared/OfficerLayout';
import { AdminLayout } from '@/components/shared/AdminLayout';
import { LandingPage } from '@/pages/public/LandingPage';
import { AboutPage } from '@/pages/public/AboutPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { ServicesPage } from '@/pages/public/ServicesPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { CitizenDashboard } from '@/pages/portal/CitizenDashboard';
import { CitizenProfile } from '@/pages/portal/CitizenProfile';
import { PortalServices } from '@/pages/portal/PortalServices';
import { ApplicationsList } from '@/pages/portal/ApplicationsList';
import { ApplicationDetail } from '@/pages/portal/ApplicationDetail';
import { ApplyFlow } from '@/pages/portal/ApplyFlow';
import { ConsentManagement } from '@/pages/portal/ConsentManagement';
import { DocumentVault } from '@/pages/portal/DocumentVault';
import { NotificationsPage } from '@/pages/portal/NotificationsPage';
import { HistoryPage } from '@/pages/portal/HistoryPage';
import { OfficerDashboard } from '@/pages/officer/OfficerDashboard';
import { ApplicationQueue } from '@/pages/officer/ApplicationQueue';
import { ApplicationReview } from '@/pages/officer/ApplicationReview';
import { VerificationCenter } from '@/pages/officer/VerificationCenter';
import { SlaMonitoring } from '@/pages/officer/SlaMonitoring';
import { WorkflowMonitor } from '@/pages/officer/WorkflowMonitor';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { OfficerManagement } from '@/pages/admin/OfficerManagement';
import { DepartmentIntegrations } from '@/pages/admin/DepartmentIntegrations';
import { ApiGatewayMonitor } from '@/pages/admin/ApiGatewayMonitor';
import { DataQuality } from '@/pages/admin/DataQuality';
import { AuditLogs } from '@/pages/admin/AuditLogs';
import { SystemHealth } from '@/pages/admin/SystemHealth';
import { Analytics } from '@/pages/admin/Analytics';
import { SystemConnectors } from '@/pages/admin/SystemConnectors';
import { DataStandards } from '@/pages/admin/DataStandards';
import { EventStream } from '@/pages/admin/EventStream';
import { ArchitecturePage } from '@/pages/public/ArchitecturePage';

import { ShieldAlert, Lock, ArrowRight, Fingerprint } from 'lucide-react';
import { FusionGridLogo } from '@/components/shared/FusionGridLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { officerService } from '@/lib/officerService';

function AppContent() {
  const { route, navigate } = useHashRoute();
  const { user, session, logout, authLoading } = useApp();
  const { path, segments } = parseRoute(route);

  const isPortalRoute = path.startsWith('/portal');
  const isOfficerRoute = path.startsWith('/officer');
  const isAdminRoute = path.startsWith('/admin');
  const isProtectedRoute = isPortalRoute || isOfficerRoute || isAdminRoute;

  // Show loading while restoring session
  if (authLoading && isProtectedRoute) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5EBDD] text-[#38241B] hero-mesh-cream relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hero-grid-pattern opacity-40" />
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-4">
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-[#C58B55]/20 blur-xl animate-pulse" />
            <FusionGridLogo size="lg" variant="auto" />
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-[#D8C2AA] bg-[#FFF8ED] px-4 py-1.5 text-xs text-[#6F4028] font-bold shadow-sm mb-3">
            <div className="h-2 w-2 rounded-full bg-[#C58B55] animate-ping" />
            <span>Establishing Secure Sovereign Session</span>
          </div>
          <p className="text-xs text-[#755C49]">
            Validating cryptographic session credentials with Supabase Auth...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5EBDD]">
        <PublicHeader currentPath={path} navigate={navigate} />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md border-[#D8C2AA] bg-[#FFF8ED] shadow-xl overflow-hidden relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-[#38241B] via-[#6F4028] to-[#C58B55]" />
            <CardContent className="p-8 text-center space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6F4028]/10 text-[#6F4028] border border-[#D8C2AA] shadow-sm">
                <Lock className="h-7 w-7 text-[#6F4028]" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-display text-xl font-bold text-[#38241B]">
                  Authentication Required
                </h2>
                <p className="text-xs text-[#755C49] leading-relaxed">
                  You are attempting to access a secured government portal. Please sign in with your verified credentials or select a demonstration role to proceed.
                </p>
              </div>

              <div className="rounded-xl border border-[#D8C2AA] bg-[#F5EBDD] p-3.5 text-left text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#38241B] font-bold">
                  <ShieldAlert className="h-4 w-4 text-[#6F4028]" />
                  <span>Role-Based Access Control</span>
                </div>
                <p className="text-[#755C49] text-[11px] leading-relaxed">
                  Citizens access scholarship & scheme portals. Officers review applications. Administrators access telemetry and data pipelines.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full gap-2 bg-[#6F4028] text-[#FFF8ED] hover:bg-[#805236] font-bold shadow-md shadow-[#6F4028]/20"
                >
                  <span>Proceed to Secure Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="w-full text-xs text-[#755C49] hover:text-[#38241B] hover:bg-[#EAD8C2]"
                >
                  Return to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <PublicFooter navigate={navigate} />
      </div>
    );
  }

  // ── Strict Server-Enforced Gates on Protected Routes ──
  if (isProtectedRoute && user) {
    // 1. Mandatory Biometric Gate: Block direct URL and dashboard access if passkey verification is incomplete
    if (session && session.authStage !== 'fully_authorized') {
      return (
        <div className="flex min-h-screen flex-col bg-[#F5EBDD]">
          <PublicHeader currentPath={path} navigate={navigate} />
          <main className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md border-[#C58B55] bg-[#FFF8ED] shadow-xl overflow-hidden relative">
              <div className="h-1.5 w-full bg-[#C58B55]" />
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C58B55]/15 text-[#6F4028] border border-[#D8C2AA]">
                  <Fingerprint className="h-7 w-7 text-[#C58B55]" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#38241B]">
                  Biometric Verification Required
                </h2>
                <p className="text-xs text-[#755C49] leading-relaxed">
                  Your session for <strong>{user.name}</strong> ({user.role.toUpperCase()}) requires mandatory WebAuthn device passkey verification. Password authentication alone is strictly insufficient to access protected government dashboards.
                </p>
                <div className="rounded-xl border border-[#D8C2AA] bg-[#F5EBDD] p-3 text-left text-xs space-y-1">
                  <div className="font-bold text-[#38241B]">Security Stage:</div>
                  <div className="font-mono text-[11px] text-[#755C49]">
                    authStage = <span className="text-amber-800 font-bold">{session.authStage}</span> (Awaiting passkey_verified)
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-[#6F4028] text-[#FFF8ED] hover:bg-[#805236] font-bold"
                  >
                    Complete Biometric Verification
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={logout}
                    className="w-full text-xs text-[#755C49] hover:text-[#38241B]"
                  >
                    Sign Out & Return
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
          <PublicFooter navigate={navigate} />
        </div>
      );
    }

    // 2. Deactivated Officer Gate: Block revoked officers even if they attempt direct URL access
    if (user.role === 'officer') {
      const officerCheck = officerService.checkOfficerActive(user.email || user.id);
      if (officerCheck.exists && !officerCheck.isActive) {
        return (
          <div className="flex min-h-screen flex-col bg-[#F5EBDD]">
            <PublicHeader currentPath={path} navigate={navigate} />
            <main className="flex flex-1 items-center justify-center p-4">
              <Card className="w-full max-w-md border-rose-300 bg-[#FFF8ED] shadow-xl overflow-hidden relative">
                <div className="h-1.5 w-full bg-rose-600" />
                <CardContent className="p-8 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 border border-rose-300">
                    <ShieldAlert className="h-7 w-7 text-rose-600" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#38241B]">
                    Officer Access Revoked
                  </h2>
                  <p className="text-xs text-[#755C49] leading-relaxed">
                    Access Denied: Officer account "{officerCheck.officer?.full_name || user.name}" ({officerCheck.officer?.employee_id || ''}) has been deactivated by Administrator <strong>Nahid Shams</strong>. Access to all officer operations is strictly blocked.
                  </p>
                  <Button
                    onClick={logout}
                    className="w-full bg-[#6F4028] text-[#FFF9F0] hover:bg-[#583320] font-bold"
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </main>
            <PublicFooter navigate={navigate} />
          </div>
        );
      }
    }
  }

  // Admin routes
  if (isAdminRoute && user) {
    if (user.role !== 'admin') {
      return (
        <div className="flex min-h-screen flex-col bg-[#F5EBDD]">
          <PublicHeader currentPath={path} navigate={navigate} />
          <main className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md border-rose-300 bg-[#FFF8ED] shadow-xl overflow-hidden relative">
              <div className="h-1.5 w-full bg-rose-600" />
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 border border-rose-300">
                  <ShieldAlert className="h-7 w-7 text-rose-600" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#38241B]">
                  Access Restricted to Administrator
                </h2>
                <p className="text-xs text-[#755C49] leading-relaxed">
                  Administrative control panels and officer management are strictly restricted to authorized Administrator <strong className="text-[#38241B]">Nahid Shams</strong>.
                </p>
                <Button
                  onClick={() => navigate(user.role === 'officer' ? '/officer/dashboard' : '/portal/dashboard')}
                  className="w-full bg-[#6F4028] text-[#FFF9F0] hover:bg-[#583320] font-bold"
                >
                  Return to Authorized Portal
                </Button>
              </CardContent>
            </Card>
          </main>
          <PublicFooter navigate={navigate} />
        </div>
      );
    }

    let adminContent: React.ReactNode;
    if (segments[1] === 'dashboard') adminContent = <AdminDashboard navigate={navigate} />;
    else if (segments[1] === 'officers') adminContent = <OfficerManagement navigate={navigate} />;
    else if (segments[1] === 'integrations') adminContent = <DepartmentIntegrations navigate={navigate} />;
    else if (segments[1] === 'api-monitor') adminContent = <ApiGatewayMonitor navigate={navigate} />;
    else if (segments[1] === 'data-quality') adminContent = <DataQuality navigate={navigate} />;
    else if (segments[1] === 'audit') adminContent = <AuditLogs navigate={navigate} />;
    else if (segments[1] === 'system-health') adminContent = <SystemHealth navigate={navigate} />;
    else if (segments[1] === 'analytics') adminContent = <Analytics navigate={navigate} />;
    else if (segments[1] === 'connectors') adminContent = <SystemConnectors navigate={navigate} />;
    else if (segments[1] === 'data-standards') adminContent = <DataStandards navigate={navigate} />;
    else if (segments[1] === 'event-stream') adminContent = <EventStream navigate={navigate} />;
    else adminContent = <AdminDashboard navigate={navigate} />;

    return (
      <AdminLayout currentPath={path} navigate={navigate}>
        {adminContent}
      </AdminLayout>
    );
  }

  // Officer routes
  if (isOfficerRoute && user) {
    if (user.role !== 'officer' && user.role !== 'admin') {
      return (
        <div className="flex min-h-screen flex-col bg-[#F5EBDD]">
          <PublicHeader currentPath={path} navigate={navigate} />
          <main className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md border-rose-300 bg-[#FFF8ED] shadow-xl overflow-hidden relative">
              <div className="h-1.5 w-full bg-rose-600" />
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 border border-rose-300">
                  <ShieldAlert className="h-7 w-7 text-rose-600" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#38241B]">
                  Officer Credentials Required
                </h2>
                <p className="text-xs text-[#755C49] leading-relaxed">
                  The Officer Console is strictly restricted to government verification officers authorized by Administrator Nahid Shams.
                </p>
                <Button
                  onClick={() => navigate('/portal/dashboard')}
                  className="w-full bg-[#6F4028] text-[#FFF9F0] hover:bg-[#583320] font-bold"
                >
                  Return to Citizen Portal
                </Button>
              </CardContent>
            </Card>
          </main>
          <PublicFooter navigate={navigate} />
        </div>
      );
    }

    let officerContent: React.ReactNode;
    if (segments[1] === 'dashboard') officerContent = <OfficerDashboard navigate={navigate} />;
    else if (segments[1] === 'queue') officerContent = <ApplicationQueue navigate={navigate} />;
    else if (segments[1] === 'review' && segments[2])
      officerContent = <ApplicationReview applicationId={segments[2]} navigate={navigate} />;
    else if (segments[1] === 'review')
      officerContent = <ApplicationQueue navigate={navigate} />;
    else if (segments[1] === 'verification') officerContent = <VerificationCenter navigate={navigate} />;
    else if (segments[1] === 'sla') officerContent = <SlaMonitoring navigate={navigate} />;
    else if (segments[1] === 'workflow') officerContent = <WorkflowMonitor navigate={navigate} />;
    else officerContent = <OfficerDashboard navigate={navigate} />;

    return (
      <OfficerLayout currentPath={path} navigate={navigate}>
        {officerContent}
      </OfficerLayout>
    );
  }

  // Citizen portal routes
  if (isPortalRoute && user) {
    if (user.role === 'officer') {
      return (
        <div className="flex min-h-screen flex-col bg-[#F5EBDD]">
          <PublicHeader currentPath={path} navigate={navigate} />
          <main className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md border-[#D8C2AA] bg-[#FFF8ED] shadow-xl overflow-hidden relative">
              <div className="h-1.5 w-full bg-[#6F4028]" />
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6F4028]/10 text-[#6F4028] border border-[#D8C2AA]">
                  <ShieldAlert className="h-7 w-7 text-[#6F4028]" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#38241B]">
                  Officer Console Active
                </h2>
                <p className="text-xs text-[#755C49] leading-relaxed">
                  You are authenticated with officer privileges. Citizen self-service portal is restricted to citizens.
                </p>
                <Button
                  onClick={() => navigate('/officer/dashboard')}
                  className="w-full bg-[#6F4028] text-[#FFF9F0] hover:bg-[#583320] font-bold"
                >
                  Proceed to Officer Dashboard
                </Button>
              </CardContent>
            </Card>
          </main>
          <PublicFooter navigate={navigate} />
        </div>
      );
    }

    if (user.role === 'admin') {
      return (
        <div className="flex min-h-screen flex-col bg-[#F5EBDD]">
          <PublicHeader currentPath={path} navigate={navigate} />
          <main className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md border-[#D8C2AA] bg-[#FFF8ED] shadow-xl overflow-hidden relative">
              <div className="h-1.5 w-full bg-[#6F4028]" />
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6F4028]/10 text-[#6F4028] border border-[#D8C2AA]">
                  <ShieldAlert className="h-7 w-7 text-[#6F4028]" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#38241B]">
                  Admin Session Active
                </h2>
                <p className="text-xs text-[#755C49] leading-relaxed">
                  You are authenticated as Root Administrator Nahid Shams.
                </p>
                <Button
                  onClick={() => navigate('/admin/dashboard')}
                  className="w-full bg-[#6F4028] text-[#FFF9F0] hover:bg-[#583320] font-bold"
                >
                  Proceed to Admin Dashboard
                </Button>
              </CardContent>
            </Card>
          </main>
          <PublicFooter navigate={navigate} />
        </div>
      );
    }

    let portalContent: React.ReactNode;
    if (segments[1] === 'dashboard') portalContent = <CitizenDashboard navigate={navigate} />;
    else if (segments[1] === 'profile') portalContent = <CitizenProfile />;
    else if (segments[1] === 'services') portalContent = <PortalServices navigate={navigate} />;
    else if (segments[1] === 'applications' && segments[2])
      portalContent = <ApplicationDetail applicationId={segments[2]} navigate={navigate} />;
    else if (segments[1] === 'applications') portalContent = <ApplicationsList navigate={navigate} />;
    else if (segments[1] === 'apply' && segments[2])
      portalContent = <ApplyFlow serviceId={segments[2]} navigate={navigate} />;
    else if (segments[1] === 'vault') portalContent = <DocumentVault navigate={navigate} />;
    else if (segments[1] === 'consent') portalContent = <ConsentManagement />;
    else if (segments[1] === 'notifications') portalContent = <NotificationsPage navigate={navigate} />;
    else if (segments[1] === 'history') portalContent = <HistoryPage navigate={navigate} />;
    else portalContent = <CitizenDashboard navigate={navigate} />;

    return (
      <PortalLayout currentPath={path} navigate={navigate}>
        {portalContent}
      </PortalLayout>
    );
  }

  // Public routes
  let publicContent: React.ReactNode;
  if (path === '/' || path === '') publicContent = <LandingPage navigate={navigate} />;
  else if (path === '/about') publicContent = <AboutPage />;
  else if (path === '/how-itworks') publicContent = <HowItWorksPage navigate={navigate} />;
  else if (path === '/how-it-works') publicContent = <HowItWorksPage navigate={navigate} />;
  else if (path === '/services') publicContent = <ServicesPage navigate={navigate} />;
  else if (path === '/architecture') publicContent = <ArchitecturePage navigate={navigate} />;
  else if (path === '/login') publicContent = <LoginPage navigate={navigate} />;
  else publicContent = <LandingPage navigate={navigate} />;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader currentPath={path} navigate={navigate} />
      <main className="flex-1">{publicContent}</main>
      <PublicFooter navigate={navigate} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
