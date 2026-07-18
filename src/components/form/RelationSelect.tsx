import { useState, useMemo } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useRelationOptions } from '@/hooks/api-hooks'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import type { RelationSource } from '@/config/resource-types'

export function RelationSelect({
  source,
  value,
  onChange,
  placeholder = 'Select…',
}: {
  source: RelationSource
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const { data, isLoading } = useRelationOptions(source.path, source.label)
  return (
    <div className="relative">
      <select
        className="input appearance-none pr-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{isLoading ? 'Loading…' : placeholder}</option>
        {(data ?? []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

export function MultiRelationSelect({
  source,
  value,
  onChange,
}: {
  source: RelationSource
  value: string[]
  onChange: (v: string[]) => void
}) {
  const { data, isLoading } = useRelationOptions(source.path, source.label)
  const [query, setQuery] = useState('')

  const options = useMemo(() => {
    const list = data ?? []
    if (!query) return list
    return list.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        {value.length > 0 && (
          <span className="badge bg-brand-50 text-brand-700">{value.length} selected</span>
        )}
      </div>
      <div className="max-h-44 overflow-y-auto p-1.5">
        {isLoading && (
          <div className="flex items-center gap-2 px-2 py-3 text-sm text-slate-400">
            <Spinner className="h-4 w-4" /> Loading…
          </div>
        )}
        {!isLoading && options.length === 0 && (
          <p className="px-2 py-3 text-sm text-slate-400">No options found.</p>
        )}
        {options.map((o) => {
          const active = value.includes(o.value)
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => toggle(o.value)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                active ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              <span className="truncate">{o.label}</span>
              <span
                className={cn(
                  'grid h-4 w-4 shrink-0 place-items-center rounded border',
                  active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300',
                )}
              >
                {active && <Check className="h-3 w-3" />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
