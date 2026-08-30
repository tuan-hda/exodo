import { Bell, CalendarBlank, Gear, House, Plus } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import { Button } from '../../components/ui/button'

export type AppTab = 'today' | 'month' | 'notifications' | 'settings'

export function MobileTabBar({
  activeTab,
  onChange,
  onRecord,
}: {
  activeTab: AppTab
  onChange: (tab: AppTab) => void
  onRecord: () => void
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[4] hidden grid-cols-5 items-center gap-1 border-t border-line bg-white/95 px-3 pt-2 backdrop-blur-[16px] max-[700px]:grid"
      style={{ height: 'calc(68px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary navigation">
      <Button
        variant="ghost"
        className={clsx(
          'flex h-12 min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-transparent p-0 text-muted no-underline',
          activeTab === 'today' && 'text-ink',
        )}
        type="button"
        onClick={() => onChange('today')}>
        <House size={20} weight={activeTab === 'today' ? 'fill' : 'regular'} />
        <span className="font-mono text-[9px] uppercase tracking-[.04em]">Today</span>
      </Button>
      <Button
        variant="ghost"
        className={clsx(
          'flex h-12 min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-transparent p-0 text-muted no-underline',
          activeTab === 'month' && 'text-ink',
        )}
        type="button"
        onClick={() => onChange('month')}>
        <CalendarBlank size={20} weight={activeTab === 'month' ? 'fill' : 'regular'} />
        <span className="font-mono text-[9px] uppercase tracking-[.04em]">Month</span>
      </Button>
      <Button
        className="relative z-10 grid size-12 place-items-center self-center justify-self-center rounded-full border-0 bg-ink p-0 text-white shadow-[0_8px_24px_rgb(21_21_21_/_0.2)]"
        type="button"
        onClick={onRecord}
        aria-label="Add income or expense">
        <Plus size={23} weight="bold" />
      </Button>
      <Button
        variant="ghost"
        className={clsx(
          'flex h-12 min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-transparent p-0 text-muted no-underline',
          activeTab === 'notifications' && 'text-ink',
        )}
        type="button"
        onClick={() => onChange('notifications')}>
        <Bell size={20} weight={activeTab === 'notifications' ? 'fill' : 'regular'} />
        <span className="font-mono text-[9px] uppercase tracking-[.04em]">Alerts</span>
      </Button>
      <Button
        variant="ghost"
        className={clsx(
          'flex h-12 min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-transparent p-0 text-muted no-underline',
          activeTab === 'settings' && 'text-ink',
        )}
        type="button"
        onClick={() => onChange('settings')}>
        <Gear size={20} weight={activeTab === 'settings' ? 'fill' : 'regular'} />
        <span className="font-mono text-[9px] uppercase tracking-[.04em]">Settings</span>
      </Button>
    </nav>
  )
}
