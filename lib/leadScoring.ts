/**
 * Lead Scoring and Country Detection Utility
 * TypeScript port of lead_scorer.py logic
 */

// NANP Country Codes (Country Code 1)
const NANP_AREA_CODES: Record<string, string> = {
  // Caribbean
  '809': 'Dominican Republic', '829': 'Dominican Republic', '849': 'Dominican Republic',
  '787': 'Puerto Rico', '939': 'Puerto Rico',
  '684': 'American Samoa', '264': 'Anguilla', '268': 'Antigua and Barbuda',
  '242': 'Bahamas', '246': 'Barbados', '441': 'Bermuda',
  '284': 'British Virgin Islands', '345': 'Cayman Islands', '767': 'Dominica',
  '473': 'Grenada', '671': 'Guam', '876': 'Jamaica', '658': 'Jamaica',
  '664': 'Montserrat', '670': 'Northern Mariana Islands',
  '869': 'Saint Kitts and Nevis', '758': 'Saint Lucia',
  '784': 'Saint Vincent and the Grenadines', '721': 'Sint Maarten',
  '868': 'Trinidad and Tobago', '649': 'Turks and Caicos Islands',
  '340': 'US Virgin Islands',
  // USA Area Codes (comprehensive)
  '201': 'USA', '202': 'USA', '203': 'USA', '205': 'USA', '206': 'USA',
  '207': 'USA', '208': 'USA', '209': 'USA', '210': 'USA', '212': 'USA',
  '213': 'USA', '214': 'USA', '215': 'USA', '216': 'USA', '217': 'USA',
  '218': 'USA', '219': 'USA', '220': 'USA', '223': 'USA', '224': 'USA',
  '225': 'USA', '228': 'USA', '229': 'USA', '231': 'USA', '234': 'USA',
  '239': 'USA', '240': 'USA', '248': 'USA', '251': 'USA', '252': 'USA',
  '253': 'USA', '254': 'USA', '256': 'USA', '260': 'USA', '262': 'USA',
  '267': 'USA', '269': 'USA', '270': 'USA', '272': 'USA', '276': 'USA',
  '281': 'USA', '301': 'USA', '302': 'USA', '303': 'USA', '304': 'USA',
  '305': 'USA', '307': 'USA', '308': 'USA', '309': 'USA', '310': 'USA',
  '312': 'USA', '313': 'USA', '314': 'USA', '315': 'USA', '316': 'USA',
  '317': 'USA', '318': 'USA', '319': 'USA', '320': 'USA', '321': 'USA',
  '323': 'USA', '325': 'USA', '326': 'USA', '330': 'USA', '331': 'USA',
  '332': 'USA', '334': 'USA', '336': 'USA', '337': 'USA', '339': 'USA',
  '346': 'USA', '347': 'USA', '351': 'USA', '352': 'USA', '360': 'USA',
  '361': 'USA', '364': 'USA', '380': 'USA', '385': 'USA', '386': 'USA',
  '401': 'USA', '402': 'USA', '404': 'USA', '405': 'USA', '406': 'USA',
  '407': 'USA', '408': 'USA', '409': 'USA', '410': 'USA', '412': 'USA',
  '413': 'USA', '414': 'USA', '415': 'USA', '417': 'USA', '419': 'USA',
  '423': 'USA', '424': 'USA', '425': 'USA', '430': 'USA', '432': 'USA',
  '434': 'USA', '435': 'USA', '440': 'USA', '442': 'USA', '443': 'USA',
  '445': 'USA', '458': 'USA', '463': 'USA', '469': 'USA', '470': 'USA',
  '475': 'USA', '478': 'USA', '479': 'USA', '480': 'USA', '484': 'USA',
  '501': 'USA', '502': 'USA', '503': 'USA', '504': 'USA', '505': 'USA',
  '507': 'USA', '508': 'USA', '509': 'USA', '510': 'USA', '512': 'USA',
  '513': 'USA', '515': 'USA', '516': 'USA', '517': 'USA', '518': 'USA',
  '520': 'USA', '530': 'USA', '531': 'USA', '534': 'USA', '539': 'USA',
  '540': 'USA', '541': 'USA', '551': 'USA', '559': 'USA', '561': 'USA',
  '562': 'USA', '563': 'USA', '564': 'USA', '567': 'USA', '570': 'USA',
  '571': 'USA', '573': 'USA', '574': 'USA', '575': 'USA', '580': 'USA',
  '585': 'USA', '586': 'USA', '601': 'USA', '602': 'USA', '603': 'USA',
  '605': 'USA', '606': 'USA', '607': 'USA', '608': 'USA', '609': 'USA',
  '610': 'USA', '612': 'USA', '614': 'USA', '615': 'USA', '616': 'USA',
  '617': 'USA', '618': 'USA', '619': 'USA', '620': 'USA', '623': 'USA',
  '626': 'USA', '628': 'USA', '629': 'USA', '630': 'USA', '631': 'USA',
  '636': 'USA', '641': 'USA', '646': 'USA', '650': 'USA', '651': 'USA',
  '657': 'USA', '659': 'USA', '660': 'USA', '661': 'USA', '662': 'USA',
  '667': 'USA', '669': 'USA', '678': 'USA', '680': 'USA', '681': 'USA',
  '682': 'USA', '689': 'USA', '701': 'USA', '702': 'USA', '703': 'USA',
  '704': 'USA', '706': 'USA', '707': 'USA', '708': 'USA', '712': 'USA',
  '713': 'USA', '714': 'USA', '715': 'USA', '716': 'USA', '717': 'USA',
  '718': 'USA', '719': 'USA', '720': 'USA', '724': 'USA', '725': 'USA',
  '726': 'USA', '727': 'USA', '731': 'USA', '732': 'USA', '734': 'USA',
  '737': 'USA', '740': 'USA', '743': 'USA', '747': 'USA', '754': 'USA',
  '757': 'USA', '760': 'USA', '762': 'USA', '763': 'USA', '765': 'USA',
  '769': 'USA', '770': 'USA', '772': 'USA', '773': 'USA', '774': 'USA',
  '775': 'USA', '779': 'USA', '781': 'USA', '785': 'USA', '786': 'USA',
  '801': 'USA', '802': 'USA', '803': 'USA', '804': 'USA', '805': 'USA',
  '806': 'USA', '808': 'USA', '810': 'USA', '812': 'USA', '813': 'USA',
  '814': 'USA', '815': 'USA', '816': 'USA', '817': 'USA', '818': 'USA',
  '820': 'USA', '828': 'USA', '830': 'USA', '831': 'USA', '832': 'USA',
  '838': 'USA', '843': 'USA', '845': 'USA', '847': 'USA', '848': 'USA',
  '850': 'USA', '854': 'USA', '856': 'USA', '857': 'USA', '858': 'USA',
  '859': 'USA', '860': 'USA', '862': 'USA', '863': 'USA', '864': 'USA',
  '865': 'USA', '870': 'USA', '872': 'USA', '878': 'USA', '901': 'USA',
  '903': 'USA', '904': 'USA', '906': 'USA', '907': 'USA', '908': 'USA',
  '909': 'USA', '910': 'USA', '912': 'USA', '913': 'USA', '914': 'USA',
  '915': 'USA', '916': 'USA', '917': 'USA', '918': 'USA', '919': 'USA',
  '920': 'USA', '925': 'USA', '928': 'USA', '929': 'USA', '930': 'USA',
  '931': 'USA', '934': 'USA', '936': 'USA', '937': 'USA', '938': 'USA',
  '940': 'USA', '941': 'USA', '945': 'USA', '947': 'USA', '949': 'USA',
  '951': 'USA', '952': 'USA', '954': 'USA', '956': 'USA', '959': 'USA',
  '970': 'USA', '971': 'USA', '972': 'USA', '973': 'USA', '975': 'USA',
  '978': 'USA', '979': 'USA', '980': 'USA', '984': 'USA', '985': 'USA',
  '986': 'USA', '989': 'USA',
  // Canada Area Codes
  '204': 'Canada', '226': 'Canada', '236': 'Canada', '249': 'Canada',
  '250': 'Canada', '289': 'Canada', '306': 'Canada', '343': 'Canada',
  '365': 'Canada', '367': 'Canada', '368': 'Canada', '382': 'Canada',
  '403': 'Canada', '416': 'Canada', '418': 'Canada', '431': 'Canada',
  '437': 'Canada', '438': 'Canada', '450': 'Canada', '506': 'Canada',
  '514': 'Canada', '519': 'Canada', '548': 'Canada', '579': 'Canada',
  '581': 'Canada', '587': 'Canada', '604': 'Canada', '613': 'Canada',
  '639': 'Canada', '647': 'Canada', '672': 'Canada', '705': 'Canada',
  '709': 'Canada', '742': 'Canada', '778': 'Canada', '780': 'Canada',
  '782': 'Canada', '807': 'Canada', '819': 'Canada', '825': 'Canada',
  '867': 'Canada', '873': 'Canada', '902': 'Canada', '905': 'Canada',
}

