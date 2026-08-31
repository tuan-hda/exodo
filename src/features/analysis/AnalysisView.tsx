'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, CaretLeft, CaretRight, TrendDown, TrendUp, X } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { formatShort } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import { formatPercentage, getMonthEntries, groupByCategory } from './analysis-utils'
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
    .filter((entry) => entry.type === type && (entry.category || 'Other') === category)
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))

  return (
    <div className="mt-8 border-t border-line pt-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[.1em] text-muted">selected category</p>
          <h3 className="m-0 text-xl font-semibold tracking-[-.05em]">{category}</h3>
        </div>
        <Button variant="outline" size="icon-sm" type="button" onClick={onClose} aria-label="Close category details">
          <X size={17} />
        </Button>
      </div>
      {categoryEntries.length ? (
        <div>
          {categoryEntries.map((entry, index) => (
            <div
              className="analysis-detail-item flex min-h-16 items-center gap-3 border-b border-line py-3"
              style={{ animationDelay: `${index * 45}ms` }}
              key={entry.id}>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-medium text-ink">{entry.title || category}</strong>
                <small className="mt-1 block font-mono text-[10px] text-muted">
                  {entry.occurredAt.slice(0, 10)} · {entry.occurredAt.slice(11, 16)}
                </small>
              </div>
              <strong
                className={clsx(
                  'font-mono text-base font-semibold',
                  type === 'expense' ? 'text-[#a84528]' : 'text-[#176b3a]',
                )}>
                {type === 'expense' ? '-' : '+'}
                {formatShort(entry.amount)}
              </strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted">No transactions in this category.</p>
      )}
    </div>
  )
}

function DistributionCard({
  type,
  entries,
  selectedCategory,
  onSelectCategory,
  onCloseCategory,
}: {
  type: Entry['type']
  entries: Entry[]
  selectedCategory: string | null
  onSelectCategory: (category: string) => void
  onCloseCategory: () => void
}) {
  const slices = groupByCategory(entries, type)
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0)
  const isIncome = type === 'income'

  return (
    <Card className="p-5 max-[700px]:p-4" aria-label={`${type} distribution`}>
      <div className="mb-7 flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[.12em] text-muted">{type}</p>
        </div>
        {isIncome ? (
          <TrendUp className="text-[#176b3a]" size={21} />
        ) : (
          <TrendDown className="text-[#a84528]" size={21} />
        )}
      </div>
      <PieChart slices={slices} total={total} selectedCategory={selectedCategory} onSelect={onSelectCategory} />
      {selectedCategory ? (
        <CategoryDetail category={selectedCategory} type={type} entries={entries} onClose={onCloseCategory} />
      ) : slices.length > 0 ? (
        <div className="mt-8 border-t border-line pt-2">
          {slices.map((slice, index) => (
            <button
              type="button"
              className="analysis-category-item flex min-h-16 w-full items-center gap-3 border-b border-line bg-transparent py-3 text-left transition-colors hover:bg-soft last:border-b-0"
              style={{ animationDelay: `${index * 45}ms` }}
              key={slice.category}
              onClick={() => onSelectCategory(slice.category)}>
              <span
                className={clsx(
                  'grid size-8 shrink-0 place-items-center rounded-full border',
                  categoryClass(slice.category),
                )}>
                {categoryIcon(slice.category, 16)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                <span className="block truncate">{slice.category}</span>
                <small className="mt-1 block font-mono text-[10px] font-normal text-muted">
                  {formatPercentage(slice.percentage)} · {slice.transactionCount}{' '}
                  {slice.transactionCount === 1 ? 'transaction' : 'transactions'}
                </small>
              </span>
              <strong
                className={clsx(
                  'font-mono text-base font-semibold',
                  type === 'expense' ? 'text-[#a84528]' : 'text-[#176b3a]',
                )}>
                {type === 'expense' ? '-' : '+'}
                {formatShort(slice.amount)}
              </strong>
            </button>
          ))}
        </div>
      ) : null}
    </Card>
  )
}

export function AnalysisView({
  entries,
  viewMonth,
  onMonthChange,
  onBack,
}: {
  entries: Entry[]
  viewMonth: Date
  onMonthChange: (delta: number) => void
  onBack: () => void
}) {
  const [activeType, setActiveType] = useState<Entry['type']>('expense')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const monthEntries = getMonthEntries(entries, viewMonth)
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const income = monthEntries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0)
  const expense = monthEntries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0)

  useEffect(() => {
    setSelectedCategory(null)
  }, [activeType, viewMonth])

  function handleCategorySelect(category: string) {
    setSelectedCategory((current) => (current === category ? null : category))
  }

  return (
    <section className="pt-[106px] animate-[page-rise_.55s_cubic-bezier(.16,1,.3,1)_120ms_both] max-[700px]:pt-[75px]">
      <Button
        variant="outline"
        size="sm"
        className="mb-8 gap-2 border-line-strong px-3.5 font-mono text-[10px] uppercase tracking-[.08em] text-muted hover:border-ink hover:text-ink"
        type="button"
        onClick={onBack}>
        <ArrowLeft size={15} />
        Dashboard
      </Button>
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="mb-[15px] font-mono text-[11px] uppercase tracking-[.12em] text-muted">the month analysis</p>
          <h2 className="mb-[17px] text-[clamp(30px,4vw,44px)] font-semibold leading-none tracking-[-.07em]">
            {monthLabel}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-[34px] rounded-xl p-0 text-[22px]"
            type="button"
            onClick={() => onMonthChange(-1)}
            aria-label="Previous month">
            <CaretLeft size={17} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-[34px] rounded-xl p-0 text-[22px]"
            type="button"
            onClick={() => onMonthChange(1)}
            aria-label="Next month">
            <CaretRight size={17} />
          </Button>
        </div>
      </div>
      <div className="mt-3 mb-7 flex gap-5 border-y border-line py-3 font-mono text-[10px] uppercase tracking-[.08em] text-muted max-[430px]:gap-3 max-[430px]:text-[9px]">
        <span>
          <b className="font-normal text-[#176b3a]">+{formatShort(income)}</b> income
        </span>
        <span>
          <b className="font-normal text-[#a84528]">-{formatShort(expense)}</b> expense
        </span>
        <span>
          <b className="font-normal text-ink">{monthEntries.length}</b> records
        </span>
      </div>
      <Tabs value={activeType} onValueChange={(value) => setActiveType(value as Entry['type'])}>
        <TabsList aria-label="Analysis type">
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        <TabsContent className="analysis-tab-content swipe-left" value="expense">
          <DistributionCard
            type="expense"
            entries={monthEntries}
            selectedCategory={activeType === 'expense' ? selectedCategory : null}
            onSelectCategory={handleCategorySelect}
            onCloseCategory={() => setSelectedCategory(null)}
          />
        </TabsContent>
        <TabsContent className="analysis-tab-content swipe-right" value="income">
          <DistributionCard
            type="income"
            entries={monthEntries}
            selectedCategory={activeType === 'income' ? selectedCategory : null}
            onSelectCategory={handleCategorySelect}
            onCloseCategory={() => setSelectedCategory(null)}
          />
        </TabsContent>
      </Tabs>
    </section>
  )
}
