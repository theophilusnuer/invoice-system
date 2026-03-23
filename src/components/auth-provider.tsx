"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"

interface AuthContextValue {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      // Set session cookie for middleware (basic approach)
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken()
        const isProduction = process.env.NODE_ENV === "production"
        const secure = isProduction ? "; Secure" : ""
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax${secure}`
      } else {
        document.cookie = "__session=; path=/; max-age=0"
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
