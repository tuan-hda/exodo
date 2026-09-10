import type { ReactNode } from 'react'
import { clsx } from 'clsx'
import { SheetTitle } from '@/components/ui/sheet'

export function ComposerHeader({
  title,
  accessibleTitle,
  accentClass = 'bg-line-strong',
  children,
}: {
  title: ReactNode
  accessibleTitle?: ReactNode
  accentClass?: string
  children: ReactNode
}) {
  return (
    <>
      <SheetTitle className="sr-only">{accessibleTitle ?? title}</SheetTitle>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
      <div className="mb-7 flex justify-between max-md:mb-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={clsx('size-2.5 shrink-0 rounded-full', accentClass)} aria-hidden="true" />
          <h2 className="ui-dialog-title m-0 truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </>
  )
}
