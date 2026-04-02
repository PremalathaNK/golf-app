import { supabase } from '../lib/supabase'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function ensureProfile({ id, email }) {
  const existing = await getProfile(id)
  if (existing) return existing

  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id, email }])
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(userId, patch) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

