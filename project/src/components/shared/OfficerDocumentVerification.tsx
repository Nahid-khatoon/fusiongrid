import { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle2, XCircle, Clock, Loader2, Eye,
  Lock, ExternalLink, Check, X, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { officerInfo } from '@/data/mockData';
import {
  fetchApplicationDocuments, officerVerifyDocument, officerRejectDocument,
  getSignedUrl,
} from '@/lib/documentService';
import { DOCUMENT_REQUIREMENTS, type ApplicationDocument } from '@/types';
import { cn } from '@/lib/utils';

interface OfficerDocumentVerificationProps {
  applicationId: string;
  onAllVerified: (allVerified: boolean) => void;
}

export function OfficerDocumentVerification({ applicationId, onAllVerified }: OfficerDocumentVerificationProps) {
  const { addAuditEvent, addNotification } = useApp();
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<ApplicationDocument | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const officerName = officerInfo.name;

  const loadDocs = useCallback(async () => {
    setLoading(true);
    const docs = await fetchApplicationDocuments(applicationId, true);
    setDocuments(docs);
    setLoading(false);
  }, [applicationId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  useEffect(() => {
    if (documents.length === 0) {
      onAllVerified(false);
      return;
    }
    const allVerified = documents.length > 0 && documents.every((d) => d.status === 'verified');
    onAllVerified(allVerified);
  }, [documents, onAllVerified]);

  const handleVerify = async (docId: string) => {
    setActionLoading(docId);
    const { error } = await officerVerifyDocument(docId, officerName);
    setActionLoading(null);
    if (error) return;

    const doc = documents.find((d) => d.id === docId);
    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId,
      action: 'Document Verified',
      actor: officerName,
      actorRole: 'officer',
      detail: `Verified ${doc?.document_type.replace(/_/g, ' ') ?? 'document'} (${doc?.file_name ?? ''})`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      type: 'verify',
    });

    addNotification({
      id: `n-${Date.now()}`,
      title: 'Document Verified',
      message: `Your ${doc?.document_type.replace(/_/g, ' ')} has been verified by ${officerName}.`,
      type: 'success',
      read: false,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      applicationId,
    });

    await loadDocs();
  };

  const handleReject = async () => {
    if (!rejectDocId || !rejectReason.trim()) return;
    setActionLoading(rejectDocId);
    const { error } = await officerRejectDocument(rejectDocId, rejectReason, officerName);
    setActionLoading(null);
    if (error) return;

    const doc = documents.find((d) => d.id === rejectDocId);
    addAuditEvent({
      id: `ae-${Date.now()}`,
      applicationId,
      action: 'Document Rejected',
      actor: officerName,
      actorRole: 'officer',
      detail: `Rejected ${doc?.document_type.replace(/_/g, ' ') ?? 'document'} (${doc?.file_name ?? ''}): ${rejectReason}`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      type: 'verify',
    });

    addNotification({
      id: `n-${Date.now()}`,
      title: 'Document Rejected',
      message: `Your ${doc?.document_type.replace(/_/g, ' ')} was rejected. Reason: ${rejectReason}. Please re-upload a valid document.`,
      type: 'warning',
      read: false,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      applicationId,
    });

    setRejectDocId(null);
    setRejectReason('');
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
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
        <CardContent className="flex items-center justify-center py-12 text-xs text-[#755C49]">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-[#6F4028]" />
          Loading secure document attachments...
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
        <CardHeader className="py-4 border-b border-[#D8C2AA] bg-[#F5EBDD]">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#38241B]">
            <FileText className="h-4 w-4 text-[#6F4028]" />
            Document Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#D8C2AA] bg-[#F5EBDD] p-3.5 text-xs text-[#755C49]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#6F4028]" />
            No documents have been attached to this record yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const rejectedCount = documents.filter((d) => d.status === 'rejected').length;
  const pendingCount = documents.filter((d) => d.status === 'pending').length;

  return (
    <>
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm text-[#38241B]">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#6F4028]" />
              <div>
                <CardTitle className="text-sm font-semibold text-[#38241B]">Supporting Document Verification</CardTitle>
                <CardDescription className="text-xs text-[#755C49]">
                  Review and certify citizen documents. Secure signed URLs expire in 60s.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 font-semibold text-xs">
                {verifiedCount} Verified
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="outline" className="border-[#D8C2AA] bg-[#FFF8ED] text-[#6F4028] font-semibold text-xs">
                  {pendingCount} Pending
                </Badge>
              )}
              {rejectedCount > 0 && (
                <Badge variant="outline" className="border-red-300 bg-red-100 text-red-800 font-semibold text-xs">
                  {rejectedCount} Discrepancies
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#D8C2AA] bg-[#F5EBDD] px-3 py-2 text-xs text-[#755C49]">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#6F4028]" />
            <span>DPDP Protected: High-assurance document preview with cryptographic signed token expiration.</span>
          </div>

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
                        <span className="text-xs font-semibold text-[#38241B]">{req?.label ?? doc.document_type}</span>
                        {isReused && (
                          <span className="rounded bg-[#EAD8C2] border border-[#D8C2AA] px-1.5 py-0.2 text-[10px] font-semibold text-[#6F4028]">
                            Vault Reused
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-[#755C49]">
                        <span className="font-mono truncate max-w-xs">{doc.file_name}</span>
                        <span>·</span>
                        <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                        {doc.verified_at && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-700 font-medium">Verified by {doc.verified_by}</span>
                          </>
                        )}
                      </div>
                      {isRejected && doc.rejection_reason && (
                        <p className="mt-1 text-xs text-red-800">Discrepancy: {doc.rejection_reason}</p>
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
                      View
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleVerify(doc.id)}
                          disabled={actionLoading === doc.id}
                          className="gap-1.5 bg-[#6F4028] hover:bg-[#805236] text-[#FFF8ED] text-xs h-8 shadow-sm border-0"
                        >
                          {actionLoading === doc.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Certify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectDocId(doc.id)}
                          disabled={actionLoading === doc.id}
                          className="gap-1 text-xs h-8 border-red-300 bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDocId} onOpenChange={(open) => !open && setRejectDocId(null)}>
        <DialogContent className="sm:max-w-md bg-[#FFF8ED] border-[#D8C2AA] text-[#38241B]">
          <DialogHeader>
            <DialogTitle className="text-base text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Reject Document Attachment
            </DialogTitle>
            <DialogDescription className="text-xs text-[#755C49]">
              Provide specific feedback explaining why this attachment was not verified. The applicant will be requested to provide a corrected file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs text-[#38241B]">Rejection Note</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="text-xs bg-[#FFF8ED] border-[#D8C2AA] text-[#38241B] focus:border-[#C58B55]"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectDocId(null)}
              className="text-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!rejectReason.trim()}
              onClick={handleReject}
              className="text-xs bg-red-700 hover:bg-red-800 text-white border-0"
            >
              Confirm Discrepancy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                      Open full view
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
