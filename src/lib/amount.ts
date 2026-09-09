export function formatAmountExpression(value: string) {
  return value.replace(/\d[\d,]*(?:\.\d*)?/g, (token) => {
    const [integer, fraction] = token.split('.')
    const grouped = Number(integer.replace(/,/g, '') || 0).toLocaleString('en-US')
    return fraction === undefined ? grouped : `${grouped}.${fraction}`
  })
}

export function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits).toLocaleString('en-US') : ''
}

export function evaluateExpression(value: string) {
  const expression = value.replaceAll('×', '*').replaceAll('÷', '/').replace(/,/g, '').trim()
  let cursor = 0

  function skipSpaces() {
    while (expression[cursor] === ' ') cursor += 1
  }

  function parseExpression(): number {
    let result = parseTerm()
    while (true) {
      skipSpaces()
      const operator = expression[cursor]
      if (operator !== '+' && operator !== '-') return result
      cursor += 1
      const right = parseTerm()
      result = operator === '+' ? result + right : result - right
    }
  }

  function parseTerm(): number {
    let result = parseFactor()
    while (true) {
      skipSpaces()
      const operator = expression[cursor]
      if (operator !== '*' && operator !== '/') return result
      cursor += 1
      const right = parseFactor()
      if (operator === '/' && right === 0) throw new Error('Cannot divide by zero.')
      result = operator === '*' ? result * right : result / right
    }
  }

  function parseFactor(): number {
    skipSpaces()
    if (expression[cursor] === '+') {
      cursor += 1
      return parseFactor()
    }
    if (expression[cursor] === '-') {
      cursor += 1
      return -parseFactor()
    }
    if (expression[cursor] === '(') {
      cursor += 1
      const result = parseExpression()
      skipSpaces()
      if (expression[cursor] !== ')') throw new Error('Close the parentheses.')
      cursor += 1
      return result
    }

    const number = expression.slice(cursor).match(/^(?:\d+(?:\.\d*)?|\.\d+)/)?.[0]
    if (!number) throw new Error('Enter a valid amount.')
    cursor += number.length
    return Number(number)
  }

  if (!expression) throw new Error('Enter an amount greater than zero.')
  const result = parseExpression()
  skipSpaces()
  if (cursor < expression.length || !Number.isFinite(result)) throw new Error('Enter a valid calculation.')
  return result
}
