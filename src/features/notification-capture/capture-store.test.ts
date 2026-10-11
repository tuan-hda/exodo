import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCaptureStore } from './capture-store'
import { captureFixture as capture } from './test-fixture'

const mocks = vi.hoisted(() => ({ insert: vi.fn(), single: vi.fn(), eq: vi.fn(), from: vi.fn() }))
vi.mock('../../lib/supabase-admin', () => ({
  createAdminSupabaseClient: () => ({ from: mocks.from }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.insert.mockResolvedValue({ error: null })
  mocks.single.mockResolvedValue({ data: { payload: capture }, error: null })
  const query = { eq: mocks.eq, single: mocks.single }
  mocks.eq.mockReturnValue(query)
  mocks.from.mockReturnValue({ insert: mocks.insert, select: () => query })
})

describe('notification capture storage', () => {
  it('assigns server-controlled ownership and inserts the complete normalized capture', async () => {
    expect(await createCaptureStore('user_owner')(capture)).toBe('stored')
    expect(mocks.from).toHaveBeenCalledWith('notification_captures')
    expect(mocks.insert).toHaveBeenCalledExactlyOnceWith({
      user_id: 'user_owner',
      device_id: capture.device_id,
      event_id: capture.event_id,
      type: 'notification',
      payload: capture,
    })
    expect(mocks.single).not.toHaveBeenCalled()
  })

  it('acknowledges an identical retry without updating or overwriting its stored payload', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    const reordered = Object.fromEntries(Object.entries(capture).reverse())
    mocks.single.mockResolvedValue({ data: { payload: reordered }, error: null })
    expect(await createCaptureStore('user_owner')(capture)).toBe('stored')
    expect(mocks.eq.mock.calls).toEqual([
      ['user_id', 'user_owner'],
      ['device_id', capture.device_id],
      ['event_id', capture.event_id],
    ])
  })

  it('rejects conflicting retries while preserving the existing record', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    mocks.single.mockResolvedValue({ data: { payload: { ...capture, message: 'different content' } }, error: null })
    expect(await createCaptureStore('user_owner')(capture)).toBe('conflict')
    expect(mocks.insert).toHaveBeenCalledTimes(1)
  })

  it('stores mail type in both the table column and payload', async () => {
    const mail = { ...capture, type: 'mail' as const }
    expect(await createCaptureStore('user_owner')(mail)).toBe('stored')
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ type: 'mail', payload: mail }))
  })

  it('recognizes a notification retry against a legacy payload without type', async () => {
    const { type: _type, ...legacy } = capture
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    mocks.single.mockResolvedValue({ data: { payload: legacy }, error: null })
    expect(await createCaptureStore('user_owner')(capture)).toBe('stored')
  })

  it('rejects a retry that changes the capture type', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    expect(await createCaptureStore('user_owner')({ ...capture, type: 'mail' })).toBe('conflict')
  })

  it('fails closed on database write errors', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '42P01' } })
    await expect(createCaptureStore('user_owner')(capture)).rejects.toThrow('database write failed')
    expect(mocks.single).not.toHaveBeenCalled()
  })

  it('fails closed when a duplicate cannot be verified', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    mocks.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    await expect(createCaptureStore('user_owner')(capture)).rejects.toThrow('duplicate verification failed')
  })

  it('requires configured ownership', () => {
    expect(() => createCaptureStore(' ')).toThrow('EXODO_SHORTCUT_USER_ID')
  })
})
