import { initializeApp, getApps, getApp as _getApp, type FirebaseApp } from "firebase/app"
import { getAuth as _getAuth, GithubAuthProvider } from "firebase/auth"
import { getFirestore as _getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let _app: FirebaseApp | undefined

function ensureApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : _getApp()
  }
  return _app
}

export const githubProvider = new GithubAuthProvider()

/** Returns the Firebase Auth instance, initializing Firebase on first call. */
export function getFirebaseAuth() {
  return _getAuth(ensureApp())
}

/** Returns the Firestore instance, initializing Firebase on first call. */
export function getFirebaseDb() {
  return _getFirestore(ensureApp())
}
