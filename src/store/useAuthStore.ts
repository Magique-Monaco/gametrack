import { create } from 'zustand';

interface AuthUser {
  uuid: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  fetchMe: () => Promise<void>;
  register: (password: string) => Promise<string | null>;
  login: (uuid: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  error: null,

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  register: async (password: string) => {
    try {
      set({ error: null });
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'Registration failed' });
        return null;
      }

      set({ user: { uuid: data.uuid, createdAt: new Date().toISOString() } });

      // Attempt to load library right after register automatically
      try {
        const { useLibraryStore } = await import('./useLibraryStore');
        const store = useLibraryStore.getState();
        if (store.games.length === 0) {
            await store.syncFromServer();
        } else {
            // If they just registered and already have local games, sync them UP to their new empty cloud
            await store.syncToServer();
        }
      } catch (e) {
          console.error("Failed to auto-sync library on register", e);
      }

      return data.uuid;
    } catch {
      set({ error: 'Network error. Please try again.' });
      return null;
    }
  },

  login: async (uuid: string, password: string) => {
    try {
      set({ error: null });
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'Login failed' });
        return false;
      }

      set({ user: { uuid: data.uuid, createdAt: data.createdAt } });
      
      // Attempt to load library right after login automatically
      // We do this via dynamic import to avoid store init cycles
      try {
        const { useLibraryStore } = await import('./useLibraryStore');
        const store = useLibraryStore.getState();
        // Use auto-pull if local library is empty
        if (store.games.length === 0) {
            await store.syncFromServer();
        }
      } catch (e) {
          console.error("Failed to auto-sync library on login", e);
      }
      
      return true;
    } catch {
      set({ error: 'Network error. Please try again.' });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ user: null });
    } catch {
      // Still clear local state even if request fails
      set({ user: null });
    }
  },

  clearError: () => set({ error: null }),
}));
