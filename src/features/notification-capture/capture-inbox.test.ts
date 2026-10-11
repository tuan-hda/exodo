import { beforeEach, expect, it, vi } from 'vitest'
import { auth } from '@clerk/nextjs/server'
import { GET } from '@/app/api/notifications/captures/route'
import { listCaptures } from './capture-inbox'
import { captureFixture } from './test-fixture'
import { parseCaptureTransaction } from './capture-parser'

const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), order: vi.fn(), range: vi.fn() }))
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('../../lib/supabase-admin', () => ({ createAdminSupabaseClient: () => ({ from: mocks.from }) }))

const request = (query = '') => new Request(`https://exodo.test/api/notifications/captures${query}`)
const row = { payload: captureFixture, type: 'notification', received_at: '2026-10-11T12:00:00.000Z' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({ userId: 'owner' } as Awaited<ReturnType<typeof auth>>)
  const query = { select: mocks.select, order: mocks.order, range: mocks.range }
  mocks.from.mockReturnValue(query)
  mocks.select.mockReturnValue(query)
  mocks.order.mockReturnValue(query)
  mocks.range.mockResolvedValue({ data: [], error: null })
})

it('rejects signed-out requests before reading captures', async () => {
  vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)
  expect((await GET(request())).status).toBe(401)
  expect(mocks.from).not.toHaveBeenCalled()
})

it('reads both notification and mail captures without Gmail connection and prevents caching', async () => {
  const mail = { ...row, type: 'mail', payload: { ...captureFixture, event_id: 'gmail-message', source_app: 'gmail' } }
  mocks.range.mockResolvedValue({ data: [row, mail], error: null })
  const response = await GET(request())
  expect(response.status).toBe(200)
  expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  expect(await response.json()).toEqual({
    captures: [
      { ...captureFixture, received_at: row.received_at, transaction: parseCaptureTransaction(captureFixture) },
      { ...mail.payload, type: 'mail', received_at: row.received_at, transaction: null },
    ],
    nextOffset: null,
  })
  expect(mocks.from).toHaveBeenCalledWith('notification_captures')
})

it('returns fifty records with a next page only when another record exists', async () => {
  mocks.range.mockResolvedValue({ data: Array.from({ length: 51 }, () => row), error: null })
  const page = await listCaptures(50)
  expect(page.captures).toHaveLength(50)
  expect(page.nextOffset).toBe(100)
  expect(mocks.range).toHaveBeenCalledWith(50, 100)
  expect(mocks.order.mock.calls).toEqual([
    ['received_at', { ascending: false }],
    ['device_id', { ascending: false }],
    ['event_id', { ascending: false }],
  ])
})

it('does not offer another page for exactly fifty records', async () => {
  mocks.range.mockResolvedValue({ data: Array.from({ length: 50 }, () => row), error: null })
  expect((await listCaptures(0)).nextOffset).toBeNull()
})

it.each(['-1', 'abc', '1.5', '', '9007199254740991'])('rejects invalid offsets: %s', async (offset) => {
  expect((await GET(request(`?offset=${offset}`))).status).toBe(400)
  expect(mocks.from).not.toHaveBeenCalled()
})

it('logs the original database error and returns a retryable failure', async () => {
  const error = { code: '42P01', message: 'Table missing', details: 'notification_captures', hint: 'Apply migration' }
  mocks.range.mockResolvedValue({ data: null, error })
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    const response = await GET(request())
    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'Could not load captures. Please try again.' })
    expect(log).toHaveBeenCalledWith('[capture-inbox]', expect.objectContaining(error))
  } finally {
    log.mockRestore()
  }
})
