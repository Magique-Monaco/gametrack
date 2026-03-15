import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameStatus = 'Playing' | 'Completed' | 'On Hold' | 'Dropped' | 'Plan to Play';

export interface TrackedGame {
  id: number;
  title: string;
  thumbnail: string;
  status: GameStatus;
  playtime: number; // in hours
  addedAt: number; // timestamp
}

interface LibraryState {
  games: TrackedGame[];
  isSyncing: boolean;
  lastSyncedAt: number | null;

  addGame: (game: Omit<TrackedGame, 'addedAt'>) => void;
  removeGame: (id: number) => void;
  updateStatus: (id: number, status: GameStatus) => void;
  updatePlaytime: (id: number, playtime: number) => void;
  importLibrary: (games: TrackedGame[]) => void;

  // Server sync
  syncToServer: () => Promise<boolean>;
  syncFromServer: () => Promise<boolean>;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      games: [],
      isSyncing: false,
      lastSyncedAt: null,
      
      addGame: (game) => set((state) => {
        // Prevent duplicates
        if (state.games.some(g => g.id === game.id)) {
          return state;
        }
        return {
          games: [...state.games, { ...game, addedAt: Date.now() }]
        };
      }),

      removeGame: (id) => set((state) => ({
        games: state.games.filter(g => g.id !== id)
      })),

      updateStatus: (id, status) => set((state) => ({
        games: state.games.map(g => g.id === id ? { ...g, status } : g)
      })),

      updatePlaytime: (id, playtime) => set((state) => ({
        games: state.games.map(g => g.id === id ? { ...g, playtime } : g)
      })),

      importLibrary: (games) => set(() => ({
        games
      })),

      syncToServer: async () => {
        const { games } = get();
        set({ isSyncing: true });
        try {
          const res = await fetch('/api/library', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              games: games.map(g => ({
                game_id: g.id,
                title: g.title,
                thumbnail: g.thumbnail,
                status: g.status,
                playtime: g.playtime,
                added_at: g.addedAt,
              })),
            }),
          });
          if (res.ok) {
            set({ isSyncing: false, lastSyncedAt: Date.now() });
            return true;
          }
          set({ isSyncing: false });
          return false;
        } catch {
          set({ isSyncing: false });
          return false;
        }
      },

      syncFromServer: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch('/api/library');
          if (res.ok) {
            const data = await res.json();
            const games: TrackedGame[] = data.games.map((g: { game_id: number; title: string; thumbnail: string; status: string; playtime: number; added_at: number }) => ({
              id: g.game_id,
              title: g.title,
              thumbnail: g.thumbnail,
              status: g.status as GameStatus,
              playtime: g.playtime,
              addedAt: g.added_at,
            }));
            set({ games, isSyncing: false, lastSyncedAt: Date.now() });
            return true;
          }
          set({ isSyncing: false });
          return false;
        } catch {
          set({ isSyncing: false });
          return false;
        }
      },
    }),
    {
      name: 'gametrack-library', // local storage key
    }
  )
);
