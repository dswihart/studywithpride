import { createClient } from '@/lib/supabase/server'

export async function updateLeadContactStatus(leadId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({
      contact_status: status,
      last_contact_date: new Date().toISOString(),
    })
    .eq('id', leadId)

  if (error) {
    throw error
  }
}
