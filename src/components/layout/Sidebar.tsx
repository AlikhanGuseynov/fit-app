import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavigationItem } from './types'

type SidebarProps = {
  navItems: NavigationItem[]
}

const Sidebar = ({ navItems }: SidebarProps) => {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-96px)] w-56 shrink-0 rounded-xl border border-border bg-card p-4 shadow-sm md:block">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground',
                isActive && 'bg-primary/10 text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
