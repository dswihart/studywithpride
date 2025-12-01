/**
 * Templates Library API
 * GET - Fetch all templates and categories
 * POST - Create new template (admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category_id")
    const type = searchParams.get("type") // 'templates', 'quick_messages', 'categories', 'all'

    // Fetch categories
    const { data: categories } = await supabaseAdmin
      .from("template_categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order")

    // Fetch templates
    let templatesQuery = supabaseAdmin
      .from("templates")
      .select("*, template_categories(name, icon)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (categoryId) {
      templatesQuery = templatesQuery.eq("category_id", categoryId)
    }

    const { data: templates } = await templatesQuery

    // Fetch quick messages
    let messagesQuery = supabaseAdmin
      .from("quick_messages")
      .select("*, template_categories(name, icon)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (categoryId) {
      messagesQuery = messagesQuery.eq("category_id", categoryId)
    }

    const { data: quickMessages } = await messagesQuery

    return NextResponse.json({
      success: true,
      data: {
        categories: categories || [],
        templates: templates || [],
        quickMessages: quickMessages || [],
      },
    })
  } catch (error) {
    console.error("[templates] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole("admin")
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: "Only admins can create templates" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      type, // 'template' or 'quick_message'
      category_id,
      name,
      title,
      description,
      file_type,
      file_url,
      file_size,
      content,
      version,
      visibility,
    } = body

    if (type === "quick_message") {
      const { data, error } = await supabaseAdmin
        .from("quick_messages")
        .insert({
          category_id,
          title: title || name,
          content,
          created_by: roleCheck.user?.id,
        })
        .select()
        .single()

      if (error) {
        console.error("[templates] Insert quick message error:", error)
        return NextResponse.json(
          { success: false, error: "Failed to create quick message" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    } else {
      // Create template
      if (!name || !file_type) {
        return NextResponse.json(
          { success: false, error: "Name and file_type are required" },
          { status: 400 }
        )
      }

      const { data, error } = await supabaseAdmin
        .from("templates")
        .insert({
          category_id,
          name,
          description,
          file_type,
          file_url,
          file_size,
          content,
          version: version || "1.0",
          visibility: visibility || "all",
          created_by: roleCheck.user?.id,
        })
        .select()
        .single()

      if (error) {
        console.error("[templates] Insert template error:", error)
        return NextResponse.json(
          { success: false, error: "Failed to create template" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, data })
    }
  } catch (error) {
    console.error("[templates] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
