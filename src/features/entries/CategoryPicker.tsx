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
import { categoryBorderStyle, categoryStyles, type Category } from './category'

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
  const style = categoryStyles[category]
  return style
    ? `${style.borderClass} ${style.backgroundClass} ${style.foregroundClass}`
    : 'border-line-strong bg-soft text-muted'
}

export function categoryChartColor(category: Category) {
  return categoryStyles[category]?.chartColor ?? '#707070'
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
              'inline-flex min-h-14 w-full items-center justify-start gap-2.5 rounded-xl border px-4 py-3 text-left text-sm font-medium transition hover:text-ink active:scale-[.98] disabled:cursor-wait disabled:opacity-50',
              categoryClass(item),
            )}
            style={categoryBorderStyle(item)}
            aria-label={item}
            title={item}
            aria-pressed={value === item}
            onClick={() => onChange(item)}>
            {categoryIcon(item, 18)}
            <span>{item}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
