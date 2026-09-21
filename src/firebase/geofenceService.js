import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

const GEOFENCES_COLLECTION = 'geofences'

export function subscribeToGeofences(callback) {
  const geofencesRef = collection(db, GEOFENCES_COLLECTION)
  return onSnapshot(geofencesRef, (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  })
}

// Only active zones — this is what the tourist map subscribes to
export function subscribeToActiveGeofences(callback) {
  const geofencesRef = collection(db, GEOFENCES_COLLECTION)
  const q = query(geofencesRef, where('active', '==', true))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
  })
}

export async function createGeofence(data) {
  const geofencesRef = collection(db, GEOFENCES_COLLECTION)
  await addDoc(geofencesRef, {
    name: data.name,
    description: data.description || '',
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius,
    riskLevel: data.riskLevel || 'LOW',
    source: data.source || 'MANUAL',
    agency: data.agency || null,
    advisoryId: data.advisoryId || null,
    active: true,
    createdAt: serverTimestamp(),
  })
}

export async function updateGeofence(id, data) {
  const geofenceRef = doc(db, GEOFENCES_COLLECTION, id)
  await updateDoc(geofenceRef, {
    name: data.name,
    description: data.description || '',
    latitude: data.latitude,
    longitude: data.longitude,
    radius: data.radius,
    riskLevel: data.riskLevel || 'LOW',
  })
}

export async function setGeofenceActive(id, active) {
  const geofenceRef = doc(db, GEOFENCES_COLLECTION, id)
  await updateDoc(geofenceRef, { active })
}

export async function deleteGeofence(id) {
  const geofenceRef = doc(db, GEOFENCES_COLLECTION, id)
  await deleteDoc(geofenceRef)
}

/**
 * Synchronizes government safety and risk zones into Firestore.
 * Deduplicates by advisoryId or normalized name so existing zones are not duplicated.
 * Leaves manual geofences completely untouched.
 */
export async function syncGovernmentGeofences(govZones) {
  const geofencesRef = collection(db, GEOFENCES_COLLECTION)
  const snapshot = await getDocs(geofencesRef)

  const existing = new Set()
  snapshot.forEach((docSnap) => {
    const data = docSnap.data()
    if (data.advisoryId) existing.add(data.advisoryId)
    if (data.name) existing.add(data.name.trim().toLowerCase())
  })

  let addedCount = 0
  let skippedCount = 0

  for (const zone of govZones) {
    const isDuplicate =
      (zone.advisoryId && existing.has(zone.advisoryId)) ||
      (zone.name && existing.has(zone.name.trim().toLowerCase()))

    if (isDuplicate) {
      skippedCount++
      continue
    }

    await addDoc(geofencesRef, {
      name: zone.name,
      description: zone.description || '',
      latitude: zone.latitude,
      longitude: zone.longitude,
      radius: zone.radius,
      riskLevel: zone.riskLevel || 'HIGH',
      source: 'GOVERNMENT_API',
      agency: zone.agency || 'NDMA',
      advisoryId: zone.advisoryId || null,
      active: true,
      createdAt: serverTimestamp(),
    })

    if (zone.advisoryId) existing.add(zone.advisoryId)
    if (zone.name) existing.add(zone.name.trim().toLowerCase())
    addedCount++
  }

  return {
    totalAvailable: govZones.length,
    addedCount,
    skippedCount,
  }
}