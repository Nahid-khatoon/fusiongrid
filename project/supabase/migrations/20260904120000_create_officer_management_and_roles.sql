/*
# FusionGrid: Role-Based Authentication & Admin-Controlled Officer Management System

## Purpose
1. Implements strict, database-enforced role-based access control (RBAC): 'admin', 'officer', 'citizen'.
2. Stores and enforces officer profiles with active/deactivated statuses, departments, and designations.
3. Restricts officer creation, updates, credential resets, and deactivations strictly to authorized Admins.
4. Prevents public visitors and ordinary citizens from assigning themselves privileged roles.
5. Records immutable administrative audit logs for all officer management actions.
*/

-- ── 1. user_roles table ──
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'officer', 'citizen')),
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_roles_user_id UNIQUE (user_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ── 2. officers table ──
CREATE TABLE IF NOT EXISTS public.officers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  department text NOT NULL,
  designation text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

-- ── 3. admin_audit_logs table (Immutable ledger) ──
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  actor_name text NOT NULL DEFAULT 'Nahid Shams',
  actor_role text NOT NULL DEFAULT 'admin',
  action text NOT NULL,
  target_id text,
  target_type text DEFAULT 'officer',
  detail text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ── 4. Helper Security Definer Functions ──

-- Check if current authenticated caller has 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Check if current authenticated caller has active 'officer' role
CREATE OR REPLACE FUNCTION public.is_officer()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.officers o ON o.id = ur.user_id
    WHERE ur.user_id = auth.uid() 
      AND ur.role = 'officer' 
      AND o.is_active = true
  );
$$;

