import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string | undefined
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Only instantiate when both vars are present — avoids a throw on empty strings
export const supabase: SupabaseClient = supabaseUrl && supabaseAnon
  ? createClient(supabaseUrl, supabaseAnon, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : (null as unknown as SupabaseClient)   // never used when SUPABASE_CONFIGURED is false
