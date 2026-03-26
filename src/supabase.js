import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://etspndtmopojuyvajsnx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0c3BuZHRtb3BvanV5dmFqc254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTA1MTAsImV4cCI6MjA5MDA4NjUxMH0.O8CNYNR-jd2gosO-NMOw8SwO9q-10SRHL53rdXdJGNg'

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
