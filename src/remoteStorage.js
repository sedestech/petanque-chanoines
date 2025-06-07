import { supabase } from './supabaseClient'

export async function loadRemoteData(key, defaultValue) {
  const { data, error } = await supabase
    .from('petanque_data')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) return defaultValue
  return data.value
}

export async function saveRemoteData(key, value) {
  await supabase
    .from('petanque_data')
    .upsert({ key, value }, { onConflict: 'key' })
}
