import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
  console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Auth and cloud sync are disabled.')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnon ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
})
