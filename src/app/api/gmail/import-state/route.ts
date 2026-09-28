import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isRecord } from '@/lib/guards'
import { getLastImportedAt, updateLastImportedAt } from '@/features/gmail/gmail-import-state'
import { GmailDisconnectedError, gmailErrorLogDetails } from '@/features/gmail/gmail-api'
import { gmailNoStoreHeaders } from '@/features/gmail/gmail-route-error'

function importStateError(error: unknown) {
  console.error('Failed to access Gmail import state', gmailErrorLogDetails(error))
  return NextResponse.json(
    { error: error instanceof GmailDisconnectedError ? 'Connect Gmail first.' : 'Could not access import state.' },
    { status: error instanceof GmailDisconnectedError ? 409 : 500, headers: gmailNoStoreHeaders },
  )
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: gmailNoStoreHeaders })
  try {
    return NextResponse.json({ lastImportedAt: await getLastImportedAt(userId) }, { headers: gmailNoStoreHeaders })
  } catch (error) {
    return importStateError(error)
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: gmailNoStoreHeaders })
  const body: unknown = await request.json().catch(() => null)
  const lastImportedAt = isRecord(body) ? body.lastImportedAt : null
  const timestamp = typeof lastImportedAt === 'string' ? Date.parse(lastImportedAt) : NaN
  if (
    typeof lastImportedAt !== 'string' ||
    !Number.isFinite(timestamp) ||
    timestamp > Date.now() ||
    new Date(timestamp).toISOString() !== lastImportedAt
  ) {
    return NextResponse.json(
      { error: 'Provide a valid past ISO timestamp.' },
      { status: 400, headers: gmailNoStoreHeaders },
    )
  }
  try {
    return NextResponse.json(
      { lastImportedAt: await updateLastImportedAt(userId, lastImportedAt) },
      { headers: gmailNoStoreHeaders },
    )
  } catch (error) {
    return importStateError(error)
  }
}
