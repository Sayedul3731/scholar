import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Bus, Eye, EyeOff, GraduationCap, Lock, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiPostVoid, getApiError } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) {
      toast.error('This password reset link is invalid or incomplete.')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await apiPostVoid('/auth/reset-password', { token, password })
      toast.success('Password reset successfully. Please sign in.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getApiError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
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
            ].map((feature) => (
              <div
                key={feature.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <div className="mb-2">{feature.icon}</div>
                <p className="text-sm font-semibold">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-brand-200">
          © {new Date().getFullYear()} Scholar SMS. All rights reserved.
        </p>
      </div>

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

          {!token ? (
            <div className="text-center">
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
                Invalid reset link
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This password reset link is missing or incomplete. Request a new link to continue.
              </p>
              <Link to="/forgot-password" className="btn-primary mt-8 inline-flex py-3">
                Request a new link <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
              <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-slate-900">
                Create a new password
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Choose a secure password with at least 8 characters.
              </p>

              <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                  <label className="label">New password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="input px-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="label">Confirm new password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmation ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="input px-10"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowConfirmation((value) => !value)}
                    >
                      {showConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? <Spinner className="h-4 w-4" /> : <>Reset password <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
