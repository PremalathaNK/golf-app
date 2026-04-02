import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      const data = await login(email.trim(), password)

      if (data?.user) {
        setUser?.(data.user)
      }

      // Navigation will be confirmed by App-level auth state,
      // but we also navigate immediately for better UX.
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? <p style={{ color: 'salmon' }}>{error}</p> : null}

      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>
    </div>
  )
}

export default Login