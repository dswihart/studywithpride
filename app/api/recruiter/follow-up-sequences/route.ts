/**
 * Automated Follow-up Sequences API
 * Manages automated follow-up campaigns for leads
 * POST /api/recruiter/follow-up-sequences - Create/manage sequences
 * GET /api/recruiter/follow-up-sequences - List sequences
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

interface FollowUpStep {
  delay_days: number
  message_template: string
  channel: "whatsapp" | "email" | "sms"
  condition?: {
    if_status_not?: string[]
    if_no_response_days?: number
  }
}

interface FollowUpSequence {
  id?: string
  name: string
  description?: string
  steps: FollowUpStep[]
  target_statuses: string[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// In-memory storage (would be database in production)
const sequences: Map<string, FollowUpSequence> = new Map()

// Initialize with default sequences
const defaultSequences: FollowUpSequence[] = [
  {
    id: "seq_new_lead",
    name: "New Lead Nurture",
    description: "Automatic follow-up for new leads",
    target_statuses: ["not_contacted"],
    is_active: true,
    steps: [
      {
        delay_days: 0,
        message_template: "welcome_message",
        channel: "whatsapp",
      },
      {
        delay_days: 3,
        message_template: "program_info",
        channel: "whatsapp",
        condition: { if_status_not: ["contacted", "interested", "qualified"] },
      },
      {
        delay_days: 7,
        message_template: "deadline_reminder",
        channel: "whatsapp",
        condition: { if_no_response_days: 5 },
      },
    ],
  },
  {
    id: "seq_interested",
    name: "Interested Lead Conversion",
    description: "Convert interested leads to qualified",
    target_statuses: ["interested"],
    is_active: true,
    steps: [
      {
        delay_days: 1,
        message_template: "application_help",
        channel: "whatsapp",
      },
      {
        delay_days: 5,
        message_template: "scholarship_info",
        channel: "whatsapp",
        condition: { if_status_not: ["qualified", "converted"] },
      },
      {
        delay_days: 10,
        message_template: "final_reminder",
        channel: "whatsapp",
        condition: { if_no_response_days: 7 },
      },
    ],
  },
  {
    id: "seq_cold_reactivation",
    name: "Cold Lead Reactivation",
    description: "Re-engage leads that went cold",
    target_statuses: ["contacted"],
    is_active: false,
    steps: [
      {
        delay_days: 14,
        message_template: "check_in",
        channel: "whatsapp",
        condition: { if_no_response_days: 14 },
      },
      {
        delay_days: 30,
        message_template: "new_intake_announcement",
        channel: "whatsapp",
        condition: { if_status_not: ["interested", "qualified", "converted", "unqualified"] },
      },
    ],
  },
]

// Initialize default sequences
defaultSequences.forEach((seq) => {
  if (seq.id) sequences.set(seq.id, seq)
})

export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")

    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    let result = Array.from(sequences.values())

    if (activeOnly) {
      result = result.filter((seq) => seq.is_active)
    }

    return NextResponse.json({
      success: true,
      data: {
        sequences: result,
        total: result.length,
      },
    })
  } catch (error: any) {
    console.error("[follow-up-sequences] GET Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")

    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, sequence, sequenceId, leadIds } = body

    switch (action) {
      case "create": {
        if (!sequence || !sequence.name || !sequence.steps) {
          return NextResponse.json(
            { success: false, error: "Missing required fields" },
            { status: 400 }
          )
        }

        const newId = `seq_${Date.now()}`
        const newSequence: FollowUpSequence = {
          ...sequence,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        sequences.set(newId, newSequence)

        return NextResponse.json({
          success: true,
          data: { sequence: newSequence },
        })
      }

      case "update": {
        if (!sequenceId || !sequences.has(sequenceId)) {
          return NextResponse.json(
            { success: false, error: "Sequence not found" },
            { status: 404 }
          )
        }

        const existing = sequences.get(sequenceId)!
        const updated: FollowUpSequence = {
          ...existing,
          ...sequence,
          id: sequenceId,
          updated_at: new Date().toISOString(),
        }

        sequences.set(sequenceId, updated)

        return NextResponse.json({
          success: true,
          data: { sequence: updated },
        })
      }

      case "toggle": {
        if (!sequenceId || !sequences.has(sequenceId)) {
          return NextResponse.json(
            { success: false, error: "Sequence not found" },
            { status: 404 }
          )
        }

        const seq = sequences.get(sequenceId)!
        seq.is_active = !seq.is_active
        seq.updated_at = new Date().toISOString()
        sequences.set(sequenceId, seq)

        return NextResponse.json({
          success: true,
          data: { sequence: seq },
        })
      }

      case "delete": {
        if (!sequenceId || !sequences.has(sequenceId)) {
          return NextResponse.json(
            { success: false, error: "Sequence not found" },
            { status: 404 }
          )
        }

        sequences.delete(sequenceId)

        return NextResponse.json({
          success: true,
          message: "Sequence deleted",
        })
      }

      case "enroll": {
        // Enroll specific leads in a sequence
        if (!sequenceId || !leadIds || !Array.isArray(leadIds)) {
          return NextResponse.json(
            { success: false, error: "Missing sequenceId or leadIds" },
            { status: 400 }
          )
        }

        const seq = sequences.get(sequenceId)
        if (!seq) {
          return NextResponse.json(
            { success: false, error: "Sequence not found" },
            { status: 404 }
          )
        }

        // In production, this would create enrollment records in the database
        // and schedule the follow-up messages

        return NextResponse.json({
          success: true,
          data: {
            enrolled: leadIds.length,
            sequence: seq.name,
            firstStepScheduled: new Date(
              Date.now() + seq.steps[0].delay_days * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        })
      }

      case "execute_step": {
        // Execute a specific step for leads (would be called by cron job)
        const supabase = await createClient()

        // Get leads that need follow-up based on sequence criteria
        const seq = sequences.get(sequenceId)
        if (!seq || !seq.is_active) {
          return NextResponse.json({
            success: true,
            data: { processed: 0, message: "Sequence inactive or not found" },
          })
        }

        // This would be implemented with actual database queries
        // to find leads matching the sequence criteria

        return NextResponse.json({
          success: true,
          data: {
            processed: 0,
            message: "Step execution placeholder - implement with cron",
          },
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error("[follow-up-sequences] POST Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
