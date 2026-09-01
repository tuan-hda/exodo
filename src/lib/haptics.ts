export function triggerHaptic() {
  if (typeof navigator !== 'undefined') navigator.vibrate?.(8)
}
