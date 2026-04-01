import Subscription from '../components/Subscription'

const SubscriptionPage = ({ user }) => {
  return (
    <div>
      <h1>Subscription Required</h1>
      <Subscription userId={user.id} />
    </div>
  )
}

export default SubscriptionPage