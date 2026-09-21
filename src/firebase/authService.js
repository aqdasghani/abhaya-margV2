import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from './config'
import { createUserProfile } from './userService'
import { createTouristProfile } from './touristService'
import { generateTouristId } from './counterService'

/**
 * Registers a tourist:
 * 1. Auth account -> 2. users doc (role: tourist) -> 3. unique Tourist ID -> 4. tourists doc.
 * Includes rollback cleanup if database initialization fails to prevent orphaned Auth accounts.
 */
export async function registerUser(formData) {
  const {
    email,
    password,
    fullName,
    phone,
    emergencyContactName,
    emergencyContactPhone,
  } = formData

  let user = null

  try {
    // 1. Create Firebase Authentication account
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
    user = userCredential.user

    if (fullName) {
      await updateProfile(user, { displayName: fullName.trim() })
    }

    // 2. Create user document (role: tourist)
    await createUserProfile(user.uid, {
      email: user.email,
      displayName: fullName.trim(),
      role: 'tourist',
    })

    // 3. Generate a collision-free sequential Tourist ID (e.g. TS-2026-00001)
    const touristId = await generateTouristId()

    // 4. Create tourist document (safety-specific profile)
    await createTouristProfile(user.uid, {
      touristId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
    })

    return user
  } catch (err) {
    // Rollback: if database document creation failed after Auth account was created,
    // delete the newly created Auth user so retrying registration won't block the email
    if (user) {
      try {
        await user.delete()
      } catch (cleanupErr) {
        console.error('Failed to cleanup orphaned Auth user during registration rollback:', cleanupErr)
      }
    }
    throw err
  }
}

/**
 * Registers an Administrator:
 * Requires valid Admin Security Authorization Key.
 * Sets role: 'admin' directly on the user profile.
 */
export async function registerAdmin(formData, adminKey) {
  const { email, password, fullName } = formData
  const expectedKey = import.meta.env.VITE_ADMIN_INVITE_KEY || 'ABHAYA-ADMIN-2026'

  if (!adminKey || adminKey.trim() !== expectedKey) {
    throw new Error('Invalid Admin Security Passcode. Access denied.')
  }

  let user = null

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
    user = userCredential.user

    if (fullName) {
      await updateProfile(user, { displayName: fullName.trim() })
    }

    await createUserProfile(user.uid, {
      email: user.email,
      displayName: fullName.trim(),
      role: 'admin',
    })

    return user
  } catch (err) {
    if (user) {
      try {
        await user.delete()
      } catch (cleanupErr) {
        console.error('Failed to cleanup orphaned Admin user during rollback:', cleanupErr)
      }
    }
    throw err
  }
}

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password)
  return userCredential.user
}

export async function logoutUser() {
  await signOut(auth)
}