import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Share } from "react-native";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Pause, Play, RotateCcw } from "lucide-react-native";
import { Board } from "@/components/Board";
import { NumberPad, ActionBar } from "@/components/Controls";
import { Confetti, ResultCard } from "@/components/Celebration";
import { StreakBadge } from "@/components/Streak";
import { UnlockOverlay } from "@/components/Achievement";
import { useGameStore } from "@/stores/game-store";
import { useStatsStore } from "@/stores/stats-store";
import { useGameTimer } from "@/hooks/use-game-timer";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useTranslation } from "@/lib/i18n";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function GameScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  useGameTimer();

  const isDark = colorScheme === "dark";
  const colors = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    surface: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#0F172A",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    primary: isDark ? "#60A5FA" : "#2563EB",
    border: isDark ? "#334155" : "#E2E8F0",
  };

  const difficulty = useGameStore((s) => s.difficulty);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const mistakes = useGameStore((s) => s.mistakes);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const isPaused = useGameStore((s) => s.isPaused);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);
  const restart = useGameStore((s) => s.restart);

  const lastMilestone = useStatsStore((s) => s.lastMilestone);
  const clearMilestone = useStatsStore((s) => s.clearMilestone);

  // 庆祝流程
  const [celebrationPhase, setCelebrationPhase] = useState<"none" | "confetti" | "result">("none");

  useEffect(() => {
    if (isCompleted) {
      if (reducedMotion) {
        setCelebrationPhase("result");
      } else {
        setCelebrationPhase("confetti");
      }
    } else {
      setCelebrationPhase("none");
    }
  }, [isCompleted, reducedMotion]);

  useEffect(() => {
    if (celebrationPhase === "result" && lastMilestone) {
      const timer = setTimeout(() => {
        Alert.alert(
          `🔥 ${t("streak.days", { count: lastMilestone })}`,
          t(`streak.milestone.${lastMilestone}`),
          [{ text: "OK", onPress: clearMilestone }]
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [celebrationPhase, lastMilestone, t, clearMilestone]);

  const handleShare = async () => {
    const text = `Cool Sudoku\n${difficulty ? t("diff." + difficulty) : ""} | ${formatTime(elapsedTime)} | ${mistakes} ${t("result.mistakes")}`;
    try {
      await Share.share({ message: text });
    } catch (_e) {}
  };

  // 没有进行中的游戏
  if (!difficulty) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("game.title")}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>{t("game.noGame")}</Text>
        <Pressable
          style={[styles.newGameButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/new-game")}
        >
          <Text style={styles.newGameButtonText}>{t("game.newGame")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight + 8, backgroundColor: colors.bg }]}>
      {/* 顶部信息栏 */}
      <View style={styles.infoBar}>
        <View style={styles.infoLeft}>
          <Text style={[styles.difficultyLabel, { color: colors.textMuted }]}>
            {t("diff." + difficulty)}
          </Text>
          <StreakBadge />
          <Pressable
            onPress={() => {
              Alert.alert(
                t("game.restartConfirm"),
                t("game.restartMsg"),
                [
                  { text: t("newGame.cancel"), style: "cancel" },
                  { text: t("game.restart"), style: "destructive", onPress: restart },
                ]
              );
            }}
            style={styles.restartButton}
            accessibilityLabel={t("game.restart")}
          >
            <RotateCcw size={16} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={styles.infoCenter}>
          <Text style={[styles.timer, { color: colors.text }]}>{formatTime(elapsedTime)}</Text>
          <Pressable
            onPress={isPaused ? resume : pause}
            style={styles.pauseButton}
            accessibilityLabel={isPaused ? t("a11y.resume") : t("a11y.pause")}
          >
            {isPaused ? (
              <Play size={18} color={colors.text} />
            ) : (
              <Pause size={18} color={colors.text} />
            )}
          </Pressable>
        </View>
        <Text style={[styles.mistakesLabel, { color: colors.textMuted }]}>
          {t("game.errors", { count: mistakes })}
        </Text>
      </View>

      {/* 棋盘 */}
      <View style={styles.boardContainer}>
        <Board />
      </View>

      {/* 控制面板 */}
      <ActionBar />
      <View style={{ height: 12 }} />
      <NumberPad />

      {/* 暂停覆盖层 */}
      {isPaused && !isCompleted && (
        <View style={[styles.overlay, { backgroundColor: colors.bg }]}>
          <Text style={[styles.overlayTitle, { color: colors.text }]}>{t("game.paused")}</Text>
          <Text style={[styles.overlaySubtitle, { color: colors.textMuted }]}>
            {t("diff." + difficulty)} • {formatTime(elapsedTime)}
          </Text>
          <Pressable style={[styles.resumeButton, { backgroundColor: colors.primary }]} onPress={resume}>
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.resumeButtonText}>{t("game.resume")}</Text>
          </Pressable>
        </View>
      )}

      {/* 庆祝流程 */}
      {celebrationPhase === "confetti" && (
        <Confetti onFinish={() => setCelebrationPhase("result")} />
      )}
      {celebrationPhase === "result" && (
        <ResultCard onShare={handleShare} />
      )}

      <UnlockOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 90,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  restartButton: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timer: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    fontVariant: ["tabular-nums"],
  },
  pauseButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  mistakesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    width: 80,
    textAlign: "right",
  },
  boardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 32,
  },
  resumeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resumeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 24,
  },
  newGameButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  newGameButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
