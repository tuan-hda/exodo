'use client'

import { TrendDown, TrendUp, X } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { CategoryIcon } from '@/features/finance/CategoryIcon'
import { canonicalCategory, categoryForegroundClass } from '@/features/finance/category'
import { AnimatedList } from '@/components/ui/animated-list'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IconTile } from '@/components/IconTile'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/lib/money'
import { formatEntryDateTime } from '@/lib/date-format'
import type { Entry } from '@/features/entries/types'
import { formatPercentage, groupByCategory } from './analysis-utils'
import { PieChart } from './PieChart'

function CategoryDetail({
  category,
  type,
  entries,
  onClose,
}: {
  category: string
  type: Entry['type']
  entries: Entry[]
  onClose: () => void
}) {
  const categoryEntries = entries
    .filter((entry) => entry.type === type && canonicalCategory(entry.category || 'Other') === category)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))

  return (
    <div className="mt-8 border-t border-line pt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="ui-label mb-1 tracking-[.1em]">selected category</p>
          <h3 className={clsx('m-0 text-xl font-semibold tracking-[-.05em]', categoryForegroundClass(category))}>
            {category}
          </h3>
        </div>
        <Button variant="outline" size="icon-sm" type="button" onClick={onClose} aria-label="Close category details">
          <X size={17} />
        </Button>
      </div>
      {categoryEntries.length ? (
        <AnimatedList items={categoryEntries} getKey={(entry) => entry.id}>
          {(entry) => (
            <div className="flex min-h-16 items-center gap-3 border-b border-line py-3">
              <CategoryIcon category={entry.category ?? category} size="xs" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-medium text-ink">{entry.title || category}</strong>
                <small className="ui-meta mt-1 block">{formatEntryDateTime(entry.occurredAt)}</small>
              </div>
              <strong
                className={clsx(
                  'ui-number text-base font-semibold',
                  type === 'expense' ? 'text-danger' : 'text-success',
                )}>
                {type === 'expense' ? '-' : '+'}
                {formatMoney(entry.amount)}
              </strong>
            </div>
          )}
        </AnimatedList>
      ) : (
        <p className="py-6 text-center text-sm text-muted">No transactions in this category.</p>
      )}
    </div>
  )
}

export function AnalysisDistribution({
  type,
  entries,
  isLoading = false,
  selectedCategory,
  onSelectCategory,
  onCloseCategory,
}: {
  type: Entry['type']
  entries: Entry[]
  isLoading?: boolean
  selectedCategory: string | null
  onSelectCategory: (category: string) => void
  onCloseCategory: () => void
}) {
  const slices = groupByCategory(entries, type)
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0)
  const isIncome = type === 'income'

  return (
    <section aria-label={`${type} distribution`}>
      <Card className="p-5 max-md:p-4">
        {isLoading ? (
          <div className="grid min-h-[360px] content-center gap-5 p-8">
            <Skeleton className="mx-auto size-[240px] rounded-full max-xs:size-[190px]" />
            <Skeleton className="mx-auto h-3 w-32" />
          </div>
        ) : slices.length ? (
          <>
            <div className="mb-7 flex items-start justify-between gap-3">
              <p className="ui-eyebrow m-0">{type}</p>
              {isIncome ? (
                <TrendUp className="text-success" size={21} />
              ) : (
                <TrendDown className="text-danger" size={21} />
              )}
            </div>
            <PieChart slices={slices} total={total} selectedCategory={selectedCategory} onSelect={onSelectCategory} />
            <div className="h-10" />
          </>
        ) : (
          <div className="grid min-h-[360px] place-items-center content-center gap-3 p-8 text-center">
            <IconTile size="lg" shape="circle" aria-hidden="true">
              {isIncome ? <TrendUp size={20} /> : <TrendDown size={20} />}
            </IconTile>
            <div className="grid gap-1">
              <h3 className="m-0 text-base font-semibold">No {type} records</h3>
              <p className="m-0 max-w-[30ch] text-sm leading-[1.55] text-muted">
                Add a record in this month to see its distribution.
              </p>
            </div>
          </div>
        )}
      </Card>
      {isLoading ? (
        <div className="mt-8 grid gap-3 border-t border-line pt-5" aria-hidden="true">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="flex min-h-16 items-center gap-3 border-b border-line py-3" key={index}>
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="ml-auto h-4 w-24" />
            </div>
          ))}
        </div>
      ) : selectedCategory ? (
        <CategoryDetail category={selectedCategory} type={type} entries={entries} onClose={onCloseCategory} />
      ) : slices.length > 0 ? (
        <AnimatedList className="mt-8 border-t border-line pt-2" items={slices} getKey={(slice) => slice.category}>
          {(slice) => (
            <Button variant="list" size="row" type="button" onClick={() => onSelectCategory(slice.category)}>
              <CategoryIcon category={slice.category} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                <span className={clsx('block truncate', categoryForegroundClass(slice.category))}>
                  {slice.category}
                </span>
                <small className="ui-meta mt-1 block">
                  {formatPercentage(slice.percentage)} · {slice.transactionCount}{' '}
                  {slice.transactionCount === 1 ? 'transaction' : 'transactions'}
                </small>
              </span>
              <strong
                className={clsx(
                  'ui-number text-base font-semibold',
                  type === 'expense' ? 'text-danger' : 'text-success',
                )}>
                {type === 'expense' ? '-' : '+'}
                {formatMoney(slice.amount)}
              </strong>
            </Button>
          )}
        </AnimatedList>
      ) : null}
    </section>
  )
}
