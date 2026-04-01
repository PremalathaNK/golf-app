import { supabase } from '../lib/supabase'

const calculatePrize = (matches) => {
  if (matches === 5) return 1000
  if (matches === 4) return 500
  if (matches === 3) return 200
  return 0
}

export const saveWinnings = async (userId, drawId, matches) => {
  try {
    const amount = calculatePrize(matches)

    if (amount === 0) return { amount: 0 }

    const { data, error } = await supabase
      .from('winnings')
      .insert([
        {
          user_id: userId,
          draw_id: drawId,
          amount: amount,
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      console.error("Winnings Insert Error:", error)
      return { amount: 0 }
    }

    console.log("Winnings saved:", data)

    return { amount }

  } catch (error) {
    console.error(error)
    return { amount: 0 }
  }
}