import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import RouteLoadingScreen from './RouteLoadingScreen'

type AdminRouteProps = {
  children: ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useProfile()

  if (authLoading || profileLoading) {
    return <RouteLoadingScreen message="Checking admin access..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
