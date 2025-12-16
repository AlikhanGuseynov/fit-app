import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { NavigationItem } from './types'

type BottomNavProps = {
  navItems: NavigationItem[]
}

const BottomNav = ({ navItems }: BottomNavProps) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-2 shadow-2xl md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-3 gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground',
                isActive && 'bg-primary/10 text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
