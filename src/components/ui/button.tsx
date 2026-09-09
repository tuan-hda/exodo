import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'
import { triggerHaptic } from '@/lib/haptics'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border bg-clip-padding text-xs font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out outline-none select-none focus-visible:ring-2 focus-visible:ring-ink/20 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-1 aria-invalid:ring-danger/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-ink bg-ink text-white shadow-[0_5px_14px_rgb(21_21_21_/_0.12)] hover:bg-ink-strong hover:shadow-[0_7px_18px_rgb(21_21_21_/_0.16)]',
        outline: 'border-line-strong bg-surface text-ink hover:border-ink hover:bg-soft',
        secondary: 'border-transparent bg-soft text-ink hover:bg-line',
        ghost: 'border-transparent text-muted hover:bg-soft hover:text-ink',
        destructive: 'border-danger/20 bg-danger-soft text-danger hover:border-danger/35 hover:bg-danger/15',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
        nav: 'border-transparent text-muted hover:bg-soft hover:text-ink data-[active=true]:bg-ink data-[active=true]:text-white data-[active=true]:shadow-[0_4px_12px_rgb(21_21_21_/_0.12)]',
      },
      size: {
        default:
          'min-h-11 gap-1.5 rounded-[14px] px-3.5 py-2.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        xs: "h-8 gap-1 rounded-[10px] px-2.5 text-[11px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1 rounded-[12px] px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-12 gap-1.5 rounded-[14px] px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        icon: 'size-10 rounded-[12px]',
        'icon-xs': "size-8 rounded-[10px] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-sm': 'size-9 rounded-[12px]',
        'icon-lg': 'size-11 rounded-[14px]',
        nav: 'min-h-10 rounded-[12px] px-3 py-2',
        'nav-item': 'h-12 min-h-12 min-w-0 rounded-[12px] px-2 py-2',
        fab: 'size-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  onKeyDown,
  onPointerDown,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') triggerHaptic()
        onKeyDown?.(event)
      }}
      onPointerDown={(event) => {
        triggerHaptic()
        onPointerDown?.(event)
      }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
