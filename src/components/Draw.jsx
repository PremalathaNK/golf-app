import { useEffect, useState } from 'react'
import { getThisMonthDraw, submitEntryForThisMonth } from '../services/drawService'

const Draw = ({ userId, onDrawComplete }) => {
  const [draw, setDraw] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const refresh = async () => {
    setError('')
    setLoading(true)
    try {
      const d = await getThisMonthDraw()
      setDraw(d)
    } catch (e) {
      setError(e.message ?? 'Failed to load draw')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleEnter = async () => {
    if (running) return
    setError('')
    setRunning(true)
    try {
      const res = await submitEntryForThisMonth(userId)
      setResult(res)
      onDrawComplete?.()
    } catch (e) {
      setError(e.message ?? 'Failed to submit entry')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <h2>Monthly Draw</h2>

      {loading ? <div className="muted">Loading draw…</div> : null}
      {error ? <p style={{ color: 'salmon' }}>{error}</p> : null}

      {!loading && !draw ? (
        <p className="muted">No draw has been created for this month yet (admin action required).</p>
      ) : null}

      {!loading && draw ? (
        <div>
          <p className="muted" style={{ marginTop: 0 }}>
            Status: <b>{draw.status}</b>
          </p>

          {draw.status !== 'published' ? (
            <p className="muted">This month’s result is not published yet. Come back after admin publishes.</p>
          ) : (
            <button className="btn btnPrimary" onClick={handleEnter} disabled={running}>
              {running ? 'Checking…' : 'Enter / Check result'}
            </button>
          )}
        </div>
      ) : null}

      {result ? (
        <div style={{ marginTop: 12 }}>
          <p>Draw Numbers: {result.drawNumbers.join(', ')}</p>
          <p>Your Scores: {result.userScores.join(', ')}</p>
          <p>Matches: {result.matches}</p>
          <p>
            <b>Prize Won: ₹{result.prize ?? 0}</b>
          </p>
          {result.alreadyEntered ? (
            <p className="muted" style={{ marginTop: 0 }}>
              You already entered this month’s draw. This is your official stored result.
            </p>
          ) : null}
          {result.alreadyEntered &&
          Array.isArray(result.currentScores) &&
          result.currentScores.length === 5 &&
          result.currentScores.join(',') !== result.userScores.join(',') ? (
            <p className="muted" style={{ marginTop: 0 }}>
              Your current 5 scores are now: <b>{result.currentScores.join(', ')}</b>. The draw uses the 5-score
              snapshot that was saved when you entered.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default Draw