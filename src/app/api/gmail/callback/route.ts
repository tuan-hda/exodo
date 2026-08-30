import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isGmailOwner } from '../../../../features/gmail/access'
import { connectGmail, gmailOAuthStateCookie } from '../../../../features/gmail/gmail-service'

export async function GET(request: Request) {
  const { userId } = await auth()
  const requestUrl = new URL(request.url)
  const redirectToNotifications = (result: string) =>
    NextResponse.redirect(new URL(`/\?tab=notifications&gmail=${result}`, requestUrl.origin))
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  if (!isGmailOwner(userId)) return new NextResponse('Gmail is not enabled for this account.', { status: 403 })

  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const cookieStore = await cookies()
  const savedState = cookieStore.get(gmailOAuthStateCookie)?.value
  cookieStore.delete(gmailOAuthStateCookie)
  if (!code || !state || !savedState || state !== savedState) return redirectToNotifications('error')

  try {
    await connectGmail(userId, code)
    return redirectToNotifications('connected')
  } catch (error) {
    console.error('Failed to connect Gmail', error)
    return redirectToNotifications('error')
  }
}
