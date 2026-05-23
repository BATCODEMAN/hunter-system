import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://opaekocugzirfcyvpcoa.supabase.co"
const SUPABASE_KEY = "sb_publishable_bMf8KomD94V9fb6FUKKAyg_O0zG11pr"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)