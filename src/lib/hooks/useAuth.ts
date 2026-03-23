"use client"

import { useState, useEffect } from "react"
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { getFirebaseAuth, githubProvider } from "@/lib/firebase"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const auth = getFirebaseAuth()
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGitHub = async () => {
    try {
      setError(null)
      await signInWithPopup(getFirebaseAuth(), githubProvider)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(getFirebaseAuth())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed")
    }
  }

  return { user, loading, error, signInWithGitHub, signOut }
}
