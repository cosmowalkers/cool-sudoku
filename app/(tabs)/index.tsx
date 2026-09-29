import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Share, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Pause, Play, RotateCcw, Heart, Download } from "lucide-react-native";
import { Board } from "@/components/Board";
import { NumberPad, ActionBar, NUMPAD_HEIGHT } from "@/components/Controls";
import { Confetti, ResultCard } from "@/components/Celebration";
import { StreakBadge } from "@/components/Streak";
import { FeedbackBanner } from "@/components/Feedback";
import { ProgressBar } from "@/components/Progress";
import { UnlockOverlay } from "@/components/Achievement";
import { DownloadSheet } from "@/components/Download";
import { MAX_LIVES, isGameOverNow, useGameStore } from "@/stores/game-store";
import { useStatsStore } from "@/stores/stats-store";
import { useGameTimer } from "@/hooks/use-game-timer";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useLocaleStore, useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";
import { showAlert, showConfirm } from "@/lib/dialog";
import type { Difficulty } from "@/lib/sudoku";
import type { ThemeColors } from "@/lib/themes";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getDiffColor(diff: Difficulty, colors: ThemeColors): string {
  const map: Record<Difficulty, string> = {
    easy: colors.diffEasy,
    medium: colors.diffMedium,
    hard: colors.diffHard,
    expert: colors.diffExpert,
  };
  return map[diff];
}

