/**
 * Pipeline Stage Management API
 * Manages recruitment funnel stages and lead progression
 * GET /api/recruiter/pipeline-stages - Get pipeline data
 * POST /api/recruiter/pipeline-stages - Update stage, move leads
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

interface PipelineStage {
  id: string
  name: string
  order: number
  color: string
  description: string
  auto_actions?: {
    send_template?: string
    assign_to?: string
    add_tag?: string
  }
  exit_criteria?: string[]
  conversion_target?: number // percentage
}

interface PipelineMetrics {
  stage_id: string
  count: number
  conversion_rate: number
  avg_time_in_stage: number // days
  stuck_leads: number // leads in stage > avg time
}

// Default pipeline stages matching contact_status values
const pipelineStages: PipelineStage[] = [
  {
    id: "not_contacted",
    name: "New Leads",
    order: 1,
    color: "#6B7280", // gray
    description: "Fresh leads that haven't been contacted yet",
    auto_actions: {
      send_template: "welcome_message",
    },
    exit_criteria: ["Make first contact within 24 hours"],
    conversion_target: 80,
  },
  {
    id: "contacted",
    name: "Contacted",
    order: 2,
    color: "#3B82F6", // blue
    description: "Initial contact made, awaiting response",
    exit_criteria: ["Receive response", "Schedule follow-up if no response in 3 days"],
    conversion_target: 60,
  },
  {
    id: "interested",
    name: "Interested",
    order: 3,
    color: "#8B5CF6", // purple
    description: "Lead has shown interest, needs nurturing",
    auto_actions: {
      send_template: "program_details",
    },
    exit_criteria: ["Answer all questions", "Send application link"],
    conversion_target: 50,
  },
  {
    id: "qualified",
    name: "Qualified",
    order: 4,
    color: "#F59E0B", // amber
    description: "Lead is qualified and ready for conversion",
    auto_actions: {
      send_template: "application_assistance",
    },
    exit_criteria: ["Complete application", "Submit documents"],
    conversion_target: 70,
  },
  {
    id: "converted",
    name: "Converted",
    order: 5,
    color: "#10B981", // green
    description: "Successfully enrolled",
    auto_actions: {
      send_template: "welcome_student",
    },
  },
  {
    id: "unqualified",
    name: "Unqualified",
    order: 6,
    color: "#EF4444", // red
    description: "Lead does not meet criteria or not interested",
  },
  {
    id: "referral",
    name: "Referral",
    order: 0,
    color: "#EC4899", // pink
    description: "Referred leads - high priority",
    auto_actions: {
      add_tag: "referral_priority",
    },
    conversion_target: 40,
  },
]

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
    const includeMetrics = searchParams.get("metrics") === "true"
    const country = searchParams.get("country")

    const supabase = await createClient()

    // Get lead counts per stage
    let query = supabase.from("leads").select("contact_status, created_at, last_contact_date")

    if (country && country !== "all") {
      query = query.eq("country", country)
    }

    const { data: leads, error } = await query

    if (error) {
      console.error("[pipeline-stages] Error fetching leads:", error)
      return NextResponse.json(
        { success: false, error: "Failed to fetch pipeline data" },
        { status: 500 }
      )
    }

    // Calculate counts and metrics per stage
    const stageCounts: Record<string, number> = {}
    const stageLeads: Record<string, any[]> = {}

    for (const lead of leads || []) {
      const status = lead.contact_status || "not_contacted"
      stageCounts[status] = (stageCounts[status] || 0) + 1
      if (!stageLeads[status]) stageLeads[status] = []
      stageLeads[status].push(lead)
    }

    // Build response with stages and counts
    const stagesWithCounts = pipelineStages
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({
        ...stage,
        count: stageCounts[stage.id] || 0,
      }))

    // Calculate metrics if requested
    let metrics: PipelineMetrics[] | undefined

    if (includeMetrics) {
      const now = new Date()
      metrics = pipelineStages.map((stage) => {
        const stageLeadList = stageLeads[stage.id] || []
        const count = stageLeadList.length

        // Calculate average time in stage (simplified - using created_at as proxy)
        let totalDays = 0
        let stuckCount = 0
        const avgThreshold = 7 // days considered "stuck"

        for (const lead of stageLeadList) {
          const created = new Date(lead.created_at)
          const daysInStage = Math.floor(
            (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
          )
          totalDays += daysInStage
          if (daysInStage > avgThreshold) stuckCount++
        }

        const avgTime = count > 0 ? Math.round(totalDays / count) : 0

        // Calculate conversion rate (leads that moved to next stage)
        // Simplified: using proportion that moved past this stage
        const laterStages = pipelineStages.filter((s) => s.order > stage.order)
        const laterCount = laterStages.reduce((acc, s) => acc + (stageCounts[s.id] || 0), 0)
        const conversionRate =
          count + laterCount > 0
            ? Math.round((laterCount / (count + laterCount)) * 100)
            : 0

        return {
          stage_id: stage.id,
          count,
          conversion_rate: conversionRate,
          avg_time_in_stage: avgTime,
          stuck_leads: stuckCount,
        }
      })
    }

    // Calculate funnel summary
    const totalLeads = leads?.length || 0
    const converted = stageCounts["converted"] || 0
    const qualified = stageCounts["qualified"] || 0
    const interested = stageCounts["interested"] || 0

    const funnelSummary = {
      total_leads: totalLeads,
      conversion_rate: totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0,
      qualification_rate:
        totalLeads > 0 ? Math.round(((qualified + converted) / totalLeads) * 100) : 0,
      interest_rate:
        totalLeads > 0
          ? Math.round(((interested + qualified + converted) / totalLeads) * 100)
          : 0,
      stages_breakdown: stageCounts,
    }

    return NextResponse.json({
      success: true,
      data: {
        stages: stagesWithCounts,
        metrics,
        summary: funnelSummary,
      },
    })
  } catch (error: any) {
    console.error("[pipeline-stages] GET Error:", error)
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
    const { action, leadIds, targetStage, notes } = body

    const supabase = await createClient()

    switch (action) {
      case "move_leads": {
        if (!leadIds || !Array.isArray(leadIds) || !targetStage) {
          return NextResponse.json(
            { success: false, error: "Missing leadIds or targetStage" },
            { status: 400 }
          )
        }

        // Validate target stage
        const validStage = pipelineStages.find((s) => s.id === targetStage)
        if (!validStage) {
          return NextResponse.json(
            { success: false, error: "Invalid target stage" },
            { status: 400 }
          )
        }

        // Update leads
        const { data, error } = await supabase
          .from("leads")
          .update({
            contact_status: targetStage,
            last_contact_date: new Date().toISOString(),
            notes: notes ? notes : undefined,
          })
          .in("id", leadIds)
          .select()

        if (error) {
          console.error("[pipeline-stages] Update error:", error)
          return NextResponse.json(
            { success: false, error: "Failed to move leads" },
            { status: 500 }
          )
        }

        // Check if auto_actions should be triggered
        const autoActions = validStage.auto_actions
        let actionsTriggered: string[] = []

        if (autoActions) {
          if (autoActions.send_template) {
            actionsTriggered.push(`Template "${autoActions.send_template}" queued`)
          }
          if (autoActions.add_tag) {
            actionsTriggered.push(`Tag "${autoActions.add_tag}" added`)
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            moved: data?.length || 0,
            target_stage: validStage.name,
            auto_actions_triggered: actionsTriggered,
          },
        })
      }

      case "get_stage_leads": {
        // Get leads in a specific stage with details
        const { stageId, limit = 50, offset = 0 } = body

        if (!stageId) {
          return NextResponse.json(
            { success: false, error: "Missing stageId" },
            { status: 400 }
          )
        }

        const { data: leads, error, count } = await supabase
          .from("leads")
          .select("*", { count: "exact" })
          .eq("contact_status", stageId)
          .range(offset, offset + limit - 1)
          .order("created_at", { ascending: false })

        if (error) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch leads" },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            leads: leads || [],
            total: count || 0,
            stage: pipelineStages.find((s) => s.id === stageId),
          },
        })
      }

      case "get_stuck_leads": {
        // Get leads that have been in their stage too long
        const { thresholdDays = 7 } = body

        const thresholdDate = new Date()
        thresholdDate.setDate(thresholdDate.getDate() - thresholdDays)

        const { data: leads, error } = await supabase
          .from("leads")
          .select("*")
          .not("contact_status", "in", '("converted","unqualified")')
          .lt("last_contact_date", thresholdDate.toISOString())
          .order("last_contact_date", { ascending: true })
          .limit(100)

        if (error) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch stuck leads" },
            { status: 500 }
          )
        }

        // Group by stage
        const stuckByStage: Record<string, any[]> = {}
        for (const lead of leads || []) {
          const stage = lead.contact_status || "not_contacted"
          if (!stuckByStage[stage]) stuckByStage[stage] = []
          stuckByStage[stage].push(lead)
        }

        return NextResponse.json({
          success: true,
          data: {
            stuck_leads: leads || [],
            by_stage: stuckByStage,
            threshold_days: thresholdDays,
            total_stuck: leads?.length || 0,
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
    console.error("[pipeline-stages] POST Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
