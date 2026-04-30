import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useGameStore } from "@/stores/game-store";

export function useGameTimer() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useGameStore((s) => s.tick);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);

  // 获取当前状态的函数（避免 stale closure）
  const getGameState = () => {
    const state = useGameStore.getState();
    return {
      isPaused: state.isPaused,
      isCompleted: state.isCompleted,
      difficulty: state.difficulty,
    };
  };

  // 管理 interval
  useEffect(() => {
    const startTimer = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        const { isPaused, isCompleted, difficulty } = getGameState();
        if (!isPaused && !isCompleted && difficulty !== null) {
          tick();
        }
      }, 1000);
    };

    const stopTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    startTimer();

    return () => {
      stopTimer();
    };
  }, [tick]);

  // AppState 监听
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const { isCompleted, difficulty } = getGameState();
      if (!difficulty || isCompleted) return;

      if (nextAppState === "active") {
        resume();
      } else if (nextAppState === "inactive" || nextAppState === "background") {
        pause();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [pause, resume]);
}
