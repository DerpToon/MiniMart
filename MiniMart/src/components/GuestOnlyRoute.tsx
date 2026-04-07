import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

type GuestOnlyRouteProps = {
  children: ReactNode
}

export default function GuestOnlyRoute({ children }: GuestOnlyRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p>Loading auth...</p>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}