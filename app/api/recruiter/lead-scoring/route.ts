/**
 * Lead Scoring API - Updated Formula
 * Name Score (max 40) + Email (max 30) + Phone (max 20) + Recency (max 10) = 0-100
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"

// Helper functions for scoring
function isTitleCase(str: string): boolean {
  if (!str || str.length === 0) return false
  return str[0] === str[0].toUpperCase() && str.slice(1) === str.slice(1).toLowerCase()
}

function hasRepeatingChars(str: string): boolean {
  return /(.)\1{2,}/.test(str)
}

function hasDigits(str: string): boolean {
  return /\d/.test(str)
}

function calculateNameScore(name: string | null, email: string | null): number {
  if (!name || name.trim() === "") return 0

  let score = 0
  const cleanName = name.trim()
  const tokens = cleanName.split(/\s+/).filter(t => t.length > 0)

  // Token count scoring
  if (tokens.length >= 2) {
    score += 28
  } else if (tokens.length === 1) {
    score += 12
  }

  // Length bonus
  if (cleanName.replace(/\s/g, "").length >= 6) {
    score += 6
  }

  // Capitalization bonus
  if (tokens.length >= 2) {
    const titleCaseCount = tokens.filter(t => isTitleCase(t)).length
    if (titleCaseCount >= 2) score += 4
  } else if (tokens.length === 1 && isTitleCase(tokens[0])) {
    score += 2
  }

  // Email corroboration for single-name
  if (tokens.length === 1 && email) {
    const emailLocal = email.split("@")[0]?.toLowerCase() || ""
    const nameLower = cleanName.toLowerCase()

    // +10 if email local-part equals the name and is letters only
    if (emailLocal === nameLower && /^[a-z]+$/.test(emailLocal)) {
      score += 10
    }
    // +6 if email shows two names (e.g., juan.perez) while submitted name has one
    else if (/^[a-z]+[._][a-z]+$/.test(emailLocal)) {
      score += 6
    }
  }

  // Penalties
  if (hasRepeatingChars(cleanName)) score -= 4
  if (hasDigits(cleanName)) score -= 4
  if (cleanName === cleanName.toUpperCase() || cleanName === cleanName.toLowerCase()) {
    // Only penalize if not Title Case
    if (!tokens.every(t => isTitleCase(t))) {
      score -= 2
    }
  }

  // Clamp 0-40
  return Math.max(0, Math.min(40, score))
}

function calculateEmailScore(email: string | null): number {
  if (!email) return 0
  // Standard email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim()) ? 30 : 0
}

function calculatePhoneScore(phone: string | null): number {
  if (!phone) return 0

  // Clean phone - remove all non-digits
  const digits = phone.replace(/\D/g, "")

  // DR format under NANP: 11 digits, starts with 1, area code in {809, 829, 849}
  if (digits.length === 11 && digits.startsWith("1")) {
    const areaCode = digits.substring(1, 4)
    if (["809", "829", "849"].includes(areaCode)) {
      return 20
    }
  }

  // Also accept 10-digit format with DR area codes
  if (digits.length === 10) {
    const areaCode = digits.substring(0, 3)
    if (["809", "829", "849"].includes(areaCode)) {
      return 20
    }
  }

  return 0
}

function calculateRecencyScore(createdTime: string | null, oldestTime: Date, newestTime: Date): number {
  if (!createdTime) return 5

  const created = new Date(createdTime)
  const range = newestTime.getTime() - oldestTime.getTime()

  if (range === 0) return 5 // All same timestamp

  const position = created.getTime() - oldestTime.getTime()
  const normalized = position / range // 0 = oldest, 1 = newest

  return Math.round(normalized * 10)
}

function calculateLeadScore(
  lead: any,
  oldestTime: Date,
  newestTime: Date
): { total_score: number; quality_tier: string; name_score: number; email_score: number; phone_score: number; recency_score: number } {
  const nameScore = calculateNameScore(lead.prospect_name, lead.prospect_email)
  const emailScore = calculateEmailScore(lead.prospect_email)
  const phoneScore = calculatePhoneScore(lead.phone)
  const recencyScore = calculateRecencyScore(lead.created_time || lead.created_at, oldestTime, newestTime)

  const totalScore = nameScore + emailScore + phoneScore + recencyScore

  // Quality buckets
  let qualityTier: string
  if (totalScore >= 70) {
    qualityTier = "High"
  } else if (totalScore >= 45) {
    qualityTier = "Medium"
  } else {
    qualityTier = "Low"
  }

  return {
    total_score: totalScore,
    quality_tier: qualityTier,
    name_score: nameScore,
    email_score: emailScore,
    phone_score: phoneScore,
    recency_score: recencyScore
  }
}

export async function GET(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: {
        formula: {
          name: { max: 40, description: "Name quality scoring" },
          email: { max: 30, description: "Email validity" },
          phone: { max: 20, description: "Phone validity (DR NANP)" },
          recency: { max: 10, description: "Recency linear scale" }
        },
        tiers: {
          High: { min: 70, max: 100 },
          Medium: { min: 45, max: 69 },
          Low: { min: 0, max: 44 }
        }
      }
    })
  } catch (error) {
    console.error("[lead-scoring] GET Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const roleCheck = await requireRole("recruiter")
    if (!roleCheck.authorized) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { action, leadIds } = body
    const supabase = await createClient()

    if (action === "recalculate_all" || action === "calculate") {
      // Fetch all leads
      let query = supabase.from("leads").select("*")
      if (leadIds && Array.isArray(leadIds) && leadIds.length > 0) {
        query = query.in("id", leadIds)
      }

      const { data: leads, error } = await query
      if (error || !leads) {
        return NextResponse.json({ success: false, error: "Failed to fetch leads" }, { status: 500 })
      }

      // Find oldest and newest timestamps for recency calculation
      const timestamps = leads
        .map(l => new Date(l.created_time || l.created_at))
        .filter(d => !isNaN(d.getTime()))

      const oldestTime = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(d => d.getTime()))) : new Date()
      const newestTime = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(d => d.getTime()))) : new Date()

      // Calculate and update scores
      let successCount = 0
      const scores = []

      for (const lead of leads) {
        const scoreData = calculateLeadScore(lead, oldestTime, newestTime)
        scores.push({
          lead_id: lead.id,
          ...scoreData
        })

        if (action === "recalculate_all") {
          const { error: updateError } = await supabase
            .from("leads")
            .update({
              lead_score: scoreData.total_score,
              lead_quality: scoreData.quality_tier,
              name_score: scoreData.name_score
            })
            .eq("id", lead.id)

          if (!updateError) successCount++
        }
      }

      const summary = {
        High: scores.filter(s => s.quality_tier === "High").length,
        Medium: scores.filter(s => s.quality_tier === "Medium").length,
        Low: scores.filter(s => s.quality_tier === "Low").length,
        average_score: scores.length > 0 ? Math.round(scores.reduce((acc, s) => acc + s.total_score, 0) / scores.length) : 0
      }

      return NextResponse.json({
        success: true,
        data: {
          scores: action === "calculate" ? scores : undefined,
          summary,
          updated: action === "recalculate_all" ? successCount : undefined,
          total: leads.length
        }
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[lead-scoring] POST Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
