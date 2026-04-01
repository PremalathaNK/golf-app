import { useState } from 'react'
import { addScore } from '../services/scoreService'

const ScoreForm = ({ userId, refreshScores }) => {
  const [score, setScore] = useState('')
  const [date, setDate] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate score range
    if (score < 1 || score > 45) {
      alert('Score must be between 1 and 45')
      return
    }

    // ❗ Prevent future date
    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      alert("Future dates are not allowed")
      return
    }

    const result = await addScore(userId, parseInt(score), date)

    if (result.success) {
      alert('Score added!')
      setScore('')
      setDate('')
      refreshScores()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Score</h2>

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

      <button type="submit">Add</button>
    </form>
  )
}

export default ScoreForm