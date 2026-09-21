import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import { generateIncidentId } from './counterService'

// --- Real-time listeners with error callbacks ---

export function subscribeToTourists(callback, onError) {
  const touristsRef = collection(db, 'tourists')
  return onSnapshot(
    touristsRef,
    (snapshot) => {
      callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    },
    (err) => {
      console.error('Error in tourists listener:', err)
      if (onError) onError(err)
    }
  )
}

export function subscribeToIncidents(callback, onError) {
  const incidentsRef = collection(db, 'incidents')
  const q = query(incidentsRef, orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    },
    (err) => {
      console.error('Error in incidents listener:', err)
      if (onError) onError(err)
    }
  )
}

export function subscribeToLatestLocations(callback, onError) {
  const locationsRef = collection(db, 'locations')
  return onSnapshot(
    locationsRef,
    (snapshot) => {
      callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    },
    (err) => {
      console.error('Error in locations listener:', err)
      if (onError) onError(err)
    }
  )
}

export function subscribeToTouristLocation(uid, callback, onError) {
  const locationRef = doc(db, 'locations', uid)
  return onSnapshot(
    locationRef,
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null)
    },
    (err) => {
      console.error(`Error in location listener for ${uid}:`, err)
      if (onError) onError(err)
    }
  )
}

// --- One-time reads ---

export async function getIncidentById(incidentId) {
  const incidentRef = doc(db, 'incidents', incidentId)
  const snapshot = await getDoc(incidentRef)
  return snapshot.exists() ? snapshot.data() : null
}

// --- Writes ---

export async function resolveIncident(incidentId) {
  const incidentRef = doc(db, 'incidents', incidentId)
  await updateDoc(incidentRef, {
    status: 'RESOLVED',
    resolvedAt: serverTimestamp(),
  })
}

/**
 * Reports a tourist as LOST:
 * Atomically updates the tourist status AND creates a real LOST incident record
 * using a single writeBatch commit. Prevents partial state failures.
 */
export async function reportTouristLostWithIncident(uid, touristProfile, lastKnownLocation) {
  const incidentId = await generateIncidentId()
  const touristRef = doc(db, 'tourists', uid)
  const incidentRef = doc(db, 'incidents', incidentId)

  const batch = writeBatch(db)

  // 1. Flip tourist status to LOST
  batch.update(touristRef, {
    status: 'LOST',
    lostAt: serverTimestamp(),
  })

  // 2. Create the associated incident
  batch.set(incidentRef, {
    incidentId,
    uid,
    touristId: touristProfile?.touristId || null,
    incidentType: 'LOST',
    status: 'ACTIVE',
    latitude: lastKnownLocation?.latitude ?? null,
    longitude: lastKnownLocation?.longitude ?? null,
    locationSource: lastKnownLocation ? lastKnownLocation.source || 'LAST_KNOWN' : null,
    geofenceId: null,
    geofenceName: null,
    riskLevel: null,
    createdAt: serverTimestamp(),
  })

  await batch.commit()
  return incidentId
}

/**
 * Resolves a LOST case:
 * Atomically marks the incident RESOLVED and returns the tourist to ACTIVE
 * using a single writeBatch commit.
 */
export async function resolveLostCase(uid, incidentId) {
  const incidentRef = doc(db, 'incidents', incidentId)
  const touristRef = doc(db, 'tourists', uid)

  const batch = writeBatch(db)

  batch.update(incidentRef, {
    status: 'RESOLVED',
    resolvedAt: serverTimestamp(),
  })

  batch.update(touristRef, {
    status: 'ACTIVE',
    foundAt: serverTimestamp(),
  })

  await batch.commit()
}