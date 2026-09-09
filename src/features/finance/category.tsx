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
import type { ReactElement } from 'react'

export type Category = string

export type CategoryStyle = {
  borderClass: string
  backgroundClass: string
  foregroundClass: string
  chartColor: string
}

const categoryChartColors: Record<string, string> = {
  Dining: '#151515',
  Groceries: '#3d3d3a',
  Shopping: '#575650',
  Transit: '#6e6c66',
  Transport: '#6e6c66',
  Entertainment: '#85827a',
  'Bill & Fees': '#99968d',
  Bills: '#99968d',
  Gifts: '#ada9a0',
  Travel: '#c0bcb2',
  Beverage: '#d0ccc2',
  Food: '#85827a',
  Home: '#d0ccc2',
  Other: '#707070',
  Salary: '#3d3d3a',
  Income: '#6e6c66',
}

export const categoryStyles: Record<string, CategoryStyle> = Object.fromEntries(
  Object.entries(categoryChartColors).map(([category, chartColor]) => [
    category,
    {
      borderClass: 'border-line-strong',
      backgroundClass: 'bg-soft',
      foregroundClass: 'text-ink',
      chartColor,
    },
  ]),
) as Record<string, CategoryStyle>

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

export function categoryBorderStyle(category: Category) {
  return { borderColor: `${categoryStyles[category]?.chartColor ?? '#707070'}1A` }
}
