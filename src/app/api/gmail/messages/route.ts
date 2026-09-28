import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCachedGmailMessages, invalidateGmailCache } from '@/features/gmail/gmail-cache'
import { getGmailConnection } from '@/features/gmail/gmail-service'
import { GmailDisconnectedError } from '@/features/gmail/gmail-api'
import { gmailNoStoreHeaders, gmailRouteError } from '@/features/gmail/gmail-route-error'

export async function GET(request: Request) {
  const logPrefix = `[gmail/messages:${crypto.randomUUID().slice(0, 8)}]`
  console.info(`${logPrefix} request Cache-Control: ${request.headers.get('cache-control') ?? '(absent)'}`)
  async function timed<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startedAt = performance.now()
    console.info(`${logPrefix} ${name} started`)
    try {
      return await operation()
    } finally {
      console.info(`${logPrefix} ${name} elapsed: ${(performance.now() - startedAt).toFixed(1)}ms`)
    }
  }

  const { userId } = await timed('auth', () => auth())
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: gmailNoStoreHeaders })
  const query = new URL(request.url).searchParams
  const pageToken = query.get('pageToken') ?? undefined
  if (pageToken && pageToken.length > 2048)
    return NextResponse.json({ error: 'Invalid page token.' }, { status: 400, headers: gmailNoStoreHeaders })
  try {
    const connection = await timed('getGmailConnection', () => getGmailConnection(userId))
    if (!connection) throw new GmailDisconnectedError()
    if (query.get('refresh') === '1') invalidateGmailCache(userId)
    const messages = await timed('getCachedGmailMessages', () =>
      getCachedGmailMessages(userId, connection.email, pageToken, connection.lastImportedAt),
    )
    return NextResponse.json(messages, { headers: gmailNoStoreHeaders })
  } catch (error) {
    return gmailRouteError(error)
  }
}
