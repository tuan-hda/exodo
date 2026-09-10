import type { ReactNode } from 'react'
import { Airplane, Briefcase, Car, Gift, House, PiggyBank, Target, Wallet } from '@phosphor-icons/react'
import type { IconTileTone } from '@/components/IconTile'

export type SavingsIconName = 'target' | 'airplane' | 'briefcase' | 'car' | 'gift' | 'house' | 'piggy-bank' | 'wallet'

type SavingsIconOption = {
  name: SavingsIconName
  label: string
  render: (size: number) => ReactNode
}

export const defaultSavingsIcon: SavingsIconName = 'target'

export const savingsIconOptions: readonly SavingsIconOption[] = [
  { name: 'target', label: 'Target', render: (size) => <Target size={size} weight="regular" /> },
  { name: 'airplane', label: 'Travel', render: (size) => <Airplane size={size} weight="regular" /> },
  { name: 'briefcase', label: 'Work', render: (size) => <Briefcase size={size} weight="regular" /> },
  { name: 'car', label: 'Car', render: (size) => <Car size={size} weight="regular" /> },
  { name: 'gift', label: 'Gift', render: (size) => <Gift size={size} weight="regular" /> },
  { name: 'house', label: 'Home', render: (size) => <House size={size} weight="regular" /> },
  { name: 'piggy-bank', label: 'Reserve', render: (size) => <PiggyBank size={size} weight="regular" /> },
  { name: 'wallet', label: 'Wallet', render: (size) => <Wallet size={size} weight="regular" /> },
]

const savingsIconTones: Record<SavingsIconName, IconTileTone> = {
  target: 'blue',
  airplane: 'teal',
  briefcase: 'amber',
  car: 'sage',
  gift: 'rose',
  house: 'clay',
  'piggy-bank': 'coral',
  wallet: 'plum',
}

export function normalizeSavingsIcon(name: string | null | undefined): SavingsIconName {
  return savingsIconOptions.find((option) => option.name === name)?.name ?? defaultSavingsIcon
}

export function savingsIconTone(name: string | null | undefined): IconTileTone {
  return savingsIconTones[normalizeSavingsIcon(name)]
}

export function SavingsIcon({ name, size = 22 }: { name?: string; size?: number }) {
  const option = savingsIconOptions.find((item) => item.name === name)
  return option?.render(size) ?? <Target size={size} weight="regular" />
}
