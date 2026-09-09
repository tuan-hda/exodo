import type { ReactNode } from 'react'
import { SheetTitle } from '@/components/ui/sheet'

export function ComposerHeader({
  title,
  accessibleTitle,
  children,
}: {
  title: ReactNode
  accessibleTitle?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <SheetTitle className="sr-only">{accessibleTitle ?? title}</SheetTitle>
      <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
      <div className="mb-7 flex justify-between max-md:mb-5">
        <h2 className="ui-dialog-title m-0">{title}</h2>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </>
  )
}
