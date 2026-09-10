import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-panel border transition-colors', {
  variants: {
    tone: {
      default: 'border-line bg-surface shadow-panel',
      soft: 'border-transparent bg-soft shadow-none',
      flat: 'border-line bg-transparent shadow-none',
    },
  },
  defaultVariants: { tone: 'default' },
})

export type CardTone = NonNullable<VariantProps<typeof cardVariants>['tone']>

function Card({
  className,
  tone,
  as: Component = 'div',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants> & { as?: 'article' | 'div' | 'section' }) {
  return <Component data-slot="card" data-tone={tone} className={cn(cardVariants({ tone }), className)} {...props} />
}

export { Card, cardVariants }
