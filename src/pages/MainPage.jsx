import ScoreForm from '../components/ScoreForm'
import Draw from '../components/Draw'
import Dashboard from '../components/Dashboard'

const MainPage = ({ user }) => {
  return (
    <div>
      <h1>Golf App</h1>

      <ScoreForm userId={user.id} />
      <Draw userId={user.id} />
      <Dashboard userId={user.id} />
    </div>
  )
}

export default MainPage