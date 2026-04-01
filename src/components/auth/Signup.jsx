import { useState } from 'react'
import { signUp } from '../../services/authService'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async () => {
    const data = await signUp(email, password)

    if (data) {
      alert("Signup successful! Now login.")
    }
  }

  return (
    <div>
      <h2>Signup</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignup}>Signup</button>
    </div>
  )
}

export default Signup