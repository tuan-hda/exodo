import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabaseClient } from '../../lib/supabase-admin'
import { parseCapture, type CaptureEvent } from './contract'

export type PersistCapture = (capture: CaptureEvent) => Promise<'stored' | 'conflict'>

export function createCaptureStore(
  userId: string,
  client: SupabaseClient = createAdminSupabaseClient(),
): PersistCapture {
  if (!userId.trim()) throw new Error('EXODO_SHORTCUT_USER_ID is required')
  return async (capture) => {
    const inserted = await client.from('notification_captures').insert({
      user_id: userId,
      device_id: capture.device_id,
      event_id: capture.event_id,
      payload: capture,
    })
    if (!inserted.error) return 'stored'
    if (inserted.error.code !== '23505') throw new Error('Capture database write failed')

    const existing = await client
      .from('notification_captures')
      .select('payload')
      .eq('user_id', userId)
      .eq('device_id', capture.device_id)
      .eq('event_id', capture.event_id)
      .single()
    if (existing.error || !existing.data) throw new Error('Capture duplicate verification failed')
    const previous = parseCapture(existing.data.payload)
    return JSON.stringify(previous) === JSON.stringify(capture) ? 'stored' : 'conflict'
  }
}
