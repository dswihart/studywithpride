import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET /api/applications - List all applications for current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from("application_states")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true, data })
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  
  const body = await request.json()
  const { data, error } = await supabase
    .from("application_states")
    .insert({ ...body, user_id: user.id })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  
  const responseTime = Date.now() - startTime
  console.log(`Application created in ${responseTime}ms`)
  
  return NextResponse.json({ success: true, data }, { status: 201 })
}
