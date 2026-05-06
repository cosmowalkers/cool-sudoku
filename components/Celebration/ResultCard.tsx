import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Share2 } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "@/lib/i18n";
import { useGameStore } from "@/stores/game-store";
import { getStatsByDifficulty, useStatsStore } from "@/stores/stats-store";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface ResultCardProps {
  onShare?: () => void;
}

export function ResultCard({ onShare }: ResultCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const difficulty = useGameStore((s) => s.difficulty);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const mistakes = useGameStore((s) => s.mistakes);
  const hintsUsed = useGameStore((s) => s.hintsUsed);

  const history = useStatsStore((s) => s.history);

  // 检查是否新纪录（当前用时 < 该难度历史最佳）
  const isNewRecord = React.useMemo(() => {
    if (!difficulty) return false;
    const stats = getStatsByDifficulty(history, difficulty);
    // 如果只完成了 1 局（刚记录的这局），就是纪录
    if (stats.gamesPlayed <= 1) return true;
    // 对比：跳过最新一条（刚记录的），看之前的历史最佳
    const prevBest = history
      .filter((g) => g.difficulty === difficulty)
      .slice(1)
      .reduce((min, g) => Math.min(min, g.elapsedTime), Infinity);
    return elapsedTime < prevBest;
  }, [difficulty, elapsedTime, history]);

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
      <View style={styles.card}>
        {isNewRecord && (
          <Text style={styles.newRecord}>{t("result.newRecord")}</Text>
        )}

        <Text style={styles.title}>{t("result.title")}</Text>
        <Text style={styles.difficulty}>
          {difficulty ? t("diff." + difficulty) : ""}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>{t("result.time")}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{mistakes}</Text>
            <Text style={styles.statLabel}>{t("result.mistakes")}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{hintsUsed}/3</Text>
            <Text style={styles.statLabel}>{t("result.hints")}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          {onShare && (
            <Pressable style={styles.shareButton} onPress={onShare}>
              <Share2 size={18} color="#64748B" />
              <Text style={styles.shareButtonText}>{t("result.share")}</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.newGameButton}
            onPress={() => router.push("/new-game")}
          >
            <Text style={styles.newGameButtonText}>{t("game.newGame")}</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 250, 252, 0.95)",
    zIndex: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  newRecord: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F59E0B",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 4,
  },
  difficulty: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  newGameButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },
  newGameButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
