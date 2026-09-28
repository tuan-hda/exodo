import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { connectGmail, gmailOAuthStateCookie } from '@/features/gmail/gmail-service'
import { gmailErrorLogDetails } from '@/features/gmail/gmail-api'

export async function GET(request: Request) {
  const { userId } = await auth()
  const requestUrl = new URL(request.url)
  const redirectToNotifications = (result: string) =>
    NextResponse.redirect(new URL(`/?tab=notifications&gmail=${encodeURIComponent(result)}`, requestUrl.origin))
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const cookieStore = await cookies()
  const [savedState, savedUserId] = cookieStore.get(gmailOAuthStateCookie)?.value.split('.') ?? []
  cookieStore.delete(gmailOAuthStateCookie)
  if (!code || !state || !savedState || state !== savedState || savedUserId !== userId) {
    return redirectToNotifications('error')
  }

  try {
    await connectGmail(userId, code)
    return redirectToNotifications('connected')
  } catch (error) {
    console.error('Failed to connect Gmail', gmailErrorLogDetails(error))
    return redirectToNotifications('error')
  }
}
