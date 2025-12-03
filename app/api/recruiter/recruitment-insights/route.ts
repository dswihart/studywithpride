/**
 * Recruitment Insights API
 * Provides analytics on recruitment success by country, contact method, and readiness
 * GET /api/recruiter/recruitment-insights
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

interface CountryInsight {
  country: string
  total_leads: number
  contacted: number
  interested: number
  qualified: number
  converted: number
  contact_rate: number
  interest_rate: number
  conversion_rate: number
  avg_lead_score: number
}

interface ContactMethodInsight {
  method: string
  total_contacts: number
  leads_interested: number
  leads_converted: number
  success_rate: number
  conversion_rate: number
}

interface OutcomeInsight {
  outcome: string
  count: number
  led_to_interested: number
  led_to_converted: number
  success_rate: number
}

interface SourceInsight {
  source: string
  total_leads: number
  converted: number
  conversion_rate: number
  avg_score: number
}

interface ReadinessInsight {
  field: string
  label: string
  total_assessed: number
  positive_count: number
  positive_rate: number
  converted_with_positive: number
  conversion_rate_with_positive: number
  converted_with_negative: number
  conversion_rate_with_negative: number
}

interface IntakeInsight {
  intake: string
  total_leads: number
  interested: number
  qualified: number
  converted: number
  conversion_rate: number
  ready_to_proceed: number
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
    const period = searchParams.get("period") || "all"

    const supabase = await createClient()

    // Calculate date range
    let startDate: Date | null = null
    const now = new Date()

    if (period !== "all") {
      startDate = new Date()
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
    }

    // Fetch all leads
    let leadsQuery = supabase.from("leads").select("*").not('contact_status', 'in', '(archived,archived_referral)')
    if (startDate) {
      leadsQuery = leadsQuery.gte("created_at", startDate.toISOString())
    }
    const { data: leads, error: leadsError } = await leadsQuery

    if (leadsError) {
      console.error("[recruitment-insights] Leads error:", leadsError)
      return NextResponse.json({ success: false, error: "Failed to fetch leads" }, { status: 500 })
    }

    // Fetch contact history with readiness data
    let contactQuery = supabase.from("contact_history").select("*")
    if (startDate) {
      contactQuery = contactQuery.gte("contacted_at", startDate.toISOString())
    }
    const { data: contactHistory, error: contactError } = await contactQuery

    if (contactError) {
      console.error("[recruitment-insights] Contact history error:", contactError)
    }

    // Create a map of lead_id to current status
    const leadStatusMap = new Map<string, string>()
    for (const lead of leads || []) {
      leadStatusMap.set(lead.id, lead.contact_status)
    }

    // ==========================================
    // 1. COUNTRY INSIGHTS
    // ==========================================
    const countryMap = new Map<string, CountryInsight>()

    for (const lead of leads || []) {
      const country = lead.country || "Unknown"

      if (!countryMap.has(country)) {
        countryMap.set(country, {
          country,
          total_leads: 0,
          contacted: 0,
          interested: 0,
          qualified: 0,
          converted: 0,
          contact_rate: 0,
          interest_rate: 0,
          conversion_rate: 0,
          avg_lead_score: 0,
        })
      }

      const stats = countryMap.get(country)!
      stats.total_leads++

      if (lead.contact_status !== "not_contacted" && lead.contact_status !== "referral") {
        stats.contacted++
      }
      if (lead.contact_status === "interested") {
        stats.interested++
      }
      if (lead.contact_status === "qualified") {
        stats.qualified++
      }
      if (lead.contact_status === "converted") {
        stats.converted++
      }
      if (lead.lead_score) {
        stats.avg_lead_score += lead.lead_score
      }
    }

    const countryInsights: CountryInsight[] = Array.from(countryMap.values())
      .map(stats => ({
        ...stats,
        contact_rate: stats.total_leads > 0 ? Math.round((stats.contacted / stats.total_leads) * 100) : 0,
        interest_rate: stats.contacted > 0 ? Math.round((stats.interested / stats.contacted) * 100) : 0,
        conversion_rate: stats.total_leads > 0 ? Math.round((stats.converted / stats.total_leads) * 100) : 0,
        avg_lead_score: stats.total_leads > 0 ? Math.round(stats.avg_lead_score / stats.total_leads) : 0,
      }))
      .sort((a, b) => b.total_leads - a.total_leads)

    // ==========================================
    // 2. CONTACT METHOD INSIGHTS
    // ==========================================
    const methodMap = new Map<string, {
      total: number
      lead_ids: Set<string>
      interested_leads: Set<string>
      converted_leads: Set<string>
    }>()

    for (const contact of contactHistory || []) {
      const method = contact.contact_type || "unknown"

      if (!methodMap.has(method)) {
        methodMap.set(method, {
          total: 0,
          lead_ids: new Set(),
          interested_leads: new Set(),
          converted_leads: new Set(),
        })
      }

      const stats = methodMap.get(method)!
      stats.total++
      stats.lead_ids.add(contact.lead_id)

      const leadStatus = leadStatusMap.get(contact.lead_id)
      if (leadStatus === "interested" || leadStatus === "qualified" || leadStatus === "converted") {
        stats.interested_leads.add(contact.lead_id)
      }
      if (leadStatus === "converted") {
        stats.converted_leads.add(contact.lead_id)
      }
    }

    const contactMethodInsights: ContactMethodInsight[] = Array.from(methodMap.entries())
      .map(([method, stats]) => ({
        method: formatMethodName(method),
        total_contacts: stats.total,
        leads_interested: stats.interested_leads.size,
        leads_converted: stats.converted_leads.size,
        success_rate: stats.lead_ids.size > 0 ? Math.round((stats.interested_leads.size / stats.lead_ids.size) * 100) : 0,
        conversion_rate: stats.lead_ids.size > 0 ? Math.round((stats.converted_leads.size / stats.lead_ids.size) * 100) : 0,
      }))
      .sort((a, b) => b.total_contacts - a.total_contacts)

    // ==========================================
    // 3. OUTCOME INSIGHTS
    // ==========================================
    const outcomeMap = new Map<string, {
      count: number
      lead_ids: Set<string>
      interested_leads: Set<string>
      converted_leads: Set<string>
    }>()

    for (const contact of contactHistory || []) {
      const outcome = contact.outcome || "No outcome recorded"

      if (!outcomeMap.has(outcome)) {
        outcomeMap.set(outcome, {
          count: 0,
          lead_ids: new Set(),
          interested_leads: new Set(),
          converted_leads: new Set(),
        })
      }

      const stats = outcomeMap.get(outcome)!
      stats.count++
      stats.lead_ids.add(contact.lead_id)

      const leadStatus = leadStatusMap.get(contact.lead_id)
      if (leadStatus === "interested" || leadStatus === "qualified" || leadStatus === "converted") {
        stats.interested_leads.add(contact.lead_id)
      }
      if (leadStatus === "converted") {
        stats.converted_leads.add(contact.lead_id)
      }
    }

    const outcomeInsights: OutcomeInsight[] = Array.from(outcomeMap.entries())
      .map(([outcome, stats]) => ({
        outcome,
        count: stats.count,
        led_to_interested: stats.interested_leads.size,
        led_to_converted: stats.converted_leads.size,
        success_rate: stats.lead_ids.size > 0 ? Math.round((stats.interested_leads.size / stats.lead_ids.size) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // ==========================================
    // 4. SOURCE/CAMPAIGN INSIGHTS
    // ==========================================
    const sourceMap = new Map<string, SourceInsight>()

    for (const lead of leads || []) {
      const source = lead.referral_source || lead.campaign || "Direct / Unknown"

      if (!sourceMap.has(source)) {
        sourceMap.set(source, {
          source,
          total_leads: 0,
          converted: 0,
          conversion_rate: 0,
          avg_score: 0,
        })
      }

      const stats = sourceMap.get(source)!
      stats.total_leads++
      if (lead.contact_status === "converted") {
        stats.converted++
      }
      if (lead.lead_score) {
        stats.avg_score += lead.lead_score
      }
    }

    const sourceInsights: SourceInsight[] = Array.from(sourceMap.values())
      .map(stats => ({
        ...stats,
        conversion_rate: stats.total_leads > 0 ? Math.round((stats.converted / stats.total_leads) * 100) : 0,
        avg_score: stats.total_leads > 0 ? Math.round(stats.avg_score / stats.total_leads) : 0,
      }))
      .sort((a, b) => b.total_leads - a.total_leads)

    // ==========================================
    // 5. READINESS CHECKLIST INSIGHTS
    // ==========================================
    const readinessFields = [
      { field: "has_funds", label: "Has Sufficient Funds" },
      { field: "meets_age_requirements", label: "Meets Age Requirements" },
      { field: "has_valid_passport", label: "Has Valid Passport" },
      { field: "can_obtain_visa", label: "Can Obtain Visa" },
      { field: "can_start_intake", label: "Can Start Intake" },
      { field: "discussed_with_family", label: "Discussed with Family" },
      { field: "needs_housing_support", label: "Needs Housing Support" },
      { field: "understands_work_rules", label: "Understands Work Rules" },
      { field: "has_realistic_expectations", label: "Has Realistic Expectations" },
      { field: "ready_to_proceed", label: "Ready to Proceed" },
    ]

    // Get the latest readiness assessment per lead
    const latestReadinessPerLead = new Map<string, any>()
    for (const contact of contactHistory || []) {
      // Only consider entries that have readiness data
      if (contact.ready_to_proceed !== null || contact.has_funds !== null) {
        const existing = latestReadinessPerLead.get(contact.lead_id)
        if (!existing || new Date(contact.contacted_at) > new Date(existing.contacted_at)) {
          latestReadinessPerLead.set(contact.lead_id, contact)
        }
      }
    }

    const readinessInsights: ReadinessInsight[] = readinessFields.map(({ field, label }) => {
      let totalAssessed = 0
      let positiveCount = 0
      let convertedWithPositive = 0
      let convertedWithNegative = 0
      let positiveLeads = 0
      let negativeLeads = 0

      for (const [leadId, readiness] of latestReadinessPerLead.entries()) {
        const value = readiness[field]
        if (value !== null && value !== undefined) {
          totalAssessed++
          const leadStatus = leadStatusMap.get(leadId)
          const isConverted = leadStatus === "converted"

          if (value === true) {
            positiveCount++
            positiveLeads++
            if (isConverted) convertedWithPositive++
          } else {
            negativeLeads++
            if (isConverted) convertedWithNegative++
          }
        }
      }

      return {
        field,
        label,
        total_assessed: totalAssessed,
        positive_count: positiveCount,
        positive_rate: totalAssessed > 0 ? Math.round((positiveCount / totalAssessed) * 100) : 0,
        converted_with_positive: convertedWithPositive,
        conversion_rate_with_positive: positiveLeads > 0 ? Math.round((convertedWithPositive / positiveLeads) * 100) : 0,
        converted_with_negative: convertedWithNegative,
        conversion_rate_with_negative: negativeLeads > 0 ? Math.round((convertedWithNegative / negativeLeads) * 100) : 0,
      }
    }).filter(r => r.total_assessed > 0)

    // ==========================================
    // 6. INTAKE PERIOD INSIGHTS
    // ==========================================
    const intakeMap = new Map<string, {
      total: number
      interested: number
      qualified: number
      converted: number
      ready_count: number
    }>()

    // Get intake from leads
    for (const lead of leads || []) {
      const intake = lead.intake || "Not specified"

      if (!intakeMap.has(intake)) {
        intakeMap.set(intake, {
          total: 0,
          interested: 0,
          qualified: 0,
          converted: 0,
          ready_count: 0,
        })
      }

      const stats = intakeMap.get(intake)!
      stats.total++

      if (lead.contact_status === "interested") stats.interested++
      if (lead.contact_status === "qualified") stats.qualified++
      if (lead.contact_status === "converted") stats.converted++

      // Check if this lead is ready to proceed
      const readiness = latestReadinessPerLead.get(lead.id)
      if (readiness?.ready_to_proceed === true) {
        stats.ready_count++
      }
    }

    const intakeInsights: IntakeInsight[] = Array.from(intakeMap.entries())
      .map(([intake, stats]) => ({
        intake,
        total_leads: stats.total,
        interested: stats.interested,
        qualified: stats.qualified,
        converted: stats.converted,
        conversion_rate: stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0,
        ready_to_proceed: stats.ready_count,
      }))
      .filter(i => i.intake !== "Not specified" || i.total_leads > 5)
      .sort((a, b) => b.total_leads - a.total_leads)

    // ==========================================
    // 7. READINESS SUMMARY
    // ==========================================
    const totalWithReadiness = latestReadinessPerLead.size
    const totalReadyToProceed = Array.from(latestReadinessPerLead.values())
      .filter(r => r.ready_to_proceed === true).length

    // Calculate overall readiness score (average of all positive responses)
    let totalChecks = 0
    let positiveChecks = 0
    for (const [, readiness] of latestReadinessPerLead.entries()) {
      for (const { field } of readinessFields) {
        if (readiness[field] !== null && readiness[field] !== undefined) {
          totalChecks++
          if (readiness[field] === true) positiveChecks++
        }
      }
    }
    const avgReadinessScore = totalChecks > 0 ? Math.round((positiveChecks / totalChecks) * 100) : 0

    // Find common blockers (fields with low positive rates)
    const blockers = readinessInsights
      .filter(r => r.positive_rate < 50 && r.total_assessed >= 5)
      .sort((a, b) => a.positive_rate - b.positive_rate)
      .slice(0, 3)
      .map(r => r.label)

    // ==========================================
    // 8. SUMMARY STATS
    // ==========================================
    const totalLeads = leads?.length || 0
    const totalConverted = leads?.filter(l => l.contact_status === "converted").length || 0
    const totalContacted = leads?.filter(l => l.contact_status !== "not_contacted" && l.contact_status !== "referral").length || 0
    const totalInterested = leads?.filter(l => ["interested", "qualified", "converted"].includes(l.contact_status)).length || 0

    // Best performing country
    const bestCountry = countryInsights.length > 0
      ? countryInsights.reduce((best, curr) =>
          (curr.conversion_rate > best.conversion_rate && curr.total_leads >= 5) ? curr : best
        , countryInsights[0])
      : null

    // Best performing contact method
    const bestMethod = contactMethodInsights.length > 0
      ? contactMethodInsights.reduce((best, curr) =>
          (curr.success_rate > best.success_rate && curr.total_contacts >= 10) ? curr : best
        , contactMethodInsights[0])
      : null

    // Generate key insights
    const keyInsights: string[] = []

    if (bestCountry && bestCountry.conversion_rate > 0) {
      keyInsights.push(`${bestCountry.country} has the highest conversion rate at ${bestCountry.conversion_rate}%`)
    }

    if (bestMethod && bestMethod.success_rate > 0) {
      keyInsights.push(`${bestMethod.method} is most effective with ${bestMethod.success_rate}% success rate`)
    }

    if (totalReadyToProceed > 0) {
      keyInsights.push(`${totalReadyToProceed} leads are ready to proceed (${totalWithReadiness > 0 ? Math.round((totalReadyToProceed / totalWithReadiness) * 100) : 0}% of assessed)`)
    }

    if (blockers.length > 0) {
      keyInsights.push(`Common blockers: ${blockers.join(", ")}`)
    }

    // Find countries with high potential
    const highPotentialCountries = countryInsights
      .filter(c => c.avg_lead_score > 60 && c.conversion_rate < 10 && c.total_leads >= 5)
      .slice(0, 3)

    if (highPotentialCountries.length > 0) {
      keyInsights.push(`Opportunity: ${highPotentialCountries.map(c => c.country).join(", ")} have high-quality leads but low conversion`)
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          total_leads: totalLeads,
          total_contacted: totalContacted,
          total_interested: totalInterested,
          total_converted: totalConverted,
          overall_contact_rate: totalLeads > 0 ? Math.round((totalContacted / totalLeads) * 100) : 0,
          overall_conversion_rate: totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0,
        },
        readiness_summary: {
          total_assessed: totalWithReadiness,
          ready_to_proceed: totalReadyToProceed,
          ready_rate: totalWithReadiness > 0 ? Math.round((totalReadyToProceed / totalWithReadiness) * 100) : 0,
          avg_readiness_score: avgReadinessScore,
          common_blockers: blockers,
        },
        country_insights: countryInsights.slice(0, 20),
        contact_method_insights: contactMethodInsights,
        outcome_insights: outcomeInsights.slice(0, 15),
        source_insights: sourceInsights.slice(0, 15),
        readiness_insights: readinessInsights,
        intake_insights: intakeInsights.slice(0, 10),
        key_insights: keyInsights,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("[recruitment-insights] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

function formatMethodName(method: string): string {
  const names: Record<string, string> = {
    call: "Phone Call",
    whatsapp: "WhatsApp",
    email: "Email",
    sms: "SMS",
    meeting: "Meeting",
    unknown: "Other",
  }
  return names[method.toLowerCase()] || method
}
