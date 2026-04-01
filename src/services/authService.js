import { supabase } from '../lib/supabase'

// ✅ SIGNUP
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return null
  }

  return data
}


// ✅ LOGIN
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert(error.message)
    return null
  }

  return data
}


// ✅ LOGOUT
export const logout = async () => {
  await supabase.auth.signOut()
}


// ✅ GET CURRENT USER
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser()
  return data?.user || null
}