import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Difficulty } from "@/lib/sudoku";

export interface GameResult {
  difficulty: Difficulty;
  elapsedTime: number;
  mistakes: number;
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
  recordGame: (result: Omit<GameResult, "completedAt">) => void;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      history: [],
      recordGame: (result) => {
        const newEntry: GameResult = {
          ...result,
          completedAt: new Date().toISOString(),
        };
        set((state) => ({
          history: [newEntry, ...state.history].slice(0, 100),
        }));
      },
    }),
    {
      name: "stats-store",
      storage: createJSONStorage(() => AsyncStorage),
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
  if (history.length === 0) {
    return { totalPlayed: 0, currentStreak: 0, bestStreak: 0 };
  }

  // 按自然日去重
  const daySet = new Set<string>();
  history.forEach((g) => {
    const day = g.completedAt.split("T")[0];
    daySet.add(day);
  });

  // currentStreak: 从今天开始连续天数
  const today = new Date().toISOString().split("T")[0];
  const days = Array.from(daySet).sort().reverse();
  let streak = 0;
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];
    if (days[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  // bestStreak: 历史最长连续天数
  const sortedDays = Array.from(daySet).sort();
  let tempStreak = 1;
  let bestStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    totalPlayed: history.length,
    currentStreak: streak,
    bestStreak,
  };
}