// International country codes
const COUNTRY_CODES: Record<string, string> = {
  // South America
  '54': 'Argentina', '591': 'Bolivia', '55': 'Brazil', '56': 'Chile',
  '57': 'Colombia', '593': 'Ecuador', '595': 'Paraguay', '51': 'Peru',
  '598': 'Uruguay', '58': 'Venezuela',
  // Central America & Caribbean
  '501': 'Belize', '506': 'Costa Rica', '53': 'Cuba', '503': 'El Salvador',
  '502': 'Guatemala', '509': 'Haiti', '504': 'Honduras', '52': 'Mexico',
  '505': 'Nicaragua', '507': 'Panama',
  // Europe
  '43': 'Austria', '32': 'Belgium', '45': 'Denmark', '358': 'Finland',
  '33': 'France', '49': 'Germany', '30': 'Greece', '353': 'Ireland',
  '39': 'Italy', '31': 'Netherlands', '47': 'Norway', '48': 'Poland',
  '351': 'Portugal', '7': 'Russia', '34': 'Spain', '46': 'Sweden',
  '41': 'Switzerland', '44': 'United Kingdom', '380': 'Ukraine',
  // Asia
  '86': 'China', '91': 'India', '62': 'Indonesia', '81': 'Japan',
  '60': 'Malaysia', '63': 'Philippines', '65': 'Singapore', '82': 'South Korea',
  '66': 'Thailand', '84': 'Vietnam',
  // Oceania
  '61': 'Australia', '64': 'New Zealand',
  // Middle East
  '971': 'United Arab Emirates', '966': 'Saudi Arabia', '972': 'Israel',
}

