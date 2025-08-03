import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../../lib/types'
import { ServiceFactory } from '../../lib/services/factory'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const authService = ServiceFactory.getAuthService()

  useEffect(() => {
    loadStoredUser()
  }, [])

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user')
      const storedToken = await AsyncStorage.getItem('authToken')
      
      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        
        // Verify token is still valid
        try {
          await authService.verifyToken(storedToken)
        } catch (error) {
          // Token invalid, clear storage
          await clearStoredAuth()
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearStoredAuth = async () => {
    await AsyncStorage.multiRemove(['user', 'authToken'])
    setUser(null)
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.signIn({ email, password })
      
      // Store user and token
      await AsyncStorage.setItem('user', JSON.stringify(response.user))
      await AsyncStorage.setItem('authToken', response.token)
      
      setUser(response.user)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await authService.signUp({ 
        email, 
        password, 
        name,
        location: null // Will be set later when user grants location permission
      })
      
      // Store user and token
      await AsyncStorage.setItem('user', JSON.stringify(response.user))
      await AsyncStorage.setItem('authToken', response.token)
      
      setUser(response.user)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      await clearStoredAuth()
    } catch (error) {
      console.error('Sign out error:', error)
      // Clear local storage even if server request fails
      await clearStoredAuth()
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return

    try {
      const updatedUser = await authService.updateProfile(user.id, userData)
      
      // Update stored user
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}