import { useEffect, useState } from 'react'
import type { Profile } from '../types/db'
import { getProfile } from '../Services/ProfileService'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const data = await getProfile()
        setProfile(data)
      } catch (error) {
        console.error(error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    loadProfile()
  }, [user])

  return { profile, loading }
}