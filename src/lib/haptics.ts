export function triggerHaptic() {
  if (typeof navigator !== 'undefined') navigator.vibrate?.(8)
  if (typeof document === 'undefined') return

  const switchInput = document.createElement('input')
  switchInput.type = 'checkbox'
  switchInput.setAttribute('switch', '')
  switchInput.tabIndex = -1
  switchInput.setAttribute('aria-hidden', 'true')
  Object.assign(switchInput.style, {
    position: 'fixed',
    left: '-100px',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none',
  })

  document.body.appendChild(switchInput)
  switchInput.click()
  switchInput.remove()
}
