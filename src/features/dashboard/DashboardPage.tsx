import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  UserCog,
  DoorOpen,
  BookOpen,
  FileText,
  Banknote,
  Library,
  Megaphone,
  CalendarHeart,
  ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { apiGet } from '@/lib/api'
import type { PaginatedResult } from '@/types'
import { useAuthStore } from '@/store/auth'
import { canViewResource } from '@/config/navigation'
import { StatCard } from '@/components/ui/StatCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { roleTone } from '@/config/roles'
import { formatDate, fullName } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Metric {
  key: string
  path: string
  label: string
  icon: ReactNode
  tone: 'brand' | 'green' | 'amber' | 'blue' | 'purple' | 'pink'
}

const METRICS: Metric[] = [
  { key: 'students', path: '/students', label: 'Students', icon: <GraduationCap className="h-6 w-6" />, tone: 'brand' },
  { key: 'teachers', path: '/teachers', label: 'Teachers', icon: <UserCog className="h-6 w-6" />, tone: 'blue' },
  { key: 'classes', path: '/classes', label: 'Classrooms', icon: <DoorOpen className="h-6 w-6" />, tone: 'purple' },
  { key: 'subjects', path: '/subjects', label: 'Subjects', icon: <BookOpen className="h-6 w-6" />, tone: 'green' },
  { key: 'exams', path: '/exams', label: 'Exams', icon: <FileText className="h-6 w-6" />, tone: 'amber' },
  { key: 'fees', path: '/fees', label: 'Fee heads', icon: <Banknote className="h-6 w-6" />, tone: 'pink' },
  { key: 'library-books', path: '/library-books', label: 'Library books', icon: <Library className="h-6 w-6" />, tone: 'blue' },
]

const CHART_COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9']

async function fetchCount(path: string): Promise<number> {
  const res = await apiGet<PaginatedResult<{ id: string }>>(path, { params: { page: 1, limit: 1 } })
  return res.meta.totalItems
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)!

  const metrics = useMemo(
    () => METRICS.filter((m) => canViewResource(m.key, user.role)),
    [user.role],
  )

  const countQueries = useQueries({
    queries: metrics.map((m) => ({
      queryKey: ['count', m.path],
      queryFn: () => fetchCount(m.path),
      staleTime: 30_000,
    })),
  })

  const canNotices = canViewResource('notices', user.role)
  const canEvents = canViewResource('events', user.role)

  const sideQueries = useQueries({
    queries: [
      {
        queryKey: ['dash-notices'],
        queryFn: () => apiGet<PaginatedResult<Record<string, unknown>>>('/notices', { params: { page: 1, limit: 5 } }),
        enabled: canNotices,
      },
      {
        queryKey: ['dash-events'],
        queryFn: () => apiGet<PaginatedResult<Record<string, unknown>>>('/events', { params: { page: 1, limit: 5 } }),
        enabled: canEvents,
      },
    ],
  })
  const notices = sideQueries[0].data?.items ?? []
  const events = sideQueries[1].data?.items ?? []

  const chartData = metrics
    .map((m, i) => ({ name: m.label, value: countQueries[i].data ?? 0 }))
    .filter((d) => d.value > 0)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={`Overview for ${user.role}s`}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <StatCard
            key={m.key}
            label={m.label}
            value={(countQueries[i].data ?? 0).toLocaleString()}
            icon={m.icon}
            tone={m.tone}
            loading={countQueries[i].isLoading}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">School at a glance</h3>
              <p className="text-sm text-slate-500">Total records across key modules</p>
            </div>
          </div>
          {chartData.length === 0 ? (
            <div className="grid h-64 place-items-center text-sm text-slate-400">
              No data to display yet.
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 30px -12px rgb(30 27 75 / 0.25)',
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Profile / quick card */}
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
            <Avatar first={user.firstName} last={user.lastName} size="lg" className="ring-white/30" />
            <p className="mt-3 font-display text-xl font-bold">{fullName(user)}</p>
            <p className="text-sm text-brand-100">{user.email}</p>
          </div>
          <div className="space-y-3 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Role</span>
              <Badge tone={roleTone(user.role)}>{user.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Status</span>
              <Badge tone={user.isActive ? 'green' : 'red'}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {user.phone && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Phone</span>
                <span className="text-sm font-medium text-slate-700">{user.phone}</span>
              </div>
            )}
            <Link to="/app/profile" className="btn-outline mt-2 w-full">
              View full profile
            </Link>
          </div>
        </div>
      </div>

      {/* Notices + Events */}
      {(canNotices || canEvents) && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {canNotices && (
            <ListCard
              title="Latest notices"
              icon={<Megaphone className="h-5 w-5" />}
              to="/app/notices"
              empty="No notices posted."
              items={notices.map((n) => ({
                id: String(n.id),
                title: String(n.title ?? ''),
                meta: formatDate(n.createdAt as string),
              }))}
            />
          )}
          {canEvents && (
            <ListCard
              title="Upcoming events"
              icon={<CalendarHeart className="h-5 w-5" />}
              to="/app/events"
              empty="No events scheduled."
              items={events.map((e) => ({
                id: String(e.id),
                title: String(e.title ?? ''),
                meta: formatDate(e.eventDate as string),
              }))}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ListCard({
  title,
  icon,
  to,
  items,
  empty,
}: {
  title: string
  icon: ReactNode
  to: string
  items: { id: string; title: string; meta: string }[]
  empty: string
}) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
            {icon}
          </div>
          <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
        </div>
        <Link to={to} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
          View all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3">
              <p className="truncate text-sm font-medium text-slate-700">{item.title}</p>
              <span className="shrink-0 text-xs text-slate-400">{item.meta}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
