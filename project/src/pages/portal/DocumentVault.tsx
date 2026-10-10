import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Eye,
  ExternalLink,
  RefreshCw,
  FolderLock,
  Layers,
  Sparkles,
  Lock,
  Plus,
  X,
  FileCheck,
  ArrowRight,
  Building2,
  Trash2,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import {
  fetchCitizenVault,
  uploadDirectVaultDocument,
  getSignedUrl,
  deleteVaultDocument,
  validateFile,
} from '@/lib/documentService';
import {
  SERVICE_DOCUMENT_CONFIGS,
  getServicesForDocumentType,
} from '@/lib/serviceDocumentRequirements';
import type { VaultDocument, DocumentType } from '@/types';
import { cn } from '@/lib/utils';

interface DocumentVaultProps {
  navigate?: (to: string) => void;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  identity_proof: 'Aadhaar / Sovereign Identity Proof',
  domicile_certificate: 'Maharashtra Domicile Certificate',
  income_certificate: 'Tahsildar Income Certificate',
  caste_certificate: 'Caste & Validity Certificate',
  bank_proof: 'Aadhaar-Seeded Bank Passbook',
  ration_card: 'Ration Card (BPL / Priority)',
  student_certificate: 'School / College Bonafide Certificate',
  salary_slip: 'Salary Slips / Employer Form 16',
  land_record: '7/12 Extract / Land Record',
  previous_marksheet: 'Previous Academic Marksheet',
  medical_estimate: 'Hospital Treatment Estimate',
  welfare_proof: 'Welfare Category Attestation',
};

