import { describe, expect, it } from 'vitest'
import { classifyTransactionSubject, parseTransaction } from './transaction-parser'

const creditSubject =
  'VPBank xin thong bao bien dong so du The tin dung cua Quy khach – VPBank would like to inform your credit card’s balance change'

describe('transaction email subjects', () => {
  it.each([
    ['[CAKE] Thông báo giao dịch thành công', 'cake'],
    [creditSubject, 'vpbank-credit'],
    ['VPBank - Thông báo biến động số dư/ Balance Changed', 'vpbank-debit'],
    [creditSubject.replace('’', "'").replace('–', '-'), 'vpbank-credit'],
    ['VPBank xin thông báo biến động số dư Thẻ tín dụng của Quý khách', 'vpbank-credit'],
    ['  [cake]  THÔNG BÁO GIAO DỊCH THÀNH CÔNG  ', 'cake'],
    ['VPBank - Thông báo biến động số dư / Balance Changed', 'vpbank-debit'],
  ])('classifies %s', (subject, source) => {
    expect(classifyTransactionSubject(subject)).toBe(source)
  })
  it.each([
    '[CAKE] Ưu đãi giao dịch thành công',
    'VPBank ưu đãi Thẻ tín dụng',
    'Other bank - Thông báo biến động số dư/ Balance Changed',
    'Re: [CAKE] Thông báo giao dịch thành công',
    'Fwd: VPBank - Thông báo biến động số dư/ Balance Changed',
    '',
  ])('excludes unrelated or forwarded subjects: %s', (subject) => {
    expect(classifyTransactionSubject(subject)).toBeNull()
  })
})

describe('transaction email fields', () => {
  const cakeSubject = '[CAKE] Thông báo giao dịch thành công'
  const debitSubject = 'VPBank - Thông báo biến động số dư/ Balance Changed'

  it('extracts the VPBank credit amount and transaction time from the supplied format', () => {
    expect(
      parseTransaction(
        creditSubject,
        `
      BIẾN ĐỘNG SỐ DƯ
      - 42,000 VND
      Số tiền thay đổi / Changed Amount
      TLJ Le Van Sy
      Nội dung / Transaction Content
      27/09/2026 10:11:06
      Thời gian /Time
    `,
      ),
    ).toEqual({ source: 'vpbank-credit', amount: -42000, occurredAt: '2026-09-27T03:11:06.000Z' })
  })

  it('keeps the debit amount when the supplied email has no transaction date', () => {
    expect(parseTransaction(debitSubject, '-400,000 VND\nSố tiền thay đổi/ Changed Amount')).toEqual({
      source: 'vpbank-debit',
      amount: -400000,
      occurredAt: null,
    })
  })

  it('parses Cake table text without confusing account numbers or fees with the transaction', () => {
    expect(
      parseTransaction(
        cakeSubject,
        `
      | Tài khoản nhận | | | | 1222681818 | |
      | **Thông tin giao dịch** |
      | - | ------------------ | - | - | - | ---------------------- | - |
      | | Loại giao dịch | | | | Chuyển tiền ngoài CAKE | |
      | | Ngày giờ giao dịch | | | | 27/09/2026, 14:54:41 | |
      | | Số tiền | | | | -1.846.000 đ | |
      | | Phí giao dịch | | | | 0 đ | |
      | | Nội dung giao dịch | | | | Chuyen khoan tu Cake | |
    `,
      ),
    ).toEqual({ source: 'cake', amount: -1846000, occurredAt: '2026-09-27T07:54:41.000Z' })
  })

  it('supports incoming amounts and labels before the VPBank date', () => {
    expect(
      parseTransaction(
        debitSubject,
        '+250,000 VND\nSố tiền thay đổi/ Changed Amount\nThời gian /Time: 28/09/2026 00:01:02',
      ),
    ).toEqual({ source: 'vpbank-debit', amount: 250000, occurredAt: '2026-09-27T17:01:02.000Z' })
  })

  it.each(['31/02/2026, 14:54:41', '27/09/2026, 25:54:41', '00/09/2026, 14:54:41'])(
    'rejects impossible transaction dates: %s',
    (date) => {
      expect(parseTransaction(cakeSubject, `Ngày giờ giao dịch ${date}\nSố tiền -21.000 đ`)).toEqual({
        source: 'cake',
        amount: -21000,
        occurredAt: null,
      })
    },
  )

  it.each(['Số tiền -1.84.600 đ', 'Phí giao dịch 500 đ', 'Số tiền 9007199254740992 đ', 'Số tiền USD 21.00'])(
    'does not invent an amount from unsupported or missing data: %s',
    (body) => {
      expect(parseTransaction(cakeSubject, body)?.amount).toBeNull()
    },
  )

  it('does not parse unrelated email bodies', () => {
    expect(parseTransaction('Cake promotion', 'Số tiền -21.000 đ')).toBeNull()
  })
})
