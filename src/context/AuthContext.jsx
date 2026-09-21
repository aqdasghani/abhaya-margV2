/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { getUserProfile } from '../firebase/userService'
import { getTouristProfile } from '../firebase/touristService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [touristProfile, setTouristProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const [profile, tourist] = await Promise.all([
          getUserProfile(user.uid),
          getTouristProfile(user.uid),
        ])
        setUserProfile(profile)
        setTouristProfile(tourist)
      } else {
        setUserProfile(null)
        setTouristProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = { currentUser, userProfile, touristProfile, loading }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}