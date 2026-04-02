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

    const total = (data ?? []).reduce((sum, item) => {
      const n = typeof item.amount === 'number' ? item.amount : Number(item.amount)
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
    return Number(total.toFixed(2))

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
        created_at,
        draws:draws (
          draw_date,
          numbers
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
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

export const getWinnings = async (userId) => {
  const { data, error } = await supabase
    .from('winnings')
    .select(
      `
      id,
      amount,
      status,
      proof_url,
      created_at,
      draws:draws (
        draw_date,
        numbers
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data ?? []
}

export const submitWinnerProof = async (winningId, proofUrl) => {
  const { data, error } = await supabase
    .from('winnings')
    .update({ proof_url: proofUrl, status: 'submitted' })
    .eq('id', winningId)
    .select('*')
    .single()

  if (error) throw error
  return data
}