import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { apiGetMe } from '../lib/api'

type Me = { id: number; email: string; role: string }

type AuthState = {
  token: string | null
  me: Me | null
  setToken: (t: string | null) => void
  refreshMe: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const STORAGE_KEY = 'expense_tracker_token'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [me, setMe] = useState<Me | null>(null)
  const tokenRef = useRef<string | null>(token)
  tokenRef.current = token

  const setToken = (t: string | null) => {
    setTokenState(t)
    if (t) localStorage.setItem(STORAGE_KEY, t)
    else localStorage.removeItem(STORAGE_KEY)
  }

  const logout = () => {
    setToken(null)
    setMe(null)
  }

  const refreshMe = useCallback(async () => {
    const snapshot = tokenRef.current
    if (!snapshot) {
      setMe(null)
      return
    }
    try {
      const data = await apiGetMe(snapshot)
      if (tokenRef.current !== snapshot) return
      setMe(data)
    } catch {
      if (tokenRef.current !== snapshot) return
      setTokenState(null)
      localStorage.removeItem(STORAGE_KEY)
      setMe(null)
    }
  }, [])

  useEffect(() => {
    void refreshMe()
  }, [token, refreshMe])

  const value = useMemo<AuthState>(() => ({ token, me, setToken, refreshMe, logout }), [token, me])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

