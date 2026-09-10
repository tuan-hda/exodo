import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/money'

type MoneyAmountTone = 'income' | 'expense' | 'neutral'

export function MoneyAmount({
  amount,
  tone = 'neutral',
  showSign = false,
  as = 'span',
  className,
}: {
  amount: number
  tone?: MoneyAmountTone
  showSign?: boolean
  as?: 'span' | 'b' | 'strong'
  className?: string
}) {
  const Component = as
  const sign = showSign ? (tone === 'expense' ? '-' : tone === 'income' ? '+' : '') : ''
  const toneClass = tone === 'expense' ? 'text-danger' : tone === 'income' ? 'text-success' : 'text-ink'

  return (
    <Component data-slot="money-amount" className={cn('ui-number', toneClass, className)}>
      {sign}
      {formatMoney(amount)}
    </Component>
  )
}
