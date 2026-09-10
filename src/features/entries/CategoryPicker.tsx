import { clsx } from 'clsx'
import { categoryClass, expenseCategories, incomeCategories, type Category } from '@/features/finance/category'
import { CategoryIcon } from '@/features/finance/CategoryIcon'
import { CategoryOptionGrid } from '@/features/finance/CategoryOptionGrid'

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
            'ui-meta inline-flex items-center gap-1.5 rounded-chip bg-soft px-2 py-1 text-ink max-md:px-3 max-md:py-2 max-md:text-xs',
            categoryClass(value),
          )}>
          <CategoryIcon category={value} size="xs" shape="control" /> {value}
        </span>
      </div>
      <CategoryOptionGrid
        categories={options}
        value={value}
        disabled={disabled}
        ariaLabel={`${type === 'expense' ? 'Expense' : 'Income'} categories`}
        onChange={onChange}
      />
    </div>
  )
}
