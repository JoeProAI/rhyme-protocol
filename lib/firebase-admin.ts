import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App

function getAdminApp(): App {
  if (getApps().length === 0) {
    // Use service account from env variable
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: 'rhyme-protocol-64545.firebasestorage.app',
      })
    } else {
      // Fallback for local dev - will use default credentials
      adminApp = initializeApp({
        projectId: 'rhyme-protocol-64545',
        storageBucket: 'rhyme-protocol-64545.firebasestorage.app',
      })
    }
  }
  return adminApp || getApps()[0]
}

export const adminDb = () => getFirestore(getAdminApp())
export const adminStorage = () => getStorage(getAdminApp())
export const adminAuth = () => getAuth(getAdminApp())
