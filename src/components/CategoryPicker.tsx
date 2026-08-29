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
import type { Category } from '../types/category'

export type { Category } from '../types/category'

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
  return `category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
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
    <div className="category-picker">
      <div className="category-picker-heading">
        <span>Category</span>
        <span className={`category-selected ${categoryClass(value)}`}>
          {categoryIcon(value, 14)} {value}
        </span>
      </div>
      <div className="category-grid">
        {options.map((item) => (
          <button
            key={item}
            disabled={disabled}
            type="button"
            className={`category-button ${categoryClass(item)} ${value === item ? 'selected' : ''}`}
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
