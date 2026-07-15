import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jzkvlgvnhlgvmumgqxpq.supabase.co'
const supabaseKey = 'sb_publishable_u8vwBptSVGNNSpqbGUFepA_cHovl1ns'

export const supabase = createClient(supabaseUrl, supabaseKey)
