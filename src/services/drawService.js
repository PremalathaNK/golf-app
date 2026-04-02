import { supabase } from '../lib/supabase'
import { saveWinnings } from './prizeService'

function monthBounds(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  const toYmd = (x) => x.toISOString().split('T')[0]
  return { startYmd: toYmd(start), endYmd: toYmd(end) }
}

// Generate 5 unique numbers
export function generateDrawNumbers() {
  const numbers = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) numbers.push(num)
  }
  return numbers
}

export async function getThisMonthDraw() {
  const { startYmd, endYmd } = monthBounds()
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .gte('draw_date', startYmd)
    .lte('draw_date', endYmd)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

// ADMIN: create one pending draw per month
export async function adminCreateMonthlyDraw() {
  const existing = await getThisMonthDraw()
  if (existing) return existing

  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('draws')
    .insert([{ draw_date: today, status: 'pending', numbers: null }])
    .select('*')
    .single()

  if (error) throw error
  return data
}

// ADMIN: publish results (monthly cadence)
export async function adminPublishMonthlyDraw(drawId, numbers) {
  if (!Array.isArray(numbers) || numbers.length !== 5) {
    throw new Error('Draw numbers must be exactly 5 values.')
  }

  const { data, error } = await supabase
    .from('draws')
    .update({ status: 'published', numbers })
    .eq('id', drawId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

// SUBSCRIBER: enter/check a published draw ONCE
export async function submitEntryForThisMonth(userId) {
  const draw = await getThisMonthDraw()
  if (!draw) throw new Error('No draw created yet for this month.')
  if (draw.status !== 'published') throw new Error('This month’s draw is not published yet.')
  if (!draw.numbers || draw.numbers.length !== 5) throw new Error('Draw numbers are missing.')

  const drawNumbers = draw.numbers
  const allowReentry = String(import.meta.env.VITE_ALLOW_DRAW_REENTRY || '').toLowerCase() === 'true'

  // Prevent duplicate entries for same user+draw
  const { data: existingEntry, error: entryCheckError } = await supabase
    .from('entries')
    .select('id,match_count,scores,created_at')
    .eq('user_id', userId)
    .eq('draw_id', draw.id)
    .maybeSingle()

  if (entryCheckError) throw entryCheckError

  // DEV/TESTING: allow re-enter by replacing the existing entry (and winnings) for this month.
  // In production (PRD), keep VITE_ALLOW_DRAW_REENTRY unset/false to enforce once-per-month.
  if (existingEntry && allowReentry) {
    const { error: delEntryErr } = await supabase.from('entries').delete().eq('id', existingEntry.id)
    if (delEntryErr) throw delEntryErr

    // Also clear prior winnings for this draw+user so the new entry can recreate correct winnings/proof.
    const { error: delWinErr } = await supabase
      .from('winnings')
      .delete()
      .eq('user_id', userId)
      .eq('draw_id', draw.id)
    if (delWinErr) throw delWinErr
  }

  // If already entered, return the OFFICIAL stored entry + winnings
  if (existingEntry && !allowReentry) {
    const { data: currentScores, error: currentScoresErr } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', userId)

    if (currentScoresErr) throw currentScoresErr

    const { data: win, error: winErr } = await supabase
      .from('winnings')
      .select('id,amount,status,proof_url')
      .eq('user_id', userId)
      .eq('draw_id', draw.id)
      .maybeSingle()
    if (winErr) throw winErr

    return {
      draw,
      drawNumbers,
      userScores: existingEntry.scores ?? [],
      currentScores: (currentScores ?? []).map((s) => s.score),
      matches: existingEntry.match_count ?? 0,
      prize: win ? Number(win.amount) : 0,
      alreadyEntered: true,
    }
  }

  // Ensure 5 scores exist (only when creating first entry)
  const { data: scores, error: scoreError } = await supabase
    .from('scores')
    .select('score')
    .eq('user_id', userId)

  if (scoreError) throw scoreError
  if (!scores || scores.length !== 5) {
    throw new Error('Please enter your latest 5 scores before joining the draw.')
  }

  const userScores = scores.map((s) => s.score)
  const matches = userScores.filter((num) => drawNumbers.includes(num)).length

  const { error: entryError } = await supabase.from('entries').insert([
    {
      user_id: userId,
      draw_id: draw.id,
      scores: userScores,
      match_count: matches,
    },
  ])
  if (entryError) throw entryError

  const prize = await saveWinnings(userId, draw.id, matches)

  return {
    draw,
    drawNumbers,
    userScores,
    matches,
    prize: prize?.amount ?? 0,
    alreadyEntered: false,
  }
}