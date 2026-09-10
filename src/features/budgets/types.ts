import type { Category } from '@/features/finance/category'

export type CategoryBudget = {
  id: string
  category: Category
  amount: number
}
