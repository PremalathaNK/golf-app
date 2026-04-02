import { Link } from 'react-router-dom'

export default function HowItWorksPage() {
  return (
    <div className="container">
      <div className="hero">
        <div className="card heroCard">
          <h1 className="h1">How the monthly draw works</h1>
          <p className="p">
            This platform is subscription-first and charity-first. The draw is executed once per month by admin,
            then published. Your entry uses your latest 5 Stableford scores (1–45).
          </p>

          <div style={{ height: 16 }} />

          <div className="grid2">
            <div className="card">
              <div className="cardInner">
                <div className="h2">1) Subscribe</div>
                <p className="p" style={{ marginTop: 0 }}>
                  Choose Monthly or Yearly. A portion of your fee goes to your selected charity (min 10%).
                </p>
              </div>
            </div>
            <div className="card">
              <div className="cardInner">
                <div className="h2">2) Enter 5 scores</div>
                <p className="p" style={{ marginTop: 0 }}>
                  You must maintain exactly 5 latest scores. New ones replace the oldest automatically.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="cardInner">
                <div className="h2">3) Monthly publish</div>
                <p className="p" style={{ marginTop: 0 }}>
                  Admin runs simulations and publishes a single official draw for the month.
                </p>
              </div>
            </div>
            <div className="card">
              <div className="cardInner">
                <div className="h2">4) Match tiers</div>
                <p className="p" style={{ marginTop: 0 }}>
                  Winners are based on 3/4/5 number matches. Winners upload proof; admin verifies and marks payouts.
                </p>
              </div>
            </div>
          </div>

          <div style={{ height: 16 }} />

          <div className="row">
            <Link className="btn" to="/charities">
              Explore charities
            </Link>
            <Link className="btn btnPrimary" to="/subscribe">
              View plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

