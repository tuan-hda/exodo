const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatMoney(value: number) {
  return `${whole.format(Math.round(value))} ₫`
}
