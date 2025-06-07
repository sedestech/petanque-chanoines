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
  const { error } = await supabase
    .from('petanque_data')
    .upsert({ key, value }, { onConflict: 'key' })

  if (error) {
    console.error(`Failed to save ${key} to Supabase`, error)
    return false
  }
  return true
}

export function subscribeToRemoteData(key, callback) {
  const channel = supabase
    .channel(`petanque-data-${key}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'petanque_data', filter: `key=eq.${key}` },
      (payload) => {
        callback(payload.new ? payload.new.value : null)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToRemoteData(key, callback) {
  const channel = supabase
    .channel(`petanque-data-${key}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'petanque_data', filter: `key=eq.${key}` },
      (payload) => {
        callback(payload.new ? payload.new.value : null)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
