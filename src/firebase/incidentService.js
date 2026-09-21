import {
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

const INCIDENTS_COLLECTION = 'incidents'

export async function createIncident(uid, data) {
  const incidentRef = doc(db, INCIDENTS_COLLECTION, data.incidentId)
  await setDoc(incidentRef, {
    incidentId: data.incidentId,
    uid,
    touristId: data.touristId || null,
    incidentType: data.type || 'SOS',
    status: data.status || 'ACTIVE',
    title: data.title || null,
    description: data.description || null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    locationSource: data.locationSource || null,
    geofenceId: data.geofenceId || null,
    geofenceName: data.geofenceName || null,
    riskLevel: data.riskLevel || null,
    createdAt: serverTimestamp(),
  })
  return data.incidentId
}

export function subscribeToTouristIncidents(uid, callback) {
  const incidentsRef = collection(db, INCIDENTS_COLLECTION)
  const q = query(incidentsRef, where('uid', '==', uid))
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    list.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime()
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime()
      return timeB - timeA
    })
    callback(list)
  })
}


export async function getRecentIncidents(uid, count = 5) {
  const incidentsRef = collection(db, INCIDENTS_COLLECTION)
  const q = query(incidentsRef, where('uid', '==', uid), orderBy('createdAt', 'desc'), limit(count))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

// Checks whether this tourist already has an open incident for this specific zone —
// the main safeguard against creating duplicate incidents on every location tick
export async function findActiveGeofenceIncident(uid, geofenceId) {
  const incidents = await getRecentIncidents(uid, 50)
  return (
    incidents.find(
      (incident) =>
        incident.incidentType === 'GEOFENCE' &&
        incident.status === 'ACTIVE' &&
        incident.geofenceId === geofenceId
    ) || null
  )
}