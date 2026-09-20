import { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle2, XCircle, Clock, Loader2,
  ShieldCheck, AlertCircle, FileCheck, RefreshCw, Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import {
  fetchApplicationDocuments, reuploadDocument, validateFile, getSignedUrl,
} from '@/lib/documentService';
import {
  DOCUMENT_REQUIREMENTS, ALLOWED_MIME_TYPES,
  type ApplicationDocument, type DocumentType,
} from '@/types';
import { cn } from '@/lib/utils';

interface CitizenDocumentStatusProps {
  applicationId: string;
  citizenId: string;
}

export function CitizenDocumentStatus({ applicationId, citizenId }: CitizenDocumentStatusProps) {
  const { addNotification } = useApp();
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<ApplicationDocument | null>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    const docs = await fetchApplicationDocuments(applicationId, false);
    setDocuments(docs);
    setLoading(false);
  }, [applicationId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleReupload = async (doc: ApplicationDocument, file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      addNotification({
        id: `n-${Date.now()}`,
        title: 'Upload Failed',
        message: validationError,
        type: 'warning',
        read: false,
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        applicationId,
      });
      return;
    }

    setUploadingId(doc.id);
    const { error } = await reuploadDocument(doc.id, file, citizenId, doc.document_type);
    setUploadingId(null);

    if (error) {
      addNotification({
        id: `n-${Date.now()}`,
        title: 'Re-upload Failed',
        message: error,
        type: 'warning',
        read: false,
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        applicationId,
      });
      return;
    }

    addNotification({
      id: `n-${Date.now()}`,
      title: 'Document Re-uploaded',
      message: `Your ${doc.document_type.replace(/_/g, ' ')} has been re-uploaded and reset to Pending for verification.`,
      type: 'info',
      read: false,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      applicationId,
    });

    await loadDocs();
  };

  const handleView = async (doc: ApplicationDocument) => {
    setViewingDoc(doc);
    setViewingUrl(null);
    const url = await getSignedUrl(doc.file_path, 60);
    setViewingUrl(url);
  };

  if (loading) {
    return (
      <Card className="border-border/60 animate-fade-in-up">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading documents…</span>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) return null;

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const allVerified = verifiedCount === documents.length;

  return (
    <>
      <Card className="border-border/60 animate-fade-in-up delay-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Document Verification Status
              </CardTitle>
              <CardDescription className="mt-1">
                Track verification of your submitted documents
              </CardDescription>
            </div>
            {allVerified ? (
              <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                <CheckCircle2 className="mr-1 h-3 w-3" />All Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                <Clock className="mr-1 h-3 w-3" />{verifiedCount}/{documents.length} Verified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => {
              const req = DOCUMENT_REQUIREMENTS.find((r) => r.type === doc.document_type);
              const isVerified = doc.status === 'verified';
              const isRejected = doc.status === 'rejected';
              const isPending = doc.status === 'pending';
              const isReused = doc.reused_from_vault;

              return (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 transition-all',
                    isVerified && 'border-accent/30 bg-accent/5',
                    isRejected && 'border-destructive/30 bg-destructive/5',
                    isPending && 'border-amber-200 bg-amber-50/30',
                  )}
                >
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    isVerified ? 'bg-accent/10 text-accent' : isRejected ? 'bg-destructive/10 text-destructive' : 'bg-amber-100 text-amber-600'
                  )}>
                    {isVerified ? <CheckCircle2 className="h-5 w-5" /> : isRejected ? <XCircle className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{req?.label ?? doc.document_type}</span>
                      {isReused && (
                        <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent text-[10px]">
                          <ShieldCheck className="mr-1 h-2.5 w-2.5" />Reused from Vault
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <FileCheck className="h-3 w-3" />
                      <span className="truncate">{doc.file_name}</span>
                      <span>·</span>
                      <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                    </div>
                    {isRejected && doc.rejection_reason && (
                      <p className="mt-1 text-xs text-destructive">Reason: {doc.rejection_reason}</p>
                    )}
                    {isVerified && doc.verified_by && (
                      <p className="mt-0.5 text-xs text-accent/70">Verified by {doc.verified_by}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleView(doc)}>
                      <FileText className="h-3.5 w-3.5" />View
                    </Button>
                    {isRejected && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept={ALLOWED_MIME_TYPES.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReupload(doc, file);
                          }}
                        />
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10">
                          {uploadingId === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                          Re-upload
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {allVerified && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-semibold text-accent">All documents verified</p>
                <p className="text-xs text-accent/80">Your application is now eligible for final review and approval.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setViewingDoc(null); setViewingUrl(null); }}>
          <div className="max-h-[90vh] max-w-3xl overflow-auto rounded-lg border bg-background p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-semibold">{viewingDoc.file_name}</h3>
              <Button size="sm" variant="outline" onClick={() => { setViewingDoc(null); setViewingUrl(null); }}>Close</Button>
            </div>
            {viewingUrl === null ? (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />Loading…
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {viewingDoc.mime_type.startsWith('image/') ? (
                  <img src={viewingUrl} alt={viewingDoc.file_name} className="max-h-[400px] rounded-lg border" />
                ) : (
                  <iframe src={viewingUrl} className="h-[400px] w-full rounded-lg border" title="Document preview" />
                )}
                <a href={viewingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">Open in new tab</a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
