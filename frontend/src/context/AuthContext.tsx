import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import request from '../utils/request'
import type { User, ApiRes } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void
  logout: () => void
  fetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
  })

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('token', token)
    setState({ user, token, loading: false })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setState({ user: null, token: null, loading: false })
  }, [])

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setState({ user: null, token: null, loading: false })
      return
    }
    try {
      const res: ApiRes<User> = await request.get('/profile')
      setState({ user: res.data, token, loading: false })
    } catch {
      localStorage.removeItem('token')
      setState({ user: null, token: null, loading: false })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
