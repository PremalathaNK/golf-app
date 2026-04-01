import { supabase } from '../lib/supabase'

// ✅ Get total winnings
export const getTotalWinnings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('winnings')
      .select('amount')
      .eq('user_id', userId)

    if (error) {
      console.error("Winnings Fetch Error:", error)
      return 0
    }

    const total = data.reduce((sum, item) => sum + item.amount, 0)
    return total

  } catch (error) {
    console.error("Unexpected Error:", error)
    return 0
  }
}


// ✅ Get draw history (CURRENT MONTH + LIMIT)
export const getDrawHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select(`
        id,
        match_count,
        draws (
          draw_date,
          numbers
        )
      `)
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(5)

    if (error) {
      console.error("Draw History Error:", error)
      return []
    }

    return data || []

  } catch (error) {
    console.error(error)
    return []
  }
}