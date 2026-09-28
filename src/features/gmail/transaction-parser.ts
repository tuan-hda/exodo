export function classifyTransactionSubject(subject: string): 'cake' | 'vpbank-credit' | 'vpbank-debit' | null {
  const title = subject
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/gi, 'd')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
  if (/^\[cake\] thong bao giao dich thanh cong[.!]?$/.test(title)) return 'cake'
  if (
    /^vpbank xin thong bao bien dong so du the tin dung cua quy khach(?: - vpbank would like to inform your credit card['’]s balance change)?[.!]?$/.test(
      title,
    )
  )
    return 'vpbank-credit'
  if (/^vpbank\s*-\s*thong bao bien dong so du\s*\/\s*balance changed[.!]?$/.test(title)) return 'vpbank-debit'
  return null
}
