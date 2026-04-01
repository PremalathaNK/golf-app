import Login from '../components/auth/Login'
import Signup from '../components/auth/Signup'

const LoginPage = ({ setUser }) => {
  return (
    <div>
      <h1>Welcome</h1>
      <Signup />
      <Login setUser={setUser} />
    </div>
  )
}

export default LoginPage