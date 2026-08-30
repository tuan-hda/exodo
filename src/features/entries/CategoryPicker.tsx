import {
  Airplane,
  Basket,
  BowlFood,
  Car,
  Coffee,
  CurrencyDollar,
  DotsThree,
  GameController,
  Gift,
  Receipt,
  ShoppingBag,
  Wallet,
} from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { Category } from './category'

export type { Category } from './category'

export const expenseCategories: Category[] = [
  'Dining',
  'Groceries',
  'Shopping',
  'Transit',
  'Entertainment',
  'Bill & Fees',
  'Gifts',
  'Travel',
  'Beverage',
]
export const incomeCategories: Category[] = ['Salary', 'Income']

export function defaultCategory(type: 'income' | 'expense'): Category {
  return type === 'income' ? 'Salary' : 'Dining'
}

export function categoryIcon(category: Category, size = 18) {
  const props = { size, weight: 'regular' as const }
  switch (category) {
    case 'Dining':
      return <BowlFood {...props} />
    case 'Groceries':
      return <Basket {...props} />
    case 'Shopping':
      return <ShoppingBag {...props} />
    case 'Transit':
      return <Car {...props} />
    case 'Entertainment':
      return <GameController {...props} />
    case 'Bill & Fees':
      return <Receipt {...props} />
    case 'Gifts':
      return <Gift {...props} />
    case 'Travel':
      return <Airplane {...props} />
    case 'Beverage':
      return <Coffee {...props} />
    case 'Salary':
      return <Wallet {...props} />
    case 'Income':
      return <CurrencyDollar {...props} />
    default:
      return <DotsThree {...props} />
  }
}

export function categoryClass(category: Category) {
  switch (category) {
    case 'Dining':
      return 'border-[#efb6a1] bg-[#fff0ea] text-[#a84528]'
    case 'Groceries':
      return 'border-[#b9d7b0] bg-[#edf8e9] text-[#397631]'
    case 'Shopping':
      return 'border-[#c9b9e8] bg-[#f3effd] text-[#694b9c]'
    case 'Transit':
      return 'border-[#a9c9e8] bg-[#edf6ff] text-[#31658e]'
    case 'Entertainment':
      return 'border-[#e9c88c] bg-[#fff7e5] text-[#936a18]'
    case 'Bill & Fees':
      return 'border-[#c5cbd3] bg-[#f1f3f6] text-[#58616d]'
    case 'Gifts':
      return 'border-[#efb5cf] bg-[#fff0f7] text-[#a7436e]'
    case 'Travel':
      return 'border-[#a9d8d5] bg-[#ebf9f8] text-[#28716d]'
    case 'Beverage':
      return 'border-[#d9bd9e] bg-[#fbf1e6] text-[#8b5a2b]'
    case 'Salary':
      return 'border-[#7fbe91] bg-[#dff3e5] text-[#176b3a]'
    case 'Income':
      return 'border-[#a8c7e8] bg-[#eaf3ff] text-[#275f96]'
    default:
      return 'border-line-strong bg-soft text-muted'
  }
}

export function CategoryPicker({
  type,
  value,
  onChange,
  disabled = false,
}: {
  type: 'income' | 'expense'
  value: Category
  onChange: (category: Category) => void
  disabled?: boolean
}) {
  const options = type === 'expense' ? expenseCategories : incomeCategories
  return (
    <div className="grid gap-2 max-[700px]:gap-3">
      <div className="flex items-center justify-between text-[11px] font-bold text-muted max-[700px]:text-sm">
        <span>Category</span>
        <span
          className={clsx(
            'inline-flex items-center gap-1 rounded-lg bg-soft px-2 py-1 font-mono text-[10px] font-normal text-ink max-[700px]:px-3 max-[700px]:py-2 max-[700px]:text-xs',
            categoryClass(value),
          )}>
          {categoryIcon(value, 14)} {value}
        </span>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 max-[700px]:gap-2.5 max-[430px]:gap-1.5">
        {options.map((item) => (
          <button
            key={item}
            disabled={disabled}
            type="button"
            className={clsx(
              'inline-flex min-h-10 w-full items-center justify-start gap-2 rounded-xl border px-3 py-2 text-left text-[11px] font-medium transition hover:border-line-strong hover:text-ink active:scale-[.98] disabled:cursor-wait disabled:opacity-50',
              value === item ? 'border-ink bg-ink text-white' : categoryClass(item),
            )}
            aria-label={item}
            title={item}
            aria-pressed={value === item}
            onClick={() => onChange(item)}>
            {categoryIcon(item, 16)}
            <span>{item}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
