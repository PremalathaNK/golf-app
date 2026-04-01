import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { getCurrentUser } from './services/authService'
import { isSubscribed } from './services/subscriptionService'

import LoginPage from './pages/LoginPage'
import SubscriptionPage from './pages/SubscriptionPage'
import MainPage from './pages/MainPage'

function App() {
  const [user, setUser] = useState(null)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    console.log("USER:", currentUser)

    if (currentUser) {
      const subStatus = await isSubscribed(currentUser.id)
      console.log("SUBSCRIBED:", subStatus)
      setSubscribed(subStatus)
    }

    setUser(currentUser)
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PAGE */}
        <Route
          path="/"
          element={
            !user
              ? <LoginPage setUser={setUser} />
              : (!subscribed
                  ? <SubscriptionPage user={user} />
                  : <MainPage user={user} />
                )
          }
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App