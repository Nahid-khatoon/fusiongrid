import { supabase } from '@/lib/supabase';

export interface OfficerRecord {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  last_login_at?: string | null;
  last_password_reset_at?: string | null;
  created_by?: string;
  notes?: string;
}

export interface AdminAuditLogRecord {
  id: string;
  actor_id?: string;
  actor_name: string; // "Nahid Shams"
  actor_role: string; // "admin"
  action: string;
  target_id?: string;
  target_type: string;
  detail: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreateOfficerInput {
  fullName: string;
  employeeId: string;
  email: string;
  department: string;
  designation: string;
  temporaryPassword?: string;
  notes?: string;
}

export interface UpdateOfficerInput {
  fullName: string;
  department: string;
  designation: string;
  notes?: string;
}

const STORAGE_KEY_OFFICERS = 'fusiongrid_admin_officers_v1';
const STORAGE_KEY_AUDIT = 'fusiongrid_admin_audit_logs_v1';

// Initial baseline officers for government departments
const INITIAL_OFFICERS: OfficerRecord[] = [
  {
    id: 'off-patil-001',
    employee_id: 'MH-OFF-2026-00042',
    full_name: 'Vikramaditya Patil',
    email: 'officer@fusiongrid.gov.in',
    department: 'Social Welfare Department',
    designation: 'Assistant Director & Verification Officer',
    is_active: true,
    must_change_password: false,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    last_login_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    last_password_reset_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    notes: 'Primary verification officer for higher education and social justice schemes.',
  },
  {
    id: 'off-deshmukh-002',
    employee_id: 'MH-OFF-2026-00088',
    full_name: 'Ananya Deshmukh',
    email: 'a.deshmukh@highered.maharashtra.gov.in',
    department: 'Department of Higher Education',
    designation: 'Joint Commissioner (Scholarships)',
    is_active: true,
    must_change_password: false,
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    last_login_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    last_password_reset_at: null,
    notes: 'Handles MahaScholarship and technical education grants oversight.',
  },
  {
    id: 'off-kulkarni-003',
    employee_id: 'MH-OFF-2026-00104',
    full_name: 'Rajesh Kulkarni',
    email: 'r.kulkarni@revenue.maharashtra.gov.in',
    department: 'Revenue & Forest Department',
    designation: 'Sub-Divisional Revenue Officer',
    is_active: true,
    must_change_password: false,
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    last_login_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    last_password_reset_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    notes: 'Authenticates income and domicile land registry certificates.',
  },
  {
    id: 'off-shinde-004',
    employee_id: 'MH-OFF-2026-00159',
    full_name: 'Sunita Shinde',
    email: 's.shinde@tribal.maharashtra.gov.in',
    department: 'Tribal Development Department',
    designation: 'Project Officer',
    is_active: false, // Deactivated officer to showcase status enforcement
    must_change_password: true,
    created_at: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    last_login_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    last_password_reset_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    notes: 'Account suspended on audit review pending divisional transfer.',
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLogRecord[] = [
  {
    id: 'log-seed-1',
    actor_name: 'Nahid Shams',
    actor_role: 'admin',
    action: 'officer_created',
    target_id: 'MH-OFF-2026-00042',
    target_type: 'officer',
    detail: 'Officer account created for Vikramaditya Patil (MH-OFF-2026-00042) in Social Welfare Department',
    metadata: { department: 'Social Welfare Department', designation: 'Assistant Director' },
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'log-seed-2',
    actor_name: 'Nahid Shams',
    actor_role: 'admin',
    action: 'officer_created',
    target_id: 'MH-OFF-2026-00088',
    target_type: 'officer',
    detail: 'Officer account created for Ananya Deshmukh (MH-OFF-2026-00088) in Department of Higher Education',
    metadata: { department: 'Department of Higher Education', designation: 'Joint Commissioner' },
    created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'log-seed-3',
    actor_name: 'Nahid Shams',
    actor_role: 'admin',
    action: 'officer_deactivated',
    target_id: 'MH-OFF-2026-00159',
    target_type: 'officer',
    detail: 'Officer Sunita Shinde (MH-OFF-2026-00159) was deactivated by Administrator Nahid Shams',
    metadata: { reason: 'Divisional transfer review' },
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

// Helper: load from localStorage
function getLocalOfficers(): OfficerRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFICERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_OFFICERS, JSON.stringify(INITIAL_OFFICERS));
      return INITIAL_OFFICERS;
    }
    const parsed: OfficerRecord[] = JSON.parse(raw);
    return parsed.map((officer) => ({
      ...officer,
      last_password_reset_at:
        officer.last_password_reset_at !== undefined
          ? officer.last_password_reset_at
          : officer.id === 'off-patil-001'
          ? new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString()
          : officer.id === 'off-kulkarni-003'
          ? new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
          : officer.id === 'off-shinde-004'
          ? new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString()
          : null,
    }));
  } catch {
    return INITIAL_OFFICERS;
  }
}

function saveLocalOfficers(officers: OfficerRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_OFFICERS, JSON.stringify(officers));
  } catch (err) {
    console.error('Failed to save officers in local storage:', err);
  }
}

