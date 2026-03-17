-- ============================================================
-- ResumeAI SaaS Platform — Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Profiles table (one per Clerk user)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Resumes table (metadata for each resume)
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Resume',
  resume_type TEXT NOT NULL DEFAULT 'fresher' CHECK (resume_type IN ('fresher','developer','internship','experienced')),
  tone TEXT NOT NULL DEFAULT 'professional' CHECK (tone IN ('professional','simple','impact')),
  generated_text TEXT,
  strength_score INTEGER DEFAULT 0 CHECK (strength_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_profile FOREIGN KEY (clerk_user_id)
    REFERENCES profiles(clerk_user_id) ON DELETE CASCADE
);

-- ============================================================
-- Resume sections (one row per section per resume)
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN (
    'personal','education','experience','projects','skills','certifications'
  )),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT fk_resume FOREIGN KEY (resume_id)
    REFERENCES resumes(id) ON DELETE CASCADE,
  CONSTRAINT unique_section UNIQUE (resume_id, section_type)
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_resumes_clerk_user ON resumes(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_sections_resume ON resume_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_sections_type ON resume_sections(section_type);

-- ============================================================
-- Updated_at auto-trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_sections_updated_at
  BEFORE UPDATE ON resume_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security (RLS)
-- NOTE: Since we use Clerk (not Supabase Auth), RLS is enforced
-- at the backend (service role key checks clerk_user_id).
-- We enable RLS but allow all via service role key.
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;

-- Allow server (service_role) full access
CREATE POLICY "service_role_all_profiles" ON profiles
  FOR ALL USING (true);

CREATE POLICY "service_role_all_resumes" ON resumes
  FOR ALL USING (true);

CREATE POLICY "service_role_all_sections" ON resume_sections
  FOR ALL USING (true);
