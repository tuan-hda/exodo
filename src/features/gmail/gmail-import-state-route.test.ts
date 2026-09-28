import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { auth } from '@clerk/nextjs/server'
import { GET, PATCH } from '@/app/api/gmail/import-state/route'
import { getLastImportedAt, updateLastImportedAt } from './gmail-import-state'

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('./gmail-import-state', () => ({ getLastImportedAt: vi.fn(), updateLastImportedAt: vi.fn() }))

const lastImportedAt = '2026-09-27T07:00:00.000Z'
const request = (body: unknown) =>
  new Request('https://exodo.test/api/gmail/import-state', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
beforeEach(() => {
  vi.mocked(auth).mockResolvedValue({ userId: 'owner' } as Awaited<ReturnType<typeof auth>>)
  vi.mocked(getLastImportedAt).mockResolvedValue(null)
  vi.mocked(updateLastImportedAt).mockResolvedValue(lastImportedAt)
})
afterEach(() => vi.resetAllMocks())

it('rejects signed-out reads and writes before touching the database', async () => {
  vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)
  expect((await GET()).status).toBe(401)
  expect((await PATCH(request({ lastImportedAt }))).status).toBe(401)
  expect(getLastImportedAt).not.toHaveBeenCalled()
  expect(updateLastImportedAt).not.toHaveBeenCalled()
})

it('reads the timestamp without advancing it and disables HTTP caching', async () => {
  const response = await GET()
  expect(await response.json()).toEqual({ lastImportedAt: null })
  expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  expect(getLastImportedAt).toHaveBeenCalledExactlyOnceWith('owner')
  expect(updateLastImportedAt).not.toHaveBeenCalled()
})

it('updates only the authenticated user timestamp', async () => {
  const response = await PATCH(request({ lastImportedAt, userId: 'someone-else' }))
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ lastImportedAt })
  expect(updateLastImportedAt).toHaveBeenCalledExactlyOnceWith('owner', lastImportedAt)
  expect(response.headers.get('Cache-Control')).toBe('private, no-store')
})

it.each([
  null,
  {},
  { lastImportedAt: 42 },
  { lastImportedAt: 'invalid' },
  { lastImportedAt: '2026-02-31T07:00:00.000Z' },
  { lastImportedAt: '2999-01-01T00:00:00.000Z' },
])('rejects an invalid timestamp: %j', async (body) => {
  expect((await PATCH(request(body))).status).toBe(400)
  expect(updateLastImportedAt).not.toHaveBeenCalled()
})

it('rejects malformed JSON', async () => {
  const response = await PATCH(new Request('https://exodo.test/api/gmail/import-state', { method: 'PATCH', body: '{' }))
  expect(response.status).toBe(400)
  expect(updateLastImportedAt).not.toHaveBeenCalled()
})

it('does not leak database errors or report a successful failed write', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    vi.mocked(updateLastImportedAt).mockRejectedValue(new Error('secret database configuration'))
    const response = await PATCH(request({ lastImportedAt }))
    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain('secret')
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret')
  } finally {
    log.mockRestore()
  }
})