export default function GameScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  useGameTimer();

  const difficulty = useGameStore((s) => s.difficulty);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const mistakes = useGameStore((s) => s.mistakes);
  const isPaused = useGameStore((s) => s.isPaused);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);
  const restart = useGameStore((s) => s.restart);

  const lastMilestone = useStatsStore((s) => s.lastMilestone);
  const clearMilestone = useStatsStore((s) => s.clearMilestone);
  const lifeMode = useLocaleStore((s) => s.lifeMode);
  const isGameOver = isGameOverNow(mistakes, isCompleted, lifeMode);

  // 庆祝流程
  const [celebrationPhase, setCelebrationPhase] = useState<"none" | "confetti" | "result">("none");
  const [downloadVisible, setDownloadVisible] = useState(false);

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
        showAlert({
          title: `🔥 ${t("streak.days", { count: lastMilestone })}`,
          message: t(`streak.milestone.${lastMilestone}`),
          okText: t("common.ok"),
          onClose: clearMilestone,
        });
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
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("game.title")}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.foregroundMuted }]}>{t("game.noGame")}</Text>
        <Pressable
          style={[styles.newGameButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/new-game")}
        >
          <Text style={styles.newGameButtonText}>{t("game.newGame")}</Text>
        </Pressable>

        {/* 网页端下载入口：扫码装 App */}
        {Platform.OS === "web" && (
          <Pressable
            style={styles.downloadButton}
            onPress={() => setDownloadVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t("download.entry")}
          >
            <Download size={16} color={colors.foregroundMuted} />
            <Text style={[styles.downloadButtonText, { color: colors.foregroundMuted }]}>
              {t("download.entry")}
            </Text>
          </Pressable>
        )}

        <DownloadSheet
          visible={downloadVisible}
          onClose={() => setDownloadVisible(false)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight + 8, backgroundColor: colors.background }]}>
      {/* 顶部信息栏 */}
      <View style={styles.infoBar}>
        <View style={styles.infoLeft}>
          <View style={[styles.diffPill, { backgroundColor: getDiffColor(difficulty, colors) }]}>
            <Text style={styles.diffPillText}>{t("diff." + difficulty)}</Text>
          </View>
          <StreakBadge />
          <Pressable
            onPress={() => {
              showConfirm({
                title: t("game.restartConfirm"),
                message: t("game.restartMsg"),
                confirmText: t("game.restart"),
                cancelText: t("newGame.cancel"),
                destructive: true,
                onConfirm: restart,
              });
            }}
            style={styles.restartButton}
            accessibilityLabel={t("game.restart")}
          >
            <RotateCcw size={16} color={colors.foregroundMuted} />
          </Pressable>
        </View>
        <View style={styles.infoCenter}>
          <Text style={[styles.timer, { color: colors.foreground }]}>{formatTime(elapsedTime)}</Text>
        </View>
        <View style={styles.infoRight}>
          {lifeMode === "challenge" && (
            <View style={styles.livesRow} accessibilityLabel={t("settings.lifeMode")}>
              {Array.from({ length: MAX_LIVES }, (_, i) => (
                <Heart
                  key={i}
                  size={18}
                  fill={i < MAX_LIVES - mistakes ? colors.life : "transparent"}
                  color={i < MAX_LIVES - mistakes ? colors.life : colors.lifeLost}
                  strokeWidth={2}
                />
              ))}
            </View>
          )}
          <Pressable
            onPress={isPaused ? resume : pause}
            style={[styles.pauseCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel={isPaused ? t("a11y.resume") : t("a11y.pause")}
          >
            {isPaused ? (
              <Play size={16} color={colors.foreground} />
            ) : (
              <Pause size={16} color={colors.foreground} />
            )}
          </Pressable>
        </View>
      </View>

      {/* 进度条 */}
      <ProgressBar />

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
        <View style={[styles.overlay, { backgroundColor: colors.background }]}>
          <Text style={[styles.overlayTitle, { color: colors.foreground }]}>{t("game.paused")}</Text>
          <Text style={[styles.overlaySubtitle, { color: colors.foregroundMuted }]}>
            {t("diff." + difficulty)} • {formatTime(elapsedTime)}
          </Text>
          <Pressable style={[styles.resumeButton, { backgroundColor: colors.primary }]} onPress={resume}>
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.resumeButtonText}>{t("game.resume")}</Text>
          </Pressable>
        </View>
      )}

      {/* Game Over 覆盖层 */}
      {isGameOver && (
        <View style={[styles.overlay, { backgroundColor: colors.background }]}>
          <Text style={styles.gameOverEmoji}>💔</Text>
          <Text style={[styles.overlayTitle, { color: colors.error }]}>{t("game.gameOver")}</Text>
          <Text style={[styles.overlaySubtitle, { color: colors.foregroundMuted }]}>
            {t("game.gameOverMsg")}
          </Text>
          <Text style={[styles.gameOverStats, { color: colors.foregroundMuted }]}>
            {t("diff." + difficulty)} • {formatTime(elapsedTime)}
          </Text>
          <View style={styles.gameOverActions}>
            <Pressable
              style={[styles.resumeButton, { backgroundColor: colors.primary }]}
              onPress={restart}
            >
              <RotateCcw size={20} color="#FFFFFF" />
              <Text style={styles.resumeButtonText}>{t("game.tryAgain")}</Text>
            </Pressable>
            <Pressable
              style={[styles.gameOverSecondary, { borderColor: colors.border }]}
              onPress={() => router.push("/new-game")}
            >
              <Text style={[styles.gameOverSecondaryText, { color: colors.foreground }]}>{t("game.newGame")}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* 庆祝流程 */}
      {celebrationPhase === "confetti" && (
        <Confetti onFinish={() => setCelebrationPhase("result")} />
      )}
      {celebrationPhase === "result" && (
        <ResultCard onShare={handleShare} />
      )}

      <FeedbackBanner bottomOffset={tabBarHeight + 8 + NUMPAD_HEIGHT} />

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
    paddingVertical: 10,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  diffPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  diffPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  restartButton: {
    padding: 6,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCenter: {
    alignItems: "center",
  },
  timer: {
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    justifyContent: "flex-end",
  },
  livesRow: {
    flexDirection: "row",
    gap: 2,
  },
  pauseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  gameOverEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameOverStats: {
    fontSize: 14,
    marginTop: -24,
    marginBottom: 32,
  },
  gameOverActions: {
    gap: 12,
    alignItems: "center",
  },
  gameOverSecondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gameOverSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
