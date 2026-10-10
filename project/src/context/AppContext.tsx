import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import type {
  Role, Application, NotificationItem, ConsentRecord, AuditEvent,
  SystemEvent, EventType, ApiFailureState, RetryState, SecuritySession,
  AuthStage,
} from '@/types';
import { officerInfo } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { getAccountSecurityPolicy } from '@/lib/webauthnService';
import { officerService } from '@/lib/officerService';

const STORAGE_KEY_AUTH_USER = 'fusiongrid_auth_user_v2';
const STORAGE_KEY_AUTH_SESSION = 'fusiongrid_auth_session_v2';

function persistSession(user: AuthUser | null, session: SecuritySession | null) {
  try {
    if (user && session) {
      sessionStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_AUTH_USER);
      sessionStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
    }
  } catch {
    // ignore
  }
}

function loadPersistedSession(): { user: AuthUser | null; session: SecuritySession | null } {
  try {
    const rawUser = sessionStorage.getItem(STORAGE_KEY_AUTH_USER);
    const rawSession = sessionStorage.getItem(STORAGE_KEY_AUTH_SESSION);
    if (rawUser && rawSession) {
      const parsedSession: SecuritySession = JSON.parse(rawSession);
      const parsedUser: AuthUser = JSON.parse(rawUser);
      if (new Date(parsedSession.expiresAt).getTime() > Date.now()) {
        return { user: parsedUser, session: parsedSession };
      }
      sessionStorage.removeItem(STORAGE_KEY_AUTH_USER);
      sessionStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
    }
  } catch {
    // ignore
  }
  return { user: null, session: null };
}

export interface CitizenProfile {
  id: string;
  full_name: string;
  mobile: string;
  dob: string;
  address: string;
  district: string;
  college: string;
  course: string;
  verified: boolean;
}

interface AuthUser {
  role: Role;
  name: string;
  id: string;
  department?: string;
  email?: string;
}

interface AppState {
  user: AuthUser | null;
  login: (
    role: Role,
    customUser?: Partial<AuthUser>,
    options?: {
      authStage?: AuthStage;
      requiresBiometrics?: boolean;
      passkeyVerified?: boolean;
      biometricEnrolled?: boolean;
    }
  ) => void;
  completeBiometricAuthorization: () => void;
  logout: () => void;
  citizenProfile: CitizenProfile | null;
  authLoading: boolean;
  signUpCitizen: (email: string, password: string, details: { full_name: string; mobile: string; dob: string; address: string; district: string; college: string; course: string }) => Promise<{ error: string | null }>;
  signInCitizen: (email: string, password: string) => Promise<{ error: string | null }>;
  applications: Application[];
  citizenMap: Record<string, { name: string; district: string }>;
  fetchAllApplications: () => Promise<void>;
  fetchCitizenById: (citizenId: string) => Promise<CitizenProfile | null>;
  addApplication: (app: Application) => Promise<string | null>;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string, reason: string) => void;
  requestInfo: (id: string, reason: string) => void;
  forwardApplication: (id: string, toDepartment: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: NotificationItem) => void;
  consents: ConsentRecord[];
  grantConsent: (department: string, dataScope: string, purpose: string, applicationId?: string) => void;
  revokeConsent: (id: string) => void;
  unreadCount: number;
  auditEvents: AuditEvent[];
  addAuditEvent: (e: AuditEvent) => void;
  systemEvents: SystemEvent[];
  emitEvent: (type: EventType, detail: string, applicationId?: string, actor?: string, department?: string) => void;
  apiFailures: ApiFailureState[];
  simulateRevenueFailure: () => void;
  resetRevenueFailure: () => void;
  session: SecuritySession | null;
  rateLimitRemaining: number;
  consumeRateLimit: () => boolean;
  checkRoleAccess: (requiredRole: Role) => boolean;
  checkConsent: (department: string) => boolean;
}

const AppContext = createContext<AppState | null>(null);

const nowString = () =>
  new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const nowShort = () =>
  new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