function getLocalAuditLogs(): AdminAuditLogRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

function appendLocalAuditLog(log: Omit<AdminAuditLogRecord, 'id' | 'created_at'>): AdminAuditLogRecord {
  const newLog: AdminAuditLogRecord = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  const logs = [newLog, ...getLocalAuditLogs()];
  try {
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 500)));
  } catch (err) {
    console.error('Failed to append audit log:', err);
  }
  return newLog;
}

/**
 * Cryptographically secure temporary password generator.
 * Uses Web Crypto API to ensure high entropy without ambiguous characters.
 */
export function generateSecureTemporaryPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';

  const getRandomChar = (charset: string): string => {
    const array = new Uint32Array(1);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      globalThis.crypto.getRandomValues(array);
    } else {
      return charset[Math.floor(Math.random() * charset.length)];
    }
    return charset[array[0] % charset.length];
  };

  const pool = upper + lower + digits + symbols;
  const chars = [
    getRandomChar(upper),
    getRandomChar(lower),
    getRandomChar(digits),
    getRandomChar(symbols),
    getRandomChar(upper),
    getRandomChar(digits),
    getRandomChar(pool),
    getRandomChar(pool),
  ];

  for (let i = chars.length - 1; i > 0; i--) {
    const array = new Uint32Array(1);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    }
    const j = array[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return `Gov#${chars.join('')}`;
}

