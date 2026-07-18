import { Mail, Phone, ShieldCheck, KeyRound, BadgeCheck } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { roleTone } from '@/config/roles'
import { fullName } from '@/lib/utils'

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
            <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
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
        </div>
      </div>
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