/**
 * Clean phone number to digits only
 */
export function cleanPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  return phone.replace(/\D/g, '')
}

/**
 * Detect country from phone number
 */
export function detectCountryFromPhone(phone: string | null | undefined): string {
  const digits = cleanPhone(phone)

  if (!digits) return 'Unknown'

  // Remove leading zeros
  const cleanedDigits = digits.replace(/^0+/, '')

  // Check NANP numbers (1 + area code)
  if (cleanedDigits.startsWith('1') && cleanedDigits.length >= 4) {
    const areaCode = cleanedDigits.substring(1, 4)
    if (NANP_AREA_CODES[areaCode]) {
      return NANP_AREA_CODES[areaCode]
    }
    // Default NANP to USA/Canada if area code not recognized
    if (cleanedDigits.length === 11) {
      return 'USA'
    }
  }

  // Check other country codes (try longest first)
  for (const codeLen of [3, 2, 1]) {
    if (cleanedDigits.length >= codeLen) {
      const code = cleanedDigits.substring(0, codeLen)
      if (COUNTRY_CODES[code]) {
        return COUNTRY_CODES[code]
      }
    }
  }

  return 'Unknown'
}

/**
 * Check if a token is in Title Case
 */
function isTitleCase(token: string): boolean {
  if (!token) return false
  return token[0] === token[0].toUpperCase() &&
         (token.length === 1 || token.slice(1) === token.slice(1).toLowerCase())
}

/**
 * Score name (max 40)
 */
export function scoreName(name: string | null | undefined, email: string = ''): number {
  if (!name || !name.trim()) return 0

  const trimmedName = name.trim()
  const tokens = trimmedName.split(/\s+/)
  const numTokens = tokens.length

  let score = 0

  // Token scoring
  if (numTokens >= 2) {
    score += 28
  } else if (numTokens === 1) {
    score += 12
  }

  // Length bonus
  if (trimmedName.replace(/\s/g, '').length >= 6) {
    score += 6
  }

  // Capitalization
  const titleCaseTokens = tokens.filter(t => isTitleCase(t)).length
  if (numTokens >= 2 && titleCaseTokens >= 2) {
    score += 4
  } else if (numTokens === 1 && titleCaseTokens === 1) {
    score += 2
  }

  // Email corroboration (for single-name submissions)
  if (email && numTokens === 1) {
    const emailLocal = email.includes('@') ? email.split('@')[0].toLowerCase() : ''
    const nameLower = trimmedName.toLowerCase().replace(/\s/g, '')

    // +10 if email local-part equals the name and is letters only
    if (emailLocal === nameLower && /^[a-z]+$/.test(emailLocal)) {
      score += 10
    } else {
      // +6 if email local-part shows two names while submitted name has one
      const emailParts = emailLocal.split(/[._]/)
      if (emailParts.length >= 2 && emailParts.every(p => !p || /^[a-z]+$/.test(p))) {
        score += 6
      }
    }
  }

  // Penalties
  // -4 if any character repeats 3+ times in a row
  if (/(.)\1{2,}/.test(trimmedName)) {
    score -= 4
  }

  // -4 if digits present
  if (/\d/.test(trimmedName)) {
    score -= 4
  }

  // -2 if all-caps or all-lower
  const nameLetters = trimmedName.replace(/[^a-zA-Z]/g, '')
  if (nameLetters && (nameLetters === nameLetters.toUpperCase() || nameLetters === nameLetters.toLowerCase())) {
    score -= 2
  }

  // Clamp 0-40
  return Math.max(0, Math.min(40, score))
}

/**
 * Score email (max 30)
 */
