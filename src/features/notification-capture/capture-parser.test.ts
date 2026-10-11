import { describe, expect, it } from 'vitest'
import { createTransactionParser } from '@/features/gmail/transaction-parser'
import { convertToVnd } from '@/lib/currency'
import { parseCaptureTransaction } from './capture-parser'
import { captureFixture } from './test-fixture'

const cakeTitle = '[CAKE] Thông báo giao dịch thành công'
const creditTitle =
  'VPBank xin thong bao bien dong so du The tin dung cua Quy khach – VPBank would like to inform your credit card’s balance change'
const debitTitle = 'VPBank - Thông báo biến động số dư/ Balance Changed'
const parseV1 = createTransactionParser({ convertAmount: convertToVnd })
const mail = (title: string, message: string) => ({
  ...captureFixture,
  type: 'mail' as const,
  source_app: 'gmail',
  title,
  message,
})
const notification = (changes = {}) => ({
  ...captureFixture,
  source_app: 'Techcombank',
  title: '+ VND 2,000',
  subtitle: '2026-10-11T19:18:37+07:00',
  message: 'Tài khoản: 123456789\nSố dư: VND 1,489,487\nChuyen khoan tu Cake',
  ...changes,
})

describe('captured bank mail parsing', () => {
  it('keeps Cake v1 amount/time and extracts accented multiline sender content without the footer', () => {
    const body = `Tài khoản nhận 123456789
Ngày giờ giao dịch 11/10/2026, 14:30:15
Số tiền -2.000 đ
Phí giao dịch 0 đ
Nội dung giao dịch Tuấn test ạ
Tiền cà phê
*Cảm ơn bạn đã sử dụng dịch vụ của Cake by VPBank*
Thân mến,
Cake Team`
    expect(parseCaptureTransaction(mail(cakeTitle, body))).toEqual({
      ...parseV1(cakeTitle, body),
      content: 'Tuấn test ạ\nTiền cà phê',
    })
    expect(parseCaptureTransaction(mail(cakeTitle, body))?.amount).toBe(-2000)
    expect(parseCaptureTransaction(mail(cakeTitle, body))?.occurredAt).toBe('2026-10-11T07:30:15.000Z')
  })

  it.each([creditTitle, debitTitle])('keeps VPBank v1 fields and separates transaction content: %s', (title) => {
    const body = `*- 39,000 VND*
Số tiền thay đổi / *Changed Amount*
*PAYOO-HIGHLANDS 30873*
Nội dung / *Transaction Content*
*09/10/2026 11:25:22*
Thời gian /*Time*
*36,139,899 VND*
Hạn mức còn lại / *Available Limit*`
    expect(parseCaptureTransaction(mail(title, body))).toEqual({
      ...parseV1(title, body),
      content: 'PAYOO-HIGHLANDS 30873',
    })
  })

  it('preserves merchant punctuation and the existing USD conversion', () => {
    const body =
      '*- 9.99 USD*\nSố tiền thay đổi / *Changed Amount*\n*Grab* A-EXAMPLE*\nNội dung / *Transaction Content*'
    expect(parseCaptureTransaction(mail(creditTitle, body))).toEqual({
      source: 'vpbank-credit',
      amount: -261438,
      occurredAt: null,
      content: 'Grab* A-EXAMPLE',
    })
  })

  it('extracts incoming Cake content from table formatting', () => {
    const body = '| Số tiền | +2.000 đ |\n| Nội dung giao dịch | Chuyen tien |\n| Cảm ơn bạn |'
    expect(parseCaptureTransaction(mail(cakeTitle, body))).toEqual({
      source: 'cake',
      amount: 2000,
      occurredAt: null,
      content: 'Chuyen tien',
    })
  })

  it('does not invent missing content or parse promotion emails', () => {
    expect(parseCaptureTransaction(mail(cakeTitle, 'Số tiền -2.000 đ'))?.content).toBeNull()
    expect(parseCaptureTransaction(mail('Cake promotion', 'Số tiền -2.000 đ'))).toBeNull()
  })
})

describe('Techcombank notification parsing', () => {
  it('reads the transaction amount from the title instead of account numbers or balance', () => {
    expect(parseCaptureTransaction(notification())).toEqual({
      source: 'techcombank',
      amount: 2000,
      occurredAt: '2026-10-11T12:18:37.000Z',
      content: 'Chuyen khoan tu Cake',
    })
  })

  it('preserves outgoing sign and multiline sender content', () => {
    expect(
      parseCaptureTransaction(
        notification({
          title: '- VND 47,000',
          message: 'Tài khoản: 123456789\nSố dư: VND 100,000\nTiền cà phê\nCảm ơn nhé',
        }),
      ),
    ).toEqual({
      source: 'techcombank',
      amount: -47000,
      occurredAt: '2026-10-11T12:18:37.000Z',
      content: 'Tiền cà phê\nCảm ơn nhé',
    })
  })

  it('leaves missing dates and content unavailable', () => {
    const parsed = parseCaptureTransaction(
      notification({ subtitle: 'not a date', message: 'Tài khoản: 123456789\nSố dư: VND 100,000' }),
    )
    expect(parsed?.occurredAt).toBeNull()
    expect(parsed?.content).toBeNull()
  })

  it('does not infer direction from balances or recognize other apps as Techcombank', () => {
    expect(parseCaptureTransaction(notification({ title: 'Số dư VND 100,000' }))).toBeNull()
    expect(parseCaptureTransaction(notification({ source_app: 'momo' }))).toBeNull()
    expect(parseCaptureTransaction(notification({ title: '+ VND 2.00' }))?.amount).toBeNull()
  })
})
