-- Migration: Link Tracking System
-- Run this in Supabase Dashboard > SQL Editor

-- Create lead_tracking_links table
CREATE TABLE IF NOT EXISTS lead_tracking_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  destination_url TEXT NOT NULL,
  label VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID,
  is_active BOOLEAN DEFAULT true
);

-- Create link_visits table
CREATE TABLE IF NOT EXISTS link_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES lead_tracking_links(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracking_links_lead_id ON lead_tracking_links(lead_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_token ON lead_tracking_links(token);
CREATE INDEX IF NOT EXISTS idx_link_visits_link_id ON link_visits(link_id);
CREATE INDEX IF NOT EXISTS idx_link_visits_visited_at ON link_visits(visited_at DESC);
