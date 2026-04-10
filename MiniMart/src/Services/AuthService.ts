import { supabase } from '../lib/supabase'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

export async function signUpWithEmail(email: string, password: string) {
  const redirectTo = `${window.location.origin}/login`
  const { data, error } = await supabase.auth.signUp(
    {
      email,
      password
    },
    {
      emailRedirectTo: redirectTo
    }
  )

  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

export async function resendVerificationEmail(email: string) {
  const redirectTo = `${window.location.origin}/login`
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  })

  if (error) throw error
  return data
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()

  if (error && error.message !== 'Auth session missing!') {
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return data.user
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return null
  }

  return data.session
}

export function subscribeToAuthChanges(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return data.subscription
}