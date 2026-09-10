import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const pageShellSizes = {
  compact: 'max-w-[620px] pb-8',
  wide: 'max-w-[760px] pb-12',
  centered: 'max-w-[560px] pb-12 text-center',
} as const

export function PageShell({
  children,
  size = 'compact',
  className,
  ...props
}: ComponentProps<'section'> & { children: ReactNode; size?: keyof typeof pageShellSizes }) {
  return (
    <section
      className={cn('ui-page-enter mx-auto grid gap-8 pt-16 max-md:pt-10', pageShellSizes[size], className)}
      {...props}>
      {children}
    </section>
  )
}
