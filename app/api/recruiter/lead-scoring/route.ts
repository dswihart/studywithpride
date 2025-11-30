/**
 * Lead Scoring API
 * Calculates and updates lead scores based on various factors
 * POST /api/recruiter/lead-scoring - Calculate/update scores
 * GET /api/recruiter/lead-scoring - Get scoring rules
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

interface ScoringRule {
  id: string
  name: string
  category: "engagement" | "profile" | "behavior" | "timing"
  condition: string
  points: number
  is_active: boolean
}

interface LeadScoreBreakdown {
  lead_id: string
  total_score: number
  quality_tier: "High" | "Medium" | "Low" | "Very Low"
  breakdown: {
    category: string
    rule: string
    points: number
  }[]
  recommendations: string[]
}

// Default scoring rules - adjusted for better distribution
const scoringRules: ScoringRule[] = [
  // Engagement scores
  {
    id: "eng_responded",
    name: "Responded to message",
    category: "engagement",
    condition: "has_responded",
    points: 15,
    is_active: true,
  },
  {
    id: "eng_interested",
    name: "Marked as interested",
    category: "engagement",
    condition: "contact_status = interested",
    points: 20,
    is_active: true,
  },
  {
    id: "eng_qualified",
    name: "Marked as qualified",
    category: "engagement",
    condition: "contact_status = qualified",
    points: 25,
    is_active: true,
  },
  {
    id: "eng_recent_activity",
    name: "Active in last 7 days",
    category: "engagement",
    condition: "last_activity_days <= 7",
    points: 10,
    is_active: true,
  },

  // Profile completeness
  {
    id: "prof_email_valid",
    name: "Valid email",
    category: "profile",
    condition: "email_score >= 80",
    points: 10,
    is_active: true,
  },
  {
    id: "prof_phone_valid",
    name: "Valid phone number",
    category: "profile",
    condition: "phone_valid = true",
    points: 15,
    is_active: true,
  },
  {
    id: "prof_name_quality",
    name: "Quality name data",
    category: "profile",
    condition: "name_score >= 70",
    points: 10,
    is_active: true,
  },

  // Behavioral signals
  {
    id: "beh_timeline_urgent",
    name: "Urgent timeline (1-3 months)",
    category: "behavior",
    condition: "barcelona_timeline <= 3",
    points: 20,
    is_active: true,
  },
  {
    id: "beh_timeline_soon",
    name: "Near timeline (4-6 months)",
    category: "behavior",
    condition: "barcelona_timeline <= 6",
    points: 10,
    is_active: true,
  },
  {
    id: "beh_referral",
    name: "Referred lead",
    category: "behavior",
    condition: "referral_source IS NOT NULL",
    points: 10,
    is_active: true,
  },

  // Timing factors
  {
    id: "time_recency",
    name: "Recent lead (< 14 days)",
    category: "timing",
    condition: "created_days <= 14",
    points: 10,
    is_active: true,
  },
  {
    id: "time_stale",
    name: "Stale lead (> 30 days no contact)",
    category: "timing",
    condition: "last_contact_days > 30",
    points: -10,
    is_active: true,
  },
  {
    id: "time_very_stale",
    name: "Very stale lead (> 60 days no contact)",
    category: "timing",
    condition: "last_contact_days > 60",
    points: -15,
    is_active: true,
  },
]

function calculateLeadScore(lead: any): LeadScoreBreakdown {
  const breakdown: LeadScoreBreakdown["breakdown"] = []
  let totalScore = 0

  const now = new Date()
  const createdAt = new Date(lead.created_at)
  const lastContact = lead.last_contact_date ? new Date(lead.last_contact_date) : null
  const createdDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  const lastContactDays = lastContact
    ? Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
    : 999

  // Evaluate each active rule
  for (const rule of scoringRules.filter((r) => r.is_active)) {
    let applies = false

    switch (rule.id) {
      case "eng_responded":
        // Only give points for actual response, not just being contacted
        applies = ["interested", "qualified", "converted", "referral"].includes(lead.contact_status)
        break
      case "eng_interested":
        applies = lead.contact_status === "interested"
        break
      case "eng_qualified":
        applies = lead.contact_status === "qualified" || lead.contact_status === "converted"
        break
      case "eng_recent_activity":
        applies = lastContactDays <= 7 && lastContactDays !== 999
        break
      case "prof_email_valid":
        applies = (lead.email_score || 0) >= 80
        break
      case "prof_phone_valid":
        applies = lead.phone_valid === true
        break
      case "prof_name_quality":
        applies = (lead.name_score || 0) >= 70
        break
      case "beh_timeline_urgent":
        applies = lead.barcelona_timeline !== null && lead.barcelona_timeline <= 3
        break
      case "beh_timeline_soon":
        // Only apply if not already urgent (exclusive ranges)
        applies =
          lead.barcelona_timeline !== null &&
          lead.barcelona_timeline > 3 &&
          lead.barcelona_timeline <= 6
        break
      case "beh_referral":
        applies = lead.referral_source !== null && lead.referral_source !== ""
        break
      case "time_recency":
        applies = createdDays <= 14
        break
      case "time_stale":
        // Only apply stale penalty if not contacted and not very stale
        applies = lastContactDays > 30 && lastContactDays <= 60 && lead.contact_status === "not_contacted"
        break
      case "time_very_stale":
        applies = lastContactDays > 60 && lead.contact_status === "not_contacted"
        break
    }

    if (applies) {
      breakdown.push({
        category: rule.category,
        rule: rule.name,
        points: rule.points,
      })
      totalScore += rule.points
    }
  }

  // Ensure score is within bounds (0-100)
  totalScore = Math.max(0, Math.min(100, totalScore))

  // Determine quality tier - Using High/Medium/Low/Very Low to match UI
  // Adjusted thresholds for better distribution based on actual data
  let qualityTier: "High" | "Medium" | "Low" | "Very Low"
  if (totalScore >= 50) {
    qualityTier = "High"
  } else if (totalScore >= 25) {
    qualityTier = "Medium"
  } else if (totalScore >= 15) {
    qualityTier = "Low"
  } else {
    qualityTier = "Very Low"
  }

  // Generate recommendations
  const recommendations: string[] = []

  if (!lead.phone_valid) {
    recommendations.push("Verify phone number to improve contact rate")
  }
  if (lead.contact_status === "not_contacted") {
    recommendations.push("Make initial contact - lead hasn't been reached")
  }
  if (lastContactDays > 14 && lastContactDays !== 999 && lead.contact_status !== "converted") {
    recommendations.push("Follow up - no contact in " + lastContactDays + " days")
  }
  if (lead.barcelona_timeline && lead.barcelona_timeline <= 3) {
    recommendations.push("PRIORITY: Urgent timeline - prioritize conversion")
  }
  if (qualityTier === "Very Low" && lead.contact_status === "contacted") {
    recommendations.push("Consider re-engagement campaign")
  }
  if (qualityTier === "Low" && !lead.referral_source) {
    recommendations.push("Ask for referrals to improve lead quality")
  }

  return {
    lead_id: lead.id,
    total_score: Math.round(totalScore),
    quality_tier: qualityTier,
    breakdown,
    recommendations,
  }
}

export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")

    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        rules: scoringRules,
        tiers: {
          High: { min: 35, max: 100, description: "High priority - ready to convert" },
          Medium: { min: 20, max: 34, description: "Engaged - needs nurturing" },
          Low: { min: 10, max: 19, description: "Some potential - needs more effort" },
          "Very Low": { min: 0, max: 9, description: "Cold leads - consider re-activation" },
        },
      },
    })
  } catch (error: any) {
    console.error("[lead-scoring] GET Error:", error)
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
    const { action, leadIds } = body

    const supabase = await createClient()

    switch (action) {
      case "calculate": {
        // Calculate scores for specific leads or all leads
        let query = supabase.from("leads").select("*")

        if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
          query = query.in("id", leadIds)
        } else {
          // Limit to recent/active leads for bulk calculation
          query = query.limit(500)
        }

        const { data: leads, error } = await query

        if (error) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch leads" },
            { status: 500 }
          )
        }

        const scores: LeadScoreBreakdown[] = (leads || []).map(calculateLeadScore)

        // Group by tier for summary
        const summary = {
          High: scores.filter((s) => s.quality_tier === "High").length,
          Medium: scores.filter((s) => s.quality_tier === "Medium").length,
          Low: scores.filter((s) => s.quality_tier === "Low").length,
          "Very Low": scores.filter((s) => s.quality_tier === "Very Low").length,
          average_score: scores.length > 0 ? Math.round(
            scores.reduce((acc, s) => acc + s.total_score, 0) / scores.length
          ) : 0,
        }

        return NextResponse.json({
          success: true,
          data: {
            scores,
            summary,
            calculated_at: new Date().toISOString(),
          },
        })
      }

      case "update_scores": {
        // Update lead scores in database
        if (!leadIds || !Array.isArray(leadIds)) {
          return NextResponse.json(
            { success: false, error: "Missing leadIds" },
            { status: 400 }
          )
        }

        const { data: leads, error: fetchError } = await supabase
          .from("leads")
          .select("*")
          .in("id", leadIds)

        if (fetchError || !leads) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch leads" },
            { status: 500 }
          )
        }

        const updates: { id: string; lead_score: number; lead_quality: string }[] = []

        for (const lead of leads) {
          const scoreData = calculateLeadScore(lead)
          updates.push({
            id: lead.id,
            lead_score: scoreData.total_score,
            lead_quality: scoreData.quality_tier,
          })
        }

        // Batch update
        let successCount = 0
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from("leads")
            .update({
              lead_score: update.lead_score,
              lead_quality: update.lead_quality,
            })
            .eq("id", update.id)

          if (!updateError) successCount++
        }

        return NextResponse.json({
          success: true,
          data: {
            updated: successCount,
            total: updates.length,
          },
        })
      }

      case "recalculate_all": {
        // Recalculate scores for all leads
        const { data: leads, error: fetchError } = await supabase
          .from("leads")
          .select("*")

        if (fetchError || !leads) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch leads" },
            { status: 500 }
          )
        }

        let successCount = 0
        for (const lead of leads) {
          const scoreData = calculateLeadScore(lead)
          const { error: updateError } = await supabase
            .from("leads")
            .update({
              lead_score: scoreData.total_score,
              lead_quality: scoreData.quality_tier,
            })
            .eq("id", lead.id)

          if (!updateError) successCount++
        }

        return NextResponse.json({
          success: true,
          data: {
            updated: successCount,
            total: leads.length,
          },
        })
      }

      case "get_recommendations": {
        // Get prioritized recommendations for leads
        if (!leadIds || !Array.isArray(leadIds)) {
          return NextResponse.json(
            { success: false, error: "Missing leadIds" },
            { status: 400 }
          )
        }

        const { data: leads, error } = await supabase
          .from("leads")
          .select("*")
          .in("id", leadIds)

        if (error || !leads) {
          return NextResponse.json(
            { success: false, error: "Failed to fetch leads" },
            { status: 500 }
          )
        }

        const recommendations = leads.map((lead) => {
          const scoreData = calculateLeadScore(lead)
          return {
            lead_id: lead.id,
            prospect_name: lead.prospect_name,
            score: scoreData.total_score,
            tier: scoreData.quality_tier,
            recommendations: scoreData.recommendations,
            priority:
              scoreData.quality_tier === "High"
                ? 1
                : scoreData.quality_tier === "Medium"
                  ? 2
                  : scoreData.quality_tier === "Low"
                    ? 3
                    : 4,
          }
        })

        // Sort by priority then score
        recommendations.sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority
          return b.score - a.score
        })

        return NextResponse.json({
          success: true,
          data: { recommendations },
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error("[lead-scoring] POST Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
