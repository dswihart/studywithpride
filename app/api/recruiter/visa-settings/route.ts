import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/auth/role-guard"
import fs from "fs"
import path from "path"

const SETTINGS_FILE = path.join(process.cwd(), "config", "visa-settings.json")

// Default settings if file doesn't exist
const DEFAULT_SETTINGS = {
  settings: {
    "Dominican Republic": { weeks: 6, notes: "High volume - BLS Santo Domingo" },
    "Mexico": { weeks: 5, notes: "BLS Mexico City" },
    "Ecuador": { weeks: 5, notes: "Quito consulate" },
    "Bolivia": { weeks: 6, notes: "La Paz - limited appointments" },
    "Guatemala": { weeks: 6, notes: "Guatemala City" },
    "Paraguay": { weeks: 5, notes: "" },
    "Costa Rica": { weeks: 5, notes: "San Jose" },
    "Panama": { weeks: 4, notes: "" },
    "Colombia": { weeks: 5, notes: "Bogota - high demand" },
    "Argentina": { weeks: 3, notes: "Buenos Aires - typically faster" },
    "Brazil": { weeks: 5, notes: "Sao Paulo/Brasilia" },
    "Chile": { weeks: 4, notes: "Santiago" },
    "Haiti": { weeks: 8, notes: "Complex process" },
    "Peru": { weeks: 5, notes: "Lima" },
    "Nicaragua": { weeks: 6, notes: "" }
  },
  defaultWeeks: 5,
  urgentThresholdWeeks: 8
}

function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error reading visa settings:", error)
  }
  return DEFAULT_SETTINGS
}

function saveSettings(settings: typeof DEFAULT_SETTINGS) {
  try {
    const dir = path.dirname(SETTINGS_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
    return true
  } catch (error) {
    console.error("Error saving visa settings:", error)
    return false
  }
}

export async function GET() {
  try {
    const roleCheck = await requireRole("recruiter")

    if (!roleCheck.authorized) {
      return NextResponse.json(
        { success: false, error: roleCheck.reason || "Forbidden" },
        { status: 403 }
      )
    }

    const settings = getSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error("Error fetching visa settings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
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
    const currentSettings = getSettings()

    // Update specific country
    if (body.country && body.weeks !== undefined) {
      currentSettings.settings[body.country] = {
        weeks: parseInt(body.weeks),
        notes: body.notes || ""
      }
    }

    // Update default weeks
    if (body.defaultWeeks !== undefined) {
      currentSettings.defaultWeeks = parseInt(body.defaultWeeks)
    }

    // Update urgent threshold
    if (body.urgentThresholdWeeks !== undefined) {
      currentSettings.urgentThresholdWeeks = parseInt(body.urgentThresholdWeeks)
    }

    // Bulk update all settings
    if (body.settings) {
      currentSettings.settings = body.settings
    }

    if (saveSettings(currentSettings)) {
      return NextResponse.json({ success: true, data: currentSettings })
    } else {
      return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error saving visa settings:", error)
    return NextResponse.json({ success: false, error: "Failed to save settings" }, { status: 500 })
  }
}
