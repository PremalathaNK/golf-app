import { useEffect, useState } from 'react'
import {
  getDrawHistory,
  getTotalWinnings,
  getWinnings,
  submitWinnerProof,
} from '../services/dashboardService'

const Dashboard = ({ userId, refreshKey = 0 }) => {
  const [total, setTotal] = useState(0)
  const [history, setHistory] = useState([])
  const [winnings, setWinnings] = useState([])
  const [proof, setProof] = useState({})
  const [submitting, setSubmitting] = useState('')
  const [error, setError] = useState('')

  const fetchData = async () => {
    setError('')
    const [totalAmount, drawHistory, wins] = await Promise.all([
      getTotalWinnings(userId),
      getDrawHistory(userId),
      getWinnings(userId),
    ])

    setTotal(totalAmount)
    setHistory(drawHistory)
    setWinnings(wins)
  }

  useEffect(() => {
    fetchData()
  }, [refreshKey, userId])

  const handleProofSubmit = async (winId) => {
    const url = (proof[winId] || '').trim()
    if (!url) return
    if (submitting) return
    setSubmitting(winId)
    setError('')
    try {
      await submitWinnerProof(winId, url)
      await fetchData()
    } catch (e) {
      setError(e.message ?? 'Failed to submit proof')
    } finally {
      setSubmitting('')
    }
  }

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>Total Winnings: ₹{total}</h3>

      {error ? <p style={{ color: 'salmon' }}>{error}</p> : null}

      <h3>Winner Proof</h3>
      {winnings.length === 0 ? <p>No winnings yet</p> : null}
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {winnings.map((w) => (
          <li key={w.id} style={{ marginBottom: 10 }}>
            <div>
              <b>₹{w.amount}</b> <span className="muted">· {w.status}</span>{' '}
              <span className="muted">· {w.draws?.draw_date}</span>
            </div>

            {w.amount > 0 && w.status === 'pending' && !w.proof_url ? (
              <div style={{ marginTop: 6, display: 'grid', gap: 8 }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  Upload proof screenshot URL (for now). This applies to winners only.
                </div>
                <input
                  className="input"
                  placeholder="Paste proof URL"
                  value={proof[w.id] ?? ''}
                  onChange={(e) => setProof((p) => ({ ...p, [w.id]: e.target.value }))}
                />
                <button
                  className="btn"
                  onClick={() => handleProofSubmit(w.id)}
                  disabled={submitting === w.id}
                >
                  {submitting === w.id ? 'Submitting…' : 'Submit proof'}
                </button>
              </div>
            ) : w.proof_url ? (
              <div className="muted" style={{ fontSize: 12 }}>
                Proof: {w.proof_url}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <h3>Draw History</h3>

      {history.length === 0 && <p>No draws yet</p>}

      <ul>
        {history.map((item) => (
          <li key={item.id}>
            Date: {item.draws?.draw_date} |
            Numbers: {item.draws?.numbers?.join(', ')} |
            Matches: {item.match_count}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Dashboard