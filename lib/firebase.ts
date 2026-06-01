import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB5266TxyfB5hR6Dbrl4Fq70qWl0W5bKdQ",
  authDomain: "rhyme-protocol-64545.firebaseapp.com",
  projectId: "rhyme-protocol-64545",
  storageBucket: "rhyme-protocol-64545.firebasestorage.app",
  messagingSenderId: "511199820854",
  appId: "1:511199820854:web:ef92d25922a225a6aeec97",
  measurementId: "G-G9FQ78NSP9"
}

// Initialize Firebase (prevent multiple instances)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Auth providers
const googleProvider = new GoogleAuthProvider()

async function clearFirebaseAuthPersistence() {
  if (typeof window === 'undefined') return

  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i)
      if (key?.startsWith('firebase:')) {
        storage.removeItem(key)
      }
    }
  }

  if (window.indexedDB) {
    await new Promise<void>((resolve) => {
      const request = window.indexedDB.deleteDatabase('firebaseLocalStorageDb')
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => resolve()
    })
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw error
  }
}

// Sign in anonymously
export async function signInAnon() {
  try {
    const result = await signInAnonymously(auth)
    return result.user
  } catch (error) {
    console.error('Anonymous sign-in error:', error)
    throw error
  }
}

// Sign out
export async function signOut() {
  try {
    await firebaseSignOut(auth)
    await clearFirebaseAuthPersistence()
  } catch (error) {
    console.error('Sign-out error:', error)
    throw error
  }
}

// Auth state listener
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export type { User }
