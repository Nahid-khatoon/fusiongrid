import { supabase } from '@/lib/supabase';
import type { ApplicationDocument, VaultDocument, DocumentType } from '@/types';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/types';

export interface UploadResult {
  success: boolean;
  error?: string;
  filePath?: string;
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 10MB.';
  }
  return null;
}

export async function uploadDocument(
  file: File,
  citizenId: string,
  documentType: DocumentType
): Promise<UploadResult> {
  const validationError = validateFile(file);
  if (validationError) return { success: false, error: validationError };

  const fileExt = file.name.split('.').pop() || 'pdf';
  const fileName = `${documentType}_${Date.now()}.${fileExt}`;
  const filePath = `${citizenId}/${fileName}`;

  const { error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) return { success: false, error: error.message };
  return { success: true, filePath };
}

export async function createApplicationDocument(
  applicationId: string,
  citizenId: string,
  documentType: DocumentType,
  file: File,
  filePath: string
): Promise<{ data: ApplicationDocument | null; error: string | null }> {
  const { data, error } = await supabase
    .from('application_documents')
    .insert({
      application_id: applicationId,
      citizen_id: citizenId,
      document_type: documentType,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ApplicationDocument, error: null };
}

export async function createReusedDocument(
  applicationId: string,
  citizenId: string,
  documentType: DocumentType,
  vaultDoc: VaultDocument,
  consentGiven: boolean
): Promise<{ data: ApplicationDocument | null; error: string | null }> {
  const { data, error } = await supabase
    .from('application_documents')
    .insert({
      application_id: applicationId,
      citizen_id: citizenId,
      document_type: documentType,
      file_path: vaultDoc.file_path,
      file_name: vaultDoc.file_name,
      file_size: vaultDoc.file_size,
      mime_type: vaultDoc.mime_type,
      status: 'verified',
      verified_at: vaultDoc.verified_at,
      verified_by: vaultDoc.verified_by,
      reused_from_vault: true,
      vault_document_id: vaultDoc.id,
      consent_given: consentGiven,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ApplicationDocument, error: null };
}

export async function fetchApplicationDocuments(
  applicationId: string,
  isOfficer: boolean
): Promise<ApplicationDocument[]> {
  if (isOfficer) {
    const { data, error } = await supabase.rpc('get_application_documents', {
      p_application_id: applicationId,
    });
    if (error || !data) return [];
    return data as unknown as ApplicationDocument[];
  }
  const { data, error } = await supabase
    .from('application_documents')
    .select('*')
    .eq('application_id', applicationId);
  if (error || !data) return [];
  return data as unknown as ApplicationDocument[];
}

export async function fetchCitizenVault(): Promise<VaultDocument[]> {
  const { data, error } = await supabase.rpc('get_citizen_vault_documents');
  if (error || !data) return [];
  return data as unknown as VaultDocument[];
}

export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 60
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function reuploadDocument(
  documentId: string,
  file: File,
  citizenId: string,
  documentType: DocumentType
): Promise<{ error: string | null }> {
  const validationError = validateFile(file);
  if (validationError) return { error: validationError };

  const fileExt = file.name.split('.').pop() || 'pdf';
  const fileName = `${documentType}_re_${Date.now()}.${fileExt}`;
  const filePath = `${citizenId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { error } = await supabase
    .from('application_documents')
    .update({
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      status: 'pending',
      rejection_reason: null,
      verified_at: null,
      verified_by: null,
    })
    .eq('id', documentId);

  return { error: error?.message ?? null };
}

export async function officerVerifyDocument(
  documentId: string,
  officerName: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('verify_document', {
    p_document_id: documentId,
    p_officer_name: officerName,
  });
  return { error: error?.message ?? null };
}

export async function officerRejectDocument(
  documentId: string,
  reason: string,
  officerName: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('reject_document', {
    p_document_id: documentId,
    p_reason: reason,
    p_officer_name: officerName,
  });
  return { error: error?.message ?? null };
}

export async function fetchAllDocumentActivity(): Promise<ApplicationDocument[]> {
  const { data, error } = await supabase.rpc('get_all_document_verification_activity');
  if (error || !data) return [];
  return data as unknown as ApplicationDocument[];
}
