import { CategoryPicker, type Category } from './CategoryPicker'
import type { EntryType } from './types'

export function ComposerCategoryStep({
  type,
  category,
  disabled,
  onChange,
}: {
  type: EntryType
  category: Category
  disabled: boolean
  onChange: (category: Category) => void
}) {
  return (
    <section className="grid content-start gap-4" aria-label="Choose category">
      <CategoryPicker disabled={disabled} type={type} value={category} onChange={onChange} />
    </section>
  )
}
