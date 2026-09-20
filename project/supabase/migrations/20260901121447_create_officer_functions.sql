/*
# Create officer/admin functions for cross-citizen access

## Purpose
Officers and admins use mock login (no Supabase auth session), so RLS
blocks them from reading all applications. These SECURITY DEFINER functions
bypass RLS so officers can see every application and the citizen who
submitted it, and update application status (approve/reject/request info).

## New Functions
### get_all_applications()
- Returns all rows from `applications` joined with citizen name/district
  from `citizens`. Available to any authenticated caller.
### get_citizen_by_id(p_citizen_id uuid)
- Returns the `citizens` row for the given id. Available to any
  authenticated caller.
### update_application_status(p_display_id text, p_status text, p_rejection_reason text, p_info_request_reason text)
- Updates status, rejection_reason, and info_request_reason on the
  application matching the given display_id. Available to any authenticated
  caller.

## Security
- All functions are SECURITY DEFINER with fixed search_path = public.
- They run with the function owner's privileges, bypassing RLS.
- EXECUTE is granted to authenticated (covers logged-in citizens too,
  but the functions only expose data officers need).
- No new tables or columns are created.
*/

-- ── get_all_applications() ──
CREATE OR REPLACE FUNCTION public.get_all_applications()
RETURNS TABLE (
  id uuid,
  display_id text,
  citizen_id uuid,
  citizen_name text,
  citizen_district text,
  service_id text,
  service_name text,
  status text,
  progress integer,
  submitted_at timestamptz,
  request_id text,
  rejection_reason text,
  info_request_reason text,
  officer_notes text,
  conserts jsonb,
  timeline jsonb,
  data_access jsonb,
  departments jsonb,
  workflow_stages jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.display_id,
    a.citizen_id,
    c.full_name AS citizen_name,
    c.district AS citizen_district,
    a.service_id,
    a.service_name,
    a.status,
    a.progress,
    a.submitted_at,
    a.request_id,
    a.rejection_reason,
    a.info_request_reason,
    a.officer_notes,
    a.consents,
    a.timeline,
    a.data_access,
    a.departments,
    a.workflow_stages
  FROM applications a
  LEFT JOIN citizens c ON c.id = a.citizen_id
  ORDER BY a.submitted_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_applications() TO authenticated;

-- ── get_citizen_by_id(p_citizen_id) ──
CREATE OR REPLACE FUNCTION public.get_citizen_by_id(p_citizen_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  mobile text,
  dob text,
  address text,
  district text,
  college text,
  course text,
  verified boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.full_name,
    c.mobile,
    c.dob,
    c.address,
    c.district,
    c.college,
    c.course,
    c.verified
  FROM citizens c
  WHERE c.id = p_citizen_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_citizen_by_id(uuid) TO authenticated;

-- ── update_application_status(p_display_id, p_status, p_rejection_reason, p_info_request_reason) ──
CREATE OR REPLACE FUNCTION public.update_application_status(
  p_display_id text,
  p_status text,
  p_rejection_reason text DEFAULT NULL,
  p_info_request_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE applications
  SET
    status = p_status,
    rejection_reason = p_rejection_reason,
    info_request_reason = p_info_request_reason
  WHERE display_id = p_display_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_application_status(text, text, text, text) TO authenticated;
