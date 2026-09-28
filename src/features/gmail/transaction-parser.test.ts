import { describe, expect, it } from 'vitest'
import { classifyTransactionSubject } from './transaction-parser'

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
