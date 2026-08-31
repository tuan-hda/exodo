export type Category = string

export type CategoryStyle = {
  borderClass: string
  backgroundClass: string
  foregroundClass: string
  chartColor: string
}

export const categoryStyles: Record<string, CategoryStyle> = {
  Dining: {
    borderClass: 'border-[#efb6a1]',
    backgroundClass: 'bg-[#fff0ea]',
    foregroundClass: 'text-[#a84528]',
    chartColor: '#a84528',
  },
  Groceries: {
    borderClass: 'border-[#b9d7b0]',
    backgroundClass: 'bg-[#edf8e9]',
    foregroundClass: 'text-[#397631]',
    chartColor: '#397631',
  },
  Shopping: {
    borderClass: 'border-[#c9b9e8]',
    backgroundClass: 'bg-[#f3effd]',
    foregroundClass: 'text-[#694b9c]',
    chartColor: '#694b9c',
  },
  Transit: {
    borderClass: 'border-[#a9c9e8]',
    backgroundClass: 'bg-[#edf6ff]',
    foregroundClass: 'text-[#31658e]',
    chartColor: '#31658e',
  },
  Transport: {
    borderClass: 'border-[#a9c9e8]',
    backgroundClass: 'bg-[#edf6ff]',
    foregroundClass: 'text-[#31658e]',
    chartColor: '#31658e',
  },
  Entertainment: {
    borderClass: 'border-[#e9c88c]',
    backgroundClass: 'bg-[#fff7e5]',
    foregroundClass: 'text-[#936a18]',
    chartColor: '#936a18',
  },
  'Bill & Fees': {
    borderClass: 'border-[#c5cbd3]',
    backgroundClass: 'bg-[#f1f3f6]',
    foregroundClass: 'text-[#58616d]',
    chartColor: '#58616d',
  },
  Bills: {
    borderClass: 'border-[#c5cbd3]',
    backgroundClass: 'bg-[#f1f3f6]',
    foregroundClass: 'text-[#58616d]',
    chartColor: '#58616d',
  },
  Gifts: {
    borderClass: 'border-[#efb5cf]',
    backgroundClass: 'bg-[#fff0f7]',
    foregroundClass: 'text-[#a7436e]',
    chartColor: '#a7436e',
  },
  Travel: {
    borderClass: 'border-[#a9d8d5]',
    backgroundClass: 'bg-[#ebf9f8]',
    foregroundClass: 'text-[#28716d]',
    chartColor: '#28716d',
  },
  Beverage: {
    borderClass: 'border-[#d9bd9e]',
    backgroundClass: 'bg-[#fbf1e6]',
    foregroundClass: 'text-[#8b5a2b]',
    chartColor: '#8b5a2b',
  },
  Food: {
    borderClass: 'border-[#e9c88c]',
    backgroundClass: 'bg-[#fff7e5]',
    foregroundClass: 'text-[#936a18]',
    chartColor: '#936a18',
  },
  Home: {
    borderClass: 'border-[#d9bd9e]',
    backgroundClass: 'bg-[#fbf1e6]',
    foregroundClass: 'text-[#8b5a2b]',
    chartColor: '#8b5a2b',
  },
  Other: {
    borderClass: 'border-line-strong',
    backgroundClass: 'bg-soft',
    foregroundClass: 'text-muted',
    chartColor: '#707070',
  },
  Salary: {
    borderClass: 'border-[#7fbe91]',
    backgroundClass: 'bg-[#dff3e5]',
    foregroundClass: 'text-[#176b3a]',
    chartColor: '#176b3a',
  },
  Income: {
    borderClass: 'border-[#a8c7e8]',
    backgroundClass: 'bg-[#eaf3ff]',
    foregroundClass: 'text-[#275f96]',
    chartColor: '#275f96',
  },
}
