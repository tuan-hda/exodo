import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isGmailOwner } from '@/features/gmail/access'
import { getGmailConnection } from '@/features/gmail/gmail-service'

const noStoreHeaders = { 'Cache-Control': 'private, no-store' }

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ connected: false }, { status: 401, headers: noStoreHeaders })
  if (!isGmailOwner(userId)) return NextResponse.json({ connected: false }, { status: 403, headers: noStoreHeaders })

  try {
    const email = await getGmailConnection(userId)
    return NextResponse.json({ connected: Boolean(email), email }, { headers: noStoreHeaders })
  } catch {
    return NextResponse.json({ connected: false }, { status: 500, headers: noStoreHeaders })
  }
}
