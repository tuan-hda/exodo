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
import { Button } from '@/components/ui/button'
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
    <div className="grid gap-2 max-md:gap-3">
      <div className="flex items-center justify-between ui-field-label max-md:text-sm">
        <span>Category</span>
        <span
          className={clsx(
            'ui-meta inline-flex items-center gap-1 rounded-chip bg-soft px-2 py-1 text-ink max-md:px-3 max-md:py-2 max-md:text-xs',
            categoryClass(value),
          )}>
          {categoryIcon(value, 14)} {value}
        </span>
      </div>
      <div className="grid w-full grid-cols-2 gap-2 max-md:gap-2.5 max-xs:gap-1.5">
        {options.map((item) => (
          <Button
            key={item}
            disabled={disabled}
            type="button"
            variant="option"
            size="option"
            className={clsx(categoryClass(item))}
            style={categoryBorderStyle(item)}
            data-selected={value === item}
            aria-label={item}
            title={item}
            aria-pressed={value === item}
            onClick={() => onChange(item)}>
            {categoryIcon(item, 18)}
            <span>{item}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
