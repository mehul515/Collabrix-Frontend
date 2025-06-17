"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { getUserProfile } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export interface User {
  fullName: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const refreshUser = async () => {
    setLoading(true)
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          setUser(parsed)
          setIsAuthenticated(true)
          setLoading(false)
          return
        } catch {
          localStorage.removeItem("user")
        }
      }

      const profile = await getUserProfile()
      if (profile) {
        setUser(profile)
        setIsAuthenticated(true)
        localStorage.setItem("user", JSON.stringify(profile))
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
  }

  useEffect(() => {
    refreshUser()
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        setUser,
        setIsAuthenticated,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
