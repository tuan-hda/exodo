import { CalendarBlank, ClockCounterClockwise, House, Plus } from '@phosphor-icons/react'
import { AuthAccount } from './AuthGate'

export type AppTab = 'today' | 'month' | 'activity'

export function MobileTabBar({ activeTab, onChange, onRecord }: { activeTab: AppTab; onChange: (tab: AppTab) => void; onRecord: () => void }) {
  return <nav className="mobile-nav" aria-label="Primary navigation"><button className={activeTab === 'today' ? 'active' : ''} type="button" onClick={() => onChange('today')}><House size={20} weight={activeTab === 'today' ? 'fill' : 'regular'} /><span>Today</span></button><button className={activeTab === 'month' ? 'active' : ''} type="button" onClick={() => onChange('month')}><CalendarBlank size={20} weight={activeTab === 'month' ? 'fill' : 'regular'} /><span>Month</span></button><button className="mobile-nav-record" type="button" onClick={onRecord} aria-label="Add expense"><Plus size={23} weight="bold" /></button><button className={activeTab === 'activity' ? 'active' : ''} type="button" onClick={() => onChange('activity')}><ClockCounterClockwise size={20} weight={activeTab === 'activity' ? 'fill' : 'regular'} /><span>Activity</span></button><div className="mobile-nav-profile"><AuthAccount /></div></nav>
}
