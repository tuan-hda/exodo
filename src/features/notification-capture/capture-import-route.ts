import { auth } from '@clerk/nextjs/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { isRecord } from '@/lib/guards'
import { parseCapture } from '@/features/notification-capture/contract'
import { parseCaptureTransaction } from '@/features/notification-capture/capture-parser'
import { captureEntry, captureKey, prepareCapture } from '@/features/notification-capture/capture-review'
import { captureErrorDetails } from '@/features/notification-capture/receive-capture'

const headers = { 'Cache-Control': 'private, no-store' }

export async function importCaptureRequest(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401, headers })
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid import.' }, { status: 400, headers })
  }
  if (
    !isRecord(body) ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > 200 ||
    !body.items.every(
      (item) =>
        isRecord(item) &&
        typeof item.device_id === 'string' &&
        typeof item.event_id === 'string' &&
        typeof item.name === 'string' &&
        item.name.length <= 1000 &&
        typeof item.category === 'string' &&
        item.category.length > 0 &&
        item.category.length <= 100 &&
        typeof item.divided === 'boolean',
    )
  ) {
    return Response.json({ error: 'Select between 1 and 200 valid transactions.' }, { status: 400, headers })
  }
  const items = body.items as {
    device_id: string
    event_id: string
    name: string
    category: string
    divided: boolean
  }[]
  if (new Set(items.map(captureKey)).size !== items.length) {
    return Response.json({ error: 'Duplicate selection.' }, { status: 400, headers })
  }
  try {
    const client = createAdminSupabaseClient()
    const { data, error } = await client
      .from('notification_captures')
      .select('device_id,event_id,payload,type,received_at')
      .in(
        'event_id',
        items.map((item) => item.event_id),
      )
    if (error) throw error
    const batch = []
    for (const item of items) {
      const row = data?.find((row) => row.device_id === item.device_id && row.event_id === item.event_id)
      if (!row)
        return Response.json({ error: 'Selected captures changed. Refresh the inbox.' }, { status: 409, headers })
      const capture = parseCapture({ ...row.payload, type: row.type })
      const review = {
        ...prepareCapture({ ...capture, received_at: row.received_at, transaction: parseCaptureTransaction(capture) }),
        ...item,
      }
      const entry = review.transaction ? captureEntry(review) : null
      if (!entry)
        return Response.json({ error: 'Deselect transactions without a valid amount.' }, { status: 400, headers })
      entry.id = JSON.stringify(['capture', userId, item.device_id, item.event_id])
      batch.push({ device_id: item.device_id, event_id: item.event_id, payload: row.payload, entry })
    }
    const result = await client.rpc('import_captures', { p_user_id: userId, p_items: batch })
    if (result.error) throw result.error
    return Response.json(result.data, { headers })
  } catch (error) {
    console.error('[capture-import]', captureErrorDetails(error))
    return Response.json({ error: 'Import failed. Refresh the inbox before retrying.' }, { status: 503, headers })
  }
}
