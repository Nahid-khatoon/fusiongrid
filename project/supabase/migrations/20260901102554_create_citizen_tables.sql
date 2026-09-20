/*
# Create citizen profiles and applications tables

## Purpose
Enables citizen signup/login via Supabase Auth, with each citizen having
a profile linked to their auth.users.id, and applications scoped to that
citizen. Row Level Security ensures citizens only see their own data.

## New Tables

### citizens
- id (uuid, primary key, references auth.users.id ON DELETE CASCADE)
- full_name (text, not null)
- mobile (text)
- dob (text)
- address (text)
- district (text)
- college (text)
- course (text)
- verified (boolean, default false)
- created_at (timestamptz, default now())

### applications
- id (uuid, primary key, default gen_random_uuid)
- citizen_id (uuid, not null, references citizens.id ON DELETE CASCADE, default auth.uid())
- service_id (text, not null)
- service_name (text, not null)
- status (text, not null, default 'submitted')
- progress (integer, default 0)
- submitted_at (timestamptz, default now())
- request_id (text)
- rejection_reason (text)
- info_request_reason (text)
- officer_notes (text)
- consents (jsonb, default '[]')
- timeline (jsonb, default '[]')
- data_access (jsonb, default '[]')
- departments (jsonb, default '[]')
- workflow_stages (jsonb, default '[]')
- created_at (timestamptz, default now())

## Security
- RLS enabled on both tables.
- citizens: users can SELECT and UPDATE only their own profile row (id = auth.uid()).
- citizens: INSERT is handled via a trigger that auto-creates a profile row
  when a new auth user signs up, so no direct INSERT policy is needed for
  the frontend. A policy is still added for authenticated insert of own row.
- applications: full CRUD scoped to citizen_id = auth.uid().

## Notes
1. A trigger function `handle_new_user()` inserts a citizens row on signup.
2. The trigger fires AFTER INSERT on auth.users, copying email and
   user_metadata fields (full_name, mobile, dob, address, district,
   college, course) into the citizens table.
3. citizen_id on applications defaults to auth.uid() so frontend inserts
   that omit it still satisfy RLS.
*/

-- ── citizens table ──
CREATE TABLE IF NOT EXISTS citizens (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  mobile text DEFAULT '',
  dob text DEFAULT '',
  address text DEFAULT '',
  district text DEFAULT '',
  college text DEFAULT '',
  course text DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_citizen" ON citizens;
CREATE POLICY "select_own_citizen"
  ON citizens FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_citizen" ON citizens;
CREATE POLICY "insert_own_citizen"
  ON citizens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_citizen" ON citizens;
CREATE POLICY "update_own_citizen"
  ON citizens FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── applications table ──
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid NOT NULL DEFAULT auth.uid() REFERENCES citizens(id) ON DELETE CASCADE,
  service_id text NOT NULL,
  service_name text NOT NULL,
  status text NOT NULL DEFAULT 'submitted',
  progress integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  request_id text,
  rejection_reason text,
  info_request_reason text,
  officer_notes text,
  consents jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  data_access jsonb NOT NULL DEFAULT '[]'::jsonb,
  departments jsonb NOT NULL DEFAULT '[]'::jsonb,
  workflow_stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = citizen_id)
  WITH CHECK (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications"
  ON applications FOR DELETE
  TO authenticated
  USING (auth.uid() = citizen_id);

-- ── Auto-create citizen profile on signup ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.citizens (id, full_name, mobile, dob, address, district, college, course)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    COALESCE(NEW.raw_user_meta_data->>'dob', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'district', ''),
    COALESCE(NEW.raw_user_meta_data->>'college', ''),
    COALESCE(NEW.raw_user_meta_data->>'course', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
