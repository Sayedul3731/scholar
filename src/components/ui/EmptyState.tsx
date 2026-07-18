import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({
  title = 'Nothing here yet',
  message,
  icon,
  action,
}: {
  title?: string
  message?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <div>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
      </div>
      {action}
    </div>
  )
}
