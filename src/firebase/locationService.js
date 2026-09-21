import { collection, doc, addDoc, setDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { db } from './config'

function readingsRef(uid) {
  return collection(db, 'locations', uid, 'readings')
}

// Saves one reading into history AND updates the "latest location" summary doc
export async function saveLocationReading(uid, { latitude, longitude, accuracy, source, touristId }) {
  const payload = {
    uid,
    touristId: touristId || null,
    latitude,
    longitude,
    accuracy: accuracy ?? null,
    source: source || 'NETWORK',
    createdAt: serverTimestamp(),
  }

  await addDoc(readingsRef(uid), payload)

  const summaryRef = doc(db, 'locations', uid)
  await setDoc(summaryRef, payload, { merge: true })
}

export async function getLastKnownLocation(uid) {
  const q = query(readingsRef(uid), orderBy('createdAt', 'desc'), limit(1))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return snapshot.docs[0].data()
}

export async function getLocationHistory(uid, count = 10) {
  const q = query(readingsRef(uid), orderBy('createdAt', 'desc'), limit(count))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}