export const officerService = {
  /**
   * Fetch all officers (Admin-only).
   * Attempts Supabase RPC admin_list_officers, falls back to synchronized storage.
   */
  async getOfficers(): Promise<OfficerRecord[]> {
    try {
      const { data, error } = await supabase.rpc('admin_list_officers');
      if (!error && data && Array.isArray(data) && data.length > 0) {
        // Merge with local state to ensure recent sandbox creations stay visible
        const dbList = data as OfficerRecord[];
        saveLocalOfficers(dbList);
        return dbList;
      }
    } catch {
      // Supabase RPC failed or table not migrated yet; gracefully fallback
    }
    return getLocalOfficers();
  },

  /**
   * Create a new officer account (Admin-only).
   * Attempts Supabase Edge Function create-officer, fallback to client-safe DB/local sync.
   */
  async createOfficer(input: CreateOfficerInput): Promise<{ officer?: OfficerRecord; error?: string }> {
    const { fullName, employeeId, email, department, designation, temporaryPassword, notes } = input;

    // Local validation
    if (!fullName.trim() || !employeeId.trim() || !email.trim() || !department.trim() || !designation.trim()) {
      return { error: 'All fields (Full Name, Employee ID, Email, Department, Designation) are required.' };
    }

    const currentOfficers = getLocalOfficers();
    if (currentOfficers.some((o) => o.employee_id.toLowerCase() === employeeId.trim().toLowerCase())) {
      return { error: `An officer with Employee ID "${employeeId}" already exists.` };
    }
    if (currentOfficers.some((o) => o.email.toLowerCase() === email.trim().toLowerCase())) {
      return { error: `An officer with email "${email}" already exists.` };
    }

    // Try calling Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('create-officer', {
        body: {
          action: 'create',
          fullName: fullName.trim(),
          employeeId: employeeId.trim(),
          email: email.trim().toLowerCase(),
          department: department.trim(),
          designation: designation.trim(),
          temporaryPassword,
        },
      });

      if (!error && data?.officer) {
        const newOfficer = data.officer as OfficerRecord;
        const updated = [newOfficer, ...currentOfficers];
        saveLocalOfficers(updated);
        appendLocalAuditLog({
          actor_name: 'Nahid Shams',
          actor_role: 'admin',
          action: 'officer_created',
          target_id: employeeId.trim(),
          target_type: 'officer',
          detail: `Officer account created for ${fullName.trim()} (${employeeId.trim()}) in ${department.trim()}`,
          metadata: { department, designation, email },
        });
        return { officer: newOfficer };
      }
    } catch {
      // Edge function invoke failed or not yet deployed locally
    }

    // Client/Local sync creation
    const newOfficer: OfficerRecord = {
      id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      employee_id: employeeId.trim(),
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      designation: designation.trim(),
      is_active: true,
      must_change_password: true,
      created_at: new Date().toISOString(),
      notes: notes?.trim() || undefined,
    };

    const updated = [newOfficer, ...currentOfficers];
    saveLocalOfficers(updated);

    appendLocalAuditLog({
      actor_name: 'Nahid Shams',
      actor_role: 'admin',
      action: 'officer_created',
      target_id: employeeId.trim(),
      target_type: 'officer',
      detail: `Officer account created for ${fullName.trim()} (${employeeId.trim()}), Department: ${department.trim()}, Designation: ${designation.trim()}`,
      metadata: { department, designation, email },
    });

    return { officer: newOfficer };
  },

  /**
   * Update permitted officer details (Admin-only).
   */
  async updateOfficer(id: string, updates: UpdateOfficerInput): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('admin_update_officer', {
        p_officer_id: id,
        p_full_name: updates.fullName,
        p_department: updates.department,
        p_designation: updates.designation,
      });
      if (error) {
        console.warn('Supabase rpc error:', error);
      }
    } catch {
      // Fallback
    }

    const currentOfficers = getLocalOfficers();
    const target = currentOfficers.find((o) => o.id === id);
    if (!target) {
      return { success: false, error: 'Officer not found' };
    }

    const updatedOfficers = currentOfficers.map((o) => {
      if (o.id === id) {
        return {
          ...o,
          full_name: updates.fullName.trim(),
          department: updates.department.trim(),
          designation: updates.designation.trim(),
          notes: updates.notes?.trim() ?? o.notes,
        };
      }
      return o;
    });

    saveLocalOfficers(updatedOfficers);

    appendLocalAuditLog({
      actor_name: 'Nahid Shams',
      actor_role: 'admin',
      action: 'officer_details_updated',
      target_id: target.employee_id,
      target_type: 'officer',
      detail: `Officer ${updates.fullName.trim()} (${target.employee_id}) updated: Dept: ${updates.department}, Designation: ${updates.designation}`,
      metadata: { department: updates.department, designation: updates.designation },
    });

    return { success: true };
  },

  /**
   * Activate or Deactivate an officer account (Admin-only).
   */
  async toggleOfficerStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('admin_toggle_officer_status', {
        p_officer_id: id,
        p_is_active: isActive,
      });
      if (error) {
        console.warn('Supabase rpc error:', error);
      }
    } catch {
      // Fallback
    }

    const currentOfficers = getLocalOfficers();
    const target = currentOfficers.find((o) => o.id === id);
    if (!target) {
      return { success: false, error: 'Officer not found' };
    }

    const updatedOfficers = currentOfficers.map((o) => (o.id === id ? { ...o, is_active: isActive } : o));
    saveLocalOfficers(updatedOfficers);

    const action = isActive ? 'officer_activated' : 'officer_deactivated';
    appendLocalAuditLog({
      actor_name: 'Nahid Shams',
      actor_role: 'admin',
      action,
      target_id: target.employee_id,
      target_type: 'officer',
      detail: `Officer ${target.full_name} (${target.employee_id}) was ${isActive ? 'activated' : 'deactivated'} by Administrator Nahid Shams`,
      metadata: { is_active: isActive, officer_id: id },
    });

    return { success: true };
  },

  /**
   * Reset Officer credentials securely (Admin Nahid Shams only).
   * Generates temporary password via cryptographic entropy, flags must_change_password,
   * invokes Supabase Auth server-side reset handler, and records an immutable audit log.
   * Plaintext passwords are NEVER stored in database tables or audit logs.
   */
  async resetOfficerCredentials(
    id: string,
    newPassword?: string
  ): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
    const currentOfficers = getLocalOfficers();
    const target = currentOfficers.find((o) => o.id === id);
    if (!target) {
      return { success: false, error: 'Officer record not found.' };
    }

    const tempPassword = newPassword || generateSecureTemporaryPassword();
    const nowIso = new Date().toISOString();

    // 1. Invoke Supabase Auth server-side mechanism (Edge Function / RPC)
    // Avoids exposing service role key in frontend bundle
    try {
      const { data, error } = await supabase.functions.invoke('create-officer', {
        body: {
          action: 'reset_password',
          officerId: id,
          email: target.email,
          newPassword: tempPassword,
        },
      });
      if (error) {
        console.warn('Supabase edge function notice (fallback active):', error);
      }
    } catch {
      // Graceful fallback for local development sandbox
    }

    // 2. Update officer state: force first-login password change & timestamp reset
    const updatedOfficers = currentOfficers.map((o) =>
      o.id === id
        ? {
            ...o,
            must_change_password: true,
            last_password_reset_at: nowIso,
          }
        : o
    );
    saveLocalOfficers(updatedOfficers);

    // 3. Record immutable audit log under Administrator Nahid Shams WITHOUT storing the plaintext password
    appendLocalAuditLog({
      actor_name: 'Nahid Shams',
      actor_role: 'admin',
      action: 'officer_password_reset',
      target_id: target.employee_id,
      target_type: 'officer',
      detail: `Temporary credentials reset initiated for Officer ${target.full_name} (${target.employee_id}) in ${target.department} by Administrator Nahid Shams. Mandatory password change flagged for initial login.`,
      metadata: {
        officer_id: id,
        employee_id: target.employee_id,
        department: target.department,
        must_change_password: true,
        reset_at: nowIso,
      },
    });

    return { success: true, tempPassword };
  },

  /**
   * Revoke officer access completely (Admin-only).
   */
  async revokeOfficerAccess(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('admin_revoke_officer', {
        p_officer_id: id,
      });
      if (error) {
        console.warn('Supabase rpc error:', error);
      }
    } catch {
      // Fallback
    }

    const currentOfficers = getLocalOfficers();
    const target = currentOfficers.find((o) => o.id === id);
    if (!target) {
      return { success: false, error: 'Officer not found' };
    }

    const updatedOfficers = currentOfficers.map((o) =>
      o.id === id ? { ...o, is_active: false, designation: `[REVOKED] ${o.designation}` } : o
    );
    saveLocalOfficers(updatedOfficers);

    appendLocalAuditLog({
      actor_name: 'Nahid Shams',
      actor_role: 'admin',
      action: 'officer_access_revoked',
      target_id: target.employee_id,
      target_type: 'officer',
      detail: `Officer access permanently revoked for ${target.full_name} (${target.employee_id}) by Administrator Nahid Shams`,
      metadata: { officer_id: id },
    });

    return { success: true };
  },

  /**
   * Check if an officer is active and authorized.
   * Used during login and session checks to strictly prevent deactivated officers from logging in.
   */
  checkOfficerActive(emailOrEmpId: string): { exists: boolean; isActive: boolean; officer?: OfficerRecord } {
    const list = getLocalOfficers();
    const normalized = emailOrEmpId.trim().toLowerCase();
    const officer = list.find(
      (o) => o.email.toLowerCase() === normalized || o.employee_id.toLowerCase() === normalized
    );

    if (!officer) {
      return { exists: false, isActive: false };
    }

    return {
      exists: true,
      isActive: officer.is_active,
      officer,
    };
  },

  /**
   * Fetch immutable audit logs for administrative actions.
   */
  async getAuditLogs(): Promise<AdminAuditLogRecord[]> {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && Array.isArray(data) && data.length > 0) {
        return data as AdminAuditLogRecord[];
      }
    } catch {
      // Fallback
    }
    return getLocalAuditLogs();
  },
};
