import { supabase } from '../lib/supabase'
import { saveWinnings } from './prizeService'

// Generate 5 unique numbers
const generateDrawNumbers = () => {
  let numbers = []

  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) {
      numbers.push(num)
    }
  }

  return numbers
}


// CREATE DRAW
export const createDraw = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Check if draw already exists this month
    const { data: existingDraws } = await supabase
      .from('draws')
      .select('*')

    const alreadyExists = existingDraws?.some(d => {
    const drawMonth = new Date(d.draw_date).getMonth()
    const currentMonth = new Date().getMonth()
    return drawMonth === currentMonth && d.status === 'published'
  })

    // Generate numbers
    const numbers = generateDrawNumbers()

    const { data, error } = await supabase
      .from('draws')
      .insert([
        {
          draw_date: today,
          numbers: numbers,
          status: 'pending'
        }
      ])
      .select()

    if (error) throw error

    return data[0]

  } catch (error) {
    console.error(error)
    return null
  }
}


// RUN DRAW
export const runDraw = async (drawId, userId) => {
  try {
    console.log("Running draw for:", drawId)

    // Get draw
    const { data: draw, error: drawError } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single()

    if (drawError) {
      console.error("Draw Fetch Error:", drawError)
      return null
    }

    // Get scores
    const { data: scores, error: scoreError } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', userId)

    if (scoreError) {
      console.error("Score Fetch Error:", scoreError)
      return null
    }

    if (!scores || scores.length === 0) {
      alert("Add scores first")
      return null
    }

    const userScores = scores.map(s => s.score)
    const drawNumbers = draw.numbers

    console.log("User Scores:", userScores)
    console.log("Draw Numbers:", drawNumbers)

    // Match logic
    const matches = userScores.filter(num => drawNumbers.includes(num)).length

    console.log("Matches:", matches)

    // Save entry
    const { error: entryError } = await supabase
      .from('entries')
      .insert([
        {
          user_id: userId,
          draw_id: drawId,
          scores: userScores,
          match_count: matches
        }
      ])

    if (entryError) {
      console.error("Entry Error:", entryError)
    }

    // Update draw
    await supabase
      .from('draws')
      .update({ status: 'published' })
      .eq('id', drawId)

    // Save winnings
    const prize = await saveWinnings(userId, drawId, matches)

    return {
      drawNumbers,
      userScores,
      matches,
      prize: prize.amount
    }

  } catch (error) {
    console.error("Run Draw Error:", error)
    return null
  }
}