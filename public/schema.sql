-- User Tracking Database Schema (Story 4.2)
-- Database: PostgreSQL via Supabase
-- Performance Target: Sub-50ms writes

-- ============================================
-- 1. USER PROFILES TABLE (Already created in Story 4.1)
-- ============================================
-- This table was created in Story 4.1 via the handle_new_user() trigger
-- Linking authentication (auth.users) to persistent user data

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  country_of_origin TEXT,
  preferred_language TEXT DEFAULT 'en',
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ============================================
-- 2. APPLICATION STATES TABLE (New for Story 4.2)
-- ============================================
-- Stores visa application progress and tracking data

CREATE TABLE IF NOT EXISTS public.application_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Application Details
  university_name TEXT,
  program_name TEXT,
  intake_term TEXT, -- e.g., "Fall 2025", "Spring 2026"
  
  -- Status Tracking
  application_status TEXT DEFAULT 'draft' CHECK (application_status IN (
    'draft',
    'submitted',
    'under_review',
    'accepted',
    'rejected',
    'withdrawn'
  )),
  
  visa_status TEXT DEFAULT 'not_started' CHECK (visa_status IN (
    'not_started',
    'documents_collecting',
    'submitted',
    'interview_scheduled',
    'approved',
    'rejected'
  )),
  
  -- Progress Tracking (JSON for flexibility)
  checklist_progress JSONB DEFAULT '{}'::jsonb,
  documents_uploaded JSONB DEFAULT '[]'::jsonb,
  
  -- Timeline
  application_submitted_at TIMESTAMPTZ,
  visa_submitted_at TIMESTAMPTZ,
  expected_decision_date DATE,
  actual_decision_date DATE,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: One active application per user per program
  UNIQUE(user_id, university_name, program_name, intake_term)
);

-- Enable Row Level Security
ALTER TABLE public.application_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own applications
CREATE POLICY IF NOT EXISTS "Users can view own applications"
  ON public.application_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own applications"
  ON public.application_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own applications"
  ON public.application_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own applications"
  ON public.application_states FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_states_user_id ON public.application_states(user_id);
CREATE INDEX IF NOT EXISTS idx_application_states_status ON public.application_states(application_status, visa_status);

-- ============================================
-- 3. SAVED CONTENT TABLE (New for Story 4.2)
-- ============================================
-- Stores user-saved courses, articles, and resources

CREATE TABLE IF NOT EXISTS public.saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Content Reference
  content_type TEXT NOT NULL CHECK (content_type IN (
    'course',
    'article',
    'university',
    'partner',
    'resource'
  )),
  content_id TEXT NOT NULL, -- External ID from CMS or other source
  
  -- Metadata
  title TEXT,
  url TEXT,
  notes TEXT, -- User's personal notes
  tags TEXT[], -- User-defined tags for organization
  
  -- Timestamps
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ,
  
  -- Constraint: Prevent duplicate saves
  UNIQUE(user_id, content_type, content_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own saved content
CREATE POLICY IF NOT EXISTS "Users can view own saved content"
  ON public.saved_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own saved content"
  ON public.saved_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own saved content"
  ON public.saved_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own saved content"
  ON public.saved_content FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_content_user_id ON public.saved_content(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_content_type ON public.saved_content(content_type);
CREATE INDEX IF NOT EXISTS idx_saved_content_saved_at ON public.saved_content(saved_at DESC);

-- ============================================
-- 4. TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to application_states
DROP TRIGGER IF EXISTS update_application_states_updated_at ON public.application_states;
CREATE TRIGGER update_application_states_updated_at
    BEFORE UPDATE ON public.application_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. PERFORMANCE VERIFICATION
-- ============================================

-- Test query for sub-50ms performance target
-- Example: Insert a new application state (should be < 50ms)
-- This will be tested via the performance test in Story 4.2

COMMENT ON TABLE public.application_states IS 'Stores student visa application progress and tracking data. Performance target: <50ms writes.';
COMMENT ON TABLE public.saved_content IS 'Stores user-saved courses and resources. Performance target: <50ms writes.';
