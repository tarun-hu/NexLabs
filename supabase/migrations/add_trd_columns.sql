-- Add TRD columns to projects table if they don't exist
-- Run this in Supabase SQL Editor

-- Add technical_requirements column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projects'
    AND column_name = 'technical_requirements'
  ) THEN
    ALTER TABLE projects ADD COLUMN technical_requirements JSONB;
  END IF;
END $$;

-- Add trd_status column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'projects'
    AND column_name = 'trd_status'
  ) THEN
    ALTER TABLE projects ADD COLUMN trd_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Add index for trd_status for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_trd_status ON projects(trd_status);
