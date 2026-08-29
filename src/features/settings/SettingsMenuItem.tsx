import type { ReactNode } from 'react'
import { ArrowRight } from '@phosphor-icons/react'

export function SettingsMenuItem({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button type="button" className="settings-menu-item" onClick={onClick}>
      <span className="settings-menu-icon">{icon}</span>
      <span className="settings-menu-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ArrowRight className="settings-menu-arrow" size={18} />
    </button>
  )
}
