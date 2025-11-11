import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

/**
 * Database Health Check Endpoint
 * Monitors database connectivity and performance
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now()
  
  const health = {
    status: "unknown",
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: "unknown", latency_ms: 0 },
      authentication: { status: "unknown" },
      tables: { status: "unknown", count: 0 },
    },
  }

  try {
    // Check database connectivity
    const supabase = await createClient()
    const dbStart = Date.now()
    
    // Simple query to check connection
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1)
    
    const dbLatency = Date.now() - dbStart

    if (error && error.code !== "PGRST116") {
      health.checks.database.status = "error"
      health.status = "degraded"
    } else {
      health.checks.database.status = "healthy"
      health.checks.database.latency_ms = dbLatency
    }

    // Check authentication service
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      health.checks.authentication.status = authError ? "error" : "healthy"
    } catch {
      health.checks.authentication.status = "error"
    }

    // Check table accessibility
    const tables = ["user_profiles", "application_states", "saved_content"]
    let accessibleTables = 0

    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select("id").limit(1)
      if (!tableError || tableError.code === "PGRST116") accessibleTables++
    }

    health.checks.tables.count = accessibleTables
    health.checks.tables.status = accessibleTables === tables.length ? "healthy" : "degraded"

    // Overall status
    const allHealthy = Object.values(health.checks).every(check => check.status === "healthy")
    health.status = allHealthy ? "healthy" : "degraded"

    const totalLatency = Date.now() - startTime

    return NextResponse.json({
      ...health,
      response_time_ms: totalLatency,
      version: "1.0.0",
    })

  } catch (error: any) {
    health.status = "error"
    health.checks.database.status = "error"

    return NextResponse.json(
      {
        ...health,
        error: error.message,
        response_time_ms: Date.now() - startTime,
      },
      { status: 503 }
    )
  }
}
