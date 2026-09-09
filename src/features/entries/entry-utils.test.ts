import { describe, expect, it } from 'vitest'
import { evaluateExpression, formatAmountExpression, formatMoney } from './entry-utils'

describe('entry formatting and calculations', () => {
  it('uses the shared Vietnamese currency format', () => {
    expect(formatMoney(1_163_658)).toBe('1,163,658 ₫')
  })

  it('formats expression input without changing its meaning', () => {
    expect(formatAmountExpression('1200+350')).toBe('1,200+350')
    expect(evaluateExpression(formatAmountExpression('1200+350'))).toBe(1_550)
  })

  it('rejects division by zero', () => {
    expect(() => evaluateExpression('1200 ÷ 0')).toThrow('Cannot divide by zero.')
  })
})
