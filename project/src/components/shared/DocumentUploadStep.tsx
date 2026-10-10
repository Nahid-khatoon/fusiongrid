import { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Sparkles,
  Layers,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import {
  uploadDocument,
  createApplicationDocument,
  createReusedDocument,
  fetchCitizenVault,
  reuploadDocument,
  validateFile,
} from '@/lib/documentService';
import {
  getServiceChecklist,
  type ServiceDocumentRequirement,
} from '@/lib/serviceDocumentRequirements';
import {
  ALLOWED_MIME_TYPES,
  type DocumentType,
  type ApplicationDocument,
  type VaultDocument,
} from '@/types';
import { cn } from '@/lib/utils';

interface DocumentUploadStepProps {
  applicationId: string;
  citizenId: string;
  serviceId?: string;
  onAllDocumentsReady: (ready: boolean) => void;
}

interface DocState {
  applicationDoc: ApplicationDocument | null;
  vaultDoc: VaultDocument | null;
  uploading: boolean;
  error: string | null;
  consentGiven: boolean;
}

export function DocumentUploadStep({
  applicationId,
  citizenId,
  serviceId = 'maha-scholarship',
  onAllDocumentsReady,
}: DocumentUploadStepProps) {
  const { addAuditEvent } = useApp();
  const requirements = getServiceChecklist(serviceId);

  const [docs, setDocs] = useState<Record<string, DocState>>({});
  const [loading, setLoading] = useState(true);

  const fetchVault = useCallback(async () => {
    return await fetchCitizenVault(citizenId);
  }, [citizenId]);

  const fetchExistingDocs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId);
      if (!error && data) return data as unknown as ApplicationDocument[];
    } catch {
      // Fallback
    }
    return [];
  }, [applicationId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [vaultDocs, existingDocs] = await Promise.all([fetchVault(), fetchExistingDocs()]);

      const initialMap: Record<string, DocState> = {};
      for (const req of requirements) {
        const existing = existingDocs.find((d) => d.document_type === req.type);
        // Matching vault document: must be valid and verified
        const vaultMatch = vaultDocs.find(
          (v) => v.document_type === req.type && v.is_valid && (v.status === 'verified' || !v.status)
        );

        initialMap[req.type] = {
          applicationDoc: existing ?? null,
          vaultDoc: req.canReuse ? vaultMatch ?? null : null,
          uploading: false,
          error: null,
          consentGiven: false,
        };
      }

      setDocs(initialMap);
      setLoading(false);
    })();
  }, [requirements, fetchVault, fetchExistingDocs]);

  const checkAllReady = useCallback(
    (docsState: Record<string, DocState>) => {
      const allReady = requirements
        .filter((r) => r.isMandatory)
        .every((req) => {
          const doc = docsState[req.type];
          return (
            doc &&
            doc.applicationDoc &&
            (doc.applicationDoc.status === 'pending' || doc.applicationDoc.status === 'verified')
          );
        });
      onAllDocumentsReady(allReady);
    },
    [requirements, onAllDocumentsReady]
  );

  useEffect(() => {
    if (Object.keys(docs).length > 0) {
      checkAllReady(docs);
    }
  }, [docs, checkAllReady]);

  const handleUpload = async (docType: DocumentType, file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setDocs((prev) => ({
        ...prev,
        [docType]: { ...prev[docType], error: validationError },
      }));
      return;
    }

    setDocs((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], uploading: true, error: null },
    }));

    const uploadResult = await uploadDocument(file, citizenId, docType);
    if (!uploadResult.success || !uploadResult.filePath) {
      setDocs((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          uploading: false,
          error: uploadResult.error || 'Upload failed',
        },
      }));
      return;
    }

    const { data, error } = await createApplicationDocument(
      applicationId,
      citizenId,
      docType,
      file,
      uploadResult.filePath
    );

    if (error || !data) {
      setDocs((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          uploading: false,
          error: error || 'Failed to save document record',
        },
      }));
      return;
    }

    setDocs((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        applicationDoc: data,
        uploading: false,
        error: null,
      },
    }));
  };

  const handleReuse = async (docType: DocumentType) => {
    const vaultDoc = docs[docType]?.vaultDoc;
    if (!vaultDoc) return;

    setDocs((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], uploading: true, error: null },
    }));

    const { data, error } = await createReusedDocument(
      applicationId,
      citizenId,
      docType,
      vaultDoc,
      true
    );

    if (error || !data) {
      setDocs((prev) => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          uploading: false,
          error: error || 'Failed to reuse document',
        },
      }));
      return;
    }

    setDocs((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        applicationDoc: data,
        uploading: false,
        error: null,
        consentGiven: true,
      },
    }));

    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId,
      action: 'Document Reused from Vault',
      actor: 'Citizen',
      actorRole: 'citizen',
      detail: `Reused verified ${docType.replace(/_/g, ' ')} from citizen document vault with explicit consent`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      type: 'consent',
    });
  };

  const handleReupload = async (docType: DocumentType, file: File) => {
    const doc = docs[docType]?.applicationDoc;
    if (!doc) return;

    setDocs((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], uploading: true, error: null },
    }));

    const { error } = await reuploadDocument(doc.id, file, citizenId, docType);
    if (error) {
      setDocs((prev) => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: false, error },
      }));
      return;
    }

    const refreshed = await fetchExistingDocs();
    const updated = refreshed.find((d) => d.id === doc.id);
    setDocs((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        applicationDoc: updated ?? doc,
        uploading: false,
        error: null,
      },
    }));
  };

  if (loading) {
    return (
      <Card className="border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury p-8 text-center text-[#786453]">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#6F4028]" />
        <p className="mt-3 font-semibold text-xs text-[#2B1B14]">
          Querying sovereign document vault and matching service requirements…
        </p>
      </Card>
    );
  }

  // Count available in vault vs missing
  const reusableInVaultCount = requirements.filter(
    (r) => docs[r.type]?.vaultDoc && !docs[r.type]?.applicationDoc
  ).length;

  return (
    <Card className="overflow-hidden border border-[#D8C2AA] bg-[#FFF9F0] shadow-luxury text-[#2B1B14]">
      <div className="border-b border-[#D8C2AA] bg-[#FAF3E8] p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6F4028] text-[#FFF9F0] shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display text-base font-bold text-[#2B1B14]">
                Service-Specific Document Checklist
              </CardTitle>
              <CardDescription className="text-xs text-[#786453]">
                Reuse pre-verified documents from your vault. Only upload documents missing for this service.
              </CardDescription>
            </div>
          </div>

          {reusableInVaultCount > 0 && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold self-start sm:self-center">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              {reusableInVaultCount} Reusable in Vault
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        {/* Attestation Banner */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#D8C2AA] bg-gradient-to-r from-[#FAF3E8] via-[#FFF9F0] to-[#FAF3E8] p-4 text-xs text-[#2B1B14] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6F4028] text-[#FFF9F0] shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[#2B1B14]">Configurable Checklist & Zero Duplicate Re-entry</p>
              <p className="text-[#786453] mt-0.5 text-[11px]">
                Pre-verified credentials in your Citizen Vault bypass re-uploading. Documents not valid for this scheme will not be accepted.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-[#D8C2AA] bg-[#FAF3E8] px-3 py-1 font-mono text-[10px] font-bold text-[#6F4028] self-start sm:self-center">
            Vault Interoperable 🔒
          </span>
        </div>

        <div className="space-y-4">
          {requirements.map((req) => {
            const docState = docs[req.type] || {
              applicationDoc: null,
              vaultDoc: null,
              uploading: false,
              error: null,
              consentGiven: false,
            };
            const appDoc = docState.applicationDoc;
            const vaultDoc = docState.vaultDoc;
            const hasVault = !!vaultDoc && !appDoc;
            const isRejected = appDoc?.status === 'rejected';
            const isVerified = appDoc?.status === 'verified';
            const isPending = appDoc?.status === 'pending';
            const isReused = appDoc?.reused_from_vault;

            return (
              <div
                key={req.type}
                className={cn(
                  'rounded-2xl border p-5 transition-all shadow-xs',
                  isVerified && 'border-emerald-300 bg-emerald-50/50',
                  isPending && 'border-[#D8C2AA] bg-[#FAF3E8]/80',
                  isRejected && 'border-rose-300 bg-rose-50/50',
                  !appDoc && hasVault && 'border-[#C58B55] bg-gradient-to-r from-amber-50/40 via-[#FAF3E8] to-[#FFF9F0]',
                  !appDoc && !hasVault && 'border-[#D8C2AA] bg-[#FAF3E8]/40 hover:border-[#6F4028]'
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-xs transition-transform',
                        isVerified
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 border-rose-300 text-rose-800'
                          : isPending
                          ? 'bg-[#F5EBDD] border-[#D8C2AA] text-[#6F4028]'
                          : hasVault
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-[#F5EBDD] border-[#D8C2AA] text-[#786453]'
                      )}
                    >
                      {isVerified ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isRejected ? (
                        <XCircle className="h-5 w-5" />
                      ) : isPending ? (
                        <Clock className="h-5 w-5" />
                      ) : hasVault ? (
                        <Sparkles className="h-5 w-5 text-[#C58B55]" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-[#2B1B14] text-sm">
                          {req.label}
                        </h3>
                        {req.isMandatory ? (
                          <span className="rounded-full bg-[#EAD8C2] px-2 py-0.5 font-mono text-[10px] font-bold text-[#6F4028]">
                            Mandatory
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                            Optional
                          </span>
                        )}
                        {hasVault && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                            Available in Vault
                          </Badge>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-[#786453] leading-relaxed">
                        {req.description}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-[#786453]">
                        <span>Rule: <strong>{req.validityRule}</strong></span>
                        <span>•</span>
                        <span>Source: <strong>{req.sourceAuthority}</strong></span>
                      </div>
                    </div>
                  </div>

                  {appDoc && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'self-start sm:self-center text-xs font-bold px-3 py-1',
                        isVerified && 'border-emerald-400 bg-emerald-100 text-emerald-800',
                        isPending && 'border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]',
                        isRejected && 'border-rose-400 bg-rose-100 text-rose-800'
                      )}
                    >
                      {isVerified && (
                        <>
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Verified
                        </>
                      )}
                      {isPending && (
                        <>
                          <Clock className="mr-1.5 h-3.5 w-3.5" />
                          Attached ({isReused ? 'Reused' : 'Uploaded'})
                        </>
                      )}
                      {isRejected && (
                        <>
                          <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          Rejected
                        </>
                      )}
                    </Badge>
                  )}
                </div>

                {/* Vault reuse option */}
                {hasVault && (
                  <div className="mt-4 rounded-2xl border border-[#C58B55]/50 bg-gradient-to-r from-[#FAF3E8] via-[#FFF9F0] to-[#FAF3E8] p-4 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C58B55]/20 text-[#6F4028]">
                        <Sparkles className="h-4 w-4 text-[#C58B55]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-[#2B1B14]">
                            Verified Vault Credential Found
                          </p>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                            {vaultDoc!.file_name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#786453] mt-0.5">
                          Verified by {vaultDoc!.verified_by}. Fast-track your application with 1-click consent reuse.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap items-center gap-3">
                      <Button
                        size="sm"
                        className="gap-2 bg-[#6F4028] text-[#FFF9F0] hover:bg-[#583320] text-xs h-8 shadow-luxury border-0 font-bold"
                        onClick={() => handleReuse(req.type)}
                        disabled={docState.uploading}
                      >
                        {docState.uploading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-[#C58B55]" />
                        )}
                        Reuse Credential with Consent
                      </Button>
                      <span className="text-[11px] text-[#786453]">or upload an alternate file below</span>
                    </div>
                  </div>
                )}

                {/* Attached file status */}
                {appDoc && (
                  <div className="mt-3.5 flex items-center justify-between rounded-xl border border-[#D8C2AA] bg-[#F5EBDD]/70 px-3.5 py-2.5 text-xs">
                    <div className="flex items-center gap-2 truncate text-[#2B1B14]">
                      <FileCheck className="h-4 w-4 shrink-0 text-[#6F4028]" />
                      <span className="font-mono truncate font-medium">{appDoc.file_name}</span>
                      <span className="text-[#786453]">({(appDoc.file_size / 1024).toFixed(0)} KB)</span>
                    </div>
                    {isReused ? (
                      <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        Linked from Citizen Vault
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#EAD8C2] border border-[#D8C2AA] px-2.5 py-0.5 text-[10px] font-bold text-[#6F4028]">
                        Uploaded for this Application
                      </span>
                    )}
                  </div>
                )}

                {/* Error message */}
                {docState.error && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{docState.error}</span>
                  </div>
                )}

                {/* Upload action for missing or replacement documents */}
                {!isVerified && !hasVault && (
                  <div className="mt-4 flex flex-wrap items-center gap-3.5">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept={ALLOWED_MIME_TYPES.join(',')}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (isRejected) handleReupload(req.type, file);
                            else handleUpload(req.type, file);
                          }
                        }}
                      />
                      <span
                        className={cn(
                          'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-luxury transition-all',
                          isRejected
                            ? 'border border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : appDoc
                            ? 'border border-[#D8C2AA] bg-[#FFF9F0] text-[#2B1B14] hover:bg-[#FAF3E8]'
                            : 'bg-[#6F4028] text-[#FFF9F0] hover:bg-[#583320]'
                        )}
                      >
                        {docState.uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isRejected ? (
                          <RefreshCw className="h-4 w-4" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {isRejected ? 'Re-upload Valid Copy' : appDoc ? 'Replace Document' : 'Upload Missing Document'}
                      </span>
                    </label>
                    <span className="text-[11px] font-medium text-[#786453]">
                      PDF, JPEG, PNG (Max 10MB) • Saved as Pending Verification
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
