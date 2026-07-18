import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { FullPageLoader } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)

  if (status === 'idle' || status === 'loading') {
    return <FullPageLoader label="Preparing your dashboard…" />
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
