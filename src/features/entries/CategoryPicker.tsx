import { clsx } from 'clsx'
import { Button } from '@/components/ui/button'
import {
  categoryBorderStyle,
  categoryClass,
  categoryIcon,
  expenseCategories,
  incomeCategories,
  type Category,
} from '@/features/finance/category'

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
