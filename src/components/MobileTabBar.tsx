import { Bell, CalendarBlank, House, Plus, UserCircle } from '@phosphor-icons/react'

export type AppTab = 'today' | 'month' | 'notifications' | 'account'

export function MobileTabBar({ activeTab, onChange, onRecord }: { activeTab: AppTab; onChange: (tab: AppTab) => void; onRecord: () => void }) {
  return <nav className="mobile-nav" aria-label="Primary navigation"><button className={activeTab === 'today' ? 'active' : ''} type="button" onClick={() => onChange('today')}><House size={20} weight={activeTab === 'today' ? 'fill' : 'regular'} /><span>Today</span></button><button className={activeTab === 'month' ? 'active' : ''} type="button" onClick={() => onChange('month')}><CalendarBlank size={20} weight={activeTab === 'month' ? 'fill' : 'regular'} /><span>Month</span></button><button className="mobile-nav-record" type="button" onClick={onRecord} aria-label="Add expense"><Plus size={23} weight="bold" /></button><button className={activeTab === 'notifications' ? 'active' : ''} type="button" onClick={() => onChange('notifications')}><Bell size={20} weight={activeTab === 'notifications' ? 'fill' : 'regular'} /><span>Alerts</span></button><button className={activeTab === 'account' ? 'active' : ''} type="button" onClick={() => onChange('account')}><UserCircle size={20} weight={activeTab === 'account' ? 'fill' : 'regular'} /><span>Account</span></button></nav>
}
