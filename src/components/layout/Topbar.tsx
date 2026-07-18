import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut, User as UserIcon, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { roleTone } from '@/config/roles'
import { fullName } from '@/lib/utils'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onMenu}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {greeting}, {user?.firstName} 👋
          </p>
          <p className="hidden text-xs text-slate-400 sm:block">
            Here's what's happening at your school today.
          </p>
        </div>
      </div>

      <div className="relative" ref={ref}>
        <button
          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-slate-50"
          onClick={() => setOpen((o) => !o)}
        >
          <Avatar first={user?.firstName} last={user?.lastName} size="sm" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-800">{fullName(user)}</p>
            <p className="text-[11px] leading-tight text-slate-400">{user?.role}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 origin-top-right animate-scale-in rounded-2xl border border-slate-200 bg-white p-2 shadow-card-lg">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
              <Avatar first={user?.firstName} last={user?.lastName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{fullName(user)}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <div className="px-2 pb-2">
              {user && <Badge tone={roleTone(user.role)}>{user.role}</Badge>}
            </div>
            <div className="my-1 h-px bg-slate-100" />
            <button
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              onClick={() => {
                setOpen(false)
                navigate('/app/profile')
              }}
            >
              <UserIcon className="h-4 w-4" /> My profile
            </button>
            <button
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
