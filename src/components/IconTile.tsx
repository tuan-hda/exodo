import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const iconTileVariants = cva('ui-icon-tile', {
  variants: {
    tone: {
      neutral: '',
      muted: 'border-line bg-soft text-muted',
      surface: 'bg-surface',
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

export function IconTile({
  className,
  tone,
  size,
  shape,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof iconTileVariants>) {
  return <span data-slot="icon-tile" className={cn(iconTileVariants({ tone, size, shape }), className)} {...props} />
}
