/**
 * Utility script to promote any registered tourist to Administrator role.
 *
 * Usage:
 *   node scripts/makeAdmin.js <email-or-uid>
 * Example:
 *   node scripts/makeAdmin.js admin@abhayamarg.gov.in
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

if (!existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found at:', envPath)
  process.exit(1)
}

// Parse .env.local
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length > 0) {
      env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '').replace(/,$/, '')
    }
  }
})

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const identifier = process.argv[2]
if (!identifier) {
  console.log('\nUsage: node scripts/makeAdmin.js <email-or-uid>')
  console.log('Example: node scripts/makeAdmin.js tourist@example.com\n')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function promote() {
  console.log(`\n🔍 Searching for user account: "${identifier}"...`)

  let targetUid = null
  let userData = null

  // 1. Check if identifier is an email
  if (identifier.includes('@')) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', identifier.trim()))
    const snap = await getDocs(q)

    if (!snap.empty) {
      targetUid = snap.docs[0].id
      userData = snap.docs[0].data()
    }
  } else {
    // 2. Direct UID check
    const userRef = doc(db, 'users', identifier.trim())
    const snap = await getDoc(userRef)
    if (snap.exists()) {
      targetUid = snap.id
      userData = snap.data()
    }
  }

  if (!targetUid) {
    console.error(`❌ User not found with identifier "${identifier}".`)
    console.log('👉 Make sure the user has already registered through the app (/register) first.\n')
    process.exit(1)
  }

  console.log(`✅ Found user: ${userData.displayName || 'No name'} (UID: ${targetUid})`)
  console.log(`Current role: "${userData.role || 'tourist'}"`)

  if (userData.role === 'admin') {
    console.log('⭐ User is already an administrator.\n')
    process.exit(0)
  }

  console.log('🚀 Promoting user to role: "admin"...')
  const userRef = doc(db, 'users', targetUid)
  await updateDoc(userRef, {
    role: 'admin',
    promotedAt: new Date(),
  })

  console.log(`🎉 SUCCESS: User "${identifier}" is now an Admin!`)
  console.log('👉 They can now log in at /login and will be automatically directed to /admin console.\n')
  process.exit(0)
}

promote().catch((err) => {
  console.error('❌ Failed to promote user:', err)
  process.exit(1)
})
