import { Outlet } from 'react-router-dom'
import { Activity, LayoutDashboard, LineChart } from 'lucide-react'
import BottomNav from './BottomNav'
import Header from './Header'
import Sidebar from './Sidebar'
import type { NavigationItem } from './types'

const navItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Progress', href: '/app/progress', icon: LineChart },
  { label: 'Activity', href: '/app/activity', icon: Activity },
]

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header navItems={navItems} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 pb-16 pt-6 md:pb-8">
        <Sidebar navItems={navItems} />
        <main className="flex-1 rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur">
          <Outlet />
        </main>
      </div>
      <BottomNav navItems={navItems} />
    </div>
  )
}

export default AppLayout
