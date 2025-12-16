import { Link } from 'react-router-dom'
import { Menu, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NavigationItem } from './types'

type HeaderProps = {
  navItems: NavigationItem[]
}

const Header = ({ navItems }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/app/dashboard" className="flex items-center gap-2 text-lg font-semibold">
            <PanelLeft className="h-5 w-5 text-primary" />
            FitFlow
          </Link>
          <nav className="ml-6 hidden items-center gap-3 text-sm font-medium text-muted-foreground md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-md px-2 py-1.5 transition hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <Button size="sm" asChild>
            <Link to="/register">Create account</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
