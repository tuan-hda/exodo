import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva('rounded-[24px] border transition-colors', {
  variants: {
    tone: {
      default: 'border-line bg-surface shadow-[0_12px_30px_rgb(21_21_21_/_0.06)]',
      soft: 'border-transparent bg-soft shadow-none',
      flat: 'border-line bg-transparent shadow-none',
      elevated: 'border-line-strong bg-surface shadow-[0_18px_48px_rgb(21_21_21_/_0.12)]',
    },
  },
  defaultVariants: { tone: 'default' },
})

function Card({ className, tone, ...props }: React.ComponentProps<'section'> & VariantProps<typeof cardVariants>) {
  return <section data-slot="card" data-tone={tone} className={cn(cardVariants({ tone }), className)} {...props} />
}

export { Card, cardVariants }
