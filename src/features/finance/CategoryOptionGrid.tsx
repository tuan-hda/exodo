import { Button } from '@/components/ui/button'
import { CategoryIcon } from './CategoryIcon'
import { categoryChartColor, categoryClass, categoryIcon, type Category } from './category'
import { cn } from '@/lib/utils'

export function CategoryOptionGrid({
  categories,
  value,
  onChange,
  disabled = false,
  ariaLabel = 'Categories',
  className,
  iconOnly = false,
}: {
  categories: Category[]
  value: Category
  onChange: (category: Category) => void
  disabled?: boolean
  ariaLabel?: string
  className?: string
  iconOnly?: boolean
}) {
  return (
    <div
      style={
        iconOnly
          ? {
              maxWidth: `min(100%, ${categories.length * 44 + Math.max(0, categories.length - 1) * 4}px)`,
            }
          : undefined
      }
      className={cn(
        'grid min-w-0 w-full',
        iconOnly ? 'gap-1' : 'gap-2',
        iconOnly ? 'grid-cols-[repeat(auto-fit,minmax(44px,1fr))] justify-items-center' : 'grid-cols-2',
        className,
      )}
      role="group"
      aria-label={ariaLabel}>
      {categories.map((item) => (
        <Button
          key={item}
          disabled={disabled}
          type="button"
          variant="category"
          size={iconOnly ? 'icon-lg' : 'option'}
          style={value === item ? { backgroundColor: categoryChartColor(item) } : undefined}
          className={cn(categoryClass(item), iconOnly && 'border-transparent hover:border-transparent')}
          data-selected={value === item}
          aria-label={item}
          title={iconOnly ? item : undefined}
          aria-pressed={value === item}
          onClick={() => onChange(item)}>
          {iconOnly ? (
            categoryIcon(item)
          ) : (
            <CategoryIcon category={item} size="sm" shape="control" className="border-0" />
          )}
          {!iconOnly && <span>{item}</span>}
        </Button>
      ))}
    </div>
  )
}
