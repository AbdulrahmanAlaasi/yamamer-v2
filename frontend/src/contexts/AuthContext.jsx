import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

const STORAGE_KEY = 'sb-quxdrwovgeoajezveiok-auth-token'

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    // Reject if token is expired
    if (session?.expires_at && session.expires_at * 1000 < Date.now()) return null
    return session?.user ?? null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // Seed from localStorage immediately so pages don't flash "unauthenticated"
  const [user, setUser]       = useState(getStoredUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to confirm with Supabase (may hang/fail if project is paused)
    const timeout = setTimeout(() => setLoading(false), 2000)

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
