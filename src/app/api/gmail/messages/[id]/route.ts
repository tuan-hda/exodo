import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { readGmailMessage } from '@/features/gmail/gmail-messages'
import { gmailNoStoreHeaders, gmailRouteError } from '@/features/gmail/gmail-route-error'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: gmailNoStoreHeaders })
  const { id } = await context.params
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id))
    return NextResponse.json({ error: 'Invalid message ID.' }, { status: 400, headers: gmailNoStoreHeaders })
  try {
    return NextResponse.json(await readGmailMessage(userId, id), { headers: gmailNoStoreHeaders })
  } catch (error) {
    return gmailRouteError(error)
  }
}
