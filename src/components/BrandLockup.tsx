import { cn } from '@/lib/utils'

export function BrandLockup({ href, className }: { href?: string; className?: string }) {
  const content = (
    <>
      <span className="grid size-7 place-items-center rounded-chip bg-ink font-sans text-xs font-semibold text-white">
        e
      </span>
      <span>exodo / έξοδο</span>
    </>
  )
  const classes = cn(
    'inline-flex items-center gap-2 font-mono text-[11px] tracking-[.04em] text-ink no-underline',
    className,
  )

  if (href) {
    return (
      <a className={classes} href={href} aria-label="Exodo home">
        {content}
      </a>
    )
  }

  return <div className={classes}>{content}</div>
}
