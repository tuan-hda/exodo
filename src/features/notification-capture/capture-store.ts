import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminSupabaseClient } from '../../lib/supabase-admin'
import { parseCapture, type CaptureEvent } from './contract'

export type PersistCapture = (capture: CaptureEvent) => Promise<'stored' | 'conflict'>

export function createCaptureStore(client: SupabaseClient = createAdminSupabaseClient()): PersistCapture {
  return async (capture) => {
    const inserted = await client.from('notification_captures').insert({
      device_id: capture.device_id,
      event_id: capture.event_id,
      type: capture.type,
      payload: capture,
    })
    if (!inserted.error) return 'stored'
    if (inserted.error.code !== '23505') throw inserted.error

    const existing = await client
      .from('notification_captures')
      .select('payload')
      .eq('device_id', capture.device_id)
      .eq('event_id', capture.event_id)
      .single()
    if (existing.error) throw existing.error
    if (!existing.data) throw new Error('Capture duplicate verification returned no row')
    const previous = parseCapture(existing.data.payload)
    return JSON.stringify(previous) === JSON.stringify(capture) ? 'stored' : 'conflict'
  }
}
