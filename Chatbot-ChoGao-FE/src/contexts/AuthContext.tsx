import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { UserProfile } from '../services/api'
import { authApi } from '../services/api'

interface AuthContextType {
  isAuthenticated: boolean
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        // In a real app, you'd verify the token with the backend
        // For now, we'll just set a placeholder user
        setUser({
          id: '',
          email: '',
          name: '',
          role: 'USER',
        })
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.login(email, password)
      setUser({
        id: response.user.id.toString(),
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setLoading(true)
    setError(null)
    try {
      await authApi.register(email, password, name)
      // Auto login after registration
      await login(email, password)
    } catch (err: any) {
      const errorMessage = err.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    setError(null)
  }

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    register,
    logout,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
