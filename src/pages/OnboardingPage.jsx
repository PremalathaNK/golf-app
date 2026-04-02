import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCharities } from '../services/charityService'
import { updateProfile } from '../services/profileService'

export default function OnboardingPage({ user, profile, onProfileUpdated }) {
  const [charities, setCharities] = useState([])
  const [charityId, setCharityId] = useState(profile?.charity_id ?? '')
  const [contributionPercent, setContributionPercent] = useState(
    profile?.contribution_percent ?? 10
  )
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let ignore = false
    const load = async () => {
      try {
        const items = await listCharities()
        if (!ignore) setCharities(items)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  const canSave = useMemo(() => {
    const pct = Number(contributionPercent)
    return Boolean(charityId) && Number.isFinite(pct) && pct >= 10 && pct <= 100
  }, [charityId, contributionPercent])

  const save = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      const pct = Number(contributionPercent)
      const next = await updateProfile(user.id, {
        charity_id: charityId,
        contribution_percent: pct,
      })
      onProfileUpdated?.(next)
      navigate('/subscribe', { replace: true })
    } catch (e) {
      alert(e.message ?? 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container">
      <div className="hero">
        <div className="card heroCard">
          <h1 className="h1">Pick your charity</h1>
          <p className="p">
            Your subscription supports a real cause. Choose a charity now (minimum 10% contribution). You can
            change this later in settings.
          </p>

          <div style={{ height: 16 }} />

          <div className="grid2">
            <div className="card">
              <div className="cardInner">
                <div className="h2">Charity</div>
                <div className="field">
                  <div className="label">Select a charity</div>
                  <select
                    className="select"
                    value={charityId}
                    onChange={(e) => setCharityId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="" disabled>
                      {loading ? 'Loading charities…' : 'Choose one'}
                    </option>
                    {charities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ height: 12 }} />

                <div className="field">
                  <div className="label">Contribution percentage (min 10%)</div>
                  <input
                    className="input"
                    type="number"
                    min={10}
                    max={100}
                    value={contributionPercent}
                    onChange={(e) => setContributionPercent(e.target.value)}
                  />
                  <div className="muted" style={{ fontSize: 12 }}>
                    Current: {Math.max(10, Number(contributionPercent) || 10)}%
                  </div>
                </div>

                <div style={{ height: 16 }} />

                <button className="btn btnPrimary" onClick={save} disabled={!canSave || saving}>
                  {saving ? 'Saving…' : 'Continue'}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="cardInner">
                <div className="h2">Why it matters</div>
                <p className="p" style={{ marginTop: 0 }}>
                  This platform is designed to feel charitable-first. Your contribution is enforced automatically,
                  and prize pools are driven by active subscribers.
                </p>
                <div style={{ height: 14 }} />
                <div className="kpi">
                  <div className="kpiValue">10% minimum</div>
                  <div className="kpiLabel">You can increase it any time</div>
                </div>
                <div style={{ height: 10 }} />
                <div className="kpi">
                  <div className="kpiValue">Monthly draw</div>
                  <div className="kpiLabel">Winners submit proof only if they win</div>
                </div>
                <div style={{ height: 10 }} />
                <div className="kpi">
                  <div className="kpiValue">Privacy</div>
                  <div className="kpiLabel">No public score sharing by default</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

