import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const iconTileVariants = cva('ui-icon-tile', {
  variants: {
    tone: {
      neutral: '',
      muted: 'border-line bg-soft text-muted',
      surface: 'bg-surface',
      coral: 'border-category-coral/25 bg-category-coral-soft text-category-coral',
      sage: 'border-category-sage/25 bg-category-sage-soft text-category-sage',
      plum: 'border-category-plum/25 bg-category-plum-soft text-category-plum',
      blue: 'border-category-blue/25 bg-category-blue-soft text-category-blue',
      amber: 'border-category-amber/25 bg-category-amber-soft text-category-amber',
      clay: 'border-category-clay/25 bg-category-clay-soft text-category-clay',
      violet: 'border-category-violet/25 bg-category-violet-soft text-category-violet',
      teal: 'border-category-teal/25 bg-category-teal-soft text-category-teal',
      rose: 'border-category-rose/25 bg-category-rose-soft text-category-rose',
      success: 'border-success/25 bg-success-soft text-success',
      danger: 'border-danger/25 bg-danger-soft text-danger',
      inverse: 'border-ink bg-ink text-white',
    },
    size: {
      sm: 'size-9',
      md: 'size-10',
      lg: 'size-11',
      xl: 'size-14',
    },
    shape: {
      circle: 'rounded-full',
      control: 'rounded-control',
      input: 'rounded-input',
    },
  },
  defaultVariants: {
    tone: 'neutral',
    size: 'md',
    shape: 'control',
  },
})

export type IconTileTone = NonNullable<VariantProps<typeof iconTileVariants>['tone']>

export function IconTile({
  className,
  tone,
  size,
  shape,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof iconTileVariants>) {
  return <span data-slot="icon-tile" className={cn(iconTileVariants({ tone, size, shape }), className)} {...props} />
}
