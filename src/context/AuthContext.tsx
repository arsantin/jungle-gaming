import React, { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { User } from '@/types'
import { AuthContext } from './useAuth'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nft_auth_token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const isMountedRef = useRef(false)

  const clearSession = useCallback(() => {
    localStorage.removeItem('nft_auth_token')
    setToken(null)
    setUser(null)
    queryClient.clear()
  }, [])

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('nft_auth_token')
    if (!currentToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const res = await api.get<{ user: User }>('/auth/me')
      setUser(res.data.user)
    } catch {
      clearSession()
    } finally {
      setIsLoading(false)
    }
  }, [clearSession])

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true
      refreshUser()
    }

    const handleExpired = () => {
      clearSession()
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [refreshUser, clearSession])

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.post<{ user: User; token: string }>('/auth/login', {
      email,
      password: pass,
    })
    const { user: loggedUser, token: authToken } = res.data
    localStorage.setItem('nft_auth_token', authToken)
    setToken(authToken)
    setUser(loggedUser)

    try {
      await api.post('/cart/merge', { guestKey: 'guest' })
    } catch {
      // Ignored
    }

    queryClient.invalidateQueries()
    return loggedUser
  }

  const register = async (name: string, email: string, pass: string): Promise<User> => {
    const res = await api.post<{ user: User; token: string }>('/auth/register', {
      name,
      email,
      password: pass,
    })
    const { user: registeredUser, token: authToken } = res.data
    localStorage.setItem('nft_auth_token', authToken)
    setToken(authToken)
    setUser(registeredUser)

    try {
      await api.post('/cart/merge', { guestKey: 'guest' })
    } catch {
      // Ignored
    }

    queryClient.invalidateQueries()
    return registeredUser
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      clearSession()
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
