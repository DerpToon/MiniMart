import { useEffect, useState } from 'react'
import { getProfile } from '../Services/ProfileService'
import type { Profile } from '../types/db'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    getProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  return { profile, loading }
}