'use client'

import type { KeyboardEvent } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { categoryChartColor, categoryClass, categoryIcon } from '../entries/CategoryPicker'
import { formatShort } from '../entries/entry-utils'
import { CountUp } from '../../components/ui/count-up'
import type { AnalysisSlice } from './analysis-utils'

const MIN_LABEL_PERCENTAGE = 0.08

function slicePath(start: number, end: number, outerRadius: number) {
  const startAngle = start * Math.PI * 2 - Math.PI / 2
  const endAngle = end * Math.PI * 2 - Math.PI / 2
  const outerStart = [50 + Math.cos(startAngle) * outerRadius, 50 + Math.sin(startAngle) * outerRadius]
  const outerEnd = [50 + Math.cos(endAngle) * outerRadius, 50 + Math.sin(endAngle) * outerRadius]
  const innerEnd = [50 + Math.cos(endAngle) * 25, 50 + Math.sin(endAngle) * 25]
  const innerStart = [50 + Math.cos(startAngle) * 25, 50 + Math.sin(startAngle) * 25]
  const largeArc = end - start > 0.5 ? 1 : 0
  return `M ${outerStart.join(' ')} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.join(' ')} L ${innerEnd.join(' ')} A 25 25 0 ${largeArc} 0 ${innerStart.join(' ')} Z`
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
  const [outerRadius, setOuterRadius] = useState(48)
  const [visualSelectedCategory, setVisualSelectedCategory] = useState<string | null>(null)
  const animationFrame = useRef<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const badgeRefs = useRef<Record<string, HTMLSpanElement | null>>({})

  useEffect(() => {
    const targetRadius = selectedCategory ? 50 : 48
    const startRadius = selectedCategory ? 48 : outerRadius
    const categoryToAnimate = selectedCategory ?? visualSelectedCategory

    if (!categoryToAnimate) return
    if (selectedCategory) setVisualSelectedCategory(selectedCategory)
    const startTime = performance.now()

    if (animationFrame.current) cancelAnimationFrame(animationFrame.current)

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / 600, 1)
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      setOuterRadius(startRadius + (targetRadius - startRadius) * easedProgress)
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate)
      } else if (!selectedCategory) {
        setVisualSelectedCategory(null)
      }
    }

    animationFrame.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    }
  }, [selectedCategory])

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

  useLayoutEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    const updateBadgePositions = () => {
      const center = chart.clientWidth / 2
      const selectedRadius = chart.clientWidth * (outerRadius / 100)
      const defaultRadius = chart.clientWidth * 0.48

      segments.forEach((segment) => {
        const badge = badgeRefs.current[segment.category]
        if (!badge) return

        const radius = segment.category === visualSelectedCategory ? selectedRadius : defaultRadius
        badge.style.left = `${center + Math.cos(segment.midpoint) * radius}px`
        badge.style.top = `${center + Math.sin(segment.midpoint) * radius}px`
      })
    }

    updateBadgePositions()
    const observer = new ResizeObserver(updateBadgePositions)
    observer.observe(chart)

    return () => observer.disconnect()
  }, [outerRadius, slices, visualSelectedCategory])

  return (
    <div ref={chartRef} className="relative mx-auto size-[300px] max-[430px]:size-[240px]">
      <div className="relative size-full">
        <svg
          className="pie-reveal size-full overflow-visible"
          viewBox="0 0 100 100"
          role="img"
          aria-label={segments.length ? `Distribution totaling ${formatShort(total)}` : 'No records for this month'}>
          {segments.map((segment) => {
            const isSelected = segment.category === visualSelectedCategory
            const segmentOuterRadius = isSelected ? outerRadius : 48
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
            }
            return segment.percentage > 0.999 ? (
              <circle {...shapeProps} key={segment.category} cx="50" cy="50" r={segmentOuterRadius} />
            ) : (
              <path
                {...shapeProps}
                key={segment.category}
                d={slicePath(segment.start, segment.end, segmentOuterRadius)}
              />
            )
          })}
        </svg>
        {segments
          .filter(
            (segment) => segment.percentage >= MIN_LABEL_PERCENTAGE || segment.category === visualSelectedCategory,
          )
          .map((segment) => (
            <span
              ref={(node) => {
                badgeRefs.current[segment.category] = node
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              key={segment.category}>
              <button
                type="button"
                className={clsx(
                  'grid size-14 place-items-center rounded-full border-[3px] shadow-[0_2px_8px_rgb(21_21_21_/_0.12)] transition-transform duration-[600ms] ease-[cubic-bezier(.05,.78,.18,1)] max-[430px]:size-11',
                  segment.category === selectedCategory && segment.percentage < MIN_LABEL_PERCENTAGE
                    ? 'animate-[pie-badge-zoom-small_600ms_cubic-bezier(.05,.78,.18,1)_both]'
                    : segment.category === visualSelectedCategory && !selectedCategory
                      ? segment.percentage < MIN_LABEL_PERCENTAGE
                        ? 'animate-[pie-badge-zoom-small-out_600ms_cubic-bezier(.05,.78,.18,1)_both]'
                        : 'animate-[pie-badge-zoom-deselect_600ms_cubic-bezier(.05,.78,.18,1)_both]'
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
        <strong className="font-mono text-lg font-semibold tracking-[-.05em]">
          <CountUp value={total} formatValue={formatShort} />
        </strong>
      </div>
    </div>
  )
}
