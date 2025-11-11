import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Run Visa Requirements Migration
 * POST /api/admin/migrate-visa-requirements
 */

export async function POST() {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const migrations = [
      // Add country field to application_states
      `ALTER TABLE public.application_states ADD COLUMN IF NOT EXISTS destination_country TEXT;`,

      // Create visa requirements table
      `CREATE TABLE IF NOT EXISTS public.visa_requirements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        country_code TEXT NOT NULL UNIQUE,
        country_name TEXT NOT NULL,
        requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
        general_info TEXT,
        processing_time TEXT,
        estimated_cost TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );`,

      // Enable RLS
      `ALTER TABLE public.visa_requirements ENABLE ROW LEVEL SECURITY;`,

      // Create policy
      `CREATE POLICY IF NOT EXISTS "Authenticated users can view visa requirements"
        ON public.visa_requirements FOR SELECT
        TO authenticated
        USING (true);`
    ]

    // Run migrations
    for (const sql of migrations) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
      if (error) {
        console.error('[migrate-visa] SQL execution error:', error)
        // Continue anyway as some errors are expected (like table already exists)
      }
    }

    // Insert Spain requirements
    const { error: esError } = await supabase
      .from('visa_requirements')
      .upsert({
        country_code: 'ES',
        country_name: 'Spain',
        requirements: [
          { id: 'passport', label: 'Valid Passport', description: 'Passport must be valid for at least 6 months', required: true, category: 'identification' },
          { id: 'acceptance_letter', label: 'University Acceptance Letter', description: 'Official acceptance from Spanish university', required: true, category: 'academic' },
          { id: 'nie_application', label: 'NIE Application', description: 'Foreigner Identity Number application', required: true, category: 'identification' },
          { id: 'health_insurance', label: 'Health Insurance', description: 'Valid health insurance in Spain', required: true, category: 'health' },
          { id: 'proof_of_funds', label: 'Proof of Funds (IPREM)', description: 'Bank statements (100% IPREM monthly)', required: true, category: 'financial' },
          { id: 'accommodation_proof', label: 'Accommodation Proof', description: 'Rental contract or host letter', required: true, category: 'housing' },
          { id: 'criminal_record', label: 'Criminal Record Certificate', description: 'Apostilled certificate from home country', required: true, category: 'legal' },
          { id: 'medical_certificate', label: 'Medical Certificate', description: 'No public health risk diseases', required: true, category: 'health' },
          { id: 'visa_application_form', label: 'Visa Application Form', description: 'Spanish form EX-00', required: true, category: 'administrative' },
          { id: 'passport_photos', label: 'Passport Photos', description: 'Recent photos meeting requirements', required: true, category: 'administrative' }
        ],
        general_info: 'Student visa for Spain requires acceptance, funds, and health coverage.',
        processing_time: '1-3 months',
        estimated_cost: '€60-180'
      }, { onConflict: 'country_code' })

    // Insert UK requirements
    const { error: gbError } = await supabase
      .from('visa_requirements')
      .upsert({
        country_code: 'GB',
        country_name: 'United Kingdom',
        requirements: [
          { id: 'passport', label: 'Valid Passport', description: 'Passport with 6 months validity', required: true, category: 'identification' },
          { id: 'cas_number', label: 'CAS Number', description: 'Confirmation of Acceptance for Studies', required: true, category: 'academic' },
          { id: 'tb_test', label: 'TB Test Certificate', description: 'If from listed countries', required: false, category: 'health' },
          { id: 'maintenance_funds', label: 'Maintenance Funds', description: '£1,334/month (London) or £1,023', required: true, category: 'financial' },
          { id: 'ielts_certificate', label: 'English Language Test', description: 'IELTS, TOEFL, or approved test', required: true, category: 'academic' },
          { id: 'accommodation_proof', label: 'Accommodation Details', description: 'Where you will stay', required: false, category: 'housing' }
        ],
        general_info: 'UK Student visa requires CAS, financial proof, and English proficiency.',
        processing_time: '3 weeks',
        estimated_cost: '£363'
      }, { onConflict: 'country_code' })

    // Insert USA requirements
    const { error: usError } = await supabase
      .from('visa_requirements')
      .upsert({
        country_code: 'US',
        country_name: 'United States',
        requirements: [
          { id: 'passport', label: 'Valid Passport', description: 'Valid 6 months beyond program end', required: true, category: 'identification' },
          { id: 'i20_form', label: 'Form I-20', description: 'Certificate of Eligibility from university', required: true, category: 'academic' },
          { id: 'sevis_fee', label: 'SEVIS Fee', description: 'I-901 fee ($350) receipt', required: true, category: 'financial' },
          { id: 'ds160_form', label: 'DS-160 Form', description: 'Nonimmigrant visa application', required: true, category: 'administrative' },
          { id: 'financial_documents', label: 'Financial Documents', description: 'Bank statements, sponsor letters', required: true, category: 'financial' },
          { id: 'visa_interview', label: 'Visa Interview', description: 'At US Embassy/Consulate', required: true, category: 'administrative' }
        ],
        general_info: 'F-1 Student visa requires I-20, SEVIS payment, and interview.',
        processing_time: '2-8 weeks',
        estimated_cost: '$510'
      }, { onConflict: 'country_code' })

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      details: {
        spain: esError ? 'error' : 'success',
        uk: gbError ? 'error' : 'success',
        usa: usError ? 'error' : 'success'
      }
    })
  } catch (error: any) {
    console.error('[migrate-visa] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Migration failed' },
      { status: 500 }
    )
  }
}
