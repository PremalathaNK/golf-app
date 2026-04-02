import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  adminCreateMonthlyDraw,
  adminPublishMonthlyDraw,
  generateDrawNumbers,
  getThisMonthDraw,
} from '../services/drawService'
import { supabase } from '../lib/supabase'
import { createCharity, deleteCharity, listCharities } from '../services/charityService'

function isAdminEmail(email) {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  const allow = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return allow.includes((email || '').toLowerCase())
}

export default function AdminPage({ user }) {
  if (!user) return <Navigate to="/auth" replace />
  if (!isAdminEmail(user.email)) {
    return (
      <div className="container">
        <div className="hero">
          <div className="card heroCard">
            <h1 className="h1">Admin access required</h1>
            <p className="p">
              This area is restricted. Add your email to <span className="pill">VITE_ADMIN_EMAILS</span> in your
              <span className="pill">.env</span> to enable access for development.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const [draw, setDraw] = useState(null)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [winners, setWinners] = useState([])
  const [charities, setCharities] = useState([])
  const [newCharity, setNewCharity] = useState({ name: '', description: '' })
  const [savingCharity, setSavingCharity] = useState(false)
  const [users, setUsers] = useState([])

  const refresh = async () => {
    setError('')
    setLoading(true)
    try {
      const d = await getThisMonthDraw()
      setDraw(d)
      const c = await listCharities()
      setCharities(c)

      const { data } = await supabase
        .from('winnings')
        .select('id,user_id,amount,status,proof_url,created_at,draws:draws(draw_date)')
        .order('created_at', { ascending: false })
        .limit(30)
      setWinners(data ?? [])

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,email,contribution_percent,charity_id')
        .order('email', { ascending: true })
        .limit(200)

      const { data: subs } = await supabase
        .from('subscriptions')
        .select('user_id,status,plan,end_date,created_at')
        .order('created_at', { ascending: false })
        .limit(500)

      const subByUser = new Map()
      for (const s of subs ?? []) {
        if (!subByUser.has(s.user_id)) subByUser.set(s.user_id, s)
      }

      setUsers(
        (profiles ?? []).map((p) => ({
          ...p,
          subscription: subByUser.get(p.id) ?? null,
        }))
      )
    } catch (e) {
      setError(e.message ?? 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const canPublish = useMemo(() => {
    return !!draw && draw.status === 'pending' && Array.isArray(preview) && preview.length === 5
  }, [draw, preview])

  const createMonthly = async () => {
    setError('')
    try {
      const d = await adminCreateMonthlyDraw()
      setDraw(d)
    } catch (e) {
      setError(e.message ?? 'Failed to create draw')
    }
  }

  const simulate = () => {
    setPreview(generateDrawNumbers())
  }

  const publish = async () => {
    if (!canPublish || publishing) return
    setPublishing(true)
    setError('')
    try {
      await adminPublishMonthlyDraw(draw.id, preview)
      setPreview([])
      await refresh()
    } catch (e) {
      setError(e.message ?? 'Failed to publish draw')
    } finally {
      setPublishing(false)
    }
  }

  const markPaid = async (winningId) => {
    await supabase.from('winnings').update({ status: 'paid' }).eq('id', winningId)
    await refresh()
  }

  const rejectProof = async (winningId) => {
    await supabase.from('winnings').update({ status: 'rejected' }).eq('id', winningId)
    await refresh()
  }

  const addCharity = async () => {
    const name = newCharity.name.trim()
    const description = newCharity.description.trim()
    if (!name) return
    if (savingCharity) return
    setSavingCharity(true)
    setError('')
    try {
      await createCharity({ name, description })
      setNewCharity({ name: '', description: '' })
      await refresh()
    } catch (e) {
      setError(e.message ?? 'Failed to create charity')
    } finally {
      setSavingCharity(false)
    }
  }

  const removeCharity = async (id) => {
    setError('')
    try {
      await deleteCharity(id)
      await refresh()
    } catch (e) {
      setError(e.message ?? 'Failed to delete charity')
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="card heroCard">
          <h1 className="h1">Admin dashboard</h1>
          <p className="p">Monthly cadence: create → simulate → publish (once per month).</p>

          <div style={{ height: 16 }} />

          {loading ? <div className="muted">Loading…</div> : null}
          {error ? <p style={{ color: 'salmon' }}>{error}</p> : null}

          <div className="grid2">
            <div className="card">
              <div className="cardInner">
                <div className="h2">Draw management</div>
                <p className="p" style={{ marginTop: 0 }}>This month: {draw ? draw.status : 'none'}</p>

                <div style={{ height: 12 }} />

                {!draw ? (
                  <button className="btn btnPrimary" onClick={createMonthly}>
                    Create this month’s draw
                  </button>
                ) : null}

                {draw && draw.status === 'pending' ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <button className="btn" onClick={simulate}>
                      Simulate numbers
                    </button>
                    {preview?.length === 5 ? (
                      <div className="muted">Preview: {preview.join(', ')}</div>
                    ) : null}
                    <button className="btn btnPrimary" disabled={!canPublish || publishing} onClick={publish}>
                      {publishing ? 'Publishing…' : 'Publish draw'}
                    </button>
                  </div>
                ) : null}

                {draw && draw.status === 'published' ? (
                  <div className="muted">
                    Published numbers: {Array.isArray(draw.numbers) ? draw.numbers.join(', ') : '—'}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="card">
              <div className="cardInner">
                <div className="h2">Winners verification</div>
                <p className="p" style={{ marginTop: 0 }}>
                  Review submitted proofs, approve (Paid) or reject.
                </p>

                <div style={{ height: 10 }} />
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {(winners ?? [])
                    .filter((w) => w.amount > 0)
                    .slice(0, 10)
                    .map((w) => (
                      <li key={w.id} style={{ marginBottom: 10 }}>
                        <div>
                          <b>₹{w.amount}</b> <span className="muted">· {w.status}</span>{' '}
                          <span className="muted">· {w.draws?.draw_date}</span>
                        </div>
                        {w.proof_url ? (
                          <div className="muted" style={{ fontSize: 12 }}>
                            Proof: {w.proof_url}
                          </div>
                        ) : (
                          <div className="muted" style={{ fontSize: 12 }}>
                            No proof uploaded yet.
                          </div>
                        )}
                        {w.status === 'submitted' ? (
                          <div className="row" style={{ marginTop: 6 }}>
                            <button className="btn btnPrimary" onClick={() => markPaid(w.id)}>
                              Mark paid
                            </button>
                            <button className="btn btnDanger" onClick={() => rejectProof(w.id)}>
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="cardInner">
                <div className="h2">Charity management</div>
                <p className="p" style={{ marginTop: 0 }}>Add/edit/delete charities.</p>

                <div style={{ height: 10 }} />
                <div style={{ display: 'grid', gap: 8 }}>
                  <input
                    className="input"
                    placeholder="Charity name"
                    value={newCharity.name}
                    onChange={(e) => setNewCharity((c) => ({ ...c, name: e.target.value }))}
                  />
                  <textarea
                    className="textarea"
                    placeholder="Description"
                    rows={3}
                    value={newCharity.description}
                    onChange={(e) => setNewCharity((c) => ({ ...c, description: e.target.value }))}
                  />
                  <button className="btn btnPrimary" onClick={addCharity} disabled={savingCharity}>
                    {savingCharity ? 'Saving…' : 'Add charity'}
                  </button>
                </div>

                <div style={{ height: 10 }} />
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  {charities.map((c) => (
                    <li key={c.id} style={{ marginBottom: 8 }}>
                      <b>{c.name}</b> <span className="muted">· {c.description || '—'}</span>
                      <div style={{ height: 6 }} />
                      <button className="btn btnDanger" onClick={() => removeCharity(c.id)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card">
              <div className="cardInner">
                <div className="h2">Users & subscriptions</div>
                <p className="p" style={{ marginTop: 0 }}>
                  View users and their latest subscription record.
                </p>

                <div style={{ height: 10 }} />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Email</th>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Plan</th>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>Status</th>
                        <th style={{ textAlign: 'left', padding: '8px 0' }}>End date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 50).map((u) => (
                        <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '10px 0' }}>{u.email || u.id}</td>
                          <td style={{ padding: '10px 0' }}>{u.subscription?.plan || '—'}</td>
                          <td style={{ padding: '10px 0' }}>{u.subscription?.status || '—'}</td>
                          <td style={{ padding: '10px 0' }}>
                            {u.subscription?.end_date ? String(u.subscription.end_date).slice(0, 10) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

