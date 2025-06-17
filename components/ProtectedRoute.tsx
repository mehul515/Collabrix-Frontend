"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login") // Redirect to login if not authenticated
    }
  }, [loading, isAuthenticated, router])

  if (loading) return <div>Loading...</div>

  return <>{children}</>
}
