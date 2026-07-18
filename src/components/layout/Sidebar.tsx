import { NavLink } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { RESOURCES } from '@/config/resources'
import { visibleNavGroups } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const groups = user ? visibleNavGroups(user.role) : []

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-extrabold leading-none tracking-tight text-slate-900">
                Scholar
              </p>
              <p className="text-[11px] font-medium text-slate-400">School Management</p>
            </div>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2">
          <NavLink to="/app" end className={navClass} onClick={onClose}>
            <LayoutDashboard className="h-[18px] w-[18px]" />
            Dashboard
          </NavLink>

          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((key) => {
                  const cfg = RESOURCES[key]
                  return (
                    <NavLink
                      key={key}
                      to={`/app/${key}`}
                      className={navClass}
                      onClick={onClose}
                    >
                      <span className="[&>svg]:h-[18px] [&>svg]:w-[18px]">{cfg.icon}</span>
                      {cfg.title}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}

function navClass({ isActive }: { isActive: boolean }) {
  return cn('nav-link', isActive && 'nav-link-active')
}
