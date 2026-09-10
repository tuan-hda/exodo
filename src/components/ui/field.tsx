import * as React from 'react'

import { cn } from '@/lib/utils'

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('ui-field', className)} {...props} />
}

function FieldLabel({
  className,
  hint,
  children,
  ...props
}: React.ComponentProps<'label'> & { hint?: React.ReactNode }) {
  return (
    <label data-slot="field-label" className={cn('ui-field-label', className)} {...props}>
      {children}
      {hint !== undefined && <span className="ui-field-hint">{hint}</span>}
    </label>
  )
}

export { Field, FieldLabel }
