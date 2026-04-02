import { useState } from 'react'
import { addScore } from '../services/scoreService'

const ScoreForm = ({ userId, refreshScores }) => {
  const [score, setScore] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    setError('')
    setMessage('')

    // Validate score range
    if (score < 1 || score > 45) {
      setError('Score must be between 1 and 45.')
      return
    }

    // ❗ Prevent future date
    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      setError('Future dates are not allowed.')
      return
    }

    setSaving(true)
    const result = await addScore(userId, parseInt(score), date)
    setSaving(false)

    if (result.success) {
      setMessage('Score added.')
      setScore('')
      setDate('')
      refreshScores()
    } else {
      // addScore already alerts, but we also show a consistent inline message.
      setError('Duplicates are not allowed (same score + same date).')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Score</h2>

      {error ? <p style={{ color: 'salmon' }}>{error}</p> : null}
      {message ? <p style={{ color: '#b7f7c3' }}>{message}</p> : null}

      <input
        type="number"
        placeholder="Score (1-45)"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        required
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        max={new Date().toISOString().split('T')[0]} // ❗ blocks future dates
        required
      />

      <button type="submit" disabled={saving}>
        {saving ? 'Adding…' : 'Add'}
      </button>
    </form>
  )
}

export default ScoreForm