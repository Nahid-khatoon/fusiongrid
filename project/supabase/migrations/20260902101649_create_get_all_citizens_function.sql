/*
# Create get_all_citizens() function for admin/officer access

## Purpose
Admins and officers use mock login (no Supabase auth session), so RLS
blocks them from reading the citizens table. This SECURITY DEFINER function
bypasses RLS so the Data Standards page can show real registered citizens
instead of hardcoded mock data.

## Security
- SECURITY DEFINER with fixed search_path = public
- EXECUTE granted to anon and authenticated
- Read-only: only exposes profile fields (no auth tokens or passwords)
*/

CREATE OR REPLACE FUNCTION public.get_all_citizens()
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
  ORDER BY c.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_citizens() TO anon, authenticated;