import { supabase } from '../lib/supabase'

export const PLANS = {
  monthly: { id: 'monthly', label: 'Monthly', priceInr: 499, months: 1 },
  yearly: { id: 'yearly', label: 'Yearly', priceInr: 4990, months: 12 },
}

// ✅ Check if user is subscribed
export const isSubscribed = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id,status,end_date')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Subscription Check Error:", error)
      return false
    }

    if (!data) return false

    if (!data.end_date) return true
    const end = new Date(data.end_date).getTime()
    return Number.isFinite(end) && end > Date.now()

  } catch (error) {
    console.error(error)
    return false
  }
}


// ✅ Create subscription
export const createSubscription = async (userId, planId) => {
  try {
    const plan = PLANS[planId]
    if (!plan) throw new Error('Invalid plan')

    const start = new Date()
    const end = new Date(start)
    end.setMonth(end.getMonth() + plan.months)

    const { error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan: plan.id,
          status: 'active',
          start_date: start.toISOString(),
          end_date: end.toISOString(),
        }
      ])

    if (error) {
      console.error("Subscription Error:", error)
      throw error
    }

    return true

  } catch (error) {
    console.error(error)
    throw error
  }
}