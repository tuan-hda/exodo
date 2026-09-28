import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { GmailDisconnectedError } from './gmail-api'

export async function getLastImportedAt(userId: string): Promise<string | null> {
  const { data, error } = await createAdminSupabaseClient()
    .from('google_connections')
    .select('last_imported_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data?.last_imported_at ? new Date(data.last_imported_at).toISOString() : null
}

export async function updateLastImportedAt(userId: string, lastImportedAt: string): Promise<string> {
  const { data, error } = await createAdminSupabaseClient()
    .from('google_connections')
    .update({ last_imported_at: lastImportedAt, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('last_imported_at')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new GmailDisconnectedError()
  return new Date(data.last_imported_at).toISOString()
}
