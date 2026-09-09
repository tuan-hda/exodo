import { cn } from '@/lib/utils'
import { categoryClass, categoryIcon, type Category } from './category'

const categoryIconSizes = {
  xs: { className: 'size-[29px]', iconSize: 16 },
  sm: { className: 'size-8', iconSize: 16 },
  md: { className: 'size-9', iconSize: 15 },
} as const

export function CategoryIcon({
  category,
  size = 'sm',
  shape = 'circle',
  className,
}: {
  category: Category
  size?: keyof typeof categoryIconSizes
  shape?: 'circle' | 'control'
  className?: string
}) {
  const icon = categoryIconSizes[size]
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center border text-current',
        icon.className,
        shape === 'circle' ? 'rounded-full' : 'rounded-input',
        categoryClass(category),
        className,
      )}
      aria-hidden="true">
      {categoryIcon(category, icon.iconSize)}
    </span>
  )
}
