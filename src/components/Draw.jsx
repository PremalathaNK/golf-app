import { useState } from 'react'
import { createDraw, runDraw } from '../services/drawService'
import { isSubscribed } from '../services/subscriptionService'

const Draw = ({ userId }) => {
  const [result, setResult] = useState(null)

  // ✅ RUN DRAW
  const handleDraw = async () => {
    console.log("Run draw clicked")

    // 🔒 Check subscription
    const subscribed = await isSubscribed(userId)

    if (!subscribed) {
      alert("Please subscribe first")
      return
    }

    // 🎲 Create draw
    const draw = await createDraw()

    if (!draw) {
      alert("Draw creation failed")
      return
    }

    // 🧠 Run draw logic
    const res = await runDraw(draw.id, userId)

    if (!res) {
      alert("Draw failed")
      return
    }

    setResult(res)
  }

  // 🔄 RESET DRAW
  const handleReset = () => {
    setResult(null)
  }

  return (
    <div>
      <h2>Monthly Draw</h2>

      <button onClick={handleDraw}>
        Run Draw
      </button>

      <button onClick={handleReset}>
        Reset Draw
      </button>

      {result && (
        <div>
          <p>Draw Numbers: {result.drawNumbers.join(', ')}</p>
          <p>Your Scores: {result.userScores.join(', ')}</p>
          <p>Matches: {result.matches}</p>

          <p>
            <b>Prize Won: ₹{result.prize}</b>
          </p>
        </div>
      )}
    </div>
  )
}

export default Draw