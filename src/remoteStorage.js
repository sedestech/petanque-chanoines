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

// Delete all rows for the table then bulk insert the provided rows
export async function persistData(table, rows) {
  const dataArray = Array.isArray(rows) ? rows : rows ? [rows] : []

  // Fetch existing ids to remove current records
  const { data: existing, error: fetchError } = await supabase
    .from(table)
    .select('id')

  if (fetchError) {
    console.error(`Failed to fetch existing ${table} rows`, fetchError)
    return false
  }

  if (existing.length > 0) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .in(
        'id',
        existing.map((r) => r.id)
      )

    if (deleteError) {
      console.error(`Failed to clear ${table}`, deleteError)
      return false
    }
  }

  if (dataArray.length > 0) {
    const { error: insertError } = await supabase.from(table).insert(dataArray)

    if (insertError) {
      console.error(`Failed to insert into ${table}`, insertError)
      return false
    }
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
