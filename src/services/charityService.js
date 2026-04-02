import { supabase } from '../lib/supabase'

export async function listCharities() {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createCharity({ name, description }) {
  const { data, error } = await supabase
    .from('charities')
    .insert([{ name, description }])
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function deleteCharity(id) {
  const { error } = await supabase.from('charities').delete().eq('id', id)
  if (error) throw error
  return true
}

