import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Pencil, Settings, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/editor', label: 'Editor', icon: Pencil },
  { to: '/settings', label: 'Definições', icon: Settings },
]

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout, user } = useAuthStore()

  // Calculate initials
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U'

  const isAdmin = Boolean(user?.labels?.includes('admin'))

  return (
    <header className="h-12 bg-background border-b border-border flex items-center px-4 gap-2 fixed top-0 left-0 right-0 z-50">
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-2 mr-6 select-none">
        <img src="/assets/brand/logo.png" alt="Blue IA Logo" className="w-6 h-6 object-contain" />
        <div className="flex flex-col -gap-1">
          <span className="font-sans font-bold text-[13px] leading-tight text-foreground tracking-tight">
            Blue IA
          </span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest leading-none">
            Studio
          </span>
        </div>
      </NavLink>

      {/* Desktop nav */}
      <nav className="hidden md:flex h-full items-stretch gap-0.5" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-3.5 flex items-center text-[13px] relative transition-colors whitespace-nowrap gap-1.5 after:content-[""] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-t after:transition-all after:duration-200 ${
                isActive
                  ? 'text-foreground after:bg-primary after:opacity-100'
                  : 'text-muted-foreground hover:text-muted-foreground after:bg-transparent after:opacity-0'
              }`
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        {user && (
          <div className="hidden md:flex items-center gap-3 border-r border-border pr-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-medium text-foreground">{user.name || 'Utilizador'}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">{user.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[12px] font-semibold text-foreground">
              {initials}
            </div>
          </div>
        )}

        {user && (
          <button
            onClick={() => logout()}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Terminar sessão"
          >
            <LogOut size={16} />
          </button>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="absolute top-12 left-0 right-0 bg-background border-b border-border md:hidden z-50">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-[13px] transition-colors ${
                  isActive ? 'text-primary bg-primary-glow' : 'text-muted-foreground hover:bg-secondary'
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
