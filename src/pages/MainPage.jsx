import { useEffect, useMemo, useState } from 'react'
import ScoreForm from '../components/ScoreForm'
import ScoreList from '../components/ScoreList'
import Draw from '../components/Draw'
import Dashboard from '../components/Dashboard'
import { getScores } from '../services/scoreService'

const MainPage = ({ user }) => {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [dashRefreshKey, setDashRefreshKey] = useState(0)

  const refreshScores = async () => {
    const data = await getScores(user.id)
    setScores(data)
    setLoading(false)
  }

  useEffect(() => {
    refreshScores()
  }, [user.id])

  const scoreProgress = useMemo(() => {
    const count = scores.length
    return {
      count,
      remaining: Math.max(0, 5 - count),
      ready: count === 5,
    }
  }, [scores])

  return (
    <div className="container">
      <div className="hero">
        <div className="card heroCard">
          <h1 className="h1">Your dashboard</h1>
          <p className="p">
            Add your latest 5 Stableford scores (1–45). We keep only the newest five automatically.
          </p>

          <div style={{ height: 16 }} />

          <div className="kpiRow">
            <div className="kpi">
              <div className="kpiValue">{scoreProgress.count} / 5 scores</div>
              <div className="kpiLabel">
                {scoreProgress.ready
                  ? 'Ready for the monthly draw'
                  : `Add ${scoreProgress.remaining} more to join the draw`}
              </div>
            </div>
            <div className="kpi">
              <div className="kpiValue">Monthly draw</div>
              <div className="kpiLabel">Publish cadence + proof upload for winners</div>
            </div>
            <div className="kpi">
              <div className="kpiValue">Charity-first</div>
              <div className="kpiLabel">Your contribution is enforced automatically</div>
            </div>
          </div>

          <div style={{ height: 16 }} />

          <div className="grid2">
            <div className="card">
              <div className="cardInner">
                <div className="h2">Scores</div>
                <p className="p" style={{ marginTop: 0 }}>
                  Enter one score at a time. New entries replace the oldest once you have 5.
                </p>
                <div style={{ height: 12 }} />
                <ScoreForm userId={user.id} refreshScores={refreshScores} />
                <div style={{ height: 14 }} />
                {loading ? <div className="muted">Loading scores…</div> : <ScoreList scores={scores} />}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div className="card">
                <div className="cardInner">
                  <Draw
                    userId={user.id}
                    onDrawComplete={() => setDashRefreshKey((k) => k + 1)}
                  />
                  {!scoreProgress.ready ? (
                    <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
                      Draw will only work after you enter all 5 scores.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="card">
                <div className="cardInner">
                  <Dashboard userId={user.id} refreshKey={dashRefreshKey} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainPage