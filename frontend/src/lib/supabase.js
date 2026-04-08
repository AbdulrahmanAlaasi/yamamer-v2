import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://quxdrwovgeoajezveiok.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1eGRyd292Z2VvYWplenZlaW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTU0MTQsImV4cCI6MjA1OTUzMTQxNH0.n2SYfFkf8LYwyOwBseCr5fx4MfShgjgPk4xcjq-ZhMg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
