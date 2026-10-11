import { convertToVnd, parseCurrencyAmount } from '@/lib/currency'
import { createTransactionParser } from '@/features/gmail/transaction-parser'
import type { GmailTransaction } from '@/features/gmail/types'
import type { CaptureEvent } from './contract'
import { applyAutoCollectRules } from '@/features/inbox/auto-collect-rules'

export type CaptureTransaction = Omit<GmailTransaction, 'source'> & {
  source: GmailTransaction['source'] | 'techcombank'
  content: string | null
}

const parseMailTransaction = createTransactionParser({ convertAmount: convertToVnd })

function transactionContent(body: string, source: GmailTransaction['source']): string | null {
  const text = body
    .normalize('NFC')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) =>
      line
        .replace(/\|/g, ' ')
        .trim()
        .replace(/^[*#]+\s*|\s*\*+$/g, '')
        .trim(),
    )
    .join('\n')
  const folded = text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd')
  const pattern =
    source === 'cake'
      ? /noi dung giao dich\s*:?\s*([\s\S]*?)(?=\n\s*(?:cam on|than men|cake team|can ho tro|all rights)|$)/i
      : /so tien thay doi(?:\s*\/\s*\*?changed amount\*?)?\s+([\s\S]*?)(?=\s+noi dung(?:\s*\/\s*transaction content)?)/i
  const match = pattern.exec(folded)
  if (!match?.[1]?.trim()) return null
  const end = match.index + match[0].length
  return text.slice(end - match[1].length, end).trim() || null
}

export function parseCaptureTransaction(capture: CaptureEvent): CaptureTransaction | null {
  if (capture.type === 'mail') {
    const transaction = parseMailTransaction(capture.title, capture.message)
    return (
      transaction && {
        ...applyAutoCollectRules(capture.message),
        ...transaction,
        content: transactionContent(capture.message, transaction.source),
      }
    )
  }
  if (capture.source_app.trim().toLowerCase() !== 'techcombank') return null

  const match = /^([+-])\s*(VND|USD|đ|₫)\s*(\d[\d.,]*)$/i.exec(capture.title.trim())
  if (!match) return null
  const money = parseCurrencyAmount(`${match[1]}${match[3]}`, match[2])
  const subtitle = capture.subtitle.trim()
  const occurredAt =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(subtitle) &&
    Number.isFinite(Date.parse(subtitle))
      ? new Date(subtitle).toISOString()
      : null
  const content =
    capture.message
      .split(/\r?\n/)
      .filter((line) => !/^\s*(?:Tài khoản|Tai khoan|Số dư|So du)\s*:/i.test(line))
      .join('\n')
      .trim() || null
  return {
    ...applyAutoCollectRules(capture.message),
    source: 'techcombank',
    amount: money ? convertToVnd(money.amount, money.currency) : null,
    occurredAt,
    content,
  }
}