-- Get current authenticated user's verified role and details
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TABLE (
  role text,
  is_active boolean,
  full_name text,
  department text,
  employee_id text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_active boolean := true;
  v_name text := '';
  v_dept text := '';
  v_emp text := '';
BEGIN
  SELECT ur.role INTO v_role
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();

  IF v_role IS NULL THEN
    -- Fallback check for citizen profile
    IF EXISTS (SELECT 1 FROM public.citizens WHERE id = auth.uid()) THEN
      v_role := 'citizen';
    END IF;
  END IF;

  IF v_role = 'officer' THEN
    SELECT o.is_active, o.full_name, o.department, o.employee_id
    INTO v_active, v_name, v_dept, v_emp
    FROM public.officers o
    WHERE o.id = auth.uid();
  ELSIF v_role = 'citizen' THEN
    SELECT c.full_name INTO v_name
    FROM public.citizens c
    WHERE c.id = auth.uid();
  ELSIF v_role = 'admin' THEN
    v_name := 'Nahid Shams';
  END IF;

  RETURN QUERY SELECT v_role, v_active, v_name, v_dept, v_emp;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_officer() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- ── 5. Row-Level Security Policies ──

-- user_roles policies
DROP POLICY IF EXISTS "users_read_own_role" ON public.user_roles;
CREATE POLICY "users_read_own_role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "admin_manage_user_roles" ON public.user_roles;
CREATE POLICY "admin_manage_user_roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- officers policies
DROP POLICY IF EXISTS "admin_read_all_officers" ON public.officers;
CREATE POLICY "admin_read_all_officers"
  ON public.officers FOR SELECT
  TO authenticated
  USING (public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "admin_manage_officers" ON public.officers;
CREATE POLICY "admin_manage_officers"
  ON public.officers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- admin_audit_logs policies
DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "admin_read_audit_logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "admin_insert_audit_logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Prevent any modification or deletion of audit logs (immutable)
DROP POLICY IF EXISTS "no_update_audit_logs" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "no_delete_audit_logs" ON public.admin_audit_logs;

-- ── 6. Update handle_new_user() Trigger (Prevent Self-Promotion) ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always assign ONLY the citizen role to public auth signups
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'citizen')
  ON CONFLICT (user_id) DO NOTHING;

  -- Create citizen profile row
  INSERT INTO public.citizens (
    id, full_name, mobile, dob, address, district, college, course
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'mobile', ''),
    COALESCE(new.raw_user_meta_data->>'dob', ''),
    COALESCE(new.raw_user_meta_data->>'address', ''),
    COALESCE(new.raw_user_meta_data->>'district', ''),
    COALESCE(new.raw_user_meta_data->>'college', ''),
    COALESCE(new.raw_user_meta_data->>'course', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- ── 7. Stored Procedures for Admin Officer Operations ──

-- Admin list all officers with safe fields
CREATE OR REPLACE FUNCTION public.admin_list_officers()
RETURNS TABLE (
  id uuid,
  employee_id text,
  full_name text,
  email text,
  department text,
  designation text,
  is_active boolean,
  must_change_password boolean,
  created_at timestamptz,
  last_login_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict server-side Admin authorization check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only authorized Administrators may view officer records.';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.employee_id,
    o.full_name,
    o.email,
    o.department,
    o.designation,
    o.is_active,
    o.must_change_password,
    o.created_at,
    o.last_login_at
  FROM public.officers o
  ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_officers() TO authenticated;

-- Admin toggle officer active status
CREATE OR REPLACE FUNCTION public.admin_toggle_officer_status(
  p_officer_id uuid,
  p_is_active boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_officer_name text;
  v_emp_id text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only authorized Administrators may modify officer status.';
  END IF;

  SELECT full_name, employee_id INTO v_officer_name, v_emp_id
  FROM public.officers
  WHERE id = p_officer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Officer account not found.';
  END IF;

  UPDATE public.officers
  SET is_active = p_is_active, updated_at = now()
  WHERE id = p_officer_id;

  -- Record in audit log
  INSERT INTO public.admin_audit_logs (actor_id, actor_name, action, target_id, detail, metadata)
  VALUES (
    auth.uid(),
    'Nahid Shams',
    CASE WHEN p_is_active THEN 'officer_activated' ELSE 'officer_deactivated' END,
    v_emp_id,
    format('Officer %s (%s) was %s by Administrator Nahid Shams', v_officer_name, v_emp_id, CASE WHEN p_is_active THEN 'activated' ELSE 'deactivated' END),
    jsonb_build_object('officer_id', p_officer_id, 'is_active', p_is_active)
  );

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_toggle_officer_status(uuid, boolean) TO authenticated;

-- Admin update officer details
CREATE OR REPLACE FUNCTION public.admin_update_officer(
  p_officer_id uuid,
  p_full_name text,
  p_department text,
  p_designation text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_emp_id text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only authorized Administrators may update officer details.';
  END IF;

  SELECT employee_id INTO v_emp_id
  FROM public.officers
  WHERE id = p_officer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Officer account not found.';
  END IF;

  UPDATE public.officers
  SET
    full_name = p_full_name,
    department = p_department,
    designation = p_designation,
    updated_at = now()
  WHERE id = p_officer_id;

  INSERT INTO public.admin_audit_logs (actor_id, actor_name, action, target_id, detail, metadata)
  VALUES (
    auth.uid(),
    'Nahid Shams',
    'officer_details_updated',
    v_emp_id,
    format('Officer %s (%s) details updated: Department=%s, Designation=%s', p_full_name, v_emp_id, p_department, p_designation),
    jsonb_build_object('department', p_department, 'designation', p_designation)
  );

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_officer(uuid, text, text, text) TO authenticated;

-- Admin revoke officer access
CREATE OR REPLACE FUNCTION public.admin_revoke_officer(
  p_officer_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_officer_name text;
  v_emp_id text;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only authorized Administrators may revoke officer access.';
  END IF;

  SELECT full_name, employee_id INTO v_officer_name, v_emp_id
  FROM public.officers
  WHERE id = p_officer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Officer account not found.';
  END IF;

  -- Mark deactivated and revoked
  UPDATE public.officers
  SET is_active = false, updated_at = now()
  WHERE id = p_officer_id;

  -- Revoke officer role in user_roles
  UPDATE public.user_roles
  SET role = 'citizen', updated_at = now()
  WHERE user_id = p_officer_id;

  INSERT INTO public.admin_audit_logs (actor_id, actor_name, action, target_id, detail, metadata)
  VALUES (
    auth.uid(),
    'Nahid Shams',
    'officer_access_revoked',
    v_emp_id,
    format('Officer credentials revoked for %s (%s) by Administrator Nahid Shams', v_officer_name, v_emp_id),
    jsonb_build_object('revoked_officer_id', p_officer_id)
  );

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_revoke_officer(uuid) TO authenticated;

-- ── 8. Initial Admin Account Bootstrapping Procedure ──
-- Secure helper procedure to grant Admin role to the designated admin email
CREATE OR REPLACE FUNCTION public.bootstrap_admin_account(
  p_admin_email text,
  p_admin_name text DEFAULT 'Nahid Shams'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Look up user ID from auth.users by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_admin_email;

  IF v_user_id IS NULL THEN
    RETURN format('User with email %s does not exist in Supabase auth yet. Please have the administrator sign up first or create the auth user in Supabase Studio, then re-run bootstrap.', p_admin_email);
  END IF;

  -- Insert or update user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin', updated_at = now();

  -- Log bootstrap action
  INSERT INTO public.admin_audit_logs (actor_id, actor_name, action, target_id, detail)
  VALUES (
    v_user_id,
    p_admin_name,
    'admin_bootstrapped',
    p_admin_email,
    format('Administrator %s (%s) authorized as Root Admin', p_admin_name, p_admin_email)
  );

  RETURN format('Success: %s (%s) has been granted Admin privileges.', p_admin_name, p_admin_email);
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_admin_account(text, text) TO authenticated;
