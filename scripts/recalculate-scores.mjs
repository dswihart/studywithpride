/**
 * Recalculate Lead Scores with Intake Proximity
 * Run with: node scripts/recalculate-scores.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load env manually
function loadEnv() {
  const envFiles = ['.env.production.local', '.env.local', '.env']
  const env = {}
  
  for (const file of envFiles) {
    try {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8')
      content.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          let value = match[2].trim()
          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          env[key] = value
        }
      })
    } catch {}
  }
  return env
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

console.log('Connecting to Supabase:', supabaseUrl)
const supabase = createClient(supabaseUrl, supabaseKey)

// Scoring functions
function calculateNameScore(name, email) {
  if (!name || name.trim() === '') return 0
  let score = 0
  const cleanName = name.trim()
  const tokens = cleanName.split(/\s+/).filter(t => t.length > 0)
  
  if (tokens.length >= 2) score += 28
  else if (tokens.length === 1) score += 12
  
  if (cleanName.replace(/\s/g, '').length >= 6) score += 6
  
  const isTitleCase = (s) => s[0] === s[0].toUpperCase() && s.slice(1) === s.slice(1).toLowerCase()
  if (tokens.length >= 2) {
    const titleCaseCount = tokens.filter(t => isTitleCase(t)).length
    if (titleCaseCount >= 2) score += 4
  } else if (tokens.length === 1 && isTitleCase(tokens[0])) {
    score += 2
  }
  
  if (tokens.length === 1 && email) {
    const emailLocal = email.split('@')[0]?.toLowerCase() || ''
    const nameLower = cleanName.toLowerCase()
    if (emailLocal === nameLower && /^[a-z]+$/.test(emailLocal)) score += 10
    else if (/^[a-z]+[._][a-z]+$/.test(emailLocal)) score += 6
  }
  
  if (/(.)\1{2,}/.test(cleanName)) score -= 4
  if (/\d/.test(cleanName)) score -= 4
  
  return Math.max(0, Math.min(40, score))
}

function calculateEmailScore(email) {
  if (!email) return 0
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email.trim()) ? 30 : 0
}

function calculatePhoneScore(phone) {
  if (!phone) return 0
  const digits = phone.replace(/\D/g, '')
  
  if (digits.length === 11 && digits.startsWith('1')) {
    const areaCode = digits.substring(1, 4)
    if (['809', '829', '849'].includes(areaCode)) return 20
  }
  if (digits.length === 10) {
    const areaCode = digits.substring(0, 3)
    if (['809', '829', '849'].includes(areaCode)) return 20
  }
  if (digits.length >= 10) return 15
  return 0
}

function calculateRecencyScore(createdTime, oldestTime, newestTime) {
  if (!createdTime) return 5
  const created = new Date(createdTime)
  const range = newestTime.getTime() - oldestTime.getTime()
  if (range === 0) return 5
  const position = created.getTime() - oldestTime.getTime()
  const normalized = position / range
  return Math.round(normalized * 10)
}

function calculateIntakeScore(intake) {
  if (!intake) return 0
  
  const intakeLower = intake.toLowerCase()
  let targetMonth = null
  let targetYear = null
  
  if (intakeLower.includes('feb')) targetMonth = 2
  else if (intakeLower.includes('may')) targetMonth = 5
  else if (intakeLower.includes('oct')) targetMonth = 10
  else {
    const monthMatch = intake.match(/(\d{4})[-\/](\d{1,2})|(\d{1,2})[-\/](\d{4})/)
    if (monthMatch) {
      if (monthMatch[1] && monthMatch[2]) {
        targetYear = parseInt(monthMatch[1])
        targetMonth = parseInt(monthMatch[2])
      } else if (monthMatch[3] && monthMatch[4]) {
        targetMonth = parseInt(monthMatch[3])
        targetYear = parseInt(monthMatch[4])
      }
    }
  }
  
  const yearMatch = intake.match(/(20\d{2})/)
  if (yearMatch && !targetYear) targetYear = parseInt(yearMatch[1])
  
  if (!targetMonth) return 0
  
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  
  if (!targetYear) {
    targetYear = targetMonth >= currentMonth ? currentYear : currentYear + 1
  }
  
  const monthsUntil = (targetYear - currentYear) * 12 + (targetMonth - currentMonth)
  
  if (monthsUntil <= 0) return monthsUntil >= -2 ? 15 : 0
  if (monthsUntil <= 2) return 20
  if (monthsUntil <= 4) return 15
  if (monthsUntil <= 6) return 10
  if (monthsUntil <= 9) return 5
  return 0
}

function getQualityTier(score) {
  if (score >= 85) return 'High'
  if (score >= 55) return 'Medium'
  if (score >= 35) return 'Low'
  return 'Very Low'
}

async function recalculateAllScores() {
  console.log('Fetching all leads...')
  
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
  
  if (error || !leads) {
    console.error('Failed to fetch leads:', error)
    return
  }
  
  console.log(`Found ${leads.length} leads to recalculate`)
  
  // Calculate time range for recency
  const timestamps = leads
    .map(l => new Date(l.created_time || l.created_at))
    .filter(d => !isNaN(d.getTime()))
  
  const oldestTime = timestamps.length > 0 ? new Date(Math.min(...timestamps.map(d => d.getTime()))) : new Date()
  const newestTime = timestamps.length > 0 ? new Date(Math.max(...timestamps.map(d => d.getTime()))) : new Date()
  
  let updated = 0
  let errors = 0
  const summary = { High: 0, Medium: 0, Low: 0, 'Very Low': 0 }
  
  for (const lead of leads) {
    const nameScore = calculateNameScore(lead.prospect_name, lead.prospect_email)
    const emailScore = calculateEmailScore(lead.prospect_email)
    const phoneScore = calculatePhoneScore(lead.phone)
    const recencyScore = calculateRecencyScore(lead.created_time || lead.created_at, oldestTime, newestTime)
    const intakeScore = calculateIntakeScore(lead.intake)
    
    const totalScore = nameScore + emailScore + phoneScore + recencyScore + intakeScore
    const quality = getQualityTier(totalScore)
    
    summary[quality]++
    
    // Log leads with intake scores
    if (intakeScore > 0) {
      console.log(`Lead ${lead.prospect_name || lead.id}: intake="${lead.intake}" -> +${intakeScore} points (total: ${totalScore}, quality: ${quality})`)
    }
    
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        name_score: nameScore,
        lead_score: totalScore,
        lead_quality: quality
      })
      .eq('id', lead.id)
    
    if (updateError) {
      errors++
      console.error(`Failed to update lead ${lead.id}:`, updateError)
    } else {
      updated++
    }
  }
  
  console.log('\n=== Recalculation Complete ===')
  console.log(`Total leads: ${leads.length}`)
  console.log(`Updated: ${updated}`)
  console.log(`Errors: ${errors}`)
  console.log('\nQuality Distribution:')
  console.log(`  High: ${summary.High}`)
  console.log(`  Medium: ${summary.Medium}`)
  console.log(`  Low: ${summary.Low}`)
  console.log(`  Very Low: ${summary['Very Low']}`)
}

recalculateAllScores().catch(console.error)
