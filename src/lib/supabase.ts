
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

// Supabase connection details
// In production, these should be environment variables
const supabaseUrl = 'https://your-supabase-project-url.supabase.co'
const supabaseAnonKey = 'your-supabase-anon-key'

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}
