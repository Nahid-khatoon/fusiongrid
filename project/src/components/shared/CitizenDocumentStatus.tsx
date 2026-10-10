import { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle2, XCircle, Clock, Loader2,
  ShieldCheck, RefreshCw, Eye, Lock, ExternalLink, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import {
  fetchApplicationDocuments, reuploadDocument, validateFile, getSignedUrl,
} from '@/lib/documentService';
import {
  DOCUMENT_REQUIREMENTS, ALLOWED_MIME_TYPES,
  type ApplicationDocument,
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
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm animate-fade-in-up">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#6F4028]" />
          <span className="ml-2 text-xs font-semibold text-[#755C49]">Checking document vault verification status…</span>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) return null;

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const allVerified = verifiedCount === documents.length;

  return (
    <>
      <Card className="overflow-hidden border-[#D8C2AA] bg-[#FFF8ED] shadow-sm animate-fade-in-up">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF8ED] text-[#6F4028] border border-[#D8C2AA]">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-[#38241B]">Supporting Documents Verification</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">
                  Authoritative checks conducted by department verification officers
                </CardDescription>
              </div>
            </div>
            {allVerified ? (
              <Badge variant="outline" className="border-[#D8C2AA] bg-[#FFF8ED] text-emerald-800 font-semibold text-xs">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                All {documents.length} Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="border-[#D8C2AA] bg-[#FFF8ED] text-[#6F4028] font-semibold text-xs">
                <Clock className="mr-1 h-3.5 w-3.5 text-[#C58B55]" />
                {verifiedCount}/{documents.length} Verified
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5">
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
                    'flex flex-col gap-3 rounded-xl border p-3.5 transition-all sm:flex-row sm:items-center sm:justify-between',
                    isVerified && 'border-emerald-300 bg-emerald-50/40',
                    isRejected && 'border-red-300 bg-red-50/40',
                    isPending && 'border-[#D8C2AA] bg-[#FFF8ED]',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                      isVerified ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : isRejected ? 'bg-red-100 border-red-300 text-red-700' : 'bg-[#F5EBDD] border-[#D8C2AA] text-[#6F4028]'
                    )}>
                      {isVerified ? <CheckCircle2 className="h-5 w-5" /> : isRejected ? <XCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#38241B]">{req?.label ?? doc.document_type}</span>
                        {isReused && (
                          <span className="inline-flex items-center gap-1 rounded bg-[#F5EBDD] border border-[#D8C2AA] px-1.5 py-0.5 text-[10px] font-semibold text-[#6F4028]">
                            <ShieldCheck className="h-3 w-3" />
                            Vault Reused
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#755C49]">
                        <span className="font-mono text-[11px] truncate max-w-xs">{doc.file_name}</span>
                        <span>·</span>
                        <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                        {doc.verified_by && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-700 font-medium">Verified by {doc.verified_by}</span>
                          </>
                        )}
                      </div>
                      {isRejected && doc.rejection_reason && (
                        <p className="mt-1.5 text-xs font-medium text-red-800">
                          Discrepancy: {doc.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(doc)}
                      className="gap-1.5 text-xs h-8 border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
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
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-200 transition-colors">
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
        </CardContent>
      </Card>

      {/* Document View Modal */}
      {viewingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#21140F]/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => { setViewingDoc(null); setViewingUrl(null); }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D8C2AA] bg-[#F5EBDD] px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#6F4028]" />
                <h3 className="font-display font-semibold text-sm truncate max-w-sm text-[#38241B]">{viewingDoc.file_name}</h3>
              </div>
              <button
                onClick={() => { setViewingDoc(null); setViewingUrl(null); }}
                className="rounded-lg p-1 text-[#755C49] hover:bg-[#EAD8C2] hover:text-[#38241B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {viewingUrl === null ? (
                <div className="flex items-center justify-center py-12 text-xs text-[#755C49]">
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-[#6F4028]" />
                  Generating secure temporary access token…
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {viewingDoc.mime_type.startsWith('image/') ? (
                    <img
                      src={viewingUrl}
                      alt={viewingDoc.file_name}
                      className="max-h-[420px] w-auto rounded-xl border border-[#D8C2AA] object-contain shadow-sm"
                    />
                  ) : (
                    <iframe
                      src={viewingUrl}
                      className="h-[420px] w-full rounded-xl border border-[#D8C2AA] shadow-inner"
                      title="Document preview"
                    />
                  )}
                  <div className="flex items-center justify-between w-full border-t border-[#D8C2AA] pt-3 text-xs text-[#755C49]">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-[#C58B55]" />
                      Signed URL expires in 60s
                    </span>
                    <a
                      href={viewingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#6F4028] hover:underline"
                    >
                      Open full preview
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
