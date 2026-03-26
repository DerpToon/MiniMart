import { supabase } from '../lib/supabase'
import type { Profile } from '../types/db'

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()

  if (error) throw error
  return data
}