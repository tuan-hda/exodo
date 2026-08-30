import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isGmailOwner } from '../../../../features/gmail/access'
import { getGmailConnection } from '../../../../features/gmail/gmail-service'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ connected: false }, { status: 401 })
  if (!isGmailOwner(userId)) return NextResponse.json({ connected: false }, { status: 403 })

  try {
    const email = await getGmailConnection(userId)
    return NextResponse.json({ connected: Boolean(email), email })
  } catch {
    return NextResponse.json({ connected: false }, { status: 500 })
  }
}
