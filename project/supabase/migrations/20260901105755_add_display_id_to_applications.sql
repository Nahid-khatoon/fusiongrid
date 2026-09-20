/*
# Add display_id column to applications table

## Purpose
The Application type in the frontend uses a human-readable ID like
"MH-SCH-2026-00125" as the `id` field. The applications table uses a UUID
primary key. This migration adds a `display_id` text column to store the
human-readable ID alongside the UUID primary key.

## Changes
- applications: add `display_id` text column (nullable)

## Security
- No security changes. RLS already enabled on applications table.
*/

ALTER TABLE applications ADD COLUMN IF NOT EXISTS display_id text;
