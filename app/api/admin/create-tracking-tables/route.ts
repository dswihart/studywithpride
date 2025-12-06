/**
 * One-time migration endpoint to create link tracking tables
 * POST /api/admin/create-tracking-tables
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  // Create admin client
  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: "public" },
    auth: { persistSession: false }
  })

  const results: string[] = []

  // Create lead_tracking_links table
  const { error: e1 } = await supabase.rpc("query", {
    query_text: `
      CREATE TABLE IF NOT EXISTS lead_tracking_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        token VARCHAR(64) UNIQUE NOT NULL,
        destination_url TEXT NOT NULL,
        label VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        created_by UUID REFERENCES auth.users(id),
        is_active BOOLEAN DEFAULT true
      )
    `
  })
  results.push(`lead_tracking_links: ${e1 ? e1.message : "OK"}`)

  // Create link_visits table  
  const { error: e2 } = await supabase.rpc("query", {
    query_text: `
      CREATE TABLE IF NOT EXISTS link_visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        link_id UUID NOT NULL REFERENCES lead_tracking_links(id) ON DELETE CASCADE,
        visited_at TIMESTAMPTZ DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT,
        referrer TEXT
      )
    `
  })
  results.push(`link_visits: ${e2 ? e2.message : "OK"}`)

  return NextResponse.json({ results })
}
