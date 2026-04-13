import { supabase } from '../lib/supabase'
import type { ContactMessage } from '../types/db'

const localStorageKey = 'miniMart_contact_messages'

function readLocalMessages(): ContactMessage[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(localStorageKey)
  if (!raw) return []

  try {
    return JSON.parse(raw) as ContactMessage[]
  } catch {
    return []
  }
}

function saveLocalMessages(messages: ContactMessage[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(localStorageKey, JSON.stringify(messages))
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      return data as ContactMessage[]
    }
  } catch {
    // fall back to local storage
  }

  return readLocalMessages().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function sendContactMessage(input: {
  name: string
  email: string
  message: string
}): Promise<ContactMessage> {
  const newMessage: ContactMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    email: input.email,
    message: input.message,
    created_at: new Date().toISOString()
  }

  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: newMessage.name,
        email: newMessage.email,
        message: newMessage.message,
        created_at: newMessage.created_at
      })
      .select()
      .single()

    if (!error && data) {
      return data as ContactMessage
    }
  } catch {
    // if remote storage fails, continue to local storage
  }

  const messages = [newMessage, ...readLocalMessages()]
  saveLocalMessages(messages)
  return newMessage
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id)
    if (!error) return
  } catch {
    // fall back to local storage
  }

  const messages = readLocalMessages().filter((message) => message.id !== id)
  saveLocalMessages(messages)
}
