import { NextResponse } from 'next/server'
import { gmailErrorStatus, isGmailGrantExpired, GmailDisconnectedError } from './gmail-api'

export const gmailNoStoreHeaders = { 'Cache-Control': 'private, no-store' }

export function gmailRouteError(error: unknown) {
  const reconnect = isGmailGrantExpired(error) || gmailErrorStatus(error) === 401
  const disconnected = error instanceof GmailDisconnectedError
  const notFound = gmailErrorStatus(error) === 404
  const status = reconnect || disconnected ? 409 : notFound ? 404 : 502
  const message = reconnect
    ? 'Gmail access has expired. Reconnect Gmail to read your emails.'
    : disconnected
      ? 'Connect Gmail to read your emails.'
      : notFound
        ? 'This email is no longer available.'
        : 'Could not read Gmail. Please try again.'
  return NextResponse.json(
    { error: message, reconnect: reconnect || disconnected },
    { status, headers: gmailNoStoreHeaders },
  )
}
