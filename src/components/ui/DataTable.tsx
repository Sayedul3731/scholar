import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { EmptyState } from './EmptyState'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
  align?: 'left' | 'right' | 'center'
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  rowActions,
  emptyTitle,
  emptyMessage,
  emptyAction,
}: {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  rowActions?: (row: T) => ReactNode
  emptyTitle?: string
  emptyMessage?: string
  emptyAction?: ReactNode
}) {
  const alignClass = (a?: string) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left'

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    'px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500',
                    alignClass(c.align),
                  )}
                >
                  {c.header}
                </th>
              ))}
              {rowActions && <th className="px-5 py-3 text-right" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-5 py-4">
                      <div className="skeleton h-4 w-full max-w-[140px]" />
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-5 py-4">
                      <div className="skeleton ml-auto h-4 w-12" />
                    </td>
                  )}
                </tr>
              ))}

            {!loading &&
              data.map((row) => (
                <tr key={row.id} className="group transition-colors hover:bg-slate-50/70">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn('px-5 py-3.5 text-slate-700', alignClass(c.align), c.className)}
                    >
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end opacity-60 transition-opacity group-hover:opacity-100">
                        {rowActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && data.length === 0 && (
        <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
      )}
    </div>
  )
}
