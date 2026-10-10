import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  Filter,
  KeyRound,
  RotateCcw,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Building2,
  Mail,
  BadgeCheck,
  Copy,
  Clock,
  ScrollText,
  X,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  officerService,
  type OfficerRecord,
  type AdminAuditLogRecord,
  type CreateOfficerInput,
  type UpdateOfficerInput,
} from '@/lib/officerService';
import { cn } from '@/lib/utils';

interface OfficerManagementProps {
  navigate?: (to: string) => void;
}

const DEPARTMENTS = [
  'Social Welfare Department',
  'Department of Higher Education',
  'Revenue & Forest Department',
  'Tribal Development Department',
  'Public Health Department',
  'School Education & Sports Department',
];

export function OfficerManagement({ navigate }: OfficerManagementProps) {
  const [officers, setOfficers] = useState<OfficerRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'audit'>('directory');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'deactivated'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerRecord | null>(null);

  // Add Form state
  const [addFullName, setAddFullName] = useState('');
  const [addEmployeeId, setAddEmployeeId] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDept, setAddDept] = useState(DEPARTMENTS[0]);
  const [addDesignation, setAddDesignation] = useState('Assistant Verification Officer');
  const [addTempPassword, setAddTempPassword] = useState('');
  const [addFormError, setAddFormError] = useState('');
  const [addFormSuccess, setAddFormSuccess] = useState('');
  const [createdCredentialsNotice, setCreatedCredentialsNotice] = useState<{
    email: string;
    empId: string;
    password: string;
  } | null>(null);

  // Edit Form state
  const [editFullName, setEditFullName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState('');

  // Password Reset modal state
  const [resetStep, setResetStep] = useState<'confirm' | 'result'>('confirm');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [tempGeneratedPassword, setTempGeneratedPassword] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Action status feedback
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [officersList, logsList] = await Promise.all([
        officerService.getOfficers(),
        officerService.getAuditLogs(),
      ]);
      setOfficers(officersList);
      setAuditLogs(logsList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered officers
  const filteredOfficers = useMemo(() => {
    return officers.filter((officer) => {
      const matchesSearch =
        searchTerm === '' ||
        officer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'all' || officer.department === selectedDept;

      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active' && officer.is_active) ||
        (selectedStatus === 'deactivated' && !officer.is_active);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [officers, searchTerm, selectedDept, selectedStatus]);

  const metrics = useMemo(() => {
    const total = officers.length;
    const active = officers.filter((o) => o.is_active).length;
    const deactivated = total - active;
    const departments = new Set(officers.map((o) => o.department)).size;
    return { total, active, deactivated, departments };
  }, [officers]);

  // Handle Add Officer Submit
  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError('');
    setAddFormSuccess('');

    if (!addFullName.trim() || !addEmployeeId.trim() || !addEmail.trim() || !addDept || !addDesignation) {
      setAddFormError('Please complete all mandatory fields.');
      return;
    }

    const defaultPassword = addTempPassword.trim() || `GovOfficer@${Math.floor(100000 + Math.random() * 900000)}!`;

    const input: CreateOfficerInput = {
      fullName: addFullName.trim(),
      employeeId: addEmployeeId.trim().toUpperCase(),
      email: addEmail.trim().toLowerCase(),
      department: addDept,
      designation: addDesignation.trim(),
      temporaryPassword: defaultPassword,
    };

    const res = await officerService.createOfficer(input);
    if (res.error) {
      setAddFormError(res.error);
      return;
    }

    setCreatedCredentialsNotice({
      email: input.email,
      empId: input.employeeId,
      password: defaultPassword,
    });
    setAddFormSuccess(`Officer account created successfully by Administrator Nahid Shams.`);
    await loadData();
  };

  // Open Edit Modal
  const openEditModal = (officer: OfficerRecord) => {
    setSelectedOfficer(officer);
    setEditFullName(officer.full_name);
    setEditDept(officer.department);
    setEditDesignation(officer.designation);
    setEditNotes(officer.notes || '');
    setEditError('');
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;
    setEditError('');

    const updates: UpdateOfficerInput = {
      fullName: editFullName.trim(),
      department: editDept,
      designation: editDesignation.trim(),
      notes: editNotes.trim(),
    };

    const res = await officerService.updateOfficer(selectedOfficer.id, updates);
    if (!res.success) {
      setEditError(res.error || 'Failed to update officer.');
      return;
    }

    setShowEditModal(false);
    setActionNotice({
      type: 'success',
      message: `Officer ${updates.fullName} (${selectedOfficer.employee_id}) details updated successfully.`,
    });
    await loadData();
  };

  // Open Status Toggle Modal
  const openStatusModal = (officer: OfficerRecord) => {
    setSelectedOfficer(officer);
    setShowStatusModal(true);
  };

  // Confirm Status Toggle
  const handleConfirmStatusToggle = async () => {
    if (!selectedOfficer) return;
    const newStatus = !selectedOfficer.is_active;
    const res = await officerService.toggleOfficerStatus(selectedOfficer.id, newStatus);
    setShowStatusModal(false);

    if (res.success) {
      setActionNotice({
        type: 'success',
        message: `Officer ${selectedOfficer.full_name} (${selectedOfficer.employee_id}) has been ${
          newStatus ? 'activated' : 'deactivated'
        } by Administrator Nahid Shams.`,
      });
      await loadData();
    } else {
      setActionNotice({
        type: 'error',
        message: res.error || 'Failed to update officer status.',
      });
    }
  };

  // Open Reset Credentials Confirmation Modal
  const openResetModal = (officer: OfficerRecord) => {
    setSelectedOfficer(officer);
    setResetStep('confirm');
    setResetLoading(false);
    setResetError(null);
    setTempGeneratedPassword('');
    setCopiedNotice(false);
    setShowResetModal(true);
  };

  // Confirm Reset Credentials & Generate Temporary Password
  const handleConfirmReset = async () => {
    if (!selectedOfficer) return;
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await officerService.resetOfficerCredentials(selectedOfficer.id);
      if (res.success && res.tempPassword) {
        setTempGeneratedPassword(res.tempPassword);
        setResetStep('result');
        await loadData();
      } else {
        setResetError(res.error || 'Failed to securely reset officer credentials.');
      }
    } catch (err: any) {
      setResetError(err.message || 'An unexpected error occurred during password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  // Close Reset Modal safely and purge generated temporary password
  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setTempGeneratedPassword('');
    setResetStep('confirm');
    setResetError(null);
  };

  // Open Revoke Modal
  const openRevokeModal = (officer: OfficerRecord) => {
    setSelectedOfficer(officer);
    setShowRevokeModal(true);
  };

  // Confirm Revoke Access
  const handleConfirmRevoke = async () => {
    if (!selectedOfficer) return;
    const res = await officerService.revokeOfficerAccess(selectedOfficer.id);
    setShowRevokeModal(false);
    if (res.success) {
      setActionNotice({
        type: 'success',
        message: `Access authorization permanently revoked for ${selectedOfficer.full_name} (${selectedOfficer.employee_id}).`,
      });
      await loadData();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] min-h-screen">
      {/* ── TOP HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#4A2E22] bg-gradient-to-r from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF9F0] shadow-luxury-lg">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#C58B55]/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-20 h-64 w-64 rounded-full bg-[#6F4028]/25 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/20 px-3.5 py-1 text-xs font-bold text-[#E8D5BF]">
                <ShieldCheck className="h-4 w-4 text-[#C58B55]" />
                ADMINISTRATION SECURITY MODULE
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-mono text-[11px] font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Root Authority: Nahid Shams
              </span>
            </div>

            <h1 className="font-display text-3xl font-black tracking-tight text-[#FFF9F0] sm:text-4xl">
              Officer Account Management & Authorization
            </h1>

            <p className="max-w-3xl text-sm text-[#E8D5BF] leading-relaxed">
              Secure, server-governed provisioning and lifecycle management of departmental verification officers across Maharashtra.
              Supervised strictly under authorized Administrator identity <strong className="text-[#FFF9F0] underline decoration-[#C58B55]">Nahid Shams</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setAddFormError('');
                setAddFormSuccess('');
                setCreatedCredentialsNotice(null);
                setAddFullName('');
                setAddEmployeeId(`MH-OFF-2026-${Math.floor(10000 + Math.random() * 90000)}`);
                setAddEmail('');
                setAddTempPassword('');
                setShowAddModal(true);
              }}
              className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#a8703f] hover:from-[#b07844] hover:to-[#935f34] text-[#2B1B14] font-bold text-sm shadow-luxury px-5 py-2.5 rounded-xl border-0 transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="h-4 w-4" />
              Add Government Officer
            </Button>
            <Button
              variant="outline"
              onClick={loadData}
              className="gap-2 border-[#6F4028] bg-[#2B1B14]/80 text-[#FFF9F0] hover:bg-[#38241B] hover:text-[#FFF9F0] text-sm rounded-xl"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Refresh Directory
            </Button>
          </div>
        </div>

        {/* Admin Identity Verified Footer within Banner */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-[#4A2E22] pt-4 text-xs text-[#D8C2AA]">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-[#C58B55]" />
            <span>Authorized Administrator Identity:</span>
            <strong className="text-[#FFF9F0] font-semibold">Nahid Shams</strong>
            <span className="text-[#786453]">•</span>
            <span className="font-mono text-[11px] text-[#C58B55]">ID: MH-ADM-ROOT-001</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#E8D5BF]/80">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>Database RLS & Server-Side Security Enforced</span>
          </div>
        </div>
      </div>

      {/* ── NOTIFICATION ALERT BANNER ── */}
      {actionNotice && (
        <div
          className={cn(
            'flex items-center justify-between rounded-2xl p-4 border text-sm font-semibold transition-all shadow-md',
            actionNotice.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
              : 'border-rose-300 bg-rose-50 text-rose-900'
          )}
        >
          <div className="flex items-center gap-3">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── METRIC STATS SUMMARY ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl border border-[#D8C2AA] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] p-5 shadow-luxury">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#786453]">Total Officers</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6F4028]/10 text-[#6F4028]">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-black text-[#2B1B14]">{metrics.total}</p>
          <p className="mt-1 text-[11px] text-[#786453]">Controlled by Nahid Shams</p>
        </Card>

        <Card className="rounded-2xl border border-[#D8C2AA] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] p-5 shadow-luxury">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Active Authorized</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-black text-emerald-700">{metrics.active}</p>
          <p className="mt-1 text-[11px] text-emerald-800">Permitted to review claims</p>
        </Card>

        <Card className="rounded-2xl border border-[#D8C2AA] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] p-5 shadow-luxury">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-800">Deactivated / Suspended</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-black text-rose-700">{metrics.deactivated}</p>
          <p className="mt-1 text-[11px] text-rose-800">Access strictly blocked</p>
        </Card>

        <Card className="rounded-2xl border border-[#D8C2AA] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] p-5 shadow-luxury">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6F4028]">Covered Departments</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C58B55]/15 text-[#6F4028]">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-3xl font-black text-[#2B1B14]">{metrics.departments}</p>
          <p className="mt-1 text-[11px] text-[#786453]">State federated nodes</p>
        </Card>
      </div>

      {/* ── TAB SELECTOR: DIRECTORY VS AUDIT TRAIL ── */}
      <div className="flex items-center gap-3 border-b border-[#D8C2AA] pb-1">
        <button
          onClick={() => setActiveTab('directory')}
          className={cn(
            'flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-bold transition-all border-b-2',
            activeTab === 'directory'
              ? 'border-[#6F4028] bg-[#FFF9F0] text-[#2B1B14] shadow-xs'
              : 'border-transparent text-[#786453] hover:text-[#2B1B14] hover:bg-[#E8D5BF]/40'
          )}
        >
          <Shield className="h-4 w-4 text-[#C58B55]" />
          Authorized Officers Directory ({officers.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={cn(
            'flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-bold transition-all border-b-2',
            activeTab === 'audit'
              ? 'border-[#6F4028] bg-[#FFF9F0] text-[#2B1B14] shadow-xs'
              : 'border-transparent text-[#786453] hover:text-[#2B1B14] hover:bg-[#E8D5BF]/40'
          )}
        >
          <ScrollText className="h-4 w-4 text-[#C58B55]" />
          Administrative Audit Trail ({auditLogs.length})
        </button>
      </div>

      {activeTab === 'directory' ? (
        <div className="space-y-6">
          {/* ── SEARCH & FILTER CONTROLS ── */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#D8C2AA] bg-[#FFF9F0] p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#786453]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#D8C2AA] bg-[#FFFDF9] text-[#2B1B14] placeholder:text-[#786453]/60 focus:border-[#6F4028] focus:ring-[#6F4028]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Department Filter */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6F4028]">
                <Filter className="h-3.5 w-3.5" />
                <span>Dept:</span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="rounded-xl border border-[#D8C2AA] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B14] focus:border-[#6F4028] focus:outline-hidden"
                >
                  <option value="all">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6F4028]">
                <span>Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="rounded-xl border border-[#D8C2AA] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B14] focus:border-[#6F4028] focus:outline-hidden"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="deactivated">Deactivated Only</option>
                </select>
              </div>

              {(searchTerm || selectedDept !== 'all' || selectedStatus !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDept('all');
                    setSelectedStatus('all');
                  }}
                  className="text-xs text-[#786453] hover:text-[#2B1B14]"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* ── OFFICERS DATA TABLE ── */}
          <div className="overflow-hidden rounded-2xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#2B1B14]">
                <thead className="border-b border-[#D8C2AA] bg-[#FAF3E8] text-xs font-bold uppercase tracking-wider text-[#6F4028]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Officer Identity</th>
                    <th scope="col" className="px-6 py-4">Department & Designation</th>
                    <th scope="col" className="px-6 py-4">Official Email</th>
                    <th scope="col" className="px-6 py-4">Account Status</th>
                    <th scope="col" className="px-6 py-4">Authentication Policy</th>
                    <th scope="col" className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-[#C58B55]" />
                        <span>Credentials</span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C2AA]/60">
                  {filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#786453]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserX className="h-8 w-8 text-[#C58B55]" />
                          <p className="font-bold text-base text-[#2B1B14]">No officer accounts match the selected criteria</p>
                          <p className="text-xs">Adjust your search keyword or department filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map((officer) => (
                      <tr
                        key={officer.id}
                        className={cn(
                          'transition-colors hover:bg-[#FAF3E8]/80',
                          !officer.is_active && 'bg-rose-50/40'
                        )}
                      >
                        {/* Identity & Employee ID */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-xs',
                                officer.is_active
                                  ? 'bg-[#6F4028] text-[#FFF9F0]'
                                  : 'bg-rose-800 text-[#FFF9F0]'
                              )}
                            >
                              {officer.full_name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#2B1B14]">{officer.full_name}</span>
                                {!officer.is_active && (
                                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                                    SUSPENDED
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-xs font-semibold text-[#6F4028]">
                                {officer.employee_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Dept & Designation */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#2B1B14]">{officer.department}</div>
                          <div className="text-xs text-[#786453]">{officer.designation}</div>
                        </td>

                        {/* Official Email */}
                        <td className="px-6 py-4 font-mono text-xs text-[#38241B]">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-[#C58B55]" />
                            <span>{officer.email}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          {officer.is_active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active Authorized
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800 shadow-2xs">
                              <span className="h-2 w-2 rounded-full bg-rose-500" />
                              Deactivated
                            </span>
                          )}
                        </td>

                        {/* Authentication Policy */}
                        <td className="px-6 py-4 text-xs">
                          {officer.must_change_password ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 font-semibold text-amber-900 border border-amber-300">
                              <RotateCcw className="h-3 w-3 text-amber-700" />
                              Password Reset Required
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Credentials Verified
                            </span>
                          )}
                          <div className="mt-1 text-[11px] text-[#786453]">
                            Created: {new Date(officer.created_at).toLocaleDateString('en-IN')}
                          </div>
                        </td>

                        {/* Credentials Column */}
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 min-w-[210px]">
                            {/* Credential Status */}
                            <div className="flex items-center gap-1.5">
                              <KeyRound className="h-3.5 w-3.5 text-[#C58B55] shrink-0" />
                              {!officer.is_active ? (
                                <span className="inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-200">
                                  Access Suspended
                                </span>
                              ) : officer.must_change_password ? (
                                <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-300">
                                  Temporary Credential
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                                  Active & Secured
                                </span>
                              )}
                            </div>

                            {/* Password Setup Status */}
                            <div className="text-[11px] text-[#786453]">
                              <span className="font-semibold text-[#38241B]">Setup:</span>{' '}
                              {officer.must_change_password ? (
                                <span className="text-amber-800 font-semibold">Requires First-Login Change</span>
                              ) : (
                                <span className="text-emerald-700 font-semibold">Password Configured</span>
                              )}
                            </div>

                            {/* Last Password Reset Date */}
                            <div className="text-[11px] text-[#786453] flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[#A89078] shrink-0" />
                              <span>
                                Last Reset:{' '}
                                <strong className="text-[#38241B]">
                                  {officer.last_password_reset_at
                                    ? new Date(officer.last_password_reset_at).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : 'Never Reset'}
                                </strong>
                              </span>
                            </div>

                            {/* Reset Password Action Button with Key Icon */}
                            <div className="pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openResetModal(officer)}
                                className="h-7 gap-1.5 border-[#C58B55]/60 bg-[#FFFDF9] px-2.5 text-[11px] font-bold text-[#6F4028] hover:border-[#6F4028] hover:bg-[#FAF3E8] hover:text-[#2B1B14] shadow-2xs"
                                title={`Reset login credentials for ${officer.full_name}`}
                              >
                                <KeyRound className="h-3 w-3 text-[#C58B55]" />
                                Reset Password
                              </Button>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(officer)}
                              className="h-8 border-[#D8C2AA] bg-[#FFFDF9] text-[#2B1B14] hover:bg-[#FAF3E8] hover:text-[#6F4028] px-2.5 text-xs font-bold"
                              title="Edit Officer Details"
                            >
                              <Edit3 className="h-3.5 w-3.5 mr-1 text-[#6F4028]" />
                              Edit
                            </Button>

                            {/* Status Toggle Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openStatusModal(officer)}
                              className={cn(
                                'h-8 px-2.5 text-xs font-bold border transition-colors',
                                officer.is_active
                                  ? 'border-rose-300 bg-rose-50/60 text-rose-800 hover:bg-rose-100'
                                  : 'border-emerald-300 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100'
                              )}
                              title={officer.is_active ? 'Deactivate Officer Account' : 'Activate Officer Account'}
                            >
                              {officer.is_active ? (
                                <>
                                  <UserX className="h-3.5 w-3.5 mr-1 text-rose-600" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                                  Activate
                                </>
                              )}
                            </Button>

                            {/* Reset Credentials */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openResetModal(officer)}
                              className="h-8 border-[#D8C2AA] bg-[#FFFDF9] text-[#2B1B14] hover:bg-[#FAF3E8] px-2.5 text-xs font-bold"
                              title="Reset Officer Temporary Credentials"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-[#C58B55]" />
                            </Button>

                            {/* Revoke Access */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openRevokeModal(officer)}
                              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-100 hover:text-rose-800"
                              title="Permanently Revoke Access"
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#D8C2AA] bg-[#FAF3E8] px-6 py-3 text-xs text-[#786453] flex items-center justify-between">
              <div>
                Showing <strong className="text-[#2B1B14]">{filteredOfficers.length}</strong> of{' '}
                <strong className="text-[#2B1B14]">{officers.length}</strong> authorized government officers
              </div>
              <div className="font-semibold text-[#6F4028]">
                Administrator in Control: <span className="font-bold underline">Nahid Shams</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── AUDIT TRAIL TAB ── */
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#D8C2AA] bg-[#FFF9F0] p-6 shadow-luxury">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#2B1B14]">
                  Immutable Officer Authorization Ledger
                </h3>
                <p className="text-xs text-[#786453]">
                  All creation, role assignments, activations, and credential resets initiated by Administrator Nahid Shams.
                </p>
              </div>
              <Badge className="bg-[#6F4028] text-[#FFF9F0] text-xs font-mono">
                {auditLogs.length} Logged Events
              </Badge>
            </div>

            <div className="divide-y divide-[#D8C2AA]/60">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                        log.action.includes('created')
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action.includes('deactivated') || log.action.includes('revoked')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-[#C58B55]/20 text-[#6F4028]'
                      )}
                    >
                      <ScrollText className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2B1B14]">{log.detail}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#786453] mt-0.5">
                        <span className="font-semibold text-[#6F4028]">Actor: {log.actor_name}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">Target: {log.target_id || 'System'}</span>
                        <span>•</span>
                        <Badge variant="outline" className="border-[#D8C2AA] text-[10px] py-0 px-1.5">
                          {log.action}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-[#786453] shrink-0 sm:self-center">
                    {new Date(log.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD OFFICER ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-[#D8C2AA] bg-[#2B1B14] p-6 text-[#FFF9F0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6F4028] text-[#FFF9F0] shadow-xs">
                    <UserPlus className="h-5 w-5 text-[#C58B55]" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#FFF9F0]">
                      Add New Government Officer
                    </h2>
                    <p className="text-xs text-[#E8D5BF]">
                      Supervised by Administrator: <strong className="text-[#FFF9F0]">Nahid Shams</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1.5 text-[#E8D5BF] hover:bg-[#38241B] hover:text-[#FFF9F0]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddOfficer} className="p-6 space-y-4">
              {addFormError && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{addFormError}</span>
                </div>
              )}

              {addFormSuccess && (
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{addFormSuccess}</span>
                  </div>
                  {createdCredentialsNotice && (
                    <div className="rounded-lg bg-white/80 p-2.5 border border-emerald-200 space-y-1 font-mono text-[11px]">
                      <div><strong>Officer Email:</strong> {createdCredentialsNotice.email}</div>
                      <div><strong>Employee ID:</strong> {createdCredentialsNotice.empId}</div>
                      <div className="flex items-center justify-between">
                        <span><strong>Temporary Password:</strong> {createdCredentialsNotice.password}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(createdCredentialsNotice.password)}
                          className="h-6 px-2 text-[10px] text-emerald-800"
                        >
                          {copiedNotice ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-emerald-700 italic">
                    Note: For security reasons, temporary credentials will not be stored in plaintext or displayed again in the public directory table.
                  </p>
                </div>
              )}

              {!addFormSuccess ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-bold text-[#6F4028]">Full Name *</Label>
                      <Input
                        required
                        value={addFullName}
                        onChange={(e) => setAddFullName(e.target.value)}
                        className="mt-1 border-[#D8C2AA] bg-[#FFFDF9] text-xs font-medium text-[#2B1B14]"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-[#6F4028]">Employee ID *</Label>
                      <Input
                        required
                        value={addEmployeeId}
                        onChange={(e) => setAddEmployeeId(e.target.value)}
                        className="mt-1 font-mono border-[#D8C2AA] bg-[#FFFDF9] text-xs font-medium text-[#2B1B14]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-[#6F4028]">Official Email Address *</Label>
                    <Input
                      required
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="mt-1 border-[#D8C2AA] bg-[#FFFDF9] text-xs font-medium text-[#2B1B14]"
                    />
                    <span className="text-[10px] text-[#786453]">Must be an official government departmental domain.</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs font-bold text-[#6F4028]">Assigned Department *</Label>
                      <select
                        value={addDept}
                        onChange={(e) => setAddDept(e.target.value)}
                        className="mt-1 w-full rounded-md border border-[#D8C2AA] bg-[#FFFDF9] p-2 text-xs font-semibold text-[#2B1B14] focus:border-[#6F4028]"
                      >
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-[#6F4028]">Designation *</Label>
                      <Input
                        required
                        value={addDesignation}
                        onChange={(e) => setAddDesignation(e.target.value)}
                        className="mt-1 border-[#D8C2AA] bg-[#FFFDF9] text-xs font-medium text-[#2B1B14]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-[#6F4028]">
                      Temporary Password (Optional - leave blank to auto-generate)
                    </Label>
                    <Input
                      type="text"
                      value={addTempPassword}
                      onChange={(e) => setAddTempPassword(e.target.value)}
                      className="mt-1 font-mono border-[#D8C2AA] bg-[#FFFDF9] text-xs font-medium text-[#2B1B14]"
                    />
                    <span className="text-[10px] text-[#786453]">
                      Officer will be strictly required to change this password on initial login.
                    </span>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8C2AA]">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddModal(false)}
                      className="text-xs font-bold text-[#786453]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold"
                    >
                      Create & Authorize Officer
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex justify-end pt-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddFormSuccess('');
                      setCreatedCredentialsNotice(null);
                    }}
                    className="bg-[#6F4028] text-[#FFF9F0] text-xs font-bold"
                  >
                    Done & Close
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT OFFICER ── */}
      {showEditModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-2xl">
            <div className="border-b border-[#D8C2AA] bg-[#2B1B14] p-5 text-[#FFF9F0]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold text-[#FFF9F0]">
                    Edit Officer Details: {selectedOfficer.employee_id}
                  </h3>
                  <p className="text-xs text-[#E8D5BF]">
                    Authorized Admin: <strong>Nahid Shams</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg p-1 text-[#E8D5BF] hover:text-[#FFF9F0]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-800 font-bold">
                  {editError}
                </div>
              )}

              <div>
                <Label className="text-xs font-bold text-[#6F4028]">Full Name</Label>
                <Input
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="mt-1 border-[#D8C2AA] bg-[#FFFDF9] text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-[#6F4028]">Department</Label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="mt-1 w-full rounded-md border border-[#D8C2AA] bg-[#FFFDF9] p-2 text-xs font-semibold text-[#2B1B14]"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold text-[#6F4028]">Designation</Label>
                <Input
                  required
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="mt-1 border-[#D8C2AA] bg-[#FFFDF9] text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-[#6F4028]">Administrative Notes</Label>
                <Input
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="mt-1 border-[#D8C2AA] bg-[#FFFDF9] text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8C2AA]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="text-xs font-bold text-[#786453]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: STATUS TOGGLE (ACTIVATE / DEACTIVATE) ── */}
      {showStatusModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold',
                  selectedOfficer.is_active ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                )}
              >
                {selectedOfficer.is_active ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#2B1B14]">
                  {selectedOfficer.is_active ? 'Deactivate Officer Account?' : 'Reactivate Officer Account?'}
                </h3>
                <p className="text-xs text-[#786453]">{selectedOfficer.full_name} ({selectedOfficer.employee_id})</p>
              </div>
            </div>

            <p className="text-xs text-[#786453] leading-relaxed">
              {selectedOfficer.is_active ? (
                <>
                  Deactivating this officer will immediately prevent them from logging into the Officer Console and executing any scholarship or document reviews.
                  This action is recorded in the permanent audit ledger under Administrator <strong>Nahid Shams</strong>.
                </>
              ) : (
                <>
                  Activating this officer restores their review authority and enables them to log in using their credentials.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8C2AA]">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
                className="text-xs font-bold text-[#786453]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmStatusToggle}
                className={cn(
                  'text-xs font-bold text-[#FFF9F0]',
                  selectedOfficer.is_active ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-700 hover:bg-emerald-800'
                )}
              >
                {selectedOfficer.is_active ? 'Confirm Deactivation' : 'Confirm Activation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RESET CREDENTIALS (TWO-STEP CONFIRMATION & ONE-TIME DISPLAY) ── */}
      {showResetModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-2xl p-6 sm:p-7 space-y-5">
            {resetStep === 'confirm' ? (
              <>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6F4028]/10 text-[#6F4028] border border-[#C58B55]/30">
                    <KeyRound className="h-6 w-6 text-[#C58B55]" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#6F4028] uppercase tracking-wide">
                      Admin Security Protocol
                    </span>
                    <h3 className="font-display text-lg font-bold text-[#2B1B14] mt-1">
                      Confirm Officer Password Reset
                    </h3>
                    <p className="text-xs text-[#786453] mt-0.5">
                      Target Account: <strong className="text-[#2B1B14]">{selectedOfficer.full_name}</strong> ({selectedOfficer.employee_id})
                    </p>
                  </div>
                </div>

                {/* Target Officer Details */}
                <div className="rounded-2xl border border-[#D8C2AA] bg-[#FAF3E8] p-4 text-xs space-y-2">
                  <div className="flex justify-between items-center text-[#786453]">
                    <span>Official Email:</span>
                    <span className="font-mono font-semibold text-[#2B1B14]">{selectedOfficer.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#786453]">
                    <span>Department:</span>
                    <span className="font-semibold text-[#2B1B14]">{selectedOfficer.department}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#786453]">
                    <span>Designation:</span>
                    <span className="font-semibold text-[#2B1B14]">{selectedOfficer.designation}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#786453]">
                    <span>Last Password Reset:</span>
                    <span className="font-semibold text-[#2B1B14]">
                      {selectedOfficer.last_password_reset_at
                        ? new Date(selectedOfficer.last_password_reset_at).toLocaleString('en-IN')
                        : 'Never Reset'}
                    </span>
                  </div>
                </div>

                {/* Security & Policy Briefing */}
                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>Security Verification & Reset Rules</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-[11px] leading-relaxed">
                    <li>A cryptographically secure temporary password will be generated upon confirmation.</li>
                    <li>The temporary password will be displayed <strong>ONCE</strong> to Administrator Nahid Shams and must be delivered to the officer securely.</li>
                    <li>The officer will be <strong>required to change the temporary password</strong> on their very first login.</li>
                    <li>Existing officer passwords are never exposed, and plaintext passwords are never stored in the database.</li>
                    <li>This operation is logged to the immutable audit trail under root admin <strong>Nahid Shams</strong>.</li>
                  </ul>
                </div>

                {resetError && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-900 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8C2AA]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseResetModal}
                    disabled={resetLoading}
                    className="border-[#D8C2AA] text-xs font-bold text-[#786453] hover:bg-[#FAF3E8]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmReset}
                    disabled={resetLoading}
                    className="gap-2 bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold shadow-md"
                  >
                    {resetLoading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Generating Credentials…
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-3.5 w-3.5 text-[#C58B55]" />
                        Confirm & Generate Temporary Password
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              /* ── STEP 2: ONE-TIME DISPLAY OF TEMPORARY PASSWORD ── */
              <>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                      Credentials Generated
                    </span>
                    <h3 className="font-display text-lg font-bold text-[#2B1B14] mt-1">
                      Temporary Password Issued
                    </h3>
                    <p className="text-xs text-[#786453] mt-0.5">
                      For Officer <strong className="text-[#2B1B14]">{selectedOfficer.full_name}</strong> ({selectedOfficer.employee_id})
                    </p>
                  </div>
                </div>

                {/* ONE-TIME DISPLAY WARNING */}
                <div className="rounded-2xl border border-[#C58B55] bg-gradient-to-r from-amber-50 to-[#FAF3E8] p-4 text-xs text-amber-950 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-[#6F4028]">
                    <ShieldAlert className="h-4 w-4 text-[#C58B55] shrink-0" />
                    <span>One-Time Security Display Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#583320]">
                    This temporary password is displayed <strong>ONCE</strong> to authorized Administrator <strong>Nahid Shams</strong>.
                    For strict zero-knowledge security, it will <strong>never be shown again</strong> and is never saved in plaintext in the database or audit logs.
                    Please copy it now and transmit it via an encrypted official communication channel.
                  </p>
                </div>

                {/* Temporary Password Box with Copy Button */}
                <div className="rounded-2xl border-2 border-[#C58B55] bg-[#2B1B14] p-4 text-center space-y-3 shadow-lg">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#E8D5BF]">
                    Generated Temporary Password
                  </div>
                  <div className="flex items-center justify-center">
                    <code className="select-all rounded-xl bg-[#38241B] px-4 py-2 font-mono text-xl font-black tracking-wider text-[#FFF9F0] border border-[#6F4028]">
                      {tempGeneratedPassword}
                    </code>
                  </div>
                  <Button
                    type="button"
                    onClick={() => copyToClipboard(tempGeneratedPassword)}
                    className={cn(
                      'w-full gap-2 font-bold text-xs transition-all shadow-md',
                      copiedNotice
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-gradient-to-r from-[#C58B55] to-[#a8703f] hover:from-[#b07844] hover:to-[#935f34] text-[#2B1B14]'
                    )}
                  >
                    {copiedNotice ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Temporary Password
                      </>
                    )}
                  </Button>
                </div>

                {/* First-login change notice */}
                <div className="rounded-xl border border-[#D8C2AA] bg-[#FAF3E8] p-3 text-xs text-[#786453] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2B1B14]">
                    <Lock className="h-3.5 w-3.5 text-[#C58B55]" />
                    <span>First-Login Password Change Mandatory</span>
                  </div>
                  <p className="text-[11px]">
                    The account flag <code className="bg-[#E8D5BF] px-1 py-0.5 rounded text-[10px] text-[#2B1B14]">must_change_password: true</code> has been enforced. The officer will be prompted to choose a new password immediately upon initial sign-in.
                  </p>
                </div>

                {/* Done Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D8C2AA]">
                  <span className="text-[11px] text-[#786453]">
                    Audited by Administrator: <strong className="text-[#2B1B14]">Nahid Shams</strong>
                  </span>
                  <Button
                    type="button"
                    onClick={handleCloseResetModal}
                    className="bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold px-6"
                  >
                    Done & Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: REVOKE OFFICER ACCESS ── */}
      {showRevokeModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-300 bg-[#FFF9F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-rose-900">
                  Revoke Officer Access Permanently?
                </h3>
                <p className="text-xs text-[#786453]">{selectedOfficer.full_name} ({selectedOfficer.employee_id})</p>
              </div>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-900 leading-relaxed">
              <strong>High-Risk Security Action:</strong> This will strip the officer's role privileges, terminate active auth sessions, and mark the account revoked in the database.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8C2AA]">
              <Button
                variant="outline"
                onClick={() => setShowRevokeModal(false)}
                className="text-xs font-bold text-[#786453]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRevoke}
                className="bg-rose-700 hover:bg-rose-800 text-[#FFF9F0] text-xs font-bold"
              >
                Permanently Revoke Access
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
