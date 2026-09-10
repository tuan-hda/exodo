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
  House,
  Receipt,
  ShoppingBag,
  Wallet,
} from '@phosphor-icons/react'
import type { ReactElement } from 'react'

export type Category = string

export type CategoryStyle = {
  borderClass: string
  backgroundClass: string
  foregroundClass: string
  indicatorClass: string
  chartColor: string
}

type CategoryTone = 'coral' | 'sage' | 'plum' | 'blue' | 'amber' | 'clay' | 'violet' | 'teal' | 'rose' | 'other'

const categoryToneStyles: Record<CategoryTone, CategoryStyle> = {
  coral: {
    borderClass: 'border-category-coral/35',
    backgroundClass: 'bg-category-coral-soft',
    foregroundClass: 'text-category-coral',
    indicatorClass: 'bg-category-coral',
    chartColor: 'var(--color-category-coral)',
  },
  sage: {
    borderClass: 'border-category-sage/35',
    backgroundClass: 'bg-category-sage-soft',
    foregroundClass: 'text-category-sage',
    indicatorClass: 'bg-category-sage',
    chartColor: 'var(--color-category-sage)',
  },
  plum: {
    borderClass: 'border-category-plum/35',
    backgroundClass: 'bg-category-plum-soft',
    foregroundClass: 'text-category-plum',
    indicatorClass: 'bg-category-plum',
    chartColor: 'var(--color-category-plum)',
  },
  blue: {
    borderClass: 'border-category-blue/35',
    backgroundClass: 'bg-category-blue-soft',
    foregroundClass: 'text-category-blue',
    indicatorClass: 'bg-category-blue',
    chartColor: 'var(--color-category-blue)',
  },
  amber: {
    borderClass: 'border-category-amber/35',
    backgroundClass: 'bg-category-amber-soft',
    foregroundClass: 'text-category-amber',
    indicatorClass: 'bg-category-amber',
    chartColor: 'var(--color-category-amber)',
  },
  clay: {
    borderClass: 'border-category-clay/35',
    backgroundClass: 'bg-category-clay-soft',
    foregroundClass: 'text-category-clay',
    indicatorClass: 'bg-category-clay',
    chartColor: 'var(--color-category-clay)',
  },
  violet: {
    borderClass: 'border-category-violet/35',
    backgroundClass: 'bg-category-violet-soft',
    foregroundClass: 'text-category-violet',
    indicatorClass: 'bg-category-violet',
    chartColor: 'var(--color-category-violet)',
  },
  teal: {
    borderClass: 'border-category-teal/35',
    backgroundClass: 'bg-category-teal-soft',
    foregroundClass: 'text-category-teal',
    indicatorClass: 'bg-category-teal',
    chartColor: 'var(--color-category-teal)',
  },
  rose: {
    borderClass: 'border-category-rose/35',
    backgroundClass: 'bg-category-rose-soft',
    foregroundClass: 'text-category-rose',
    indicatorClass: 'bg-category-rose',
    chartColor: 'var(--color-category-rose)',
  },
  other: {
    borderClass: 'border-category-other/35',
    backgroundClass: 'bg-category-other-soft',
    foregroundClass: 'text-category-other',
    indicatorClass: 'bg-category-other',
    chartColor: 'var(--color-category-other)',
  },
}

const categoryTones: Record<string, CategoryTone> = {
  Dining: 'coral',
  Groceries: 'sage',
  Shopping: 'plum',
  Transit: 'blue',
  Transport: 'blue',
  Entertainment: 'amber',
  'Bill & Fees': 'clay',
  Bills: 'clay',
  Gifts: 'violet',
  Travel: 'teal',
  Beverage: 'rose',
  Food: 'amber',
  Home: 'sage',
  Other: 'other',
  Salary: 'teal',
  Income: 'blue',
}

const categoryAliases: Record<string, Category> = {
  Transport: 'Transit',
  Bills: 'Bill & Fees',
  Food: 'Dining',
}

export const categoryStyles: Record<string, CategoryStyle> = Object.fromEntries(
  Object.entries(categoryTones).map(([category, tone]) => [category, categoryToneStyles[tone]]),
)

const fallbackCategoryStyle = categoryToneStyles.other

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

export function canonicalCategory(category: Category): Category {
  return categoryAliases[category] ?? category
}

export function categoryIcon(category: Category, size = 18): ReactElement {
  const props = { size, weight: 'regular' as const }
  switch (category) {
    case 'Dining':
      return <BowlFood {...props} />
    case 'Groceries':
      return <Basket {...props} />
    case 'Shopping':
      return <ShoppingBag {...props} />
    case 'Transit':
    case 'Transport':
      return <Car {...props} />
    case 'Entertainment':
      return <GameController {...props} />
    case 'Bill & Fees':
    case 'Bills':
      return <Receipt {...props} />
    case 'Gifts':
      return <Gift {...props} />
    case 'Travel':
      return <Airplane {...props} />
    case 'Beverage':
      return <Coffee {...props} />
    case 'Food':
      return <BowlFood {...props} />
    case 'Home':
      return <House {...props} />
    case 'Salary':
      return <Wallet {...props} />
    case 'Income':
      return <CurrencyDollar {...props} />
    default:
      return <DotsThree {...props} />
  }
}

export function categoryClass(category: Category) {
  const style = categoryStyle(category)
  return `${style.borderClass} ${style.backgroundClass} ${style.foregroundClass}`
}

export function categoryStyle(category: Category): CategoryStyle {
  return categoryStyles[category] ?? fallbackCategoryStyle
}

export function categoryChartColor(category: Category) {
  return categoryStyle(category).chartColor
}

export function categoryIndicatorClass(category: Category) {
  return categoryStyle(category).indicatorClass
}

export function categoryBackgroundClass(category: Category) {
  return categoryStyle(category).backgroundClass
}

export function categoryForegroundClass(category: Category) {
  return categoryStyle(category).foregroundClass
}
