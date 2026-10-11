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
  it('inserts the complete normalized capture without user ownership', async () => {
    expect(await createCaptureStore()(capture)).toBe('stored')
    expect(mocks.from).toHaveBeenCalledWith('notification_captures')
    expect(mocks.insert).toHaveBeenCalledExactlyOnceWith({
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
    expect(await createCaptureStore()(capture)).toBe('stored')
    expect(mocks.eq.mock.calls).toEqual([
      ['device_id', capture.device_id],
      ['event_id', capture.event_id],
    ])
  })

  it('rejects conflicting retries while preserving the existing record', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    mocks.single.mockResolvedValue({ data: { payload: { ...capture, message: 'different content' } }, error: null })
    expect(await createCaptureStore()(capture)).toBe('conflict')
    expect(mocks.insert).toHaveBeenCalledTimes(1)
  })

  it('stores mail type in both the table column and payload', async () => {
    const mail = { ...capture, type: 'mail' as const }
    expect(await createCaptureStore()(mail)).toBe('stored')
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ type: 'mail', payload: mail }))
  })

  it('recognizes a notification retry against a legacy payload without type', async () => {
    const { type: _type, ...legacy } = capture
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    mocks.single.mockResolvedValue({ data: { payload: legacy }, error: null })
    expect(await createCaptureStore()(capture)).toBe('stored')
  })

  it('rejects a retry that changes the capture type', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    expect(await createCaptureStore()({ ...capture, type: 'mail' })).toBe('conflict')
  })

  it('fails closed on database write errors', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '42P01' } })
    await expect(createCaptureStore()(capture)).rejects.toThrow('database write failed')
    expect(mocks.single).not.toHaveBeenCalled()
  })

  it('fails closed when a duplicate cannot be verified', async () => {
    mocks.insert.mockResolvedValue({ error: { code: '23505' } })
    mocks.single.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    await expect(createCaptureStore()(capture)).rejects.toThrow('duplicate verification failed')
  })
})
