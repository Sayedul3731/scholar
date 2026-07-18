import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'brand' | 'green' | 'amber' | 'blue' | 'purple' | 'pink'

const tones: Record<Tone, string> = {
  brand: 'from-brand-500 to-brand-600',
  green: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-600',
  blue: 'from-sky-500 to-blue-600',
  purple: 'from-violet-500 to-purple-600',
  pink: 'from-pink-500 to-rose-600',
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
  hint,
  loading,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  tone?: Tone
  hint?: string
  loading?: boolean
}) {
  return (
    <div className="card group relative overflow-hidden p-5 transition-shadow hover:shadow-card-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="skeleton mt-2 h-8 w-20" />
          ) : (
            <p className="mt-1 font-display text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          )}
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div
          className={cn(
            'grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            tones[tone],
          )}
        >
          {icon}
        </div>
      </div>
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -bottom-8 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.07] transition-transform duration-300 group-hover:scale-125',
          tones[tone],
        )}
      />
    </div>
  )
}
