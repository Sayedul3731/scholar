import { useState } from 'react'
import { Mail, Phone, ShieldCheck, KeyRound, BadgeCheck, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { roleTone } from '@/config/roles'
import { fullName } from '@/lib/utils'
import { apiPatch, getApiError } from '@/lib/api'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null

  const permissions = new Set<string>()
  user.roles?.forEach((r) => r.permissions?.forEach((p) => permissions.add(p.name)))

  return (
    <div className="animate-fade-in">
      <PageHeader title="My Profile" subtitle="Your account details and access" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-center text-white">
            <div className="flex justify-center">
              <Avatar first={user.firstName} last={user.lastName} size="lg" className="h-20 w-20 text-2xl ring-white/30" />
            </div>
            <p className="mt-4 font-display text-xl font-bold">{fullName(user)}</p>
            <div className="mt-2 flex justify-center">
              <Badge tone={roleTone(user.role)}>{user.role}</Badge>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email ?? '—'} />
            <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone ?? '—'} />
            <Row
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Account status"
              value={user.isActive ? 'Active' : 'Inactive'}
            />
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">Assigned roles</h3>
            </div>
            {user.roles && user.roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.roles.map((r) => (
                  <Badge key={r.id} tone="purple">
                    {r.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No RBAC roles assigned. Primary role: <b>{user.role}</b>.
              </p>
            )}
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 text-brand-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">Permissions</h3>
            </div>
            {permissions.size > 0 ? (
              <div className="flex flex-wrap gap-2">
                {[...permissions].map((p) => (
                  <Badge key={p} tone="blue">
                    {p}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No granular permissions assigned.</p>
            )}
          </div>

          <ChangePasswordCard />
        </div>
      </div>
    </div>
  )
}

function ChangePasswordCard() {
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (next !== confirm) {
      toast.error('New password and confirmation do not match')
      return
    }
    setLoading(true)
    try {
      await apiPatch('/users/me/password', { currentPassword: current, newPassword: next })
      // Changing the password revokes every session (logging out other
      // devices). Silently re-authenticate this device with the new password
      // so the current session keeps working.
      const identifier = user?.email ?? user?.phone
      if (identifier) {
        await login({ identifier, password: next })
      }
      toast.success('Password changed. Other devices have been signed out.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600">
          <KeyRound className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-900">Change password</h3>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Current password</label>
          <input
            type={show ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className="input"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">New password</label>
            <input
              type={show ? 'text' : 'password'}
              required
              autoComplete="new-password"
              className="input"
              placeholder="At least 8 characters"
              value={next}
              onChange={(e) => setNext(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type={show ? 'text' : 'password'}
              required
              autoComplete="new-password"
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
            onClick={() => setShow((s) => !s)}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {show ? 'Hide' : 'Show'} passwords
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading && <Spinner className="h-4 w-4" />}
            Update password
          </button>
        </div>
      </form>
    </div>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  )
}