export function scoreEmail(email: string | null | undefined): { score: number; valid: boolean } {
  if (!email || !email.trim()) return { score: 0, valid: false }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (emailPattern.test(email.trim().toLowerCase())) {
    return { score: 30, valid: true }
  }

  return { score: 0, valid: false }
}

/**
 * Score phone (max 20)
 */
export function scorePhone(phone: string | null | undefined): { score: number; valid: boolean; country: string } {
  const digits = cleanPhone(phone)
  const country = detectCountryFromPhone(phone)

  if (!digits) {
    return { score: 0, valid: false, country: 'Unknown' }
  }

  // Dominican Republic NANP format: 11 digits, starts with 1, area code in {809, 829, 849}
  if (digits.length === 11 && digits.startsWith('1')) {
    const areaCode = digits.substring(1, 4)
    if (['809', '829', '849'].includes(areaCode)) {
      return { score: 20, valid: true, country: 'Dominican Republic' }
    }
  }

  // Also accept other valid phone formats (10+ digits)
  if (digits.length >= 10) {
    return { score: 15, valid: true, country }
  }

  return { score: 0, valid: false, country }
}

/**
 * Score recency (max 10)
 * Returns 5 as default when no timestamp comparison available
 */
export function scoreRecency(): number {
  return 5 // Default for imports without timestamp comparison
}

/**
 * Score intake proximity (max 20 bonus points)
 * Awards higher points when target intake is closer
 * Intake months: February (2), May (5), October (10)
 */
export function scoreIntakeProximity(intake: string | null | undefined): number {
  if (!intake) return 0
  
  // Parse intake string to get target month
  // Expected formats: "February 2025", "Feb 2025", "2025-02", etc.
  const intakeLower = intake.toLowerCase()
  let targetMonth: number | null = null
  let targetYear: number | null = null
  
  // Try to extract month
  if (intakeLower.includes('feb')) targetMonth = 2
  else if (intakeLower.includes('may')) targetMonth = 5
  else if (intakeLower.includes('oct')) targetMonth = 10
  else {
    // Try numeric format like "2025-02" or "02/2025"
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
  
  // Try to extract year
  const yearMatch = intake.match(/(20\d{2})/)
  if (yearMatch && !targetYear) {
    targetYear = parseInt(yearMatch[1])
  }
  
  // If we couldn't parse the intake, return 0
  if (!targetMonth) return 0
  
  // Use current year if not specified, or next year if month has passed
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-indexed
  const currentYear = now.getFullYear()
  
  if (!targetYear) {
    // Assume next occurrence of that intake month
    if (targetMonth >= currentMonth) {
      targetYear = currentYear
    } else {
      targetYear = currentYear + 1
    }
  }
  
  // Calculate months until intake
  const monthsUntil = (targetYear - currentYear) * 12 + (targetMonth - currentMonth)
  
  // Score based on proximity
  if (monthsUntil <= 0) {
    // Intake already passed or this month - still valuable if recent
    return monthsUntil >= -2 ? 15 : 0
  } else if (monthsUntil <= 2) {
    return 20 // Urgent - intake imminent
  } else if (monthsUntil <= 4) {
    return 15 // Soon - high priority
  } else if (monthsUntil <= 6) {
    return 10 // Moderate - active planning
  } else if (monthsUntil <= 9) {
    return 5  // Planning ahead
  }
  
  return 0 // 10+ months away
}

/**
 * Get quality bucket from total score
 * Updated thresholds to account for intake proximity bonus (max 120)
 */
export function getQualityBucket(score: number): string {
  if (score >= 85) return 'High'
  if (score >= 55) return 'Medium'
  if (score >= 35) return 'Low'
  return 'Very Low'
}

/**
 * Calculate full lead score
 * Now includes intake proximity bonus for leads with upcoming intake dates
 */
export function calculateLeadScore(
  name: string | null | undefined,
  email: string | null | undefined,
  phone: string | null | undefined,
  intake?: string | null
): {
  nameScore: number
  emailScore: number
  phoneScore: number
  phoneValid: boolean
  recencyScore: number
  intakeScore: number
  totalScore: number
  quality: string
  detectedCountry: string
} {
  const nameScore = scoreName(name, email || '')
  const { score: emailScore } = scoreEmail(email)
  const { score: phoneScore, valid: phoneValid, country: detectedCountry } = scorePhone(phone)
  const recencyScore = scoreRecency()
  const intakeScore = scoreIntakeProximity(intake)

  const totalScore = nameScore + emailScore + phoneScore + recencyScore + intakeScore
  const quality = getQualityBucket(totalScore)

  return {
    nameScore,
    emailScore,
    phoneScore,
    phoneValid,
    recencyScore,
    intakeScore,
    totalScore,
    quality,
    detectedCountry
  }
}
