import { isRecord } from '@/lib/guards'

export type BillSplit = { config?: string; testOnly?: boolean }
export type BillSplitResult = { people: number; share: number }

export class RatioError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

export function parseBillSplit(value: unknown): BillSplit | null | undefined {
  if (value === undefined || value === null) return undefined
  if (!isRecord(value)) return null
  if (value.config !== undefined && (typeof value.config !== 'string' || !value.config || value.config.length > 64))
    return null
  if (value.testOnly !== undefined && typeof value.testOnly !== 'boolean') return null
  return { config: value.config as string | undefined, testOnly: value.testOnly as boolean | undefined }
}

// Ratio bills everyone else `share` each; the owner keeps the rest (rounding lands on the owner).
export function ownerShare(amount: number, result: BillSplitResult) {
  return amount - result.people * result.share
}

// Server-only. The idempotency key makes retries return the first result instead of billing people twice.
export async function splitBill(input: { key: string; title: string; amount: number } & BillSplit) {
  const url = process.env.RATIO_API_URL
  const apiKey = process.env.RATIO_API_KEY
  if (!url || !apiKey) throw new RatioError('Bill split is not configured.', 503)
  const response = await fetch(new URL('/api/external/split', url), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': input.key,
    },
    body: JSON.stringify({ title: input.title, amount: input.amount, config: input.config, testOnly: input.testOnly }),
    cache: 'no-store',
  })
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = isRecord(body) && typeof body.error === 'string' ? body.error : 'Bill split failed.'
    throw new RatioError(error, response.status)
  }
  if (
    !isRecord(body) ||
    !Number.isSafeInteger(body.people) ||
    !Number.isSafeInteger(body.share) ||
    (body.people as number) < 1 ||
    (body.share as number) < 1
  )
    throw new RatioError('Unexpected bill split response.', 502)
  return { people: body.people as number, share: body.share as number }
}

export async function splitKey(...parts: string[]) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(parts)))
  return `exodo-${Buffer.from(digest).toString('hex')}`
}
