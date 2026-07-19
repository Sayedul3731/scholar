import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { FullPageLoader } from '@/components/ui/Spinner'

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const ResourcePage = lazy(() => import('@/features/resources/ResourcePage'))
const NotFound = lazy(() => import('@/features/misc/NotFound'))

function SessionWatcher() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  useEffect(() => {
    const handler = () => {
      logout()
      navigate('/login', { replace: true })
    }
    window.addEventListener('sms:session-expired', handler)
    return () => window.removeEventListener('sms:session-expired', handler)
  }, [logout, navigate])
  return null
}

function LoginGate() {
  const status = useAuthStore((s) => s.status)
  if (status === 'authenticated') return <Navigate to="/app" replace />
  if (status === 'idle' || status === 'loading') return <FullPageLoader />
  return (
    <Suspense fallback={<FullPageLoader />}>
      <LoginPage />
    </Suspense>
  )
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <BrowserRouter>
      <SessionWatcher />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginGate />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path=":resource" element={<ResourcePage />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
