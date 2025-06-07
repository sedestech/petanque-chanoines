import { supabase } from './supabaseClient'

export async function fetchRows(table) {
  const { data, error } = await supabase.from(table).select('*')
  if (error) {
    console.error(`Failed to fetch ${table}`, error)
    return []
  }
  return data || []
}

export async function insertRow(table, row) {
  const { error } = await supabase.from(table).insert(row)
  if (error) {
    console.error(`Failed to insert into ${table}`, error)
    return false
  }
  return true
}

export async function updateRow(table, id, updates) {
  const { error } = await supabase.from(table).update(updates).eq('id', id)
  if (error) {
    console.error(`Failed to update ${table}`, error)
    return false
  }
  return true
}

export async function deleteRow(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) {
    console.error(`Failed to delete from ${table}`, error)
    return false
  }
  return true
}

export function subscribeToTable(table, callback) {
  const channel = supabase
    .channel(`petanque-${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      fetchRows(table).then(callback)
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
