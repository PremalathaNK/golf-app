import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isSubscribed, createSubscription, PLANS } from '../services/subscriptionService'

const Subscription = ({ userId, onSubscribed }) => {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const checkSubscription = async () => {
    const status = await isSubscribed(userId)
    setSubscribed(status)
    setLoading(false)
  }

  const handleSubscribe = async (planId) => {
    if (subscribing) return
    setError('')
    setSubscribing(planId)
    try {
      const success = await createSubscription(userId, planId)

      if (success) {
        setSubscribed(true)
        await onSubscribed?.()
        navigate('/app', { replace: true })
      }
    } catch (e) {
      setError(e.message ?? 'Subscription failed')
    } finally {
      setSubscribing('')
    }
  }

  useEffect(() => {
    checkSubscription()
  }, [])

  const planCards = useMemo(() => {
    const items = Object.values(PLANS)
    return items
  }, [])

  return (
    <div className="container">
      <div className="hero">
        <div className="card heroCard">
          <h1 className="h1">Choose your plan</h1>
          <p className="p">
            Subscribers unlock score tracking, draw entries, winnings, and full reporting. A portion of your plan
            goes to your chosen charity (min 10%).
          </p>

          <div style={{ height: 16 }} />

          {loading ? <div className="muted">Checking subscription…</div> : null}
          {error ? <p style={{ color: 'salmon' }}>{error}</p> : null}

          {subscribed ? (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="cardInner">
                <div className="h2">✅ You are subscribed</div>
                <p className="p" style={{ marginTop: 0 }}>
                  You can now access the dashboard and enter your latest scores.
                </p>
                <div style={{ height: 12 }} />
                <button className="btn btnPrimary" onClick={() => navigate('/app', { replace: true })}>
                  Go to dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="grid2" style={{ marginTop: 16 }}>
              {planCards.map((p) => (
                <div key={p.id} className="card">
                  <div className="cardInner">
                    <div className="h2">{p.label}</div>
                    <div style={{ fontSize: 34, fontWeight: 750, letterSpacing: '-0.02em' }}>
                      ₹{p.priceInr}
                      <span className="muted" style={{ fontSize: 14, fontWeight: 500 }}>
                        {p.id === 'monthly' ? ' / month' : ' / year'}
                      </span>
                    </div>
                    <p className="p" style={{ marginTop: 8 }}>
                      Includes access control checks on every request, rolling 5 scores, and monthly prize draw
                      participation.
                    </p>
                    <div style={{ height: 14 }} />
                    <button
                      className="btn btnPrimary"
                      onClick={() => handleSubscribe(p.id)}
                      disabled={!!subscribing}
                    >
                      {subscribing === p.id ? 'Processing…' : `Subscribe ${p.label}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Subscription