import { beforeEach, expect, it, vi } from 'vitest'
import { auth } from '@clerk/nextjs/server'
import { POST } from '@/app/api/notifications/captures/import/route'
import { captureFixture } from './test-fixture'

const mocks = vi.hoisted(() => ({ from: vi.fn(), in: vi.fn(), rpc: vi.fn() }))
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('../../lib/supabase-admin', () => ({ createAdminSupabaseClient: () => ({ from: mocks.from, rpc: mocks.rpc }) }))

const capture = {
  ...captureFixture,
  type: 'mail',
  source_app: 'gmail',
  title: '[CAKE] Thông báo giao dịch thành công',
  message: 'Số tiền -47.000 đ\nNgày giờ giao dịch 11/10/2026, 15:31:40\nNội dung giao dịch Chuyen tien',
}
const row = {
  device_id: capture.device_id,
  event_id: capture.event_id,
  payload: capture,
  type: 'mail',
  received_at: '2026-10-11T12:00:00Z',
}
const item = {
  device_id: capture.device_id,
  event_id: capture.event_id,
  name: 'Coffee',
  category: 'Dining',
  divided: true,
}
const request = (body: unknown = { items: [item] }) =>
  new Request('https://exodo.test/api/notifications/captures/import', { method: 'POST', body: JSON.stringify(body) })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({ userId: 'owner' } as Awaited<ReturnType<typeof auth>>)
  mocks.from.mockReturnValue({ select: () => ({ in: mocks.in }) })
  mocks.in.mockResolvedValue({ data: [row], error: null })
  mocks.rpc.mockResolvedValue({ data: { imported: 1, deleted: 4, cutoff: capture.captured_at }, error: null })
})

it('requires authentication before accessing captures', async () => {
  vi.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>)
  expect((await POST(request())).status).toBe(401)
  expect(mocks.from).not.toHaveBeenCalled()
  expect(mocks.rpc).not.toHaveBeenCalled()
})

it('reparses the stored amount, applies edits, and atomically saves under the authenticated user', async () => {
  const response = await POST(request({ userId: 'attacker', cutoff: '2999-01-01', items: [{ ...item, amount: 1 }] }))
  expect(response.status).toBe(200)
  expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  const [name, args] = mocks.rpc.mock.calls[0]
  expect(name).toBe('import_captures')
  expect(args.p_user_id).toBe('owner')
  expect(args.p_items).toEqual([
    {
      device_id: capture.device_id,
      event_id: capture.event_id,
      payload: capture,
      entry: {
        id: JSON.stringify(['capture', 'owner', capture.device_id, capture.event_id]),
        type: 'expense',
        amount: 23500,
        occurredAt: '2026-10-11T15:31:40',
        title: 'Coffee',
        category: 'Dining',
      },
    },
  ])
  expect(args).not.toHaveProperty('cutoff')
})

it.each([null, {}, { items: [] }, { items: [item, item] }, { items: [{ ...item, divided: 'yes' }] }])(
  'rejects invalid or duplicate selections: %j',
  async (body) => {
    expect((await POST(request(body))).status).toBe(400)
    expect(mocks.rpc).not.toHaveBeenCalled()
  },
)

it('does not save or delete when the selected capture disappeared', async () => {
  mocks.in.mockResolvedValue({ data: [], error: null })
  expect((await POST(request())).status).toBe(409)
  expect(mocks.rpc).not.toHaveBeenCalled()
})

it.each(['unsupported', 'Số tiền 0 đ'])(
  'does not import unparsed or zero amounts: %s',
  async (message) => {
    mocks.in.mockResolvedValue({ data: [{ ...row, payload: { ...capture, message } }], error: null })
    expect((await POST(request())).status).toBe(400)
    expect(mocks.rpc).not.toHaveBeenCalled()
  },
)

it('does not report success when the atomic database operation fails', async () => {
  const error = { code: '42501', message: 'Migration required' }
  mocks.rpc.mockResolvedValue({ data: null, error })
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    expect((await POST(request())).status).toBe(503)
    expect(log).toHaveBeenCalledWith('[capture-import]', expect.objectContaining(error))
  } finally {
    log.mockRestore()
  }
})
