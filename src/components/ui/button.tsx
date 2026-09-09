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
        default: 'border-ink bg-ink text-white shadow-button hover:bg-ink-strong hover:shadow-button-hover',
        outline: 'border-line-strong bg-surface text-ink hover:border-ink hover:bg-soft',
        secondary: 'border-transparent bg-soft text-ink hover:bg-line',
        ghost: 'border-transparent text-muted hover:bg-soft hover:text-ink',
        destructive: 'border-danger/20 bg-danger-soft text-danger hover:border-danger/35 hover:bg-danger/15',
        link: 'border-transparent text-ink underline-offset-4 hover:underline',
        'outline-muted': 'border-line-strong bg-surface text-muted hover:border-ink hover:bg-soft hover:text-ink',
        option:
          'border-line-strong bg-soft text-muted hover:border-ink hover:bg-surface hover:text-ink data-[selected=true]:border-ink data-[selected=true]:bg-surface data-[selected=true]:text-ink data-[selected=true]:shadow-option',
        keypad: 'border-line bg-soft text-ink hover:border-line-strong hover:bg-line',
        list: 'bg-transparent text-ink hover:bg-soft',
        nav: 'border-transparent text-muted hover:bg-soft hover:text-ink data-[active=true]:bg-ink data-[active=true]:text-white data-[active=true]:shadow-button',
      },
      size: {
        default:
          'min-h-11 gap-1.5 rounded-control px-3.5 py-2.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        xs: "h-8 gap-1 rounded-chip px-2.5 text-[11px] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1 rounded-input px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-12 gap-1.5 rounded-control px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        icon: 'size-10 rounded-input',
        'icon-xs': "size-8 rounded-chip [&_svg:not([class*='size-'])]:size-3.5",
        'icon-sm': 'size-9 rounded-input',
        'icon-lg': 'size-11 rounded-control',
        option: 'min-h-14 w-full justify-start gap-2.5 rounded-control px-4 py-3 text-left text-sm font-medium',
        keypad: 'min-h-[52px] w-full rounded-input font-mono text-base max-md:min-h-[58px]',
        list: 'grid min-h-[67px] w-full min-w-0 grid-cols-[34px_1fr_auto] items-center gap-[13px] rounded-none border-0 border-b border-line px-2 py-3 text-left max-xs:grid-cols-[30px_1fr_auto] max-xs:gap-[9px]',
        summary:
          'grid min-h-[76px] w-full min-w-0 grid-cols-3 items-center gap-3 rounded-none border-0 border-b border-line px-2 py-4 text-left',
        row: 'flex min-h-16 w-full min-w-0 items-center gap-3 rounded-none border-0 border-b border-line px-0 py-3 text-left',
        nav: 'min-h-10 rounded-input px-3 py-2',
        'nav-item': 'h-12 min-h-12 min-w-0 rounded-input px-2 py-2',
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
