export type Category = string

export type CategoryStyle = {
  borderClass: string
  backgroundClass: string
  foregroundClass: string
  chartColor: string
}

const categoryChartColors: Record<string, string> = {
  Dining: '#151515',
  Groceries: '#3d3d3a',
  Shopping: '#575650',
  Transit: '#6e6c66',
  Transport: '#6e6c66',
  Entertainment: '#85827a',
  'Bill & Fees': '#99968d',
  Bills: '#99968d',
  Gifts: '#ada9a0',
  Travel: '#c0bcb2',
  Beverage: '#d0ccc2',
  Food: '#85827a',
  Home: '#d0ccc2',
  Other: '#707070',
  Salary: '#3d3d3a',
  Income: '#6e6c66',
}

export const categoryStyles: Record<string, CategoryStyle> = Object.fromEntries(
  Object.entries(categoryChartColors).map(([category, chartColor]) => [
    category,
    {
      borderClass: 'border-line-strong',
      backgroundClass: 'bg-soft',
      foregroundClass: 'text-ink',
      chartColor,
    },
  ]),
) as Record<string, CategoryStyle>

export function categoryBorderStyle(category: Category) {
  return { borderColor: `${categoryStyles[category]?.chartColor ?? '#707070'}1A` }
}
