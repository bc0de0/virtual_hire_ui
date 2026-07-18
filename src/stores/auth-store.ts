import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// The backend verifies externally-issued HR-user JWTs (Auth0/Clerk per
// app/core/config.py) - it has no login route of its own. Until that
// provider is wired up, this stores a bearer token pasted in via the
// Settings page (e.g. minted by the backend's own test fixtures) so
// authenticated endpoints can be exercised for real.
interface AuthState {
  token: string | null
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token: token && token.trim() ? token.trim() : null }),
    }),
    { name: 'vh-auth' },
  ),
)
