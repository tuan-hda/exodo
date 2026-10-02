import type { Category } from '@/features/finance/category'

type TransactionDefaults = { title: string; category: Category }
type AutoCollectRule = TransactionDefaults & { matches: (content: string) => boolean }

const rules: AutoCollectRule[] = [
  { matches: (content) => content.includes('wutheringwaves'), title: 'Wuwa', category: 'Entertainment' },
]

export function applyAutoCollectRules(content: string): TransactionDefaults | null {
  const rule = rules.find((rule) => rule.matches(content.toLowerCase()))
  return rule ? { title: rule.title, category: rule.category } : null
}
