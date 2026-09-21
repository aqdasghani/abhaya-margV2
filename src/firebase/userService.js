import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

const USERS_COLLECTION = 'users'

// Create the Firestore profile document for a newly registered user
export async function createUserProfile(uid, data) {
  const userRef = doc(db, USERS_COLLECTION, uid)
  await setDoc(userRef, {
    uid,
    email: data.email,
    displayName: data.displayName || '',
    role: data.role || 'tourist',
    createdAt: serverTimestamp(),
  })
}

// Read a user's profile document
export async function getUserProfile(uid) {
  const userRef = doc(db, USERS_COLLECTION, uid)
  const snapshot = await getDoc(userRef)
  return snapshot.exists() ? snapshot.data() : null
}

// Update fields on a user's profile document
export async function updateUserProfile(uid, updates) {
  const userRef = doc(db, USERS_COLLECTION, uid)
  await updateDoc(userRef, updates)
}