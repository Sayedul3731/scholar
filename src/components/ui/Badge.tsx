import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'brand' | 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'purple' | 'pink'

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  red: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  blue: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  slate: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
  purple: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
  pink: 'bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-200',
}

export function Badge({
  children,
  tone = 'slate',
  className,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return <span className={cn('badge', tones[tone], className)}>{children}</span>
}

/** Map arbitrary status-like strings to a sensible tone. */
export function statusTone(value?: string | null): Tone {
  const v = (value ?? '').toLowerCase()
  if (['present', 'completed', 'active', 'paid', 'success'].includes(v)) return 'green'
  if (['late', 'pending', 'excused', 'partial'].includes(v)) return 'amber'
  if (['absent', 'failed', 'refunded', 'inactive', 'overdue'].includes(v)) return 'red'
  return 'slate'
}
