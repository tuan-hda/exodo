import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { listGmailMessages } from '@/features/gmail/gmail-messages'
import { gmailNoStoreHeaders, gmailRouteError } from '@/features/gmail/gmail-route-error'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: gmailNoStoreHeaders })
  const pageToken = new URL(request.url).searchParams.get('pageToken') ?? undefined
  if (pageToken && pageToken.length > 2048)
    return NextResponse.json({ error: 'Invalid page token.' }, { status: 400, headers: gmailNoStoreHeaders })
  try {
    return NextResponse.json(await listGmailMessages(userId, pageToken), { headers: gmailNoStoreHeaders })
  } catch (error) {
    return gmailRouteError(error)
  }
}
