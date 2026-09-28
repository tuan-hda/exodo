import { beforeEach, expect, it, vi } from 'vitest'
import { getLastImportedAt, updateLastImportedAt } from './gmail-import-state'
import { GmailDisconnectedError } from './gmail-api'

const mocks = vi.hoisted(() => ({ from: vi.fn(), select: vi.fn(), eq: vi.fn(), update: vi.fn(), result: vi.fn() }))
vi.mock('@/lib/supabase-admin', () => ({
  createAdminSupabaseClient: () => {
    const query = {
      select: (columns: string) => {
        mocks.select(columns)
        return query
      },
      eq: (column: string, value: string) => {
        mocks.eq(column, value)
        return query
      },
      update: (value: unknown) => {
        mocks.update(value)
        return query
      },
      maybeSingle: mocks.result,
    }
    return {
      from: (table: string) => {
        mocks.from(table)
        return query
      },
    }
  },
}))
beforeEach(() => {
  vi.clearAllMocks()
  mocks.result.mockResolvedValue({ data: null, error: null })
})

it('reads only the signed-in user import timestamp without updating it', async () => {
  mocks.result.mockResolvedValue({ data: { last_imported_at: '2026-09-27T07:00:00+00:00' }, error: null })
  expect(await getLastImportedAt('owner')).toBe('2026-09-27T07:00:00.000Z')
  expect(mocks.from).toHaveBeenCalledWith('google_connections')
  expect(mocks.select).toHaveBeenCalledExactlyOnceWith('last_imported_at')
  expect(mocks.eq).toHaveBeenCalledWith('user_id', 'owner')
  expect(mocks.update).not.toHaveBeenCalled()
})

it('returns null before the first import', async () => {
  expect(await getLastImportedAt('owner')).toBeNull()
  mocks.result.mockResolvedValue({ data: { last_imported_at: null }, error: null })
  expect(await getLastImportedAt('owner')).toBeNull()
})

it('updates the timestamp on the user existing connection', async () => {
  const lastImportedAt = '2026-09-27T07:00:00.000Z'
  mocks.result.mockResolvedValue({ data: { last_imported_at: lastImportedAt }, error: null })
  expect(await updateLastImportedAt('owner', lastImportedAt)).toBe(lastImportedAt)
  expect(mocks.update).toHaveBeenCalledWith({ last_imported_at: lastImportedAt, updated_at: expect.any(String) })
  expect(mocks.eq).toHaveBeenCalledWith('user_id', 'owner')
})

it('does not report a successful update when the connection is missing', async () => {
  await expect(updateLastImportedAt('owner', '2026-09-27T07:00:00.000Z')).rejects.toBeInstanceOf(GmailDisconnectedError)
})

it('propagates database read and write failures', async () => {
  const error = new Error('Database unavailable')
  mocks.result.mockResolvedValue({ data: null, error })
  await expect(getLastImportedAt('owner')).rejects.toBe(error)
  await expect(updateLastImportedAt('owner', '2026-09-27T07:00:00.000Z')).rejects.toBe(error)
})
