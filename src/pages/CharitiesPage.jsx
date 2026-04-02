import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCharities } from '../services/charityService'

export default function CharitiesPage() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    const load = async () => {
      setError('')
      setLoading(true)
      try {
        const data = await listCharities()
        if (!ignore) setItems(data)
      } catch (e) {
        if (!ignore) setError(e.message ?? 'Failed to load charities')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((c) => (c.name || '').toLowerCase().includes(q))
  }, [items, query])

  return (
    <div className="container">
      <div className="hero">
        <div className="card heroCard">
          <h1 className="h1">Charities</h1>
          <p className="p">
            Explore charities supported by subscriptions. Choose your charity during onboarding or update it later
            in settings.
          </p>

          <div style={{ height: 14 }} />

          <div className="row" style={{ alignItems: 'center' }}>
            <input
              className="input"
              placeholder="Search charities…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1, minWidth: 240 }}
            />
            <Link className="btn btnPrimary" to="/subscribe">
              Subscribe
            </Link>
          </div>

          <div style={{ height: 14 }} />

          {loading ? <div className="muted">Loading…</div> : null}
          {error ? <p style={{ color: 'salmon' }}>{error}</p> : null}

          <div className="grid2" style={{ marginTop: 10 }}>
            {filtered.map((c) => (
              <div key={c.id} className="card">
                <div className="cardInner">
                  <div className="h2">{c.name}</div>
                  <p className="p" style={{ marginTop: 0 }}>
                    {c.description || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {!loading && filtered.length === 0 ? <p className="muted">No charities found.</p> : null}
        </div>
      </div>
    </div>
  )
}

