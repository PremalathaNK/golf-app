import { useEffect, useState } from 'react'
import { isSubscribed, createSubscription } from '../services/subscriptionService'

const Subscription = ({ userId }) => {
  const [subscribed, setSubscribed] = useState(false)

  const checkSubscription = async () => {
    const status = await isSubscribed(userId)
    setSubscribed(status)
  }

  const handleSubscribe = async () => {
    const success = await createSubscription(userId)

    if (success) {
      alert("Subscribed successfully!")
      setSubscribed(true)
    }
  }

  useEffect(() => {
    checkSubscription()
  }, [])

  return (
    <div>
      <h2>Subscription</h2>

      {subscribed ? (
        <p>✅ You are subscribed</p>
      ) : (
        <button onClick={handleSubscribe}>
          Subscribe
        </button>
      )}
    </div>
  )
}

export default Subscription