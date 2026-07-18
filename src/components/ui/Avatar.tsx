import { cn } from '@/lib/utils'
import { initials } from '@/lib/utils'

const palette = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-pink-100 text-pink-700',
  'bg-rose-100 text-rose-700',
]

function pick(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

export function Avatar({
  first,
  last,
  size = 'md',
  className,
}: {
  first?: string
  last?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }
  const seed = `${first ?? ''}${last ?? ''}` || '?'
  return (
    <div
      className={cn(
        'grid place-items-center rounded-full font-semibold ring-2 ring-white',
        sizes[size],
        pick(seed),
        className,
      )}
    >
      {initials(first, last)}
    </div>
  )
}
