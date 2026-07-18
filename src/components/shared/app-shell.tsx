import { NavLink, Outlet } from 'react-router-dom'
import { BriefcaseBusiness, LayoutDashboard, MessagesSquare, Settings, Upload, CalendarClock, Video, BadgeCheck, PanelLeftClose, PanelLeftOpen, Plug, Moon, Sun } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { useThemeStore } from '../../stores/theme-store'
import { useAuthStore } from '../../stores/auth-store'
import { api } from '../../api'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/candidates/upload', label: 'Upload', icon: Upload },
  { to: '/interviews/schedule', label: 'Schedule', icon: CalendarClock },
  { to: '/interviews/live', label: 'Proctoring', icon: Video },
  { to: '/interviews/review', label: 'Transcript', icon: MessagesSquare },
  { to: '/verdicts/report', label: 'Verdict', icon: BadgeCheck },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const year = useMemo(() => new Date().getFullYear(), [])
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const hasToken = useAuthStore((state) => Boolean(state.token))
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health.check(),
    retry: false,
    staleTime: 30_000,
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className={cn('border-r border-slate-200 bg-white/95 transition-all dark:border-slate-800 dark:bg-slate-950/95', collapsed ? 'w-24' : 'w-72')}>
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-500/15 p-2 text-indigo-600 dark:text-indigo-400">
                <BriefcaseBusiness size={18} />
              </div>
              {!collapsed && <div>
                <p className="text-sm font-semibold">Virtual Hire</p>
                <p className="text-xs text-slate-500">AI interviewing</p>
              </div>}
            </div>
            <Button className="border-0 bg-transparent p-2 hover:bg-slate-100 dark:hover:bg-slate-900" onClick={() => setCollapsed((value) => !value)}>
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </Button>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100',
                  )
                }
              >
                <Icon size={16} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 border-t border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800">
            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Plug size={14} className={hasToken ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} />
                {hasToken ? 'Bearer token set' : 'No bearer token'}
              </div>
              <p className="text-xs leading-5">
                {hasToken ? 'Authenticated requests will include it.' : 'Set one in Settings to use authenticated endpoints.'}
              </p>
            </div>
          </div>
        </aside>
        <div className="flex-1">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/70 px-6 dark:border-slate-800 dark:bg-slate-950/70">
            <div>
              <p className="text-sm text-slate-500">Operations console</p>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Virtual Hire</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="border-slate-200 bg-white p-2 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    healthQuery.isSuccess ? 'bg-emerald-400' : healthQuery.isError ? 'bg-rose-400' : 'bg-slate-400',
                  )}
                />
                {healthQuery.isSuccess ? 'API connected' : healthQuery.isError ? 'API unreachable' : 'Checking API…'}
              </div>
            </div>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
          <footer className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500 dark:border-slate-800">
            © {year} Virtual Hire • Frontend scaffold for HR operations
          </footer>
        </div>
      </div>
    </div>
  )
}
