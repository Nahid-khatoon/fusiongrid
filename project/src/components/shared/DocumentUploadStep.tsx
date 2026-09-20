import { useState, useEffect, useCallback } from 'react';
import {
  Upload, FileText, CheckCircle2, XCircle, Clock, Loader2,
  ShieldCheck, RefreshCw, FileCheck, AlertCircle, Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import {
  uploadDocument, createApplicationDocument, createReusedDocument,
  fetchCitizenVault, reuploadDocument, validateFile,
} from '@/lib/documentService';
import {
  DOCUMENT_REQUIREMENTS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE,
  type DocumentType, type ApplicationDocument, type VaultDocument,
} from '@/types';
import { cn } from '@/lib/utils';

interface DocumentUploadStepProps {
  applicationId: string;
  citizenId: string;
  onAllDocumentsReady: (ready: boolean) => void;
}

interface DocState {
  applicationDoc: ApplicationDocument | null;
  vaultDoc: VaultDocument | null;
  uploading: boolean;
  error: string | null;
  consentGiven: boolean;
}

export function DocumentUploadStep({ applicationId, citizenId, onAllDocumentsReady }: DocumentUploadStepProps) {
  const { addNotification, addAuditEvent } = useApp();
  const [vault, setVault] = useState<VaultDocument[]>([]);
  const [docs, setDocs] = useState<Record<DocumentType, DocState>>({
    identity_proof: { applicationDoc: null, vaultDoc: null, uploading: false, error: null, consentGiven: false },
    income_certificate: { applicationDoc: null, vaultDoc: null, uploading: false, error: null, consentGiven: false },
    student_certificate: { applicationDoc: null, vaultDoc: null, uploading: false, error: null, consentGiven: false },
    bank_proof: { applicationDoc: null, vaultDoc: null, uploading: false, error: null, consentGiven: false },
  });
  const [loading, setLoading] = useState(true);

  const fetchVault = useCallback(async () => {
    const vaultDocs = await fetchCitizenVault();
    setVault(vaultDocs);
    return vaultDocs;
  }, []);

  const fetchExistingDocs = useCallback(async () => {
    const { data, error } = await supabase
      .from('application_documents')
      .select('*')
      .eq('application_id', applicationId);
    if (error || !data) return [];
    return data as unknown as ApplicationDocument[];
  }, [applicationId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [vaultDocs, existingDocs] = await Promise.all([fetchVault(), fetchExistingDocs()]);
      setDocs((prev) => {
        const next = { ...prev };
        for (const req of DOCUMENT_REQUIREMENTS) {
          const existing = existingDocs.find((d) => d.document_type === req.type);
          const vaultMatch = vaultDocs.find((v) => v.document_type === req.type);
          next[req.type] = {
            ...next[req.type],
            applicationDoc: existing ?? null,
            vaultDoc: vaultMatch ?? null,
          };
        }
        return next;
      });
      setLoading(false);
    })();
  }, [fetchVault, fetchExistingDocs]);

  const checkAllReady = useCallback((docsState: Record<DocumentType, DocState>) => {
    const allReady = DOCUMENT_REQUIREMENTS.every((req) => {
      const doc = docsState[req.type];
      return doc.applicationDoc && (doc.applicationDoc.status === 'pending' || doc.applicationDoc.status === 'verified');
    });
    onAllDocumentsReady(allReady);
  }, [onAllDocumentsReady]);

  useEffect(() => {
    checkAllReady(docs);
  }, [docs, checkAllReady]);

  const handleUpload = async (docType: DocumentType, file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], error: validationError } }));
      return;
    }

    setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], uploading: true, error: null } }));

    const uploadResult = await uploadDocument(file, citizenId, docType);
    if (!uploadResult.success || !uploadResult.filePath) {
      setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], uploading: false, error: uploadResult.error || 'Upload failed' } }));
      return;
    }

    const { data, error } = await createApplicationDocument(applicationId, citizenId, docType, file, uploadResult.filePath);
    if (error || !data) {
      setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], uploading: false, error: error || 'Failed to save document record' } }));
      return;
    }

    setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], applicationDoc: data, uploading: false, error: null } }));
  };

  const handleReuse = async (docType: DocumentType) => {
    const vaultDoc = docs[docType].vaultDoc;
    if (!vaultDoc) return;

    setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], uploading: true, error: null } }));

    const { data, error } = await createReusedDocument(applicationId, citizenId, docType, vaultDoc, true);
    if (error || !data) {
      setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], uploading: false, error: error || 'Failed to reuse document' } }));
      return;
    }

    setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], applicationDoc: data, uploading: false, error: null, consentGiven: true } }));

    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId,
      action: 'Document Reused from Vault',
      actor: 'Citizen',
      actorRole: 'citizen',
      detail: `Reused verified ${docType.replace(/_/g, ' ')} from document vault with consent`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      type: 'consent',
    });
  };

  const handleReupload = async (docType: DocumentType, file: File) => {
    const doc = docs[docType].applicationDoc;
    if (!doc) return;

    setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], uploading: true, error: null } }));

    const { error } = await reuploadDocument(doc.id, file, citizenId, docType);
    if (error) {
      setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], uploading: false, error } }));
      return;
    }

    const refreshed = await fetchExistingDocs();
    const updated = refreshed.find((d) => d.id === doc.id);
    setDocs((prev) => ({ ...prev, [docType]: { ...prev[docType], applicationDoc: updated ?? doc, uploading: false, error: null } }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading document requirements…</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold">Required Documents</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload all required documents below. If a document is already verified in your vault, you can reuse it with consent instead of uploading again.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5 text-xs text-accent">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <span>Submit Once → Verify Once → Reuse with Consent. Your documents are stored privately and never exposed publicly.</span>
      </div>

      <div className="space-y-4">
        {DOCUMENT_REQUIREMENTS.map((req, i) => {
          const docState = docs[req.type];
          const appDoc = docState.applicationDoc;
          const vaultDoc = docState.vaultDoc;
          const hasVault = !!vaultDoc && !appDoc;
          const isRejected = appDoc?.status === 'rejected';
          const isVerified = appDoc?.status === 'verified';
          const isPending = appDoc?.status === 'pending';
          const isReused = appDoc?.reused_from_vault;

          return (
            <Card
              key={req.type}
              className={cn(
                'border-border/60 transition-all animate-fade-in-up',
                isVerified && 'border-accent/30',
                isRejected && 'border-destructive/30',
              )}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      isVerified ? 'bg-accent/10 text-accent' : isRejected ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                    )}>
                      {isVerified ? <CheckCircle2 className="h-5 w-5" /> : isRejected ? <XCircle className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{req.label}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{req.description}</p>
                    </div>
                  </div>
                  {appDoc && (
                    <Badge variant="outline" className={cn(
                      'shrink-0',
                      isVerified && 'border-accent/30 bg-accent/10 text-accent',
                      isPending && 'border-amber-300 bg-amber-50 text-amber-700',
                      isRejected && 'border-destructive/30 bg-destructive/10 text-destructive',
                    )}>
                      {isVerified && <><CheckCircle2 className="mr-1 h-3 w-3" />Verified</>}
                      {isPending && <><Clock className="mr-1 h-3 w-3" />Pending</>}
                      {isRejected && <><XCircle className="mr-1 h-3 w-3" />Rejected</>}
                    </Badge>
                  )}
                </div>

                {/* Rejected reason */}
                {isRejected && appDoc.rejection_reason && (
                  <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
                    <p className="text-xs font-semibold text-destructive">Rejection Reason:</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{appDoc.rejection_reason}</p>
                  </div>
                )}

                {/* Reused from vault badge */}
                {isReused && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accent">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Already Verified — Reused from your Document Vault with consent
                  </div>
                )}

                {/* Vault reuse offer */}
                {hasVault && (
                  <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-accent">Already Verified — Reuse Document</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          This document was verified on {new Date(vaultDoc!.verified_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} by {vaultDoc!.verified_by}.
                          Reuse it with your consent — no need to upload or verify again.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" className="gap-1.5 bg-accent hover:bg-accent/90" onClick={() => handleReuse(req.type)} disabled={docState.uploading}>
                        {docState.uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        Reuse with Consent
                      </Button>
                      <span className="text-xs text-muted-foreground">or upload a new document below</span>
                    </div>
                  </div>
                )}

                {/* File info */}
                {appDoc && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
                    <FileCheck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium">{appDoc.file_name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{(appDoc.file_size / 1024).toFixed(0)} KB</span>
                  </div>
                )}

                {/* Error */}
                {docState.error && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {docState.error}
                  </div>
                )}

                {/* Upload / Re-upload button */}
                {!isVerified && !hasVault && (
                  <div className="mt-3">
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
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        isRejected
                          ? 'border border-destructive/30 text-destructive hover:bg-destructive/10'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      )}>
                        {docState.uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isRejected ? <RefreshCw className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                        {isRejected ? 'Re-upload' : 'Upload Document'}
                      </span>
                    </label>
                  </div>
                )}

                <p className="mt-2 text-xs text-muted-foreground/60">
                  Accepted: PDF, JPG, JPEG, PNG · Max 10MB
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
