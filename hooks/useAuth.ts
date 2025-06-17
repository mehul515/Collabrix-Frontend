import { useState, useEffect } from "react"
import { getUserProfile } from "@/lib/api" // Adjust the path accordingly

interface User {
  name: string
  email: string
  avatar?: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      try {
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("authToken")

        if (storedUser && token) {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        } else if (token) {
          // Fetch user from API
          const profileData = await getProfile(token)
          setUser(profileData)
          setIsAuthenticated(true)
          localStorage.setItem("user", JSON.stringify(profileData))
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { isAuthenticated, user, loading }
}
