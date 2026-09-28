import { isRecord } from '@/lib/guards'

export class GmailReadError extends Error {
  constructor(
    message: string,
    public reconnect = false,
  ) {
    super(message)
  }
}

export async function readGmailJson(path: string, signal: AbortSignal) {
  const response = await fetch(path, { signal })
  const value: unknown = await response.json()
  if (!response.ok) {
    throw new GmailReadError(
      isRecord(value) && typeof value.error === 'string' ? value.error : 'Could not read Gmail. Please try again.',
      isRecord(value) && value.reconnect === true,
    )
  }
  return value
}

export function formatEmailDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
