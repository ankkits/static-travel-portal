import { supabase } from '../lib/supabase'

export async function getActivePackages() {
  if (!supabase) {
    return { data: [], error: null, source: 'fallback' }
  }

  const result = await supabase
    .from('holiday_packages')
    .select('id,title,destination,description,duration,starting_price,image_url')
    .eq('active', true)
    .order('created_at', { ascending: false })

  return { ...result, source: 'supabase' }
}
