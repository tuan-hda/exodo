export function triggerHaptic(switchInput?: HTMLInputElement | null) {
  switchInput?.click()
  if (typeof navigator !== 'undefined') navigator.vibrate?.(8)
}
