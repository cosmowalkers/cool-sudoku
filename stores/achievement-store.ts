import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStatsStore, type GameResult } from "@/stores/stats-store";
import type { Difficulty } from "@/lib/sudoku";

export interface Achievement {
  id: string;
  icon: string;
  nameKey: string;  // i18n key
  descKey: string;  // i18n key
  condition: (snapshot: StatsSnapshot) => boolean;
}

export interface StatsSnapshot {
  totalPlayed: number;
  currentStreak: number;
  bestStreak: number;
  lastGame: GameResult | null;
  perDifficulty: Record<Difficulty, number>; // 每个难度完成的局数
  hasCompletedAll: boolean; // 四个难度都至少完成1局
}

interface AchievementState {
  unlockedIds: string[];
  unlockedDates: Record<string, string>; // { id: ISO date }
  newlyUnlocked: string[];
  checkAchievements: () => void;
  clearNewlyUnlocked: () => void;
}

// 18 个成就定义
export const ACHIEVEMENTS: Achievement[] = [
  // 入门 (4)
  { id: "first-win", icon: "🌱", nameKey: "achievement.first-win.name", descKey: "achievement.first-win.desc",
    condition: (s) => s.totalPlayed >= 1 },
  { id: "zero-mistakes", icon: "⭐", nameKey: "achievement.zero-mistakes.name", descKey: "achievement.zero-mistakes.desc",
    condition: (s) => s.lastGame !== null && s.lastGame.mistakes === 0 },
  { id: "speed-easy", icon: "⚡", nameKey: "achievement.speed-easy.name", descKey: "achievement.speed-easy.desc",
    condition: (s) => s.lastGame !== null && s.lastGame.difficulty === "easy" && s.lastGame.elapsedTime < 300 },
  { id: "no-hints", icon: "🧠", nameKey: "achievement.no-hints.name", descKey: "achievement.no-hints.desc",
    condition: (s) => s.lastGame !== null && s.lastGame.hintsUsed === 0 },

  // 进阶 (6)
  { id: "master-easy", icon: "🎯", nameKey: "achievement.master-easy.name", descKey: "achievement.master-easy.desc",
    condition: (s) => s.perDifficulty.easy >= 10 },
  { id: "master-medium", icon: "🎯", nameKey: "achievement.master-medium.name", descKey: "achievement.master-medium.desc",
    condition: (s) => s.perDifficulty.medium >= 10 },
  { id: "master-hard", icon: "🎯", nameKey: "achievement.master-hard.name", descKey: "achievement.master-hard.desc",
    condition: (s) => s.perDifficulty.hard >= 10 },
  { id: "master-expert", icon: "🎯", nameKey: "achievement.master-expert.name", descKey: "achievement.master-expert.desc",
    condition: (s) => s.perDifficulty.expert >= 10 },
  { id: "perfectionist", icon: "💎", nameKey: "achievement.perfectionist.name", descKey: "achievement.perfectionist.desc",
    condition: (s) => s.lastGame !== null && (s.lastGame.difficulty === "hard" || s.lastGame.difficulty === "expert") && s.lastGame.mistakes === 0 },
  { id: "speed-medium", icon: "🚀", nameKey: "achievement.speed-medium.name", descKey: "achievement.speed-medium.desc",
    condition: (s) => s.lastGame !== null && s.lastGame.difficulty === "medium" && s.lastGame.elapsedTime < 600 },

  // 连胜 (4)
  { id: "streak-3", icon: "🔥", nameKey: "achievement.streak-3.name", descKey: "achievement.streak-3.desc",
    condition: (s) => s.currentStreak >= 3 },
  { id: "streak-7", icon: "🔥", nameKey: "achievement.streak-7.name", descKey: "achievement.streak-7.desc",
    condition: (s) => s.currentStreak >= 7 },
  { id: "streak-14", icon: "🔥", nameKey: "achievement.streak-14.name", descKey: "achievement.streak-14.desc",
    condition: (s) => s.currentStreak >= 14 },
  { id: "streak-30", icon: "🔥", nameKey: "achievement.streak-30.name", descKey: "achievement.streak-30.desc",
    condition: (s) => s.currentStreak >= 30 },

  // 里程碑 (4)
  { id: "games-10", icon: "📊", nameKey: "achievement.games-10.name", descKey: "achievement.games-10.desc",
    condition: (s) => s.totalPlayed >= 10 },
  { id: "games-50", icon: "📊", nameKey: "achievement.games-50.name", descKey: "achievement.games-50.desc",
    condition: (s) => s.totalPlayed >= 50 },
  { id: "games-100", icon: "📊", nameKey: "achievement.games-100.name", descKey: "achievement.games-100.desc",
    condition: (s) => s.totalPlayed >= 100 },
  { id: "all-difficulties", icon: "🏆", nameKey: "achievement.all-difficulties.name", descKey: "achievement.all-difficulties.desc",
    condition: (s) => s.hasCompletedAll },
];

function buildSnapshot(): StatsSnapshot {
  const state = useStatsStore.getState();
  const history = state.history;

  const perDifficulty: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0 };
  for (const g of history) {
    perDifficulty[g.difficulty]++;
  }

  return {
    totalPlayed: history.length,
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    lastGame: history.length > 0 ? history[0] : null,
    perDifficulty,
    hasCompletedAll: perDifficulty.easy > 0 && perDifficulty.medium > 0 && perDifficulty.hard > 0 && perDifficulty.expert > 0,
  };
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlockedIds: [],
      unlockedDates: {},
      newlyUnlocked: [],

      checkAchievements: () => {
        const snapshot = buildSnapshot();
        const { unlockedIds } = get();
        const newUnlocks: string[] = [];
        const today = new Date().toISOString().split("T")[0];

        for (const achievement of ACHIEVEMENTS) {
          if (unlockedIds.includes(achievement.id)) continue;
          if (achievement.condition(snapshot)) {
            newUnlocks.push(achievement.id);
          }
        }

        if (newUnlocks.length > 0) {
          const newDates = { ...get().unlockedDates };
          for (const id of newUnlocks) {
            newDates[id] = today;
          }
          set({
            unlockedIds: [...unlockedIds, ...newUnlocks],
            unlockedDates: newDates,
            newlyUnlocked: newUnlocks,
          });
        }
      },

      clearNewlyUnlocked: () => {
        set({ newlyUnlocked: [] });
      },
    }),
    {
      name: "achievement-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        unlockedIds: state.unlockedIds,
        unlockedDates: state.unlockedDates,
      }),
    }
  )
);
