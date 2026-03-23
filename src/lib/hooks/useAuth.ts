"use client"

import { useState, useEffect } from "react"
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import { getFirebaseAuth, googleProvider } from "@/lib/firebase"

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

  const signInWithGoogle = async () => {
    try {
      setError(null)
      await signInWithPopup(getFirebaseAuth(), googleProvider)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed")
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed")
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setError(null)
      await sendPasswordResetEmail(getFirebaseAuth(), email)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed")
      return false
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(getFirebaseAuth())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed")
    }
  }

  return { user, loading, error, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut }
}