export function DocumentVault({ navigate }: DocumentVaultProps) {
  const { user, citizenProfile, addNotification, addAuditEvent } = useApp();
  const citizenId = user?.id || 'Information not available';

  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('maha-scholarship');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<DocumentType>('income_certificate');
  const [uploadValidity, setUploadValidity] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadVault = useCallback(async () => {
    setLoading(true);
    const docs = await fetchCitizenVault(user?.id);
    setVaultDocs(docs);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  // Handle direct vault document upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadFile) {
      setUploadError('Please select a document file to upload (PDF, JPG, or PNG under 10MB).');
      return;
    }

    const validation = validateFile(uploadFile);
    if (validation) {
      setUploadError(validation);
      return;
    }

    setUploading(true);
    const res = await uploadDirectVaultDocument(
      uploadFile,
      citizenId,
      uploadType,
      uploadValidity.trim() || undefined
    );
    setUploading(false);

    if (res.error || !res.data) {
      setUploadError(res.error || 'Failed to securely store document in vault.');
      return;
    }

    // Success feedback
    addNotification({
      id: `n-${Date.now()}`,
      title: 'Document Added to Vault',
      message: `Your ${DOCUMENT_TYPE_LABELS[uploadType]} has been stored securely in your vault. Status: Pending Verification by department officers.`,
      type: 'info',
      read: false,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    });

    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId: 'VAULT-STORAGE',
      action: 'Document Uploaded to Vault',
      actor: user?.name || 'Citizen',
      actorRole: 'citizen',
      detail: `Citizen deposited ${DOCUMENT_TYPE_LABELS[uploadType]} into private document vault. Awaiting officer verification.`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      type: 'submit',
    });

    setShowUploadModal(false);
    setUploadFile(null);
    setUploadValidity('');
    await loadVault();
  };

  const handleOpenPreview = async (doc: VaultDocument) => {
    setPreviewDoc(doc);
    setPreviewUrl(null);
    const url = await getSignedUrl(doc.file_path, 120);
    setPreviewUrl(url);
  };

  const handleDelete = async (doc: VaultDocument) => {
    if (window.confirm(`Are you sure you want to remove "${doc.file_name}" from your vault?`)) {
      await deleteVaultDocument(doc.id);
      await loadVault();
    }
  };

  // Filtered vault docs
  const filteredDocs = vaultDocs.filter((doc) => {
    const matchesSearch =
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      DOCUMENT_TYPE_LABELS[doc.document_type]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.verified_by?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'verified' && doc.status === 'verified') ||
      (statusFilter === 'pending' && doc.status === 'pending');

    return matchesSearch && matchesStatus;
  });

  const metrics = {
    total: vaultDocs.length,
    verified: vaultDocs.filter((d) => d.status === 'verified').length,
    pending: vaultDocs.filter((d) => d.status === 'pending').length,
  };

  // Selected service document checklist analysis
  const currentServiceConfig = SERVICE_DOCUMENT_CONFIGS[selectedServiceId];
  const serviceChecklistAnalysis = currentServiceConfig.checklist.map((req) => {
    const matchingDoc = vaultDocs.find(
      (d) => d.document_type === req.type && d.is_valid && (d.status === 'verified' || !d.status)
    );
    return {
      requirement: req,
      isAvailable: !!matchingDoc,
      vaultDoc: matchingDoc,
    };
  });

  const availableCount = serviceChecklistAnalysis.filter((item) => item.isAvailable).length;
  const totalRequiredCount = serviceChecklistAnalysis.length;
  const readinessPercent = Math.round((availableCount / totalRequiredCount) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] min-h-screen text-[#38241B]">
      {/* ── TOP HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#4A2E22] bg-gradient-to-r from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF9F0] shadow-luxury-lg">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#C58B55]/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-20 h-64 w-64 rounded-full bg-[#6F4028]/30 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/20 px-3.5 py-1 text-xs font-bold text-[#E8D5BF]">
                <FolderLock className="h-4 w-4 text-[#C58B55]" />
                SOVEREIGN CITIZEN DOCUMENT VAULT
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-mono text-[11px] font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Submit Once • Verify Once • Securely Reuse
              </span>
            </div>

            <h1 className="font-display text-3xl font-black tracking-tight text-[#FFF9F0] sm:text-4xl">
              Cross-Department Document Repository
            </h1>

            <p className="max-w-3xl text-sm text-[#E8D5BF] leading-relaxed">
              Your verified state credentials (Aadhaar, Domicile, Tahsildar Income Certificate, Caste Validity) are securely preserved in private storage.
              When applying for state services, reuse approved credentials with explicit consent rather than repeatedly re-uploading documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setUploadError(null);
                setUploadFile(null);
                setShowUploadModal(true);
              }}
              className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#a8703f] hover:from-[#b07844] hover:to-[#935f34] text-[#2B1B14] font-bold text-sm shadow-luxury px-5 py-2.5 rounded-xl border-0 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Deposit Document to Vault
            </Button>
            <Button
              variant="outline"
              onClick={loadVault}
              className="gap-2 border-[#6F4028] bg-[#2B1B14]/80 text-[#FFF9F0] hover:bg-[#38241B] text-sm rounded-xl"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Refresh Vault
            </Button>
          </div>
        </div>

        {/* Security & RLS guarantee footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between border-t border-[#4A2E22] pt-4 text-xs text-[#D8C2AA]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#C58B55]" />
            <span>DPDP Act 2023 Sec 6 Enforced:</span>
            <strong className="text-[#FFF9F0]">Encrypted Private Storage (RLS Enabled)</strong>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#E8D5BF]/80">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>Access Controlled by Sovereign UID: {citizenId.slice(0, 14)}…</span>
          </div>
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="rounded-2xl border border-[#D8C2AA] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] p-5 shadow-luxury">
          <p className="text-xs font-bold uppercase tracking-wider text-[#786453]">Total Stored Documents</p>
          <p className="mt-2 font-display text-3xl font-black text-[#2B1B14]">{metrics.total}</p>
          <p className="mt-1 text-[11px] text-[#786453]">In citizen sovereign vault</p>
        </Card>

        <Card className="rounded-2xl border border-[#D8C2AA] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] p-5 shadow-luxury">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Verified & Reusable</p>
          <p className="mt-2 font-display text-3xl font-black text-emerald-700">{metrics.verified}</p>
          <p className="mt-1 text-[11px] text-emerald-800">Officer verified & valid</p>
        </Card>

        <Card className="rounded-2xl border border-[#D8C2AA] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] p-5 shadow-luxury">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending Verification</p>
          <p className="mt-2 font-display text-3xl font-black text-amber-700">{metrics.pending}</p>
          <p className="mt-1 text-[11px] text-amber-800">Awaiting officer audit</p>
        </Card>

        <Card className="rounded-2xl border border-[#D8C2AA] bg-gradient-to-b from-[#FFF9F0] to-[#FAF3E8] p-5 shadow-luxury">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6F4028]">State Services Interoperable</p>
          <p className="mt-2 font-display text-3xl font-black text-[#2B1B14]">5 of 5</p>
          <p className="mt-1 text-[11px] text-[#786453]">Higher Ed, Revenue, Health, Welfare</p>
        </Card>
      </div>

      {/* ── SERVICE READINESS & MISSING DOCUMENTS MATRIX ── */}
      <Card className="rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#FAF3E8] p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#6F4028] px-3 py-0.5 text-xs font-bold text-[#FFF9F0]">
                  Service Interoperability Matrix
                </span>
                <span className="text-xs font-semibold text-[#786453]">
                  Available vs. Missing Document Analysis
                </span>
              </div>
              <CardTitle className="mt-1 font-display text-xl font-bold text-[#2B1B14]">
                Check Document Readiness for Maharashtra Services
              </CardTitle>
              <CardDescription className="text-xs text-[#786453]">
                Select any government scheme to inspect which vault documents are accepted and what is currently missing.
              </CardDescription>
            </div>

            {/* Service Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {Object.values(SERVICE_DOCUMENT_CONFIGS).map((srv) => (
                <button
                  key={srv.serviceId}
                  onClick={() => setSelectedServiceId(srv.serviceId)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                    selectedServiceId === srv.serviceId
                      ? 'bg-[#6F4028] text-[#FFF9F0] shadow-sm'
                      : 'border border-[#D8C2AA] bg-[#FFFDF9] text-[#786453] hover:bg-[#FAF3E8] hover:text-[#2B1B14]'
                  )}
                >
                  {srv.serviceName.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Selected Service Overview Banner */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#D8C2AA] bg-[#FAF3E8] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#2B1B14]">{currentServiceConfig.serviceName}</span>
                <span className="text-xs text-[#786453]">• {currentServiceConfig.department}</span>
              </div>
              <p className="text-xs text-[#786453]">{currentServiceConfig.description}</p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#786453]">Vault Readiness</span>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-28 rounded-full bg-[#E8D5BF] overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        readinessPercent === 100 ? 'bg-emerald-600' : 'bg-gradient-to-r from-[#6F4028] to-[#C58B55]'
                      )}
                      style={{ width: `${readinessPercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#2B1B14]">{readinessPercent}%</span>
                </div>
                <span className="text-[10px] text-[#786453]">{availableCount} of {totalRequiredCount} documents ready</span>
              </div>

              {navigate && (
                <Button
                  onClick={() => navigate(`/portal/apply/${currentServiceConfig.serviceId}`)}
                  className="gap-1.5 bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold shadow-md"
                >
                  Apply with Reused Docs
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Checklist Items: Reused vs Missing */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceChecklistAnalysis.map(({ requirement, isAvailable, vaultDoc }) => (
              <div
                key={requirement.type}
                className={cn(
                  'flex flex-col justify-between rounded-2xl border p-4 transition-all shadow-xs',
                  isAvailable
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-amber-300 bg-amber-50/50'
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#2B1B14]">{requirement.label}</span>
                    {isAvailable ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                        Reused from Vault
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-bold shrink-0">
                        <AlertTriangle className="h-3 w-3 mr-1 text-amber-700" />
                        Missing Document
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-[#786453] leading-relaxed">
                    {requirement.description}
                  </p>

                  <div className="text-[10px] text-[#786453] font-mono">
                    <span>Rule: {requirement.validityRule}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                  {isAvailable && vaultDoc ? (
                    <>
                      <span className="truncate text-[11px] font-mono text-[#2B1B14]" title={vaultDoc.file_name}>
                        {vaultDoc.file_name}
                      </span>
                      <button
                        onClick={() => handleOpenPreview(vaultDoc)}
                        className="text-[11px] font-bold text-[#6F4028] hover:underline"
                      >
                        View
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-amber-800 font-semibold">Upload required</span>
                      <button
                        onClick={() => {
                          setUploadType(requirement.type);
                          setUploadValidity(requirement.validityRule);
                          setShowUploadModal(true);
                        }}
                        className="text-[11px] font-bold text-[#6F4028] hover:underline flex items-center gap-1"
                      >
                        <Upload className="h-3 w-3" />
                        Deposit Now
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── VAULT DOCUMENTS DIRECTORY ── */}
      <div className="space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#D8C2AA] bg-[#FFF9F0] p-4 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#786453]" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-[#D8C2AA] bg-[#FFFDF9] text-xs font-semibold text-[#2B1B14] placeholder:text-[#786453]/70 focus:border-[#6F4028]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#6F4028]">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-[#D8C2AA] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B14] focus:border-[#6F4028] focus:outline-hidden"
            >
              <option value="all">All Documents</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-hidden rounded-2xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#2B1B14]">
              <thead className="border-b border-[#D8C2AA] bg-[#FAF3E8] text-xs font-bold uppercase tracking-wider text-[#6F4028]">
                <tr>
                  <th scope="col" className="px-6 py-4">Document Title & Type</th>
                  <th scope="col" className="px-6 py-4">Verification Status</th>
                  <th scope="col" className="px-6 py-4">Validity / Expiry Period</th>
                  <th scope="col" className="px-6 py-4">Verified By / Source Authority</th>
                  <th scope="col" className="px-6 py-4">Accepted Services for Reuse</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C2AA]/60">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#786453]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderLock className="h-8 w-8 text-[#C58B55]" />
                        <p className="font-bold text-base text-[#2B1B14]">No vault documents matched</p>
                        <p className="text-xs">Deposit new documents using the button above.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const isVerified = doc.status === 'verified' || (!doc.status && doc.verified_at);
                    const acceptedServices = getServicesForDocumentType(doc.document_type);

                    return (
                      <tr key={doc.id} className="transition-colors hover:bg-[#FAF3E8]/80">
                        {/* Title & File details */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6F4028]/10 text-[#6F4028] border border-[#D8C2AA]">
                              <FileText className="h-5 w-5 text-[#6F4028]" />
                            </div>
                            <div>
                              <p className="font-bold text-[#2B1B14]">{DOCUMENT_TYPE_LABELS[doc.document_type] || doc.document_type}</p>
                              <div className="flex items-center gap-2 text-xs font-mono text-[#786453]">
                                <span>{doc.file_name}</span>
                                <span>•</span>
                                <span>{(doc.file_size / (1024 * 1024)).toFixed(1)} MB</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              Verified & Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900 shadow-2xs">
                              <Clock className="h-3 w-3 text-amber-700" />
                              Pending Verification
                            </span>
                          )}
                        </td>

                        {/* Validity / Expiry */}
                        <td className="px-6 py-4 text-xs font-medium text-[#2B1B14]">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#C58B55] shrink-0" />
                            <span>{doc.validity_period || 'Permanent Valid'}</span>
                          </div>
                          {doc.expiry_date && (
                            <div className="text-[10px] text-amber-800 font-semibold mt-0.5">
                              Expires: {new Date(doc.expiry_date).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Verified By */}
                        <td className="px-6 py-4 text-xs text-[#786453]">
                          <div className="font-semibold text-[#2B1B14]">
                            {doc.verified_by || 'Awaiting initial officer audit'}
                          </div>
                          {doc.verified_at && (
                            <div className="text-[10px] text-[#786453] mt-0.5">
                              Certified on: {new Date(doc.verified_at).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Accepted Services for Reuse */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {acceptedServices.length > 0 ? (
                              acceptedServices.map((srvName) => (
                                <span
                                  key={srvName}
                                  className="inline-block rounded-md bg-[#FAF3E8] border border-[#D8C2AA] px-2 py-0.5 text-[10px] font-semibold text-[#6F4028]"
                                >
                                  {srvName.split('(')[0].trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-[#786453]">Specific to source service</span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenPreview(doc)}
                              className="h-8 border-[#D8C2AA] bg-[#FFFDF9] text-[#2B1B14] hover:bg-[#FAF3E8] text-xs font-bold"
                              title="View Document"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1 text-[#6F4028]" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(doc)}
                              className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-100"
                              title="Delete from Vault"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL: UPLOAD DIRECTLY TO VAULT ── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-[#D8C2AA] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6F4028] text-[#FFF9F0]">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#2B1B14]">Deposit Document to Vault</h3>
                  <p className="text-xs text-[#786453]">Add a document for reuse across Maharashtra digital services.</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#786453] hover:text-[#2B1B14] p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Document Type Selector */}
              <div>
                <Label className="text-xs font-bold text-[#6F4028]">Document Classification *</Label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as DocumentType)}
                  className="mt-1 w-full rounded-xl border border-[#D8C2AA] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#2B1B14] focus:border-[#6F4028] focus:outline-hidden"
                >
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([typeKey, label]) => (
                    <option key={typeKey} value={typeKey}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Validity / Issuing Notes */}
              <div>
                <Label className="text-xs font-bold text-[#6F4028]">Validity Period / Financial Year (Optional)</Label>
                <Input
                  type="text"
                  value={uploadValidity}
                  onChange={(e) => setUploadValidity(e.target.value)}
                  className="mt-1 border-[#D8C2AA] bg-[#FFFDF9] text-xs font-semibold text-[#2B1B14]"
                />
              </div>

              {/* File Input */}
              <div>
                <Label className="text-xs font-bold text-[#6F4028]">Document File (PDF, JPG, PNG &lt; 10MB) *</Label>
                <div className="mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8C2AA] bg-[#FAF3E8] p-5 text-center">
                  <Upload className="h-8 w-8 text-[#C58B55] mb-2" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="text-xs text-[#2B1B14] file:mr-3 file:rounded-xl file:border-0 file:bg-[#6F4028] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-[#FFF9F0]"
                  />
                  {uploadFile && (
                    <p className="mt-2 text-xs font-mono font-bold text-[#6F4028]">
                      Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Security policy notice */}
              <div className="rounded-xl border border-[#D8C2AA] bg-[#FAF3E8] p-3 text-[11px] text-[#786453] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[#2B1B14] mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#C58B55]" />
                  <span>Security & Verification Policy</span>
                </div>
                Newly deposited documents are saved securely to your private vault in <strong>Pending</strong> status until verified during an application review by an authorized departmental officer.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8C2AA]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="text-xs font-bold text-[#786453]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={uploading}
                  className="bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold shadow-md"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                      Depositing…
                    </>
                  ) : (
                    'Deposit to Vault'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DOCUMENT PREVIEW ── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#D8C2AA] bg-[#FFF9F0] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8C2AA] pb-3">
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-[#6F4028]" />
                <div>
                  <h3 className="font-display text-base font-bold text-[#2B1B14]">{previewDoc.file_name}</h3>
                  <p className="text-xs text-[#786453]">{DOCUMENT_TYPE_LABELS[previewDoc.document_type]}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-[#786453] hover:text-[#2B1B14] p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-[#D8C2AA] bg-[#2B1B14] p-8 text-center text-[#FFF9F0] space-y-3">
              <FileText className="mx-auto h-16 w-16 text-[#C58B55]" />
              <p className="font-bold text-sm text-[#FFF9F0]">{previewDoc.file_name}</p>
              <p className="text-xs text-[#E8D5BF]">
                Storage Path: <code className="bg-[#38241B] px-2 py-0.5 rounded text-[11px]">{previewDoc.file_path}</code>
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 text-xs text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified by {previewDoc.verified_by || 'Officer Audit'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D8C2AA] text-xs">
              <span className="text-[#786453]">Validity: {previewDoc.validity_period || 'Permanent'}</span>
              <Button
                size="sm"
                onClick={() => setPreviewDoc(null)}
                className="bg-[#6F4028] hover:bg-[#583320] text-[#FFF9F0] text-xs font-bold"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
