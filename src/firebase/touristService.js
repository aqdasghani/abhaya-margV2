import { doc, getDoc, setDoc, collection, query, where, limit, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

const TOURISTS_COLLECTION = 'tourists'

export async function createTouristProfile(uid, data) {
  const touristRef = doc(db, TOURISTS_COLLECTION, uid)
  await setDoc(touristRef, {
    uid,
    touristId: data.touristId,
    fullName: data.fullName,
    phone: data.phone,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    status: 'ACTIVE',
    createdAt: serverTimestamp(),
  })
}

export async function getTouristProfile(uid) {
  const touristRef = doc(db, TOURISTS_COLLECTION, uid)
  const snapshot = await getDoc(touristRef)
  return snapshot.exists() ? snapshot.data() : null
}

export async function getTouristByTouristId(touristId) {
  if (!touristId) return null
  const q = query(
    collection(db, TOURISTS_COLLECTION),
    where('touristId', '==', touristId),
    limit(1)
  )
  const snapshot = await getDocs(q)
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
  }

  // Fallback: check if the parameter passed is actually a UID
  const docRef = doc(db, TOURISTS_COLLECTION, touristId)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }

  return null
}