import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET /api/saved - List all saved content
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from("saved_content")
    .select("*")
    .order("saved_at", { ascending: false })
  
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true, data })
}

// POST /api/saved - Save new content
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  
  const body = await request.json()
  const { data, error } = await supabase
    .from("saved_content")
    .insert({ ...body, user_id: user.id })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  
  const responseTime = Date.now() - startTime
  console.log(`Content saved in ${responseTime}ms`)
  
  return NextResponse.json({ success: true, data }, { status: 201 })
}

// DELETE /api/saved - Remove saved content
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ success: false, error: "ID required" }, { status: 400 })
  }
  
  const { error } = await supabase
    .from("saved_content")
    .delete()
    .eq("id", id)
  
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true, message: "Content removed" })
}
