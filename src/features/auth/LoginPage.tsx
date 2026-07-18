import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Users, BookOpen, Bus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { getApiError } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'

export default function LoginPage() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login({ email, password })
      toast.success('Welcome back!')
      navigate('/app', { replace: true })
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 lg:flex lg:flex-col lg:justify-between p-12 text-white">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight">Scholar</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Run your entire school from one beautiful dashboard.
          </h1>
          <p className="mt-4 text-brand-100">
            Students, staff, attendance, exams, finance, library and transport — unified in a single
            modern platform.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: <Users className="h-5 w-5" />, label: 'People' },
              { icon: <BookOpen className="h-5 w-5" />, label: 'Academics' },
              { icon: <Bus className="h-5 w-5" />, label: 'Transport' },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <div className="mb-2">{f.icon}</div>
                <p className="text-sm font-semibold">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-brand-200">
          © {new Date().getFullYear()} Scholar SMS. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white shadow-glow">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight text-slate-900">
              Scholar
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access the dashboard.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="input pl-10"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="input px-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Protected area. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  )
}
