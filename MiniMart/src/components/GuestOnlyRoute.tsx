import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import RouteLoadingScreen from './RouteLoadingScreen'

type GuestOnlyRouteProps = {
  children: ReactNode
}

export default function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <RouteLoadingScreen message="Preparing sign-in..." />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
