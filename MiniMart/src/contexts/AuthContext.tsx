// src/context/AuthContext.tsx

import { createContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { AppUser } from "../types/auth"
import {
  getCurrentUser,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges
} from '../Services/AuthService'

type AuthContextType = {
  user: AppUser | null
  loading: boolean
  error: string
  successMessage: string
  signUp: (email: string, password: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapUser(user: { id: string; email?: string | null } | null): AppUser | null {
  if (!user) return null
  return {
    id: user.id,
    email: user.email ?? null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentUser()
        setUser(mapUser(user))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    init()

    const subscription = subscribeToAuthChanges((_event, session) => {
      setUser(mapUser(session?.user ?? null))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(email: string, password: string) {
    try {
      setError("")
      setSuccessMessage("")

      await signUpWithEmail(email, password)
      setSuccessMessage("Account created successfully!")

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setError("")
      setSuccessMessage("")

      await signInWithEmail(email, password)
      setSuccessMessage("Signed in successfully!")

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  async function signOut() {
    try {
      setError("")
      setSuccessMessage("")

      await signOutUser()
      setSuccessMessage("Signed out successfully!")

      return true
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        successMessage,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }