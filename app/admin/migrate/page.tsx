'use client';

import { useState } from 'react';

export default function MigratePage() {
  const [copied, setCopied] = useState(false);

  const schema = `-- Epic 4.2: User Tracking Database Schema
-- APPLICATION STATES TABLE
CREATE TABLE IF NOT EXISTS public.application_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  university_name TEXT,
  program_name TEXT,
  intake_term TEXT,
  application_status TEXT DEFAULT 'draft' CHECK (application_status IN (
    'draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'
  )),
  visa_status TEXT DEFAULT 'not_started' CHECK (visa_status IN (
    'not_started', 'documents_collecting', 'submitted',
    'interview_scheduled', 'approved', 'rejected'
  )),
  checklist_progress JSONB DEFAULT '{}'::jsonb,
  documents_uploaded JSONB DEFAULT '[]'::jsonb,
  application_submitted_at TIMESTAMPTZ,
  visa_submitted_at TIMESTAMPTZ,
  expected_decision_date DATE,
  actual_decision_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, university_name, program_name, intake_term)
);

ALTER TABLE public.application_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.application_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.application_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.application_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON public.application_states FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_application_states_user_id ON public.application_states(user_id);
CREATE INDEX idx_application_states_status ON public.application_states(application_status);

-- SAVED CONTENT TABLE
CREATE TABLE IF NOT EXISTS public.saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'scholarship', 'resource', 'program')),
  content_id TEXT NOT NULL,
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE public.saved_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved content"
  ON public.saved_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved content"
  ON public.saved_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved content"
  ON public.saved_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved content"
  ON public.saved_content FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_saved_content_user_id ON public.saved_content(user_id);
CREATE INDEX idx_saved_content_type ON public.saved_content(content_type);

-- Update trigger for application_states
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_application_states_updated_at BEFORE UPDATE
  ON public.application_states FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(schema);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert('Failed to copy. Please copy manually.');
    }
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '10px' }}>Database Migration - Epic 4.2</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Apply this schema to create the application_states and saved_content tables
      </p>

      <div style={{ 
        background: '#f0f9ff', 
        border: '2px solid #0ea5e9',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginTop: 0, color: '#0284c7' }}>Instructions:</h2>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Click the <strong>"Copy SQL"</strong> button below</li>
          <li>Open <a 
            href="https://supabase.com/dashboard/project/eurovhkmzgqtjrkjwrpb/sql/new" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0ea5e9', textDecoration: 'underline' }}
          >Supabase SQL Editor</a> (opens in new tab)</li>
          <li>Paste the SQL into the editor</li>
          <li>Click <strong>"Run"</strong></li>
          <li>Return here and refresh to verify</li>
        </ol>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={copyToClipboard}
          style={{
            background: copied ? '#10b981' : '#0ea5e9',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy SQL to Clipboard'}
        </button>

        <a
          href="https://supabase.com/dashboard/project/eurovhkmzgqtjrkjwrpb/sql/new"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginLeft: '15px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          🚀 Open SQL Editor
        </a>
      </div>

      <div style={{ 
        background: '#1e293b',
        borderRadius: '8px',
        padding: '20px',
        overflow: 'auto',
        maxHeight: '500px'
      }}>
        <pre style={{ 
          color: '#e2e8f0',
          margin: 0,
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          {schema}
        </pre>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#fef3c7',
        border: '2px solid #f59e0b',
        borderRadius: '8px'
      }}>
        <h3 style={{ marginTop: 0, color: '#92400e' }}>Why is this needed?</h3>
        <p style={{ color: '#78350f', margin: 0 }}>
          Epic 4.2 requires two database tables to store student application tracking and saved content.
          These tables use Row Level Security (RLS) to ensure students can only access their own data.
          Once applied, Epic 4.3 (Visa Tracker Portal) can be implemented.
        </p>
      </div>
    </div>
  );
}
