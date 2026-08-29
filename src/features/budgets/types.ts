import type { Category } from '../entries/category'

export type CategoryBudget = {
  id: string
  category: Category
  amount: number
}

export type StoredCategoryBudget = {
  id: string
  category: string
  amount: number | string
}