const generateToken = () => {
  const part = () => Math.random().toString(36).substring(2, 10).toUpperCase();
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${part()}.${part()}`;
};

function mapDbApplication(row: Record<string, unknown>): Application {
  const status = row.status as Application['status'];
  const submittedAt = row.submitted_at as string;

  const timeline = (row.timeline as Application['timeline']) || [];
  const workflowStages = (row.workflow_stages as Application['workflowStages']) || undefined;

  // Approval is persisted in Supabase, but older records may still contain
  // pre-approval progress/workflow values (for example 65% and Officer Review
  // as current). Normalize the derived UI state whenever the persisted status
  // is already approved so every portal stays consistent after logout/login.
  if (status === 'approved') {
    const completedAt = nowShort();

    const normalizedTimeline = timeline.map((step) => ({
      ...step,
      status: 'done' as const,
      timestamp: step.timestamp ?? completedAt,
    }));

    const normalizedWorkflowStages = workflowStages?.map((stage) => ({
      ...stage,
      status: 'done' as const,
      duration:
        stage.duration === 'In progress' || stage.duration === '—'
          ? 'Completed'
          : stage.duration,
      timestamp: stage.timestamp ?? completedAt,
    }));

    return {
      id: (row.display_id as string) || (row.id as string),
      dbId: row.id as string | undefined,
      citizenId: row.citizen_id as string | undefined,
      serviceId: row.service_id as string,
      serviceName: row.service_name as string,
      status,
      progress: 100,
      submittedAt,
      requestId: row.request_id as string | undefined,
      consents: (row.consents as ConsentRecord[]) || [],
      timeline: normalizedTimeline,
      dataAccess: (row.data_access as Application['dataAccess']) || [],
      departments: (row.departments as string[]) || [],
      workflowStages: normalizedWorkflowStages,
      rejectionReason: row.rejection_reason as string | undefined,
      infoRequestReason: row.info_request_reason as string | undefined,
      officerNotes: row.officer_notes as string | undefined,
    };
  }

  return {
    id: (row.display_id as string) || (row.id as string),
    dbId: row.id as string | undefined,
    citizenId: row.citizen_id as string | undefined,
    serviceId: row.service_id as string,
    serviceName: row.service_name as string,
    status,
    progress: row.progress as number,
    submittedAt,
    requestId: row.request_id as string | undefined,
    consents: (row.consents as ConsentRecord[]) || [],
    timeline,
    dataAccess: (row.data_access as Application['dataAccess']) || [],
    departments: (row.departments as string[]) || [],
    workflowStages,
    rejectionReason: row.rejection_reason as string | undefined,
    infoRequestReason: row.info_request_reason as string | undefined,
    officerNotes: row.officer_notes as string | undefined,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initialPersisted = useRef(loadPersistedSession()).current;
  const [user, setUser] = useState<AuthUser | null>(initialPersisted.user);
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [citizenMap, setCitizenMap] = useState<Record<string, { name: string; district: string }>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => {
    try {
      const saved = localStorage.getItem('fusiongrid_audit_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [systemEvents, setSystemEvents] = useState<SystemEvent[]>(() => {
    try {
      const saved = localStorage.getItem('fusiongrid_system_events');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [apiFailures, setApiFailures] = useState<ApiFailureState[]>(() => {
    try {
      const saved = localStorage.getItem('fusiongrid_api_failures');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [session, setSession] = useState<SecuritySession | null>(initialPersisted.session);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(100);
  const rateLimitTotal = 100;
  const retryTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const emitEvent = useCallback((type: EventType, detail: string, applicationId?: string, actor?: string, department?: string) => {
    const evt: SystemEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: nowString(),
      applicationId,
      actor: actor ?? 'System',
      detail,
      department,
    };
    setSystemEvents((prev) => {
      const updated = [evt, ...prev].slice(0, 500);
      localStorage.setItem('fusiongrid_system_events', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addAuditEvent = useCallback((e: AuditEvent) => {
    setAuditEvents((prev) => {
      const updated = [e, ...prev];
      localStorage.setItem('fusiongrid_audit_events', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addNotification = useCallback((n: NotificationItem) => {
    setNotifications((prev) => [n, ...prev]);
  }, []);

  // Fetch applications for the logged-in citizen from Supabase
  const fetchApplications = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('citizen_id', userId)
      .order('submitted_at', { ascending: false });
    if (error) return;
    setApplications((data as Record<string, unknown>[]).map(mapDbApplication));
  }, []);

  // Fetch ALL applications (officer/admin view) via SECURITY DEFINER function
  const fetchAllApplications = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_all_applications');
    if (error || !data) return;
    const rows = data as Record<string, unknown>[];
    setApplications(rows.map(mapDbApplication));
    const map: Record<string, { name: string; district: string }> = {};
    for (const row of rows) {
      const displayId = (row.display_id as string) || (row.id as string);
      map[displayId] = {
        name: (row.citizen_name as string) || 'Unknown',
        district: (row.citizen_district as string) || '—',
      };
    }
    setCitizenMap(map);
  }, []);

  // Fetch a citizen's profile by their UUID (officer view)
  const fetchCitizenById = useCallback(async (citizenId: string): Promise<CitizenProfile | null> => {
    const { data, error } = await supabase.rpc('get_citizen_by_id', { p_citizen_id: citizenId });
    if (error || !data || data.length === 0) return null;
    const row = data[0] as Record<string, unknown>;
    return {
      id: row.id as string,
      full_name: row.full_name as string,
      mobile: row.mobile as string,
      dob: row.dob as string,
      address: row.address as string,
      district: row.district as string,
      college: row.college as string,
      course: row.course as string,
      verified: row.verified as boolean,
    };
  }, []);

  const login = useCallback((
    role: Role,
    customUser?: Partial<AuthUser>,
    options?: {
      authStage?: AuthStage;
      requiresBiometrics?: boolean;
      passkeyVerified?: boolean;
      biometricEnrolled?: boolean;
    }
  ) => {
    const users: Record<Role, AuthUser> = {
      citizen: { role: 'citizen', name: 'Citizen', id: '' },
      officer: {
        role: 'officer',
        name: customUser?.name || officerInfo.name,
        id: customUser?.id || officerInfo.id,
        department: customUser?.department || officerInfo.department,
        email: customUser?.email || officerInfo.email,
      },
      admin: {
        role: 'admin',
        name: 'Nahid Shams',
        id: 'MH-ADM-ROOT-001',
        email: 'admin@fusiongrid.gov.in',
      },
    };
    const targetUser = {
      ...users[role],
      ...(customUser || {}),
      role, // Role cannot be spoofed
    };
    setUser(targetUser);
    const now = new Date();
    const exp = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const requiresBio = options?.requiresBiometrics ?? (role === 'admin' || role === 'officer');
    const stage: AuthStage = options?.authStage ?? (requiresBio ? (options?.biometricEnrolled ? 'biometric_verification_pending' : 'passkey_enrollment_required') : 'fully_authorized');
    const passkeyVerified = options?.passkeyVerified ?? (stage === 'fully_authorized' || stage === 'passkey_verified');
    const biometricEnrolled = options?.biometricEnrolled ?? (stage === 'fully_authorized' || stage === 'passkey_verified');

    const newSession: SecuritySession = {
      token: generateToken(),
      role,
      issuedAt: now.toISOString(),
      expiresAt: exp.toISOString(),
      rateLimitRemaining: rateLimitTotal,
      rateLimitTotal,
      authStage: stage,
      requiresBiometrics: requiresBio,
      passkeyVerified,
      biometricEnrolled,
    };
    setSession(newSession);
    persistSession(targetUser, newSession);
    setRateLimitRemaining(rateLimitTotal);
    emitEvent('ApplicationSubmitted', `Session established for ${role} role (stage: ${stage})`, undefined, targetUser.name);

    if (stage === 'fully_authorized') {
      if (role === 'officer' || role === 'admin') {
        fetchAllApplications();
      } else if (role === 'citizen' && targetUser.id) {
        fetchApplications(targetUser.id);
        supabase
          .from('citizens')
          .select('*')
          .eq('id', targetUser.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setCitizenProfile(data as CitizenProfile);
            }
          });
      }
    }
  }, [emitEvent, fetchAllApplications, fetchApplications]);

  const completeBiometricAuthorization = useCallback(() => {
    setSession((prev) => {
      if (!prev) return null;
      const updated: SecuritySession = {
        ...prev,
        authStage: 'fully_authorized',
        passkeyVerified: true,
        biometricEnrolled: true,
      };
      if (user) {
        persistSession(user, updated);
      }
      return updated;
    });
    if (user?.role === 'officer' || user?.role === 'admin') {
      fetchAllApplications();
    } else if (user?.role === 'citizen' && user.id) {
      fetchApplications(user.id);
      supabase
        .from('citizens')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setCitizenProfile(data as CitizenProfile);
          }
        });
    }
  }, [user, fetchAllApplications, fetchApplications]);

  const logout = useCallback(() => {
    supabase.auth.signOut().catch(() => {});
    setUser(null);
    setCitizenProfile(null);
    setApplications([]);
    setCitizenMap({});
    setConsents([]);
    setSession(null);
    persistSession(null, null);
    retryTimers.current.forEach((t) => clearTimeout(t));
    retryTimers.current = [];
  }, []);

  const addApplication = useCallback(async (app: Application): Promise<string | null> => {
    if (user?.role === 'citizen' && user.id) {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          display_id: app.id,
          citizen_id: user.id,
          service_id: app.serviceId,
          service_name: app.serviceName,
          status: app.status,
          progress: app.progress,
          submitted_at: app.submittedAt,
          request_id: app.requestId,
          consents: app.consents,
          timeline: app.timeline,
          data_access: app.dataAccess,
          departments: app.departments,
          workflow_stages: app.workflowStages,
        })
        .select('id')
        .single();
      if (error) {
  console.error('FAILED TO SAVE APPLICATION');
  console.error('Supabase error:', error);
  console.error('Application data:', app);

  alert(`Application save failed:\n${error.message}`);

  setApplications((prev) => [app, ...prev]);
  return null;
}
      const realId = (data as Record<string, unknown>).id as string;
      setApplications((prev) => [{ ...app, dbId: realId }, ...prev]);
      return realId;
    }
    setApplications((prev) => [app, ...prev]);
    return null;
  }, [user]);

  const updateApplication = useCallback((id: string, updates: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const approveApplication = useCallback((id: string) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const timeline = a.timeline.map((step) => ({ ...step, status: 'done' as const, timestamp: step.timestamp ?? nowShort() }));
        const workflowStages = a.workflowStages?.map((ws) => ({ ...ws, status: 'done' as const, timestamp: ws.timestamp ?? nowShort() }));
        return { ...a, status: 'approved' as const, progress: 100, timeline, workflowStages };
      })
    );
    const notif: NotificationItem = {
      id: `n-${Date.now()}`,
      title: 'Application approved',
      message: `Your application (${id}) has been approved by the reviewing officer. Benefits will be disbursed shortly.`,
      type: 'success',
      read: false,
      timestamp: nowString(),
      applicationId: id,
    };
    setNotifications((prev) => [notif, ...prev]);
    const audit: AuditEvent = {
      id: `ae-${Date.now()}`,
      applicationId: id,
      action: 'Application Approved',
      actor: officerInfo.name,
      actorRole: 'officer',
      detail: `Application ${id} approved by ${officerInfo.name}`,
      timestamp: nowString(),
      type: 'approve',
    };
    addAuditEvent(audit);
    emitEvent('ApplicationApproved', `Application ${id} approved`, id, officerInfo.name);
    supabase.rpc('update_application_status', { p_display_id: id, p_status: 'approved' }).then(({ error }: { error: unknown }) => {
      if (error) {
        console.error('Failed to persist approval:', error);
        return;
      }

      // Keep the persisted progress aligned with the approved status.
      supabase.rpc('update_application_progress', {
        p_display_id: id,
        p_progress: 100,
      }).then(({ error: progressError }: { error: unknown }) => {
        if (progressError) console.error('Failed to persist approval progress:', progressError);
      });
    });
  }, [emitEvent, addAuditEvent]);

  const rejectApplication = useCallback((id: string, reason: string) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const timeline = a.timeline.map((step) => {
          if (step.status === 'current') return { ...step, status: 'done' as const, timestamp: step.timestamp ?? nowShort() };
          if (step.status === 'pending') return { ...step, status: 'skipped' as const };
          return step;
        });
        const workflowStages = a.workflowStages?.map((ws) => {
          if (ws.status === 'current') return { ...ws, status: 'done' as const, timestamp: ws.timestamp ?? nowShort() };
          if (ws.status === 'pending') return { ...ws, status: 'skipped' as const };
          return ws;
        });
        return { ...a, status: 'rejected' as const, progress: a.progress, rejectionReason: reason, timeline, workflowStages };
      })
    );
    setNotifications((prev) => [{
      id: `n-${Date.now()}`,
      title: 'Application rejected',
      message: `Your application (${id}) has been rejected. Reason: ${reason}. Please review and re-apply if eligible.`,
      type: 'warning',
      read: false,
      timestamp: nowString(),
      applicationId: id,
    }, ...prev]);
    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId: id,
      action: 'Application Rejected',
      actor: officerInfo.name,
      actorRole: 'officer',
      detail: `Application ${id} rejected. Reason: ${reason}`,
      timestamp: nowString(),
      type: 'reject',
    });
    emitEvent('ApplicationRejected', `Application ${id} rejected: ${reason}`, id, officerInfo.name);
    supabase.rpc('update_application_status', { p_display_id: id, p_status: 'rejected', p_rejection_reason: reason }).then(({ error }: { error: unknown }) => { if (error) console.error('Failed to persist rejection:', error); });
  }, [emitEvent, addAuditEvent]);

  const requestInfo = useCallback((id: string, reason: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'info_requested' as const, infoRequestReason: reason } : a))
    );
    setNotifications((prev) => [{
      id: `n-${Date.now()}`,
      title: 'Action required: Information requested',
      message: `The reviewing officer has requested additional information for your application (${id}). Reason: ${reason}.`,
      type: 'action',
      read: false,
      timestamp: nowString(),
      applicationId: id,
    }, ...prev]);
    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId: id,
      action: 'Information Requested',
      actor: officerInfo.name,
      actorRole: 'officer',
      detail: `Information requested for application ${id}. Reason: ${reason}`,
      timestamp: nowString(),
      type: 'request_info',
    });
    supabase.rpc('update_application_status', {
  p_display_id: id,
  p_status: 'approved'
}).then(({ error }: { error: unknown }) => {
  if (error) {
    console.error('Failed to persist approval:', error);
    return;
  }

  supabase.rpc('update_application_progress', {
    p_display_id: id,
    p_progress: 100
  }).then(({ error: progressError }: { error: unknown }) => {
    if (progressError) {
      console.error('Failed to persist progress:', progressError);
    }
  });
});
  }, [addAuditEvent]);

  const forwardApplication = useCallback((id: string, toDepartment: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, departments: [...new Set([...a.departments, toDepartment])] } : a))
    );
    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId: id,
      action: 'Application Forwarded',
      actor: officerInfo.name,
      actorRole: 'officer',
      detail: `Application ${id} forwarded to ${toDepartment}`,
      timestamp: nowString(),
      type: 'forward',
    });
  }, [addAuditEvent]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const grantConsent = useCallback((department: string, dataScope: string, purpose: string, applicationId?: string) => {
    const consent: ConsentRecord = {
      id: `c-${Date.now()}`,
      department,
      dataScope,
      purpose,
      requestedAt: new Date().toISOString(),
      status: 'granted',
      applicationId,
    };
    setConsents((prev) => [consent, ...prev]);
    const actorName = citizenProfile?.full_name || user?.name || 'Citizen';
    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId: applicationId ?? '—',
      action: 'Consent Granted',
      actor: actorName,
      actorRole: 'citizen',
      detail: `Consent granted to ${department} for ${dataScope} — Purpose: ${purpose}`,
      timestamp: nowString(),
      type: 'consent',
    });
    emitEvent('ConsentGranted', `Consent granted to ${department} for ${dataScope}`, applicationId, actorName, department);
  }, [emitEvent, citizenProfile, user, addAuditEvent]);

  const revokeConsent = useCallback((id: string) => {
    let revokedDept = '';
    setConsents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          revokedDept = c.department;
          return { ...c, status: 'revoked' as const };
        }
        return c;
      })
    );
    const actorName = citizenProfile?.full_name || user?.name || 'Citizen';
    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId: '—',
      action: 'Consent Revoked',
      actor: actorName,
      actorRole: 'citizen',
      detail: `Consent revoked for ${revokedDept}`,
      timestamp: nowString(),
      type: 'consent',
    });
    emitEvent('ConsentRevoked', `Consent revoked for ${revokedDept}`, undefined, actorName, revokedDept);
  }, [emitEvent, citizenProfile, user, addAuditEvent]);

  // ─── API Failure Simulation ───

  const updateFailureState = useCallback((dept: string, updates: Partial<ApiFailureState>) => {
    setApiFailures((prev) => {
      const existing = prev.find((f) => f.department === dept);
      if (!existing) return prev;
      const updated = prev.map((f) => (f.department === dept ? { ...f, ...updates } : f));
      localStorage.setItem('fusiongrid_api_failures', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addFailureHistory = useCallback((dept: string, state: RetryState, message: string) => {
    setApiFailures((prev) => {
      const updated = prev.map((f) => (f.department === dept ? {
        ...f,
        history: [...f.history, { state, message, timestamp: nowString() }],
      } : f));
      localStorage.setItem('fusiongrid_api_failures', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const simulateRevenueFailure = useCallback(() => {
    const requestId = `REQ-REV-${Date.now().toString(36).toUpperCase()}`;
    const endpoint = '/api/revenue/income/:citizenId';

    retryTimers.current.forEach((t) => clearTimeout(t));
    retryTimers.current = [];

    const failure: ApiFailureState = {
      department: 'Revenue Department',
      isDown: true,
      retryState: 'failed',
      requestId,
      endpoint,
      attempts: 0,
      message: 'Request Failed — Revenue API is DOWN',
      citizenMessage: 'Your application is safe. Verification will continue automatically.',
      timestamp: nowString(),
      history: [{ state: 'failed', message: 'Request Failed — Revenue API is DOWN', timestamp: nowString() }],
    };
    setApiFailures((prev) => {
      const filtered = prev.filter((f) => f.department !== 'Revenue Department');
      const updated = [failure, ...filtered];
      localStorage.setItem('fusiongrid_api_failures', JSON.stringify(updated));
      return updated;
    });

    emitEvent('ApiFailure', `Revenue API failure detected — ${endpoint}`, undefined, 'System', 'Revenue Department');

    const t1 = setTimeout(() => {
      addFailureHistory('Revenue Department', 'retry_1', 'Retry 1 — Attempting to reconnect...');
      updateFailureState('Revenue Department', { retryState: 'retry_1', attempts: 1, message: 'Retry 1 — Attempting to reconnect...' });
      retryTimers.current = retryTimers.current.filter((t) => t !== t1);
    }, 2000);
    retryTimers.current.push(t1);

    const t2 = setTimeout(() => {
      addFailureHistory('Revenue Department', 'retry_2', 'Retry 2 — Reconnection failed, queuing request...');
      updateFailureState('Revenue Department', { retryState: 'retry_2', attempts: 2, message: 'Retry 2 — Reconnection failed' });
      retryTimers.current = retryTimers.current.filter((t) => t !== t2);
    }, 4000);
    retryTimers.current.push(t2);

    const t3 = setTimeout(() => {
      addFailureHistory('Revenue Department', 'queued', 'Request Queued — Application preserved in persistent queue');
      updateFailureState('Revenue Department', { retryState: 'queued', message: 'Request Queued — Application preserved' });
      retryTimers.current = retryTimers.current.filter((t) => t !== t3);
    }, 6000);
    retryTimers.current.push(t3);

    const t4 = setTimeout(() => {
      addFailureHistory('Revenue Department', 'auto_retry', 'Automatic Retry — Revenue API recovering...');
      updateFailureState('Revenue Department', { retryState: 'auto_retry', attempts: 3, message: 'Automatic Retry — API recovering' });
      retryTimers.current = retryTimers.current.filter((t) => t !== t4);
    }, 9000);
    retryTimers.current.push(t4);

    const t5 = setTimeout(() => {
      addFailureHistory('Revenue Department', 'recovered', 'Recovered — Revenue API back online, request completed');
      updateFailureState('Revenue Department', { retryState: 'recovered', isDown: false, message: 'Recovered — API back online', citizenMessage: 'Verification completed successfully after automatic retry.' });
      retryTimers.current = retryTimers.current.filter((t) => t !== t5);
      emitEvent('IncomeVerified', 'Revenue API recovered — income verification completed', undefined, 'System', 'Revenue Department');
    }, 12000);
    retryTimers.current.push(t5);
  }, [emitEvent, addFailureHistory, updateFailureState]);

  const resetRevenueFailure = useCallback(() => {
    retryTimers.current.forEach((t) => clearTimeout(t));
    retryTimers.current = [];
    setApiFailures((prev) => {
      const updated = prev.filter((f) => f.department !== 'Revenue Department');
      localStorage.setItem('fusiongrid_api_failures', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─── Security Simulation ───

  const consumeRateLimit = useCallback(() => {
    if (rateLimitRemaining <= 0) return false;
    setRateLimitRemaining((prev) => prev - 1);
    return true;
  }, [rateLimitRemaining]);

  const checkRoleAccess = useCallback((requiredRole: Role): boolean => {
    if (!user || !session) return false;
    // Strict requirement: Protected roles demand fully authorized session stage
    if (session.authStage !== 'fully_authorized') return false;
    if (requiredRole === 'admin') return user.role === 'admin';
    if (requiredRole === 'officer') return user.role === 'officer' || user.role === 'admin';
    return true;
  }, [user, session]);

  const checkConsent = useCallback((department: string): boolean => {
    return consents.some((c) => c.department === department && c.status === 'granted');
  }, [consents]);

  // ── Citizen Supabase Auth ──

  const signUpCitizen = useCallback(async (
    email: string,
    password: string,
    details: { full_name: string; mobile: string; dob: string; address: string; district: string; college: string; course: string }
  ): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: details.full_name,
          mobile: details.mobile,
          dob: details.dob,
          address: details.address,
          district: details.district,
          college: details.college,
          course: details.course,
        },
      },
    });
    if (error) return { error: error.message };

if (!data.user) return { error: 'Signup failed. Please try again.' };

const { error: citizenError } = await supabase
  .from('citizens')
  .upsert({
    id: data.user.id,
    full_name: details.full_name,
    mobile: details.mobile,
    dob: details.dob,
    address: details.address,
    district: details.district,
    college: details.college,
    course: details.course,
    verified: false,
  });

if (citizenError) {
  return { error: citizenError.message };
}

return { error: null };

}, []);
  const signInCitizen = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Authentication failed. Please try again.' };

    const { data: profile } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    const citizenUser: AuthUser = {
      role: 'citizen',
      name: (profile as CitizenProfile)?.full_name || data.user.email?.split('@')[0] || 'Citizen',
      id: data.user.id,
      email: data.user.email,
    };

    if (profile) {
      setCitizenProfile(profile as CitizenProfile);
    }

    const policy = await getAccountSecurityPolicy(email.trim(), 'citizen');
    const stage: AuthStage = policy.requiresBiometrics
      ? (policy.hasRegisteredPasskey ? 'biometric_verification_pending' : 'passkey_enrollment_required')
      : 'fully_authorized';

    const now = new Date();
    const exp = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const newSession: SecuritySession = {
      token: generateToken(),
      role: 'citizen',
      issuedAt: now.toISOString(),
      expiresAt: exp.toISOString(),
      rateLimitRemaining: rateLimitTotal,
      rateLimitTotal,
      authStage: stage,
      requiresBiometrics: policy.requiresBiometrics,
      passkeyVerified: !policy.requiresBiometrics,
      biometricEnrolled: policy.hasRegisteredPasskey,
    };

    setUser(citizenUser);
    setSession(newSession);
    persistSession(citizenUser, newSession);

    if (stage === 'fully_authorized') {
      fetchApplications(data.user.id);
    }

    return { error: null };
  }, [fetchApplications]);

  // Restore session on mount and listen for auth changes
  useEffect(() => {
    let mounted = true;

    const syncAuthUser = async (authUser: { id: string; email?: string }) => {
      const email = authUser.email?.trim().toLowerCase() || '';
      const existing = loadPersistedSession();
      const currentStage = existing.session?.authStage || 'fully_authorized';

      // 1. Try server RPC check
      let resolvedRole: Role | null = null;
      let officerActive = true;
      let officerDetails: { full_name?: string; department?: string; employee_id?: string } = {};

      try {
        const { data: roleData, error: roleError } = await supabase.rpc('get_current_user_role');
        if (!roleError && roleData && Array.isArray(roleData) && roleData.length > 0) {
          const row = roleData[0] as { role: Role; is_active: boolean; full_name: string; department: string; employee_id: string };
          resolvedRole = row.role;
          officerActive = row.is_active;
          officerDetails = row;
        }
      } catch {
        // Fallback to trusted registry
      }

      // 2. Authoritative role resolution fallback
      if (!resolvedRole) {
        if (email === 'admin@fusiongrid.gov.in') {
          resolvedRole = 'admin';
        } else {
          const offCheck = officerService.checkOfficerActive(email);
          if (offCheck.exists) {
            resolvedRole = 'officer';
            officerActive = offCheck.isActive;
            if (offCheck.officer) {
              officerDetails = {
                full_name: offCheck.officer.full_name,
                department: offCheck.officer.department,
                employee_id: offCheck.officer.employee_id,
              };
            }
          } else {
            resolvedRole = 'citizen';
          }
        }
      }

      if (!mounted) return;

      // 3. Handle Admin
      if (resolvedRole === 'admin') {
        const adminUser: AuthUser = {
          role: 'admin',
          name: 'Nahid Shams',
          id: 'MH-ADM-ROOT-001',
          email: authUser.email,
        };
        setUser(adminUser);

        const policy = await getAccountSecurityPolicy('admin@fusiongrid.gov.in', 'admin');
        const stage: AuthStage = existing.session?.role === 'admin' && existing.session.authStage === 'fully_authorized'
          ? 'fully_authorized'
          : (policy.hasRegisteredPasskey ? 'biometric_verification_pending' : 'passkey_enrollment_required');

        const newSession: SecuritySession = {
          token: existing.session?.token || generateToken(),
          role: 'admin',
          issuedAt: existing.session?.issuedAt || new Date().toISOString(),
          expiresAt: existing.session?.expiresAt || new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
          rateLimitRemaining: rateLimitTotal,
          rateLimitTotal,
          authStage: stage,
          requiresBiometrics: true,
          passkeyVerified: stage === 'fully_authorized',
          biometricEnrolled: policy.hasRegisteredPasskey,
        };
        setSession(newSession);
        persistSession(adminUser, newSession);
        if (stage === 'fully_authorized') {
          fetchAllApplications();
        }
        return;
      }

      // 4. Handle Officer
      if (resolvedRole === 'officer') {
        if (!officerActive) {
          await supabase.auth.signOut().catch(() => {});
          setUser(null);
          setSession(null);
          persistSession(null, null);
          return;
        }

        const officerUser: AuthUser = {
          role: 'officer',
          name: officerDetails.full_name || 'Verification Officer',
          id: officerDetails.employee_id || authUser.id,
          department: officerDetails.department || 'Government Department',
          email: authUser.email,
        };
        setUser(officerUser);

        const policy = await getAccountSecurityPolicy(email, 'officer');
        const stage: AuthStage = existing.session?.role === 'officer' && existing.session.authStage === 'fully_authorized'
          ? 'fully_authorized'
          : (policy.hasRegisteredPasskey ? 'biometric_verification_pending' : 'passkey_enrollment_required');

        const newSession: SecuritySession = {
          token: existing.session?.token || generateToken(),
          role: 'officer',
          issuedAt: existing.session?.issuedAt || new Date().toISOString(),
          expiresAt: existing.session?.expiresAt || new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
          rateLimitRemaining: rateLimitTotal,
          rateLimitTotal,
          authStage: stage,
          requiresBiometrics: true,
          passkeyVerified: stage === 'fully_authorized',
          biometricEnrolled: policy.hasRegisteredPasskey,
        };
        setSession(newSession);
        persistSession(officerUser, newSession);
        if (stage === 'fully_authorized') {
          fetchAllApplications();
        }
        return;
      }

      // 5. Handle Citizen
      const { data: profile } = await supabase
        .from('citizens')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const citizenUser: AuthUser = {
        role: 'citizen',
        name: (profile as CitizenProfile)?.full_name || authUser.email?.split('@')[0] || 'Citizen',
        id: authUser.id,
        email: authUser.email,
      };

      if (profile) {
        setCitizenProfile(profile as CitizenProfile);
      }

      const policy = await getAccountSecurityPolicy(email, 'citizen');
      const stage: AuthStage = policy.requiresBiometrics
        ? (existing.session?.role === 'citizen' && existing.session.authStage === 'fully_authorized'
            ? 'fully_authorized'
            : (policy.hasRegisteredPasskey ? 'biometric_verification_pending' : 'passkey_enrollment_required'))
        : 'fully_authorized';

      const newSession: SecuritySession = {
        token: existing.session?.token || generateToken(),
        role: 'citizen',
        issuedAt: existing.session?.issuedAt || new Date().toISOString(),
        expiresAt: existing.session?.expiresAt || new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        rateLimitRemaining: rateLimitTotal,
        rateLimitTotal,
        authStage: stage,
        requiresBiometrics: policy.requiresBiometrics,
        passkeyVerified: !policy.requiresBiometrics || stage === 'fully_authorized',
        biometricEnrolled: policy.hasRegisteredPasskey,
      };

      setUser(citizenUser);
      setSession(newSession);
      persistSession(citizenUser, newSession);
      if (stage === 'fully_authorized') {
        fetchApplications(authUser.id);
      }
    };

    (async () => {
      const persisted = loadPersistedSession();
      if (persisted.user && persisted.session) {
        setUser(persisted.user);
        setSession(persisted.session);
        if (persisted.session.authStage === 'fully_authorized') {
          if (persisted.user.role === 'officer' || persisted.user.role === 'admin') {
            fetchAllApplications();
          } else if (persisted.user.role === 'citizen' && persisted.user.id) {
            fetchApplications(persisted.user.id);
          }
        }
      }

      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (mounted && authUser) {
          await syncAuthUser(authUser);
        }
      } catch {
        // Continue with local persisted session
      }

      if (mounted) {
        setAuthLoading(false);
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          // If the active role was officer or admin without Supabase auth, don't clear local session
          const persisted = loadPersistedSession();
          if (persisted.user && (persisted.user.role === 'officer' || persisted.user.role === 'admin') && !session?.user) {
            return;
          }
          setUser(null);
          setCitizenProfile(null);
          setApplications([]);
          setConsents([]);
          setSession(null);
          persistSession(null, null);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await syncAuthUser(session.user);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAllApplications, fetchApplications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        completeBiometricAuthorization,
        logout,
        citizenProfile,
        authLoading,
        signUpCitizen,
        signInCitizen,
        applications,
        citizenMap,
        fetchAllApplications,
        fetchCitizenById,
        addApplication,
        updateApplication,
        approveApplication,
        rejectApplication,
        requestInfo,
        forwardApplication,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        consents,
        grantConsent,
        revokeConsent,
        unreadCount,
        auditEvents,
        addAuditEvent,
        systemEvents,
        emitEvent,
        apiFailures,
        simulateRevenueFailure,
        resetRevenueFailure,
        session,
        rateLimitRemaining,
        consumeRateLimit,
        checkRoleAccess,
        checkConsent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
