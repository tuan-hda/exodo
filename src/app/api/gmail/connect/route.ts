import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isGmailOwner } from '../../../../features/gmail/access'
import { createGmailAuthorizationUrl, gmailOAuthStateCookie } from '../../../../features/gmail/gmail-service'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  if (!isGmailOwner(userId)) return new NextResponse('Gmail is not enabled for this account.', { status: 403 })

  const state = crypto.randomUUID()
  const url = createGmailAuthorizationUrl(state)
  if (!url) return new NextResponse('Gmail OAuth is not configured.', { status: 503 })
  const cookieStore = await cookies()
  cookieStore.set(gmailOAuthStateCookie, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/api/gmail',
  })

  return NextResponse.redirect(url)
}
