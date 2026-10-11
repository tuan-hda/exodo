import { expect, it } from 'vitest'
import { captureEntry, captureKey, captureSourceTime, prepareCapture, reviewAmount } from './capture-review'
import { parseCaptureTransaction } from './capture-parser'
import { captureFixture } from './test-fixture'

const capture = {
  ...captureFixture,
  received_at: '2026-10-11T12:00:00Z',
  transaction: { source: 'cake' as const, amount: -47000, occurredAt: '2026-10-11T08:31:40Z', content: 'Coffee' },
}

it('defaults categories by direction and imports the reviewed name and divided amount in Vietnam time', () => {
  const review = { ...prepareCapture(capture), divided: true, name: ' Coffee ' }
  expect(reviewAmount(review)).toBe(-23500)
  expect(captureEntry(review)).toMatchObject({
    type: 'expense',
    amount: 23500,
    title: 'Coffee',
    category: 'Dining',
    occurredAt: '2026-10-11T15:31:40',
  })
  expect(prepareCapture({ ...capture, transaction: { ...capture.transaction, amount: 2000 } }).category).toBe('Income')
})

it('reuses v1 rules to prefill name and category', () => {
  const transaction = parseCaptureTransaction({
    ...captureFixture,
    type: 'mail',
    source_app: 'gmail',
    title: '[CAKE] Thông báo giao dịch thành công',
    message: 'Số tiền -10.000 đ\nNội dung giao dịch wutheringwaves',
  })
  expect(prepareCapture({ ...capture, transaction })).toMatchObject({ name: 'Wuwa', category: 'Entertainment' })
})

it('uses original time for cutoff and falls back for invalid captured timestamps', () => {
  expect(captureSourceTime({ ...capture, captured_at: '2026-10-09T00:00:00+07:00' })).toBe(
    Date.parse('2026-10-08T17:00:00Z'),
  )
  expect(captureSourceTime({ ...capture, captured_at: 'invalid' })).toBe(Date.parse(capture.received_at))
})

it('does not import zero or missing amounts and distinguishes devices', () => {
  for (const amount of [0, null]) {
    expect(
      captureEntry({
        ...prepareCapture({ ...capture, transaction: { ...capture.transaction, amount } }),
        divided: true,
      }),
    ).toBeNull()
  }
  expect(captureKey(capture)).not.toBe(captureKey({ ...capture, device_id: 'another-device' }))
})
