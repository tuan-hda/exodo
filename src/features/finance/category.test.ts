import { describe, expect, it } from 'vitest'
import {
  canonicalCategory,
  categoryChartColor,
  categoryClass,
  categoryForegroundClass,
  categoryIcon,
  categoryIndicatorClass,
  categoryStyle,
  categoryStyles,
  expenseCategories,
  incomeCategories,
} from './category'

describe('category presentation', () => {
  it('keeps every supported category on the shared accent system', () => {
    for (const category of [...expenseCategories, ...incomeCategories]) {
      expect(categoryStyles[category]).toBeDefined()
      expect(categoryClass(category)).toContain('category-')
      expect(categoryForegroundClass(category)).toContain('text-category-')
      expect(categoryIndicatorClass(category)).toContain('bg-category-')
      expect(categoryChartColor(category)).toMatch(/^var\(--color-category-/)
    }
  })

  it('uses the Other tone for imported or legacy categories', () => {
    expect(categoryStyle('Legacy category')).toBe(categoryStyle('Other'))
    expect(categoryClass('Legacy category')).toBe(categoryClass('Other'))
    expect(categoryForegroundClass('Legacy category')).toBe(categoryForegroundClass('Other'))
    expect(categoryIndicatorClass('Legacy category')).toBe(categoryIndicatorClass('Other'))
    expect(categoryChartColor('Legacy category')).toBe(categoryChartColor('Other'))
  })

  it('keeps legacy category aliases on the matching icon family', () => {
    expect(categoryIcon('Transport').type).toBe(categoryIcon('Transit').type)
    expect(categoryIcon('Bills').type).toBe(categoryIcon('Bill & Fees').type)
    expect(categoryIcon('Food').type).toBe(categoryIcon('Dining').type)
    expect(categoryIcon('Home').type).not.toBe(categoryIcon('Other').type)
  })

  it('normalizes legacy category labels for shared calculations', () => {
    expect(canonicalCategory('Transport')).toBe('Transit')
    expect(canonicalCategory('Bills')).toBe('Bill & Fees')
    expect(canonicalCategory('Food')).toBe('Dining')
    expect(canonicalCategory('Home')).toBe('Home')
  })
})
