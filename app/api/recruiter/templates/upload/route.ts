/**
 * Template File Upload API
 * POST - Upload file to Supabase Storage
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireRole } from "@/lib/auth/role-guard"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole("admin")
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: "Only admins can upload files" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Allowed: PDF, DOCX, JPG, PNG, GIF" },
        { status: 400 }
      )
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large. Max 10MB" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${timestamp}_${sanitizedName}`

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("templates")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("[templates/upload] Storage error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to upload file" },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("templates")
      .getPublicUrl(fileName)

    // Determine file type for DB
    let fileType = "pdf"
    if (file.type.includes("word")) fileType = "docx"
    else if (file.type.includes("image")) fileType = "image"

    return NextResponse.json({
      success: true,
      data: {
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: fileType,
        file_name: file.name,
      },
    })
  } catch (error) {
    console.error("[templates/upload] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
