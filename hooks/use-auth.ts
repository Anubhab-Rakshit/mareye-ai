"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      try {
        console.log("useAuth - Checking authentication...")
        
        // First check if user data exists in localStorage
        const stored = typeof window !== "undefined" ? localStorage.getItem("profile") : null
        console.log("useAuth - localStorage profile:", stored ? "exists" : "not found")
        
        if (stored) {
          const userData = JSON.parse(stored)
          console.log("useAuth - Found user in localStorage:", userData)
          setUser(userData)
          setLoading(false)
          return
        }

        // If no localStorage data, check authentication via API
        console.log("useAuth - Checking API authentication...")
        const response = await fetch('/api/profile', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store' // Prevent caching
        })

        console.log("useAuth - API response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("useAuth - API response data:", data)
          if (data.success && data.user) {
            console.log("useAuth - User authenticated via API:", data.user)
            const userData = {
              id: data.user.id || '',
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              avatar: data.user.avatar
            }
            setUser(userData)
            // Store user data in localStorage for future use
            if (typeof window !== "undefined") {
              localStorage.setItem("profile", JSON.stringify(userData))
            }
          } else {
            console.log("useAuth - API returned no user data")
            // Clear stale localStorage
            if (typeof window !== "undefined") {
              localStorage.removeItem("profile")
            }
            setUser(null)
          }
        } else {
          console.log("useAuth - API authentication failed")
          // Clear stale localStorage on auth failure
          if (typeof window !== "undefined") {
            localStorage.removeItem("profile")
          }
          setUser(null)
        }
      } catch (error) {
        console.error("useAuth - Error checking auth:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for storage changes (e.g., when user logs out in another tab)
    if (typeof window !== "undefined") {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "profile") {
          if (e.newValue) {
            try {
              setUser(JSON.parse(e.newValue))
            } catch {
              setUser(null)
            }
          } else {
            setUser(null)
          }
        }
      }

      window.addEventListener("storage", handleStorageChange)
      return () => window.removeEventListener("storage", handleStorageChange)
    }
  }, [mounted])

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' })
      localStorage.removeItem("profile")
      localStorage.removeItem("user")
      setUser(null)
      window.location.href = "/try"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout
  }
}
