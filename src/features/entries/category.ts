export type Category = string

export type CategoryStyle = {
  borderClass: string
  backgroundClass: string
  foregroundClass: string
  chartColor: string
}

export const categoryStyles: Record<string, CategoryStyle> = {
  Dining: {
    borderClass: 'border-ink',
    backgroundClass: 'bg-soft',
    foregroundClass: 'text-ink',
    chartColor: '#151515',
  },
  Groceries: {
    borderClass: 'border-[#2f7d32]',
    backgroundClass: 'bg-[#ebf7eb]',
    foregroundClass: 'text-[#2f7d32]',
    chartColor: '#2f7d32',
  },
  Shopping: {
    borderClass: 'border-[#6842a5]',
    backgroundClass: 'bg-[#f2edfb]',
    foregroundClass: 'text-[#6842a5]',
    chartColor: '#6842a5',
  },
  Transit: {
    borderClass: 'border-[#1769a8]',
    backgroundClass: 'bg-[#eaf4fc]',
    foregroundClass: 'text-[#1769a8]',
    chartColor: '#1769a8',
  },
  Transport: {
    borderClass: 'border-[#1769a8]',
    backgroundClass: 'bg-[#eaf4fc]',
    foregroundClass: 'text-[#1769a8]',
    chartColor: '#1769a8',
  },
  Entertainment: {
    borderClass: 'border-[#b97800]',
    backgroundClass: 'bg-[#fff6e2]',
    foregroundClass: 'text-[#b97800]',
    chartColor: '#b97800',
  },
  'Bill & Fees': {
    borderClass: 'border-[#536273]',
    backgroundClass: 'bg-[#eff2f5]',
    foregroundClass: 'text-[#536273]',
    chartColor: '#536273',
  },
  Bills: {
    borderClass: 'border-[#536273]',
    backgroundClass: 'bg-[#eff2f5]',
    foregroundClass: 'text-[#536273]',
    chartColor: '#536273',
  },
  Gifts: {
    borderClass: 'border-[#b1376b]',
    backgroundClass: 'bg-[#fcecf4]',
    foregroundClass: 'text-[#b1376b]',
    chartColor: '#b1376b',
  },
  Travel: {
    borderClass: 'border-[#087c83]',
    backgroundClass: 'bg-[#e8f7f6]',
    foregroundClass: 'text-[#087c83]',
    chartColor: '#087c83',
  },
  Beverage: {
    borderClass: 'border-[#965619]',
    backgroundClass: 'bg-[#faf0e5]',
    foregroundClass: 'text-[#965619]',
    chartColor: '#965619',
  },
  Food: {
    borderClass: 'border-[#b97800]',
    backgroundClass: 'bg-[#fff6e2]',
    foregroundClass: 'text-[#b97800]',
    chartColor: '#b97800',
  },
  Home: {
    borderClass: 'border-[#965619]',
    backgroundClass: 'bg-[#faf0e5]',
    foregroundClass: 'text-[#965619]',
    chartColor: '#965619',
  },
  Other: {
    borderClass: 'border-line-strong',
    backgroundClass: 'bg-soft',
    foregroundClass: 'text-muted',
    chartColor: '#707070',
  },
  Salary: {
    borderClass: 'border-[#2f7d32]',
    backgroundClass: 'bg-[#ebf7eb]',
    foregroundClass: 'text-[#2f7d32]',
    chartColor: '#2f7d32',
  },
  Income: {
    borderClass: 'border-[#1769a8]',
    backgroundClass: 'bg-[#eaf4fc]',
    foregroundClass: 'text-[#1769a8]',
    chartColor: '#1769a8',
  },
}
