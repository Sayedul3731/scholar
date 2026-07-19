import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Bus, CheckCircle2, GraduationCap, Mail, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { apiPostVoid, getApiError } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      await apiPostVoid('/auth/forgot-password', { email })
      setSubmitted(true)
      toast.success('If an account exists, a reset link has been sent.')
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

          {submitted ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" />
              <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900">
                Check your email
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                If an account exists for <span className="font-medium text-slate-700">{email}</span>,
                you will receive a password reset link shortly.
              </p>
              <Link to="/login" className="btn-primary mt-8 inline-flex py-3">
                Back to sign in <ArrowRight className="h-4 w-4" />
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
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email address and we’ll send you a reset link.
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
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                  {loading ? <Spinner className="h-4 w-4" /> : <>Send reset link <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
