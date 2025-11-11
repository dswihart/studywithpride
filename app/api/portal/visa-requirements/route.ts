import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { visaRequirements } from '@/lib/data/visa-requirements'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('country_of_origin')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch user profile',
      }, { status: 500 })
    }

    const countryCode = profile?.country_of_origin
    if (!countryCode) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No country set in profile',
      })
    }

    const visaReqs = visaRequirements[countryCode]
    if (!visaReqs) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No visa requirements found',
      })
    }

    return NextResponse.json({
      success: true,
      data: visaReqs,
    })

  } catch (error) {
    console.error('visa-requirements API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
