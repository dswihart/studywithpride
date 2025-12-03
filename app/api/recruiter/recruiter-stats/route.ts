/**
 * Recruiter Performance Stats API
 * Tracks recruiter performance metrics and team analytics
 * GET /api/recruiter/recruiter-stats - Get performance data
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

interface RecruiterPerformance {
  recruiter_id: string
  recruiter_name: string
  metrics: {
    total_leads_assigned: number
    leads_contacted: number
    leads_converted: number
    contact_rate: number
    conversion_rate: number
    avg_response_time_hours: number
    messages_sent_today: number
    messages_sent_week: number
    active_conversations: number
  }
  ranking: {
    overall: number
    by_conversions: number
    by_contact_rate: number
  }
  trends: {
    conversions_this_week: number
    conversions_last_week: number
    trend_direction: "up" | "down" | "stable"
  }
}

interface TeamMetrics {
  total_recruiters: number
  total_leads: number
  total_converted: number
  team_conversion_rate: number
  avg_leads_per_recruiter: number
  top_performer: string
  needs_attention: string[]
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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // day, week, month, quarter
    const recruiterId = searchParams.get("recruiter_id")

    const supabase = await createClient()

    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(now.getMonth() - 3)
        break
    }

    // Get all leads for the period
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*").not('contact_status', 'in', '(archived,archived_referral)')
      .gte("created_at", startDate.toISOString())

    if (leadsError) {
      console.error("[recruiter-stats] Error fetching leads:", leadsError)
      return NextResponse.json(
        { success: false, error: "Failed to fetch data" },
        { status: 500 }
      )
    }

    // Get WhatsApp messages for activity tracking
    const { data: messages, error: messagesError } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .gte("created_at", startDate.toISOString())

    // Calculate overall metrics
    const totalLeads = leads?.length || 0
    const contactedLeads = leads?.filter((l) => l.contact_status !== "not_contacted").length || 0
    const convertedLeads = leads?.filter((l) => l.contact_status === "converted").length || 0
    const qualifiedLeads = leads?.filter((l) => l.contact_status === "qualified").length || 0
    const interestedLeads = leads?.filter((l) => l.contact_status === "interested").length || 0
    const referralLeads = leads?.filter((l) => l.contact_status === "referral").length || 0

    // Calculate funnel metrics
    const funnelMetrics = {
      new_to_contacted: totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0,
      contacted_to_interested:
        contactedLeads > 0 ? Math.round((interestedLeads / contactedLeads) * 100) : 0,
      interested_to_qualified:
        interestedLeads > 0 ? Math.round((qualifiedLeads / interestedLeads) * 100) : 0,
      qualified_to_converted:
        qualifiedLeads > 0 ? Math.round((convertedLeads / qualifiedLeads) * 100) : 0,
      overall_conversion: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      referral_count: referralLeads,
      referral_to_contacted: referralLeads > 0 ? Math.round((contactedLeads / referralLeads) * 100) : 0,
    }

    // Calculate daily activity for the period
    const dailyActivity: Record<string, { contacts: number; conversions: number; messages: number }> = {}

    for (const lead of leads || []) {
      const date = new Date(lead.created_at).toISOString().split("T")[0]
      if (!dailyActivity[date]) {
        dailyActivity[date] = { contacts: 0, conversions: 0, messages: 0 }
      }
      if (lead.contact_status !== "not_contacted") {
        dailyActivity[date].contacts++
      }
      if (lead.contact_status === "converted") {
        dailyActivity[date].conversions++
      }
    }

    for (const msg of messages || []) {
      const date = new Date(msg.created_at).toISOString().split("T")[0]
      if (!dailyActivity[date]) {
        dailyActivity[date] = { contacts: 0, conversions: 0, messages: 0 }
      }
      dailyActivity[date].messages++
    }

    // Calculate performance benchmarks
    const benchmarks = {
      contact_rate_target: 80,
      conversion_rate_target: 15,
      response_time_target_hours: 2,
      messages_per_day_target: 20,
    }

    const currentPerformance = {
      contact_rate: totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0,
      conversion_rate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      avg_messages_per_day: Math.round((messages?.length || 0) / Math.max(1, Object.keys(dailyActivity).length)),
    }

    const performanceVsBenchmark = {
      contact_rate: {
        value: currentPerformance.contact_rate,
        target: benchmarks.contact_rate_target,
        status:
          currentPerformance.contact_rate >= benchmarks.contact_rate_target
            ? "on_target"
            : currentPerformance.contact_rate >= benchmarks.contact_rate_target * 0.8
              ? "near_target"
              : "below_target",
      },
      conversion_rate: {
        value: currentPerformance.conversion_rate,
        target: benchmarks.conversion_rate_target,
        status:
          currentPerformance.conversion_rate >= benchmarks.conversion_rate_target
            ? "on_target"
            : currentPerformance.conversion_rate >= benchmarks.conversion_rate_target * 0.8
              ? "near_target"
              : "below_target",
      },
      activity: {
        value: currentPerformance.avg_messages_per_day,
        target: benchmarks.messages_per_day_target,
        status:
          currentPerformance.avg_messages_per_day >= benchmarks.messages_per_day_target
            ? "on_target"
            : currentPerformance.avg_messages_per_day >= benchmarks.messages_per_day_target * 0.7
              ? "near_target"
              : "below_target",
      },
    }

    // Get leads by source for ROI tracking
    const leadsBySource: Record<string, { count: number; converted: number; conversion_rate: number }> = {}

    for (const lead of leads || []) {
      const source = lead.referral_source || lead.campaign || "Direct"
      if (!leadsBySource[source]) {
        leadsBySource[source] = { count: 0, converted: 0, conversion_rate: 0 }
      }
      leadsBySource[source].count++
      if (lead.contact_status === "converted") {
        leadsBySource[source].converted++
      }
    }

    // Calculate conversion rates per source
    for (const source of Object.keys(leadsBySource)) {
      const data = leadsBySource[source]
      data.conversion_rate = data.count > 0 ? Math.round((data.converted / data.count) * 100) : 0
    }

    // Sort sources by count
    const topSources = Object.entries(leadsBySource)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([source, data]) => ({ source, ...data }))

    // Calculate week-over-week trends
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const thisWeekLeads = leads?.filter((l) => new Date(l.created_at) >= oneWeekAgo).length || 0
    const lastWeekLeads =
      leads?.filter(
        (l) => new Date(l.created_at) >= twoWeeksAgo && new Date(l.created_at) < oneWeekAgo
      ).length || 0

    const thisWeekConverted =
      leads?.filter(
        (l) => new Date(l.created_at) >= oneWeekAgo && l.contact_status === "converted"
      ).length || 0
    const lastWeekConverted =
      leads?.filter(
        (l) =>
          new Date(l.created_at) >= twoWeeksAgo &&
          new Date(l.created_at) < oneWeekAgo &&
          l.contact_status === "converted"
      ).length || 0

    const trends = {
      leads: {
        this_week: thisWeekLeads,
        last_week: lastWeekLeads,
        change: lastWeekLeads > 0 ? Math.round(((thisWeekLeads - lastWeekLeads) / lastWeekLeads) * 100) : 0,
        direction: thisWeekLeads > lastWeekLeads ? "up" : thisWeekLeads < lastWeekLeads ? "down" : "stable",
      },
      conversions: {
        this_week: thisWeekConverted,
        last_week: lastWeekConverted,
        change:
          lastWeekConverted > 0
            ? Math.round(((thisWeekConverted - lastWeekConverted) / lastWeekConverted) * 100)
            : 0,
        direction:
          thisWeekConverted > lastWeekConverted
            ? "up"
            : thisWeekConverted < lastWeekConverted
              ? "down"
              : "stable",
      },
    }

    // Identify action items
    const actionItems: string[] = []

    if (currentPerformance.contact_rate < benchmarks.contact_rate_target * 0.7) {
      actionItems.push("Contact rate is significantly below target - prioritize outreach")
    }

    const staleLeads = leads?.filter((l) => {
      if (l.contact_status === "converted" || l.contact_status === "unqualified") return false
      const lastContact = l.last_contact_date ? new Date(l.last_contact_date) : new Date(l.created_at)
      const daysSince = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
      return daysSince > 7
    }).length || 0

    if (staleLeads > 10) {
      actionItems.push(`${staleLeads} leads haven't been contacted in 7+ days`)
    }

    const hotLeads = leads?.filter((l) => l.lead_quality === "hot" && l.contact_status !== "converted").length || 0
    if (hotLeads > 0) {
      actionItems.push(`${hotLeads} hot leads need immediate attention`)
    }

    if (trends.conversions.direction === "down" && trends.conversions.change < -20) {
      actionItems.push("Conversion rate dropped significantly - review follow-up strategy")
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          total_leads: totalLeads,
          contacted: contactedLeads,
          converted: convertedLeads,
          qualified: qualifiedLeads,
          interested: interestedLeads,
          messages_sent: messages?.length || 0,
        },
        funnel: funnelMetrics,
        performance: performanceVsBenchmark,
        daily_activity: dailyActivity,
        top_sources: topSources,
        trends,
        action_items: actionItems,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("[recruiter-stats] GET Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
