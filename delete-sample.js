const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function deleteSampleUniversity() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Find and delete any sample/test universities
  const { data, error } = await supabase
    .from('application_states')
    .select('*')
    .ilike('university_name', '%sample%')

  if (error) {
    console.error('Error finding sample universities:', error)
    return
  }

  console.log('Found sample universities:', data)

  if (data && data.length > 0) {
    const ids = data.map(item => item.id)
    const { error: deleteError } = await supabase
      .from('application_states')
      .delete()
      .in('id', ids)

    if (deleteError) {
      console.error('Error deleting:', deleteError)
    } else {
      console.log('Successfully deleted ' + data.length + ' sample university entries')
    }
  } else {
    console.log('No sample universities found')
  }
}

deleteSampleUniversity().then(() => process.exit(0))
