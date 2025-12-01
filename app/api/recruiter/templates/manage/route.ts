/**
 * Template Management API
 * PUT - Update template
 * DELETE - Delete template
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(request: NextRequest) {
  try {
    const roleCheck = await requireRole("admin")
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: "Only admins can update templates" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, type, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      )
    }

    const table = type === "quick_message" ? "quick_messages" : "templates"
    
    const { data, error } = await supabaseAdmin
      .from(table)
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[templates/manage] Update error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to update" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[templates/manage] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const roleCheck = await requireRole("admin")
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: "Only admins can delete templates" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type") // 'template' or 'quick_message'

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      )
    }

    const table = type === "quick_message" ? "quick_messages" : "templates"

    // Soft delete by setting is_active = false
    const { error } = await supabaseAdmin
      .from(table)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("[templates/manage] Delete error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to delete" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" })
  } catch (error) {
    console.error("[templates/manage] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
