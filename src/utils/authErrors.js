/**
 * Formats Firebase Authentication errors into user-friendly messages
 * without leaking internal API details or stack traces.
 */
export function getFriendlyAuthErrorMessage(err) {
  if (!err) return 'An unexpected error occurred. Please try again.'

  const code = err.code || ''

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials and try again.'

    case 'auth/email-already-in-use':
      return 'An account with this email address is already registered. Please sign in instead.'

    case 'auth/weak-password':
      return 'Password is too short. Please choose a password with at least 6 characters.'

    case 'auth/invalid-email':
      return 'Please provide a valid email address (e.g. user@example.com).'

    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection and retry.'

    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access to this account has been temporarily restricted. Please try again in a few minutes.'

    case 'auth/user-disabled':
      return 'This account has been suspended or disabled. Please contact the administrator.'

    default:
      // Strip raw "Firebase: Error (auth/...)" wrapper if present
      if (err.message && err.message.includes('auth/')) {
        return 'Authentication failed. Please verify your details and try again.'
      }
      return err.message || 'Authentication failed. Please try again.'
  }
}
