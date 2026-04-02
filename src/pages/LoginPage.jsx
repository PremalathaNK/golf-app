import Login from '../components/auth/Login'
import Signup from '../components/auth/Signup'

const LoginPage = ({ setUser }) => {
  return (
    <div className="container">
      <div className="hero">
        <div className="card heroCard">
          <h1 className="h1">Welcome</h1>
          <p className="p">
            Create an account, pick a charity, then subscribe to unlock scores and the monthly draw.
          </p>

          <div style={{ height: 16 }} />

          <div className="grid2">
            <div className="card">
              <div className="cardInner">
                <Signup />
              </div>
            </div>
            <div className="card">
              <div className="cardInner">
                <Login setUser={setUser} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage