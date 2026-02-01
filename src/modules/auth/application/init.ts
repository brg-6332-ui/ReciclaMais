import { useAuthState } from '~/modules/auth/application/authState'

// Initialize auth state on application start, ensuring listeners are set up
// so auth changes are tracked and persisted.
useAuthState()
