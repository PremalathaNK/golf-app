import { useState } from 'react'
import { signUp } from '../../services/authService'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async () => {
    if (loading) return
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const data = await signUp(email.trim(), password)

      // If email confirmations are enabled, Supabase returns a user but no session.
      if (data?.user && !data?.session) {
        setMessage(
          'Signup successful. Please verify your email, then come back and login.'
        )
      } else {
        setMessage('Signup successful. You can now login.')
      }
    } catch (e) {
      setError(e.message ?? 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Signup</h2>

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
      {message ? <p style={{ color: '#b7f7c3' }}>{message}</p> : null}

      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Signing up…' : 'Signup'}
      </button>
    </div>
  )
}

export default Signup