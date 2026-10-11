import { auth } from '@clerk/nextjs/server'
import { listCaptures } from '@/features/notification-capture/capture-inbox'
import { captureErrorDetails } from '@/features/notification-capture/receive-capture'

const headers = { 'Cache-Control': 'private, no-store' }

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401, headers })
  const value = new URL(request.url).searchParams.get('offset') ?? '0'
  const offset = Number(value)
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(offset) || offset > Number.MAX_SAFE_INTEGER - 50) {
    return Response.json({ error: 'Invalid page offset.' }, { status: 400, headers })
  }
  try {
    // Captures share one store in this single-user app.
    return Response.json(await listCaptures(offset), { headers })
  } catch (error) {
    console.error('[capture-inbox]', captureErrorDetails(error))
    return Response.json({ error: 'Could not load captures. Please try again.' }, { status: 503, headers })
  }
}
