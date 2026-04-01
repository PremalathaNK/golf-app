import { supabase } from '../lib/supabase'

// ✅ Check if user is subscribed
export const isSubscribed = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error("Subscription Check Error:", error)
      return false
    }

    return !!data

  } catch (error) {
    console.error(error)
    return false
  }
}


// ✅ Create subscription
export const createSubscription = async (userId) => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          status: 'active'
        }
      ])

    if (error) {
      console.error("Subscription Error:", error)
      alert(error.message)
      return false
    }

    return true

  } catch (error) {
    console.error(error)
    return false
  }
}