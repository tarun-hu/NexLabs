-- NexLabs Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  client_email TEXT,
  status TEXT DEFAULT 'lead',
  title TEXT NOT NULL,
  idea_summary TEXT NOT NULL,
  vertical TEXT NOT NULL,
  timeline TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  tech_stack_preference TEXT,
  ai_generated_prd JSONB,
  technical_requirements JSONB,
  trd_status TEXT DEFAULT 'pending',
  quote_amount INTEGER,
  quote_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project messages table
CREATE TABLE IF NOT EXISTS project_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scoping submissions table
CREATE TABLE IF NOT EXISTS scoping_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  idea VARCHAR(500) NOT NULL,
  vertical TEXT NOT NULL,
  timeline TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  referral_source TEXT,
  ai_prd_status TEXT DEFAULT 'pending',
  ai_prd_raw JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoping_submissions ENABLE ROW LEVEL SECURITY;

-- Users: users can read their own row
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Projects: clients can only see their own projects
CREATE POLICY "Clients see own projects" ON projects
  FOR SELECT USING (user_id = auth.uid());

-- Admins can see all projects
CREATE POLICY "Admins see all projects" ON projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Project messages: only non-internal messages for clients
CREATE POLICY "Clients see project messages" ON project_messages
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
    AND is_internal = false
  );

-- Scoping submissions: public insert, admin only read
CREATE POLICY "Public can submit scoping" ON scoping_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read scoping" ON scoping_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_scoping_submissions_email ON scoping_submissions(email);