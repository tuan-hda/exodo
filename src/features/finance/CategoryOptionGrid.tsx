import { Button } from '@/components/ui/button'
import { CategoryIcon } from './CategoryIcon'
import { categoryClass, type Category } from './category'
import { cn } from '@/lib/utils'

export function CategoryOptionGrid({
  categories,
  value,
  onChange,
  disabled = false,
  ariaLabel = 'Categories',
  className,
}: {
  categories: Category[]
  value: Category
  onChange: (category: Category) => void
  disabled?: boolean
  ariaLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn('grid w-full grid-cols-2 gap-2 max-md:gap-2.5 max-xs:gap-1.5', className)}
      role="group"
      aria-label={ariaLabel}>
      {categories.map((item) => (
        <Button
          key={item}
          disabled={disabled}
          type="button"
          variant="category"
          size="option"
          className={categoryClass(item)}
          data-selected={value === item}
          aria-label={item}
          aria-pressed={value === item}
          onClick={() => onChange(item)}>
          <CategoryIcon category={item} size="sm" shape="control" />
          <span>{item}</span>
        </Button>
      ))}
    </div>
  )
}
