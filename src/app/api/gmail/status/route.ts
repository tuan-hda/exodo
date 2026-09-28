import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getGmailConnection } from '@/features/gmail/gmail-service'
import { gmailErrorLogDetails } from '@/features/gmail/gmail-api'

const noStoreHeaders = { 'Cache-Control': 'private, no-store' }

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ connected: false }, { status: 401, headers: noStoreHeaders })

  try {
    const email = await getGmailConnection(userId)
    return NextResponse.json({ connected: Boolean(email), email }, { headers: noStoreHeaders })
  } catch (error) {
    console.error('Failed to check Gmail connection status', gmailErrorLogDetails(error))
    return NextResponse.json({ connected: false }, { status: 500, headers: noStoreHeaders })
  }
}
