import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Difficulty } from "@/lib/sudoku";
import { useAchievementStore } from "@/stores/achievement-store";

export interface GameResult {
  difficulty: Difficulty;
  elapsedTime: number;
  mistakes: number;
  hintsUsed: number;
  completedAt: string; // ISO string
}

interface DifficultyStats {
  gamesPlayed: number;
  bestTime: number;
  averageTime: number;
}

interface OverallStats {
  totalPlayed: number;
  currentStreak: number;
  bestStreak: number;
}

interface StatsState {
  history: GameResult[];
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null; // "YYYY-MM-DD"
  lastMilestone: number | null;
  recordGame: (result: Omit<GameResult, "completedAt">) => void;
  clearMilestone: () => void;
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      history: [],
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      lastMilestone: null,
      recordGame: (result) => {
        const newEntry: GameResult = {
          ...result,
          completedAt: new Date().toISOString(),
        };
        const today = new Date().toISOString().split("T")[0];
        const { lastCompletedDate, currentStreak, bestStreak } = get();

        let newStreak = currentStreak;

        if (lastCompletedDate === today) {
          // 同一天，不变
        } else if (lastCompletedDate === getYesterday()) {
          // 昨天完成过，连胜+1
          newStreak = currentStreak + 1;
        } else {
          // 更早或从未完成，重置为1
          newStreak = 1;
        }

        const newBest = Math.max(bestStreak, newStreak);

        const milestones = [3, 7, 14, 30, 100];
        const hitMilestone = milestones.includes(newStreak) && newStreak > currentStreak;

        set((state) => ({
          history: [newEntry, ...state.history].slice(0, 100),
          currentStreak: newStreak,
          bestStreak: newBest,
          lastCompletedDate: today,
          lastMilestone: hitMilestone ? newStreak : null,
        }));

        setTimeout(() => {
          useAchievementStore.getState().checkAchievements();
        }, 100);
      },
      clearMilestone: () => set({ lastMilestone: null }),
    }),
    {
      name: "stats-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          const history = persistedState?.history || [];
          let streak = 0;
          let bestStreak = 0;
          let lastDate: string | null = null;

          if (history.length > 0) {
            lastDate = history[0]?.completedAt?.split("T")[0] || null;
            streak = 1;
            bestStreak = 1;
          }

          return {
            ...persistedState,
            currentStreak: streak,
            bestStreak: bestStreak,
            lastCompletedDate: lastDate,
            lastMilestone: null,
          };
        }
        return persistedState as StatsState;
      },
    }
  )
);

// Derived selectors
export function getStatsByDifficulty(history: GameResult[], difficulty: Difficulty): DifficultyStats {
  const filtered = history.filter((g) => g.difficulty === difficulty);
  if (filtered.length === 0) return { gamesPlayed: 0, bestTime: 0, averageTime: 0 };
  const times = filtered.map((g) => g.elapsedTime);
  return {
    gamesPlayed: filtered.length,
    bestTime: Math.min(...times),
    averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
  };
}

export function getOverallStats(history: GameResult[]): OverallStats {
  const state = useStatsStore.getState();
  return {
    totalPlayed: history.length,
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
  };
}
