/*
# FusionGrid: WebAuthn Passkeys & Biometric Authentication Schema

## Purpose
1. Stores public WebAuthn credential descriptors and public keys linked to Supabase user accounts.
2. Supports device-bound platform authenticators (Windows Hello, Touch ID, Face ID, Security Keys).
3. Zero Biometric Storage Guarantee: Never stores biometric templates, raw images, or private keys.
   Only public key credentials and counter values are stored for cryptographic signature verification.
4. Enforces strict Row Level Security (RLS) to ensure users can only access their own credentials.
5. Preserves Admin and Officer authorization boundaries.
*/

-- ── 1. user_passkeys Table ──
CREATE TABLE IF NOT EXISTS public.user_passkeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  counter bigint NOT NULL DEFAULT 0,
  device_name text NOT NULL DEFAULT 'Platform Authenticator',
  authenticator_type text NOT NULL DEFAULT 'platform' CHECK (authenticator_type IN ('windows_hello', 'touch_id', 'face_id', 'platform', 'security_key')),
  transports text[] DEFAULT ARRAY['internal'],
  user_role text NOT NULL CHECK (user_role IN ('admin', 'officer', 'citizen')),
  user_email text NOT NULL,
  user_display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

-- ── 2. Row Level Security Policies ──

-- Users can view their own enrolled passkeys
DROP POLICY IF EXISTS "users_read_own_passkeys" ON public.user_passkeys;
CREATE POLICY "users_read_own_passkeys"
  ON public.user_passkeys FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Users can enroll a passkey for their own account
DROP POLICY IF EXISTS "users_insert_own_passkeys" ON public.user_passkeys;
CREATE POLICY "users_insert_own_passkeys"
  ON public.user_passkeys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own enrolled passkeys (revocation)
DROP POLICY IF EXISTS "users_delete_own_passkeys" ON public.user_passkeys;
CREATE POLICY "users_delete_own_passkeys"
  ON public.user_passkeys FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Allow update of last_used_at and counter on verification
DROP POLICY IF EXISTS "users_update_own_passkeys" ON public.user_passkeys;
CREATE POLICY "users_update_own_passkeys"
  ON public.user_passkeys FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ── 3. Helper Functions ──

-- Register a new passkey credential descriptor safely
CREATE OR REPLACE FUNCTION public.register_passkey(
  p_credential_id text,
  p_public_key text,
  p_device_name text,
  p_authenticator_type text,
  p_user_role text,
  p_user_email text,
  p_user_display_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required to enroll a biometric passkey.';
  END IF;

  -- Verify role cannot be spoofed to admin without is_admin check
  IF p_user_role = 'admin' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Admin biometric credentials can only be registered by authorized Root Administrator Nahid Shams.';
  END IF;

  INSERT INTO public.user_passkeys (
    user_id,
    credential_id,
    public_key,
    device_name,
    authenticator_type,
    user_role,
    user_email,
    user_display_name,
    created_at
  )
  VALUES (
    v_uid,
    p_credential_id,
    p_public_key,
    COALESCE(p_device_name, 'Platform Authenticator'),
    COALESCE(p_authenticator_type, 'platform'),
    p_user_role,
    p_user_email,
    p_user_display_name,
    now()
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_passkey(text, text, text, text, text, text, text) TO authenticated;
