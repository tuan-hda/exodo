import { beforeEach, expect, it, vi } from 'vitest'
import { auth } from '@clerk/nextjs/server'
import { POST } from '@/app/api/notifications/captures/import/route'
import { captureFixture } from './test-fixture'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  in: vi.fn(),
  rpc: vi.fn(),
  splitBill: vi.fn(),
  reportPayment: vi.fn(),
}))
vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }))
vi.mock('../bill-split/ratio-client', async (original) => ({
  ...(await original<typeof import('../bill-split/ratio-client')>()),
  splitBill: mocks.splitBill,
  reportPayment: mocks.reportPayment,
}))
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

it.each(['unsupported', 'Số tiền 0 đ'])('does not import unparsed or zero amounts: %s', async (message) => {
  mocks.in.mockResolvedValue({ data: [{ ...row, payload: { ...capture, message } }], error: null })
  expect((await POST(request())).status).toBe(400)
  expect(mocks.rpc).not.toHaveBeenCalled()
})

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

it('bills ratio before importing and records only the owner share', async () => {
  mocks.splitBill.mockResolvedValue({ people: 2, share: 15000 })
  const split = { ...item, divided: false, split: { config: 'more' } }
  expect((await POST(request({ items: [split] }))).status).toBe(200)
  const [input] = mocks.splitBill.mock.calls[0]
  expect(input).toMatchObject({ title: 'Coffee', amount: 47000, config: 'more' })
  expect(input.key).toMatch(/^exodo-[0-9a-f]{64}$/)
  expect(mocks.rpc.mock.calls[0][1].p_items[0].entry.amount).toBe(17000)
  expect(mocks.splitBill.mock.invocationCallOrder[0]).toBeLessThan(mocks.rpc.mock.invocationCallOrder[0])
})

it('does not import when ratio rejects the split', async () => {
  const { RatioError } = await import('../bill-split/ratio-client')
  mocks.splitBill.mockRejectedValue(new RatioError('unknown config', 400))
  const response = await POST(request({ items: [{ ...item, divided: false, split: { config: 'nope' } }] }))
  expect(response.status).toBe(400)
  expect(await response.json()).toEqual({ error: 'Bill split: unknown config' })
  expect(mocks.rpc).not.toHaveBeenCalled()
})

it.each([{ split: { config: 1 } }, { divided: true, split: {} }])(
  'rejects invalid split options: %j',
  async (extra) => {
    expect((await POST(request({ items: [{ ...item, divided: false, ...extra }] }))).status).toBe(400)
    expect(mocks.splitBill).not.toHaveBeenCalled()
  },
)

const income = (content: string) => ({
  ...row,
  payload: {
    ...capture,
    message: `Số tiền +200.000 đ\nNgày giờ giao dịch 11/10/2026, 15:31:40\nNội dung giao dịch ${content}`,
  },
})

it('sends incoming transfers to ratio before importing and returns its results', async () => {
  mocks.in.mockResolvedValue({ data: [income('RATIO PTTU 7')], error: null })
  mocks.reportPayment.mockResolvedValue({ result: 'done', billId: 7 })
  const response = await POST(request({ items: [{ ...item, category: 'Income', divided: false }] }))
  expect(response.status).toBe(200)
  expect(mocks.reportPayment).toHaveBeenCalledWith({ content: 'RATIO PTTU 7', amount: 200000 })
  expect(mocks.reportPayment.mock.invocationCallOrder[0]).toBeLessThan(mocks.rpc.mock.invocationCallOrder[0])
  expect((await response.json()).payments).toEqual([{ result: 'done', billId: 7 }])
})

it('imports even when ratio fails, and hides transfers without a bill id', async () => {
  mocks.in.mockResolvedValue({ data: [income('Luong')], error: null })
  mocks.reportPayment.mockResolvedValue({ result: 'no_bill_id' })
  const quiet = await POST(request({ items: [{ ...item, category: 'Income', divided: false }] }))
  expect(await quiet.json()).not.toHaveProperty('payments')

  mocks.reportPayment.mockRejectedValue(new Error('offline'))
  const failed = await POST(request({ items: [{ ...item, category: 'Income', divided: false }] }))
  expect(failed.status).toBe(200)
  expect((await failed.json()).payments).toEqual([{ result: 'failed' }])
})

it('does not send expenses to ratio', async () => {
  await POST(request())
  expect(mocks.reportPayment).not.toHaveBeenCalled()
})
