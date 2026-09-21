import { doc, runTransaction } from 'firebase/firestore'
import { db } from './config'

async function generateSequentialId(counterName, prefix) {
  const counterRef = doc(db, 'counters', counterName)
  const currentYear = new Date().getFullYear()

  const newId = await runTransaction(db, async (transaction) => {
    const counterSnap = await transaction.get(counterRef)

    let lastNumber = 0
    if (counterSnap.exists()) {
      const data = counterSnap.data()
      lastNumber = data.year === currentYear ? data.lastNumber : 0
    }

    const nextNumber = lastNumber + 1

    transaction.set(counterRef, {
      year: currentYear,
      lastNumber: nextNumber,
    })

    const paddedNumber = String(nextNumber).padStart(5, '0')
    return `${prefix}-${currentYear}-${paddedNumber}`
  })

  return newId
}

// Generates sequential Tourist IDs like TS-2026-00001, resetting each year
export async function generateTouristId() {
  return generateSequentialId('touristId', 'TS')
}

// Generates sequential Incident IDs like INC-2026-00001, resetting each year
export async function generateIncidentId() {
  return generateSequentialId('incidentId', 'INC')
}