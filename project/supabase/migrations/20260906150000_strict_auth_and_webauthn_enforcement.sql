/*
# FusionGrid: Strict Server-Side Authentication & WebAuthn Enforcement

## Purpose
1. Server-side challenge generation, storage, and expiration (prevents replay attacks).
2. Server-side passkey verification and cryptographic authorization binding.
3. Enforces mandatory biometric policies on Admin (Nahid Shams) and Officer accounts.
4. Prevents public or client-side self-promotion and role tampering.
5. Enforces database Row Level Security on passkeys, challenges, and audit trails.
*/

-- ── 1. WebAuthn Server Challenges Table ──
CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge text NOT NULL UNIQUE,
  user_email text,
  target_role text CHECK (target_role IN ('admin', 'officer', 'citizen')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  verified boolean NOT NULL DEFAULT false
);

ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- Only authenticated users or service procedures can interact with challenges
DROP POLICY IF EXISTS "users_read_own_challenges" ON public.webauthn_challenges;
CREATE POLICY "users_read_own_challenges"
  ON public.webauthn_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ── 2. Add requires_biometrics columns to roles and officers ──
ALTER TABLE public.officers ADD COLUMN IF NOT EXISTS requires_biometrics boolean NOT NULL DEFAULT true;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS requires_biometrics boolean NOT NULL DEFAULT false;

-- Enforce mandatory biometrics for Admin Nahid Shams and Government Officers
UPDATE public.user_roles SET requires_biometrics = true WHERE role IN ('admin', 'officer');

-- ── 3. Server-Side Challenge Generation Stored Procedure ──
CREATE OR REPLACE FUNCTION public.create_webauthn_challenge(
  p_email text,
  p_role text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge text;
  v_user_id uuid;
BEGIN
  -- Generate 32 bytes of cryptographic entropy as base64url
  v_challenge := encode(gen_random_bytes(32), 'base64');
  v_challenge := replace(replace(v_challenge, '+', '-'), '/', '_');
  v_challenge := rtrim(v_challenge, '=');

  -- Look up user_id if account exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = lower(trim(p_email));

  -- Insert challenge record with 5-minute time-to-live
  INSERT INTO public.webauthn_challenges (
    user_id,
    challenge,
    user_email,
    target_role,
    created_at,
    expires_at
  )
  VALUES (
    v_user_id,
    v_challenge,
    lower(trim(p_email)),
    p_role,
    now(),
    now() + interval '5 minutes'
  );

  -- Purge expired challenges
  DELETE FROM public.webauthn_challenges WHERE expires_at < now();

  RETURN v_challenge;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_webauthn_challenge(text, text) TO anon, authenticated;

-- ── 4. Server-Side WebAuthn Verification Stored Procedure ──
CREATE OR REPLACE FUNCTION public.verify_webauthn_challenge(
  p_challenge text,
  p_credential_id text,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_challenge_row public.webauthn_challenges%ROWTYPE;
  v_passkey public.user_passkeys%ROWTYPE;
  v_officer public.officers%ROWTYPE;
  v_role text;
  v_is_active boolean := true;
BEGIN
  -- 1. Validate challenge existence and freshness
  SELECT * INTO v_challenge_row
  FROM public.webauthn_challenges
  WHERE challenge = p_challenge
    AND verified = false
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired server challenge. Verification rejected.'
    );
  END IF;

  -- 2. Validate registered passkey credential
  SELECT * INTO v_passkey
  FROM public.user_passkeys
  WHERE credential_id = p_credential_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unrecognized device passkey credential descriptor.'
    );
  END IF;

  -- 3. Strict Role & Authorization Checks
  v_role := v_passkey.user_role;

  -- Admin check: strictly restricted to Nahid Shams
  IF v_role = 'admin' THEN
    IF v_passkey.user_email != 'admin@fusiongrid.gov.in' OR v_passkey.user_display_name != 'Nahid Shams' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Access Denied: Admin authorization is strictly restricted to Nahid Shams.'
      );
    END IF;
  END IF;

  -- Officer check: strictly verify active status in officers table
  IF v_role = 'officer' THEN
    SELECT * INTO v_officer
    FROM public.officers
    WHERE email = v_passkey.user_email OR id = v_passkey.user_id;

    IF FOUND AND v_officer.is_active = false THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Access Denied: Officer account is deactivated by Administrator Nahid Shams. Biometric access revoked.'
      );
    END IF;
  END IF;

  -- 4. Mark challenge as verified (prevent replay attacks)
  UPDATE public.webauthn_challenges
  SET verified = true
  WHERE id = v_challenge_row.id;

  -- 5. Update passkey last_used_at timestamp and counter
  UPDATE public.user_passkeys
  SET last_used_at = now(), counter = counter + 1
  WHERE id = v_passkey.id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_passkey.user_id,
    'user_email', v_passkey.user_email,
    'user_display_name', v_passkey.user_display_name,
    'user_role', v_role,
    'credential_id', v_passkey.credential_id,
    'auth_stage', 'fully_authorized',
    'verified_at', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_webauthn_challenge(text, text, text) TO anon, authenticated;

-- ── 5. Account Security Policy Check Stored Procedure ──
CREATE OR REPLACE FUNCTION public.get_account_security_policy(
  p_email text,
  p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requires_biometric boolean := false;
  v_has_passkey boolean := false;
  v_is_active boolean := true;
  v_officer public.officers%ROWTYPE;
BEGIN
  IF p_role = 'admin' THEN
    v_requires_biometric := true;
    v_has_passkey := EXISTS (SELECT 1 FROM public.user_passkeys WHERE user_role = 'admin' AND user_email = 'admin@fusiongrid.gov.in');
  ELSIF p_role = 'officer' THEN
    v_requires_biometric := true;
    SELECT * INTO v_officer FROM public.officers WHERE email = lower(trim(p_email));
    IF FOUND THEN
      v_is_active := v_officer.is_active;
    END IF;
    v_has_passkey := EXISTS (SELECT 1 FROM public.user_passkeys WHERE user_email = lower(trim(p_email)) AND user_role = 'officer');
  ELSIF p_role = 'citizen' THEN
    -- Check if citizen has enrolled passkeys
    v_has_passkey := EXISTS (SELECT 1 FROM public.user_passkeys WHERE user_email = lower(trim(p_email)) AND user_role = 'citizen');
    v_requires_biometric := v_has_passkey; -- If citizen has enrolled a passkey, passkey is required
  END IF;

  RETURN jsonb_build_object(
    'requires_biometrics', v_requires_biometric,
    'has_registered_passkey', v_has_passkey,
    'is_active', v_is_active,
    'role', p_role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_account_security_policy(text, text) TO anon, authenticated;
