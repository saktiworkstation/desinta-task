import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || !key || url === 'your_supabase_url_here') {
    // Return a dummy client that won't crash but won't work
    _supabase = createClient('https://placeholder.supabase.co', 'placeholder')
    return _supabase
  }

  _supabase = createClient(url, key)
  return _supabase
}

// For convenience — lazy getter
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const isSupabaseConfigured =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here'

// Default user ID (single-user app for Desinta)
export const USER_ID = 'desinta-main'
