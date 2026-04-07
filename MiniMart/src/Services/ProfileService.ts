import { supabase } from '../lib/supabase'
import type { Profile } from '../types/db'
import type { ProfileView } from '../types/db'

type UpdateMyProfileInput = {
  full_name: string
  email: string
  new_password?: string
}
export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()

  if (error) throw error
  return data
}
export async function getMyProfileView(): Promise<ProfileView> {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('No authenticated user found.')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) throw profileError

  return {
    id: user.id,
    full_name: profile?.full_name ?? null,
    email: user.email ?? '',
    role: profile?.role ?? 'customer',
    created_at: profile?.created_at ?? user.created_at ?? ''
  }
}

export async function updateMyProfile({
  full_name,
  email,
  new_password
}: UpdateMyProfileInput): Promise<ProfileView> {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('No authenticated user found.')

  const trimmedName = full_name.trim()
  const trimmedEmail = email.trim()
  const trimmedPassword = new_password?.trim() ?? ''

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: trimmedName || null
    })
    .eq('id', user.id)

  if (profileError) throw profileError

  const authUpdates: { email?: string; password?: string } = {}

  if (trimmedEmail && trimmedEmail !== user.email) {
    authUpdates.email = trimmedEmail
  }

  if (trimmedPassword) {
    authUpdates.password = trimmedPassword
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error: updateAuthError } = await supabase.auth.updateUser(authUpdates)

    if (updateAuthError) throw updateAuthError
  }

  return getMyProfileView()
}