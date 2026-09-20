/*
# Create Document Upload & One-Time Verification System

## Purpose
Enables citizens to upload required documents (Identity Proof, Income Certificate,
Student/College Certificate, Bank Account Proof) as part of their scholarship application.
Documents are stored in a private Supabase Storage bucket. After an officer verifies a
document, it is saved to the citizen's reusable "document vault." For future eligible
services, the citizen can reuse verified vault documents with consent — no re-upload or
re-verification needed. This implements the SIH concept: "Submit Once → Verify Once →
Securely Reuse with Citizen Consent."

## New Tables

### document_vault
- id (uuid, primary key)
- citizen_id (uuid, references citizens.id ON DELETE CASCADE)
- document_type (text, not null)
- file_path (text, not null) — storage path in 'documents' bucket
- file_name (text, not null)
- file_size (bigint, not null)
- mime_type (text, not null)
- verified_at (timestamptz, not null)
- verified_by (text, not null)
- source_application_id (uuid, references applications.id ON DELETE SET NULL)
- is_valid (boolean, default true) — false if expired/rejected/outdated
- created_at (timestamptz, default now())

### application_documents
- id (uuid, primary key)
- application_id (uuid, references applications.id ON DELETE CASCADE)
- citizen_id (uuid, references citizens.id ON DELETE CASCADE, default auth.uid())
- document_type (text, not null)
- file_path (text, not null)
- file_name (text, not null)
- file_size (bigint, not null)
- mime_type (text, not null)
- status (text, not null, default 'pending') — 'pending' | 'verified' | 'rejected'
- rejection_reason (text)
- verified_at (timestamptz)
- verified_by (text)
- reused_from_vault (boolean, default false)
- vault_document_id (uuid, references document_vault.id ON DELETE SET NULL)
- consent_given (boolean, default false)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

## Security
- RLS enabled on both tables.
- Citizens can SELECT, INSERT, UPDATE only their own rows (citizen_id = auth.uid()).
- Officers/admins use SECURITY DEFINER functions to access and verify documents.
- Storage bucket 'documents' is private — access only via signed URLs.
- No service-role key in frontend code.

## New Functions
### get_application_documents(p_application_id uuid)
### get_citizen_vault_documents()
### verify_document(p_document_id uuid, p_officer_name text)
### reject_document(p_document_id uuid, p_reason text, p_officer_name text)
### get_all_document_verification_activity()
*/

-- ── document_vault table (create FIRST for FK reference) ──
CREATE TABLE IF NOT EXISTS document_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid NOT NULL DEFAULT auth.uid() REFERENCES citizens(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  verified_by text NOT NULL,
  source_application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  is_valid boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE document_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vault" ON document_vault;
CREATE POLICY "select_own_vault"
  ON document_vault FOR SELECT
  TO authenticated
  USING (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "insert_own_vault" ON document_vault;
CREATE POLICY "insert_own_vault"
  ON document_vault FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "update_own_vault" ON document_vault;
CREATE POLICY "update_own_vault"
  ON document_vault FOR UPDATE
  TO authenticated
  USING (auth.uid() = citizen_id)
  WITH CHECK (auth.uid() = citizen_id);

-- ── application_documents table ──
CREATE TABLE IF NOT EXISTS application_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  citizen_id uuid NOT NULL DEFAULT auth.uid() REFERENCES citizens(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  verified_at timestamptz,
  verified_by text,
  reused_from_vault boolean NOT NULL DEFAULT false,
  vault_document_id uuid REFERENCES document_vault(id) ON DELETE SET NULL,
  consent_given boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON application_documents;
CREATE POLICY "select_own_documents"
  ON application_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "insert_own_documents" ON application_documents;
CREATE POLICY "insert_own_documents"
  ON application_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "update_own_documents" ON application_documents;
CREATE POLICY "update_own_documents"
  ON application_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = citizen_id)
  WITH CHECK (auth.uid() = citizen_id);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_app_docs_application_id ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_app_docs_citizen_id ON application_documents(citizen_id);
CREATE INDEX IF NOT EXISTS idx_vault_citizen_id ON document_vault(citizen_id);
CREATE INDEX IF NOT EXISTS idx_vault_citizen_type ON document_vault(citizen_id, document_type);

-- ── updated_at trigger ──
CREATE OR REPLACE FUNCTION public.update_app_doc_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_app_doc_updated ON application_documents;
CREATE TRIGGER trg_app_doc_updated
  BEFORE UPDATE ON application_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_app_doc_timestamp();

-- ── SECURITY DEFINER functions ──

CREATE OR REPLACE FUNCTION public.get_application_documents(p_application_id uuid)
RETURNS TABLE (
  id uuid,
  application_id uuid,
  citizen_id uuid,
  document_type text,
  file_path text,
  file_name text,
  file_size bigint,
  mime_type text,
  status text,
  rejection_reason text,
  verified_at timestamptz,
  verified_by text,
  reused_from_vault boolean,
  vault_document_id uuid,
  consent_given boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM application_documents WHERE application_id = p_application_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_application_documents(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_citizen_vault_documents()
RETURNS TABLE (
  id uuid,
  citizen_id uuid,
  document_type text,
  file_path text,
  file_name text,
  file_size bigint,
  mime_type text,
  verified_at timestamptz,
  verified_by text,
  source_application_id uuid,
  is_valid boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM document_vault WHERE citizen_id = auth.uid() AND is_valid = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_citizen_vault_documents() TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_document(
  p_document_id uuid,
  p_officer_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app_id uuid;
  v_citizen_id uuid;
  v_doc_type text;
  v_file_path text;
  v_file_name text;
  v_file_size bigint;
  v_mime_type text;
  v_reused boolean;
BEGIN
  SELECT application_id, citizen_id, document_type, file_path, file_name, file_size, mime_type, reused_from_vault
  INTO v_app_id, v_citizen_id, v_doc_type, v_file_path, v_file_name, v_file_size, v_mime_type, v_reused
  FROM application_documents WHERE id = p_document_id;

  IF v_app_id IS NULL THEN
    RAISE EXCEPTION 'Document not found';
  END IF;

  UPDATE application_documents
  SET status = 'verified',
      verified_at = now(),
      verified_by = p_officer_name,
      rejection_reason = NULL
  WHERE id = p_document_id;

  IF v_reused = false THEN
    INSERT INTO document_vault (citizen_id, document_type, file_path, file_name, file_size, mime_type, verified_at, verified_by, source_application_id, is_valid)
    VALUES (v_citizen_id, v_doc_type, v_file_path, v_file_name, v_file_size, v_mime_type, now(), p_officer_name, v_app_id, true);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_document(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.reject_document(
  p_document_id uuid,
  p_reason text,
  p_officer_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE application_documents
  SET status = 'rejected',
      rejection_reason = p_reason,
      verified_at = now(),
      verified_by = p_officer_name
  WHERE id = p_document_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_document(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_all_document_verification_activity()
RETURNS TABLE (
  id uuid,
  application_id uuid,
  citizen_id uuid,
  document_type text,
  file_name text,
  status text,
  rejection_reason text,
  verified_at timestamptz,
  verified_by text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, application_id, citizen_id, document_type, file_name, status,
         rejection_reason, verified_at, verified_by, created_at, updated_at
  FROM application_documents
  ORDER BY updated_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_document_verification_activity() TO authenticated;
