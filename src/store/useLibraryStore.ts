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
  addGame: (game: Omit<TrackedGame, 'addedAt'>) => void;
  removeGame: (id: number) => void;
  updateStatus: (id: number, status: GameStatus) => void;
  updatePlaytime: (id: number, playtime: number) => void;
  importLibrary: (games: TrackedGame[]) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      games: [],
      
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
      }))
    }),
    {
      name: 'gametrack-library', // local storage key
    }
  )
);
