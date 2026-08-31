'use client'

import { ArrowLeft, ChartDonut, CaretLeft, CaretRight, TrendDown, TrendUp } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { categoryChartColor, categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { formatShort } from '../entries/entry-utils'
import type { Entry } from '../entries/types'
import { getMonthEntries, groupByCategory } from './analysis-utils'

const MIN_LABEL_PERCENTAGE = 0.08

function PieChart({ slices, total }: { slices: ReturnType<typeof groupByCategory>; total: number }) {
  let offset = 0
  const segments = slices.map((slice) => {
    const start = offset
    const end = offset + slice.percentage
    const segment = `${start * 360}deg ${end * 360}deg`
    offset += slice.percentage
    return {
      ...slice,
      segment,
      color: categoryChartColor(slice.category),
      midpoint: (start + slice.percentage / 2) * Math.PI * 2 - Math.PI / 2,
    }
  })

  return (
    <div className="relative mx-auto size-[210px] max-[430px]:size-[180px]">
      <div className="relative size-full">
        <div
          className="size-full rounded-full"
          style={{
            background: segments.length
              ? `conic-gradient(${segments.map((item) => `${item.color} ${item.segment}`).join(', ')})`
              : '#eeeeee',
          }}
          role="img"
          aria-label={segments.length ? `Distribution totaling ${formatShort(total)}` : 'No records for this month'}
        />
        {segments
          .filter((segment) => segment.percentage >= MIN_LABEL_PERCENTAGE)
          .map((segment) => (
            <span
              className={clsx(
                'pointer-events-none absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 bg-white shadow-[0_2px_8px_rgb(21_21_21_/_0.12)] max-[430px]:size-9',
                categoryClass(segment.category),
              )}
              key={segment.category}
              style={{
                left: `${50 + Math.cos(segment.midpoint) * 50}%`,
                top: `${50 + Math.sin(segment.midpoint) * 50}%`,
              }}>
              {categoryIcon(segment.category, 19)}
            </span>
          ))}
      </div>
      <div className="absolute inset-[27%] grid place-items-center rounded-full bg-white text-center">
        <div>
          <ChartDonut className="mx-auto mb-1 text-muted" size={17} />
          <strong className="block font-mono text-sm font-normal tracking-[-.04em]">{formatShort(total)}</strong>
          <span className="font-mono text-[9px] uppercase tracking-[.08em] text-muted">total</span>
        </div>
      </div>
    </div>
  )
}

function DistributionCard({ type, entries }: { type: Entry['type']; entries: Entry[] }) {
  const slices = groupByCategory(entries, type)
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0)
  const isIncome = type === 'income'

  return (
    <Card className="p-5 max-[700px]:p-4" aria-label={`${type} distribution`}>
      <div className="mb-7 flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[.12em] text-muted">{type}</p>
          <strong className={clsx('font-mono text-lg font-normal', isIncome ? 'text-[#176b3a]' : 'text-[#a84528]')}>
            {isIncome ? '+' : '-'}
            {formatShort(total)}
          </strong>
        </div>
        {isIncome ? (
          <TrendUp className="text-[#176b3a]" size={21} />
        ) : (
          <TrendDown className="text-[#a84528]" size={21} />
        )}
      </div>
      <PieChart slices={slices} total={total} />
      {slices.length > 0 && (
        <div className="mt-8 border-t border-line pt-2">
          {slices.map((slice) => (
            <div
              className="flex min-h-12 items-center gap-3 border-b border-line py-2 last:border-b-0"
              key={slice.category}>
              <span
                className={clsx(
                  'grid size-8 shrink-0 place-items-center rounded-full border',
                  categoryClass(slice.category),
                )}>
                {categoryIcon(slice.category, 16)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted">{slice.category}</span>
              <strong className="font-mono text-xs font-normal text-ink">{formatShort(slice.amount)}</strong>
            </div>
          ))}
        </div>
      )}
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
  const monthEntries = getMonthEntries(entries, viewMonth)
  const monthLabel = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const income = monthEntries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0)
  const expense = monthEntries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0)

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
      <Tabs defaultValue="expense">
        <TabsList aria-label="Analysis type">
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        <TabsContent value="expense">
          <DistributionCard type="expense" entries={monthEntries} />
        </TabsContent>
        <TabsContent value="income">
          <DistributionCard type="income" entries={monthEntries} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
