/*
# Fix officer functions: correct column name and grant execute to anon

## Purpose
1. Fix typo in get_all_applications(): "conserts" -> "consents" in RETURNS TABLE
2. Grant EXECUTE to anon role so officer/admin (mock login, no Supabase session) can call

## Security
- Functions remain SECURITY DEFINER with fixed search_path = public
- No data deleted or modified
*/

DROP FUNCTION IF EXISTS public.get_all_applications();

CREATE FUNCTION public.get_all_applications()
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
  consents jsonb,
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

GRANT EXECUTE ON FUNCTION public.get_all_applications() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_citizen_by_id(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_application_status(text, text, text, text) TO anon, authenticated;