import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/types'
import { cn } from '@/lib/utils'

export function Pagination({
  meta,
  onPage,
}: {
  meta?: PaginationMeta
  onPage: (page: number) => void
}) {
  if (!meta || meta.totalPages <= 1) {
    return meta ? (
      <p className="px-1 py-3 text-sm text-slate-500">
        {meta.totalItems} {meta.totalItems === 1 ? 'record' : 'records'}
      </p>
    ) : null
  }

  const { currentPage, totalPages, totalItems, itemsPerPage } = meta
  const from = (currentPage - 1) * itemsPerPage + 1
  const to = Math.min(currentPage * itemsPerPage, totalItems)

  const pages: (number | '…')[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) pages.push(p)
    else if (pages[pages.length - 1] !== '…') pages.push('…')
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-700">{from}</span>–
        <span className="font-semibold text-slate-700">{to}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          className="btn-outline h-9 w-9 !px-0"
          disabled={currentPage <= 1}
          onClick={() => onPage(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-2 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={cn(
                'h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition-colors',
                p === currentPage
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          className="btn-outline h-9 w-9 !px-0"
          disabled={currentPage >= totalPages}
          onClick={() => onPage(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
