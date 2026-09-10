'use client'

import { useEffect, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { PageHeader } from '@/components/PageHeader'
import { PageShell } from '@/components/PageShell'
import { MoneyAmount } from '@/components/MoneyAmount'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { isEntryType, type Entry } from '@/features/entries/types'
import { sumEntriesByType } from '@/features/entries/entry-utils'
import { getMonthEntries } from './analysis-utils'
import { AnalysisDistribution } from './AnalysisDistribution'
import { formatMonthLabel } from '@/lib/date-format'

export function AnalysisView({
  entries,
  isLoading = false,
  viewMonth,
  onMonthChange,
  onBack,
}: {
  entries: Entry[]
  isLoading?: boolean
  viewMonth: Date
  onMonthChange: (delta: number) => void
  onBack: () => void
}) {
  const [activeType, setActiveType] = useState<Entry['type']>('expense')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const monthEntries = getMonthEntries(entries, viewMonth)
  const monthLabel = formatMonthLabel(viewMonth)
  const income = sumEntriesByType(monthEntries, 'income')
  const expense = sumEntriesByType(monthEntries, 'expense')

  useEffect(() => {
    setSelectedCategory(null)
  }, [activeType, viewMonth])

  function handleCategorySelect(category: string) {
    setSelectedCategory((current) => (current === category ? null : category))
  }

  return (
    <PageShell size="wide" className="ui-page-enter-delay-120 gap-8" aria-busy={isLoading}>
      <PageHeader
        eyebrow="the month analysis"
        title={monthLabel}
        description="See where the month went, then select a category to review its transactions."
        backLabel="Dashboard"
        onBack={onBack}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              type="button"
              onClick={() => onMonthChange(-1)}
              aria-label="Previous month">
              <CaretLeft size={17} />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              type="button"
              onClick={() => onMonthChange(1)}
              aria-label="Next month">
              <CaretRight size={17} />
            </Button>
          </div>
        }
      />
      {isLoading ? (
        <div className="flex gap-5 border-y border-line py-3" aria-hidden="true">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ) : (
        <div className="ui-label grid grid-cols-3 gap-4 border-y border-line py-3 max-xs:gap-2 max-xs:text-[9px]">
          <span className="min-w-0">
            <MoneyAmount amount={income} tone="income" showSign as="b" className="font-normal" /> income
          </span>
          <span className="min-w-0">
            <MoneyAmount amount={expense} tone="expense" showSign as="b" className="font-normal" /> expense
          </span>
          <span className="min-w-0">
            <b className="ui-number font-normal text-ink">{monthEntries.length}</b> records
          </span>
        </div>
      )}
      <Tabs value={activeType} onValueChange={(value) => isEntryType(value) && setActiveType(value)}>
        <TabsList aria-label="Analysis type">
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        <TabsContent className="analysis-tab-content swipe-left" value="expense">
          <AnalysisDistribution
            type="expense"
            entries={monthEntries}
            isLoading={isLoading}
            selectedCategory={activeType === 'expense' ? selectedCategory : null}
            onSelectCategory={handleCategorySelect}
            onCloseCategory={() => setSelectedCategory(null)}
          />
        </TabsContent>
        <TabsContent className="analysis-tab-content swipe-right" value="income">
          <AnalysisDistribution
            type="income"
            entries={monthEntries}
            isLoading={isLoading}
            selectedCategory={activeType === 'income' ? selectedCategory : null}
            onSelectCategory={handleCategorySelect}
            onCloseCategory={() => setSelectedCategory(null)}
          />
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
