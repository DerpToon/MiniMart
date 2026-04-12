// src/context/AuthContext.tsx

import { createContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { AppUser } from "../types/auth"
import { getErrorMessage } from '../lib/error'
import {
  getCurrentUser,
  signInWithEmail,
  resendVerificationEmail as sendVerificationEmail,
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
  resendVerificationEmail: (email: string) => Promise<boolean>
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

function isSameUser(a: AppUser | null, b: AppUser | null) {
  return a?.id === b?.id && a?.email === b?.email
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    async function init() {
      try {
        const nextUser = mapUser(await getCurrentUser())
        setUser((previousUser) => (isSameUser(previousUser, nextUser) ? previousUser : nextUser))
      } catch (error: unknown) {
        setError(getErrorMessage(error, 'Failed to initialize session.'))
      } finally {
        setLoading(false)
      }
    }

    init()

    const subscription = subscribeToAuthChanges((_event, session) => {
      const nextUser = mapUser(session?.user ?? null)
      setUser((previousUser) => (isSameUser(previousUser, nextUser) ? previousUser : nextUser))
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
      setSuccessMessage(
        "Account created! Check your email and verify your address before logging in."
      )

      return true
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to create account.'))
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
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Unable to sign in.')
      const lower = message.toLowerCase()
      if (lower.includes('confirm') || lower.includes('verified') || lower.includes('verification')) {
        setError('Please verify your email before logging in. Check your inbox for the confirmation link.')
      } else {
        setError(message)
      }
      return false
    }
  }

  async function resendVerificationEmail(email: string) {
    try {
      setError("")
      setSuccessMessage("")

      await sendVerificationEmail(email)
      setSuccessMessage('Verification link sent. Please check your email.')
      return true
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Unable to resend verification email.'))
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
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to sign out.'))
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
        resendVerificationEmail,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
