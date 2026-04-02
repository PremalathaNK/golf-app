import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { isSubscribed } from './services/subscriptionService'
import { ensureProfile } from './services/profileService'

import LoginPage from './pages/LoginPage'
import SubscriptionPage from './pages/SubscriptionPage'
import MainPage from './pages/MainPage'
import OnboardingPage from './pages/OnboardingPage'
import AdminPage from './pages/AdminPage'
import CharitiesPage from './pages/CharitiesPage'
import HowItWorksPage from './pages/HowItWorksPage'

function isAdminEmail(email) {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  const allow = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  return allow.includes((email || '').toLowerCase())
}

function TopBar({ user, subscribed, onLogout }) {
  return (
    <div className="topbar">
      <div className="topbarInner">
        <div className="brand">
          <div className="logo" />
          <Link to="/" className="pill" style={{ color: 'var(--text)' }}>
            Golf for Good
          </Link>
        </div>

        <div className="nav">
          <Link className="btn" to="/charities">
            Charities
          </Link>
          <Link className="btn" to="/how-it-works">
            How it works
          </Link>
          {user ? (
            <>
              <span className="pill">{user.email}</span>
              <span className="pill">
                {subscribed ? 'Subscription: Active' : 'Subscription: Inactive'}
              </span>
              {isAdminEmail(user.email) ? (
                <Link className="btn" to="/admin">
                  Admin
                </Link>
              ) : null}
              {subscribed ? (
                <Link className="btn btnPrimary" to="/app">
                  Dashboard
                </Link>
              ) : (
                <Link className="btn btnPrimary" to="/subscribe">
                  Subscribe
                </Link>
              )}
              <button className="btn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn" to="/auth">
                Login
              </Link>
              <Link className="btn btnPrimary" to="/auth">
                Start
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function RequireAuth({ user, children }) {
  const location = useLocation()
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  return children
}

function RequireSubscription({ subscribed, children }) {
  if (!subscribed) return <Navigate to="/subscribe" replace />
  return children
}

function PublicHome({ user, subscribed }) {
  return (
    <div className="container">
      <div className="hero">
        <div className="card heroCard">
          <h1 className="h1">Play better. Win monthly. Fund real impact.</h1>
          <p className="p">
            Track your last 5 Stableford scores, enter the monthly draw, and direct a portion of your subscription
            to a charity you care about — without the “traditional golf” look.
          </p>

          <div className="row" style={{ marginTop: 18 }}>
            {user ? (
              subscribed ? (
                <Link to="/app" className="btn btnPrimary">
                  Go to dashboard
                </Link>
              ) : (
                <Link to="/subscribe" className="btn btnPrimary">
                  Subscribe to unlock
                </Link>
              )
            ) : (
              <Link to="/auth" className="btn btnPrimary">
                Start (Signup / Login)
              </Link>
            )}

            <Link to="/subscribe" className="btn">
              View plans
            </Link>
            <Link to="/charities" className="btn">
              Explore charities
            </Link>
            <Link to="/how-it-works" className="btn">
              Draw mechanics
            </Link>
          </div>

          <div className="kpiRow">
            <div className="kpi">
              <div className="kpiValue">Monthly / Yearly</div>
              <div className="kpiLabel">Simple subscription plans</div>
            </div>
            <div className="kpi">
              <div className="kpiValue">Rolling 5 scores</div>
              <div className="kpiLabel">Always keep your latest form</div>
            </div>
            <div className="kpi">
              <div className="kpiValue">Charity-first</div>
              <div className="kpiLabel">Minimum 10% contribution</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const sessionUser = data?.session?.user ?? null
      if (ignore) return
      setUser(sessionUser)
      setLoading(false)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      ignore = true
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const check = async () => {
      if (!user) {
        setSubscribed(false)
        setProfile(null)
        return
      }
      const status = await isSubscribed(user.id)
      if (ignore) return
      setSubscribed(status)
    }

    check()

    return () => {
      ignore = true
    }
  }, [user])

  const refreshSubscription = async () => {
    if (!user) return false
    const status = await isSubscribed(user.id)
    setSubscribed(status)
    return status
  }

  useEffect(() => {
    let ignore = false
    const load = async () => {
      if (!user) return
      setProfileLoading(true)
      try {
        const p = await ensureProfile({ id: user.id, email: user.email })
        if (!ignore) setProfile(p)
      } catch (e) {
        console.error(e)
      } finally {
        if (!ignore) setProfileLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [user])

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const topBarProps = useMemo(
    () => ({ user, subscribed, onLogout: logout }),
    [user, subscribed]
  )

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="cardInner">
            <div className="muted">Loading…</div>
          </div>
        </div>
      </div>
    )
  }

  const needsOnboarding = !!user && !profileLoading && !!profile && !profile.charity_id

  return (
    <>
      <TopBar {...topBarProps} />

      <Routes>
        <Route path="/" element={<PublicHome user={user} subscribed={subscribed} />} />
        <Route path="/charities" element={<CharitiesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />

        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <LoginPage setUser={setUser} />}
        />

        <Route
          path="/subscribe"
          element={
            <RequireAuth user={user}>
              {needsOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <SubscriptionPage user={user} onSubscribed={refreshSubscription} />
              )}
            </RequireAuth>
          }
        />

        <Route
          path="/onboarding"
          element={
            <RequireAuth user={user}>
              <OnboardingPage
                user={user}
                profile={profile}
                onProfileUpdated={(p) => setProfile(p)}
              />
            </RequireAuth>
          }
        />

        <Route
          path="/app"
          element={
            <RequireAuth user={user}>
              {needsOnboarding ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <RequireSubscription subscribed={subscribed}>
                  <MainPage user={user} />
                </RequireSubscription>
              )}
            </RequireAuth>
          }
        />

        <Route path="/admin" element={<AdminPage user={user} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App