'use client'

import type { KeyboardEvent } from 'react'
import { ChartDonut } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { categoryChartColor, categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { formatShort } from '../entries/entry-utils'
import type { AnalysisSlice } from './analysis-utils'

const MIN_LABEL_PERCENTAGE = 0.08

function slicePath(start: number, end: number) {
  const startAngle = start * Math.PI * 2 - Math.PI / 2
  const endAngle = end * Math.PI * 2 - Math.PI / 2
  const outerStart = [50 + Math.cos(startAngle) * 48, 50 + Math.sin(startAngle) * 48]
  const outerEnd = [50 + Math.cos(endAngle) * 48, 50 + Math.sin(endAngle) * 48]
  const innerEnd = [50 + Math.cos(endAngle) * 25, 50 + Math.sin(endAngle) * 25]
  const innerStart = [50 + Math.cos(startAngle) * 25, 50 + Math.sin(startAngle) * 25]
  const largeArc = end - start > 0.5 ? 1 : 0
  return `M ${outerStart.join(' ')} A 48 48 0 ${largeArc} 1 ${outerEnd.join(' ')} L ${innerEnd.join(' ')} A 25 25 0 ${largeArc} 0 ${innerStart.join(' ')} Z`
}

export function PieChart({
  slices,
  total,
  selectedCategory,
  onSelect,
}: {
  slices: AnalysisSlice[]
  total: number
  selectedCategory: string | null
  onSelect: (category: string) => void
}) {
  let offset = 0
  const segments = slices.map((slice) => {
    const start = offset
    const end = offset + slice.percentage
    offset = end
    return {
      ...slice,
      start,
      end,
      color: categoryChartColor(slice.category),
      midpoint: (start + slice.percentage / 2) * Math.PI * 2 - Math.PI / 2,
    }
  })

  return (
    <div className="relative mx-auto size-[300px] max-[430px]:size-[240px]">
      <div className="relative size-full">
        <svg
          className="pie-reveal size-full overflow-visible"
          viewBox="-4 -4 108 108"
          role="img"
          aria-label={segments.length ? `Distribution totaling ${formatShort(total)}` : 'No records for this month'}>
          {segments.map((segment) => {
            const isSelected = segment.category === selectedCategory
            const scale = isSelected ? 1.06 : 1
            const transform = `translate(50 50) scale(${scale}) translate(-50 -50)`
            const shapeProps = {
              className:
                'pie-slice cursor-pointer outline-none transition-[transform] duration-[600ms] ease-[cubic-bezier(.05,.78,.18,1)] focus-visible:stroke-ink focus-visible:stroke-[1.5]',
              fill: segment.color,
              onClick: () => onSelect(segment.category),
              onKeyDown: (event: KeyboardEvent<SVGElement>) => {
                if (event.key === 'Enter' || event.key === ' ') onSelect(segment.category)
              },
              role: 'button',
              tabIndex: 0,
              'aria-label': `${segment.category}, ${formatShort(segment.amount)}`,
              transform,
            }
            return segment.percentage > 0.999 ? (
              <circle {...shapeProps} key={segment.category} cx="50" cy="50" r="48" />
            ) : (
              <path {...shapeProps} key={segment.category} d={slicePath(segment.start, segment.end)} />
            )
          })}
        </svg>
        {segments
          .filter((segment) => segment.percentage >= MIN_LABEL_PERCENTAGE || segment.category === selectedCategory)
          .map((segment) => (
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2"
              key={segment.category}
              style={{
                left: `${50 + Math.cos(segment.midpoint) * 48}%`,
                top: `${50 + Math.sin(segment.midpoint) * 48}%`,
              }}>
              <button
                type="button"
                className={clsx(
                  'grid size-14 place-items-center rounded-full border-2 bg-white shadow-[0_2px_8px_rgb(21_21_21_/_0.12)] transition-transform duration-[600ms] ease-[cubic-bezier(.05,.78,.18,1)] max-[430px]:size-11',
                  segment.category === selectedCategory && segment.percentage < MIN_LABEL_PERCENTAGE
                    ? 'animate-[pie-badge-zoom-small_600ms_cubic-bezier(.05,.78,.18,1)_both]'
                    : segment.category === selectedCategory
                      ? 'animate-[pie-badge-zoom-selected_600ms_cubic-bezier(.05,.78,.18,1)_both]'
                      : undefined,
                  categoryClass(segment.category),
                )}>
                {categoryIcon(segment.category, 24)}
              </button>
            </span>
          ))}
      </div>
      <div className="absolute inset-[25%] grid place-items-center rounded-full bg-white text-center">
        <div>
          <ChartDonut className="mx-auto mb-1 text-muted" size={17} />
          <strong className="block font-mono text-sm font-normal tracking-[-.04em]">{formatShort(total)}</strong>
          <span className="font-mono text-[9px] uppercase tracking-[.08em] text-muted">total</span>
        </div>
      </div>
    </div>
  )
}
