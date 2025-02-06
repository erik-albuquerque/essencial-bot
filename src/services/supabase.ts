import { createClient } from '@supabase/supabase-js'

import { env } from '../config/env'

const supabaseUrl = env.SUPABASE_URL
const supabaseAnonKey = env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
