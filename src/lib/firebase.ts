import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, GithubAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// eslint-disable-next-line prefer-const
export let auth: Auth = null!
// eslint-disable-next-line prefer-const
export let db: Firestore = null!
// eslint-disable-next-line prefer-const
export let githubProvider: GithubAuthProvider = null!

let _app: FirebaseApp | null = null

if (typeof window !== "undefined") {
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(_app)
  db = getFirestore(_app)
  githubProvider = new GithubAuthProvider()
}

export { _app as app }
