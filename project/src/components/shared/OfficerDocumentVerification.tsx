import { useState, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle2, XCircle, Clock, Loader2, Eye,
  ShieldCheck, AlertCircle, FileCheck, Lock,
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
import { DOCUMENT_REQUIREMENTS, type ApplicationDocument, type DocumentType } from '@/types';
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
    const requiredTypes = DOCUMENT_REQUIREMENTS.map((r) => r.type);
    const relevantDocs = documents.filter((d) => requiredTypes.includes(d.document_type));
    const allVerified = relevantDocs.length === requiredTypes.length && relevantDocs.every((d) => d.status === 'verified');
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
      <Card className="border-border/60 animate-fade-in-up">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading documents…</span>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Document Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            No documents have been uploaded for this application yet.
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
      <Card className="border-border/60 animate-fade-in-up delay-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Document Verification
              </CardTitle>
              <CardDescription className="mt-1">
                Review and verify citizen documents. Signed URLs expire in 60 seconds.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                <CheckCircle2 className="mr-1 h-3 w-3" />{verifiedCount} Verified
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                  <Clock className="mr-1 h-3 w-3" />{pendingCount} Pending
                </Badge>
              )}
              {rejectedCount > 0 && (
                <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                  <XCircle className="mr-1 h-3 w-3" />{rejectedCount} Rejected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-xs text-blue-700">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            Documents are accessed via temporary signed URLs only. No permanent public URLs are exposed.
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
                      {doc.verified_at && (
                        <>
                          <span>·</span>
                          <span>By {doc.verified_by}</span>
                        </>
                      )}
                    </div>
                    {isRejected && doc.rejection_reason && (
                      <p className="mt-1 text-xs text-destructive">Reason: {doc.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleView(doc)}>
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          className="gap-1 bg-accent hover:bg-accent/90"
                          onClick={() => handleVerify(doc.id)}
                          disabled={actionLoading === doc.id}
                        >
                          {actionLoading === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => { setRejectDocId(doc.id); setRejectReason(''); }}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {isVerified && (
                      <Badge variant="outline" className="border-accent/30 bg-accent/10 text-accent">
                        <CheckCircle2 className="mr-1 h-3 w-3" />Verified
                      </Badge>
                    )}
                    {isRejected && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => { setRejectDocId(doc.id); setRejectReason(doc.rejection_reason || ''); }}
                      >
                        <XCircle className="h-3.5 w-3.5" />Rejected
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {verifiedCount === documents.length && documents.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-semibold text-accent">All documents verified</p>
                <p className="text-xs text-accent/80">This application can now proceed to final review and approval.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDocId} onOpenChange={(open) => { if (!open) setRejectDocId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              A reason is required. The citizen will be notified and can re-upload the document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-doc-reason">Rejection Reason</Label>
            <Textarea
              id="reject-doc-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDocId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()} className="gap-1.5">
              <XCircle className="h-4 w-4" />
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={!!viewingDoc} onOpenChange={(open) => { if (!open) { setViewingDoc(null); setViewingUrl(null); } }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {viewingDoc?.file_name ?? 'Document'}
            </DialogTitle>
            <DialogDescription>
              Temporary signed URL — expires in 60 seconds. This URL is private and cannot be shared.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center rounded-lg border bg-muted/30 p-4" style={{ minHeight: '300px' }}>
            {viewingUrl === null ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating signed URL…
              </div>
            ) : viewingUrl === '' ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed to generate signed URL. You may not have permission.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                {viewingDoc?.mime_type.startsWith('image/') ? (
                  <img src={viewingUrl} alt={viewingDoc?.file_name} className="max-h-[400px] rounded-lg border" />
                ) : (
                  <iframe src={viewingUrl} className="h-[400px] w-full rounded-lg border" title="Document preview" />
                )}
                <a href={viewingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                  Open in new tab
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
