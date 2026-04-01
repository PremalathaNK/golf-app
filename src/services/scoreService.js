import { supabase } from '../lib/supabase'
import { isSubscribed } from './subscriptionService'

// ✅ ADD SCORE FUNCTION
export const addScore = async (userId, score, date) => {
  try {
    console.log("Adding score for user:", userId)

    // 🔒 0. Check subscription FIRST
    const subscribed = await isSubscribed(userId)

    if (!subscribed) {
      alert("Please subscribe to add scores")
      return { success: false }
    }

    // ✅ Format date safely (YYYY-MM-DD)
    const formattedDate = new Date(date).toISOString().split('T')[0]

    // 1. Fetch existing scores (oldest first)
    const { data: scores, error: fetchError } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (fetchError) {
      console.error("Fetch Error:", fetchError)
      alert(fetchError.message)
      return { success: false }
    }

    console.log("Existing scores:", scores)

    // 2. ❌ Prevent duplicate (same score + same date)
    const duplicate = scores.find(
      (s) => s.score === score && s.date === formattedDate
    )

    if (duplicate) {
      alert("Duplicate score entry not allowed")
      return { success: false }
    }

    // 3. If already 5 → delete oldest
    if (scores.length >= 5) {
      const oldest = scores[0]

      const { error: deleteError } = await supabase
        .from('scores')
        .delete()
        .eq('id', oldest.id)

      if (deleteError) {
        console.error("Delete Error:", deleteError)
        alert(deleteError.message)
        return { success: false }
      }
    }

    // 4. Insert new score
    const { error: insertError } = await supabase
      .from('scores')
      .insert([
        {
          user_id: userId,
          score: score,
          date: formattedDate
        }
      ])

    if (insertError) {
      console.error("INSERT ERROR:", insertError)
      alert(insertError.message)
      return { success: false }
    }

    console.log("Score inserted successfully")

    return { success: true }

  } catch (error) {
    console.error("Unexpected Error:", error)
    alert("Something went wrong")
    return { success: false }
  }
}


// ✅ GET SCORES FUNCTION
export const getScores = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error("Fetch Scores Error:", error)
      return []
    }

    return data || []

  } catch (error) {
    console.error("Unexpected Fetch Error:", error)
    return []
  }
}