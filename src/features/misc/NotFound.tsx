import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="font-display text-5xl font-extrabold text-slate-900">404</h1>
      <p className="max-w-sm text-slate-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/app" className="btn-primary mt-2">
        Back to dashboard
      </Link>
    </div>
  )
}
