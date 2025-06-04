import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ylnwvnnsrjerrnbldjhq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsbnd2bm5zcmplcnJuYmxkamhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTkwMjgsImV4cCI6MjA2NDU5NTAyOH0.VrXXo8CXls6ZbKb9z-vtufQ57keGyVBUwcJ94oMnpWI'

export const supabase = createClient(supabaseUrl, supabaseKey)
