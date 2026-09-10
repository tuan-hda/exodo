import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-panel border transition-colors', {
  variants: {
    tone: {
      default: 'border-line bg-surface shadow-panel',
      soft: 'border-transparent bg-soft shadow-none',
      flat: 'border-line bg-transparent shadow-none',
      success: 'border-success/20 bg-success-soft shadow-none',
      danger: 'border-danger/20 bg-danger-soft shadow-none',
    },
    accent: {
      none: '',
      neutral: '',
      muted: 'border-line bg-soft',
      surface: 'border-line bg-surface',
      coral: 'border-category-coral/30 bg-category-coral-soft/70',
      sage: 'border-category-sage/30 bg-category-sage-soft/70',
      plum: 'border-category-plum/30 bg-category-plum-soft/70',
      blue: 'border-category-blue/30 bg-category-blue-soft/70',
      amber: 'border-category-amber/30 bg-category-amber-soft/70',
      clay: 'border-category-clay/30 bg-category-clay-soft/70',
      violet: 'border-category-violet/30 bg-category-violet-soft/70',
      teal: 'border-category-teal/30 bg-category-teal-soft/70',
      rose: 'border-category-rose/30 bg-category-rose-soft/70',
      success: 'border-success/25 bg-success-soft/70',
      danger: 'border-danger/25 bg-danger-soft/70',
      inverse: 'border-ink bg-ink text-white',
    },
  },
  defaultVariants: { tone: 'default', accent: 'none' },
})

export type CardTone = NonNullable<VariantProps<typeof cardVariants>['tone']>
export type CardAccent = NonNullable<VariantProps<typeof cardVariants>['accent']>

function Card({
  className,
  tone,
  accent,
  as: Component = 'div',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants> & { as?: 'article' | 'div' | 'section' }) {
  return (
    <Component
      data-slot="card"
      data-tone={tone}
      data-accent={accent}
      className={cn(cardVariants({ tone, accent }), className)}
      {...props}
    />
  )
}

export { Card, cardVariants }
