import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { parseCapture, type CaptureEvent } from './contract'
import { parseCaptureTransaction, type CaptureTransaction } from './capture-parser'

export type CaptureInboxItem = CaptureEvent & { received_at: string; transaction: CaptureTransaction | null }
export type CaptureInboxPage = { captures: CaptureInboxItem[]; nextOffset: number | null }

const PAGE_SIZE = 50

export async function listCaptures(offset: number): Promise<CaptureInboxPage> {
  const { data, error } = await createAdminSupabaseClient()
    .from('notification_captures')
    .select('payload,type,received_at')
    .order('received_at', { ascending: false })
    .order('device_id', { ascending: false })
    .order('event_id', { ascending: false })
    .range(offset, offset + PAGE_SIZE)
  if (error) throw error
  const rows = data ?? []
  return {
    captures: rows.slice(0, PAGE_SIZE).map((row) => {
      const capture = parseCapture({ ...row.payload, type: row.type })
      return { ...capture, received_at: row.received_at, transaction: parseCaptureTransaction(capture) }
    }),
    nextOffset: rows.length > PAGE_SIZE ? offset + PAGE_SIZE : null,
  }
}
