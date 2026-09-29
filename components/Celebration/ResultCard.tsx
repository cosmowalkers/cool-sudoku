import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Share2, Star } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";
import { useGameStore } from "@/stores/game-store";
import { getStatsByDifficulty, useStatsStore } from "@/stores/stats-store";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function getStarCount(mistakes: number): number {
  if (mistakes === 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}

const SHADOW_H = 4;

interface ResultCardProps {
  onShare?: () => void;
}

export function ResultCard({ onShare }: ResultCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();

  const difficulty = useGameStore((s) => s.difficulty);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const mistakes = useGameStore((s) => s.mistakes);
  const hintsUsed = useGameStore((s) => s.hintsUsed);

  const history = useStatsStore((s) => s.history);

  const isNewRecord = React.useMemo(() => {
    if (!difficulty) return false;
    const stats = getStatsByDifficulty(history, difficulty);
    if (stats.gamesPlayed <= 1) return true;
    const prevBest = history
      .filter((g) => g.difficulty === difficulty)
      .slice(1)
      .reduce((min, g) => Math.min(min, g.elapsedTime), Infinity);
    return elapsedTime < prevBest;
  }, [difficulty, elapsedTime, history]);

  const stars = getStarCount(mistakes);

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* 星级 */}
        <View style={styles.starsRow}>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              size={36}
              fill={i <= stars ? colors.accent : "transparent"}
              color={i <= stars ? colors.accent : colors.border}
              strokeWidth={2}
            />
          ))}
        </View>

        {isNewRecord && (
          <View style={[styles.recordBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.recordBadgeText}>{t("result.newRecord")}</Text>
          </View>
        )}

        <Text style={[styles.title, { color: colors.hint }]}>{t("result.title")}</Text>
        <Text style={[styles.difficulty, { color: colors.foregroundMuted }]}>
          {difficulty ? t("diff." + difficulty) : ""}
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{formatTime(elapsedTime)}</Text>
            <Text style={[styles.statLabel, { color: colors.foregroundMuted }]}>{t("result.time")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.statValue, { color: colors.error }]}>{mistakes}</Text>
            <Text style={[styles.statLabel, { color: colors.foregroundMuted }]}>{t("result.mistakes")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.secondaryLight }]}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>{hintsUsed}/3</Text>
            <Text style={[styles.statLabel, { color: colors.foregroundMuted }]}>{t("result.hints")}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          {onShare && (
            <Pressable style={[styles.shareButton, { borderColor: colors.border }]} onPress={onShare}>
              <Share2 size={18} color={colors.foregroundMuted} />
              <Text style={[styles.shareButtonText, { color: colors.foregroundMuted }]}>{t("result.share")}</Text>
            </Pressable>
          )}
          <View>
            <Pressable
              style={[styles.newGameButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/new-game")}
            >
              <Text style={styles.newGameButtonText}>{t("game.newGame")}</Text>
            </Pressable>
            <View style={[styles.newGameShadow, { backgroundColor: colors.numpadShadow }]} />
          </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 20,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    width: "85%",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 10 },
    }),
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  recordBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  recordBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  difficulty: {
    fontSize: 14,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  newGameButton: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
  },
  newGameShadow: {
    marginHorizontal: 3,
    height: SHADOW_H,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  newGameButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
