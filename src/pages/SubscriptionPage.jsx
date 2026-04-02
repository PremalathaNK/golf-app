import Subscription from '../components/Subscription'

const SubscriptionPage = ({ user, onSubscribed }) => {
  return (
    <Subscription userId={user.id} onSubscribed={onSubscribed} />
  )
}

export default SubscriptionPage