import React from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";
import { showConfirm } from "@/lib/dialog";
import { PRESS_IN_MS, PRESS_OUT_MS, PRESS_SCALE, softShadow } from "@/lib/ui/press";
import type { ThemeColors } from "@/lib/themes";
import type { Difficulty } from "@/lib/sudoku";

const DIFF_META: Record<Difficulty, { emoji: string }> = {
  easy: { emoji: "🌱" },
  medium: { emoji: "🔥" },
  hard: { emoji: "💀" },
  expert: { emoji: "⚡" },
};

function getDiffColor(diff: Difficulty, colors: ThemeColors): string {
  const map: Record<Difficulty, string> = {
    easy: colors.diffEasy,
    medium: colors.diffMedium,
    hard: colors.diffHard,
    expert: colors.diffExpert,
  };
  return map[diff];
}

function DifficultyCard({ diff, label, desc, onPress, disabled }: {
  diff: Difficulty; label: string; desc: string; onPress: () => void; disabled: boolean;
}) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const color = getDiffColor(diff, colors);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        if (!reducedMotion && !disabled)
          scale.value = withTiming(PRESS_SCALE, { duration: PRESS_IN_MS });
      }}
      onPressOut={() => {
        if (!reducedMotion)
          scale.value = withTiming(1, { duration: PRESS_OUT_MS });
      }}
      onPress={onPress}
      disabled={disabled}
      style={styles.cardWrapper}
    >
      <Animated.View style={[styles.card, { backgroundColor: color }, bodyStyle]}>
        <Text style={styles.cardEmoji}>{DIFF_META[diff].emoji}</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{label}</Text>
          <Text style={styles.cardDescription}>{desc}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function NewGameScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();

  const difficulties: { key: Difficulty; label: string; description: string }[] = [
    { key: "easy", label: t("diff.easy"), description: t("diff.easy.desc") },
    { key: "medium", label: t("diff.medium"), description: t("diff.medium.desc") },
    { key: "hard", label: t("diff.hard"), description: t("diff.hard.desc") },
    { key: "expert", label: t("diff.expert"), description: t("diff.expert.desc") },
  ];

  const newGame = useGameStore((s) => s.newGame);
  const currentDifficulty = useGameStore((s) => s.difficulty);
  const isCompleted = useGameStore((s) => s.isCompleted);
  const isGenerating = useGameStore((s) => s.isGenerating);

  const handleSelect = (difficulty: Difficulty) => {
    if (currentDifficulty && !isCompleted) {
      showConfirm({
        title: t("newGame.confirmTitle"),
        message: t("newGame.confirmMsg"),
        confirmText: t("newGame.startNew"),
        cancelText: t("newGame.cancel"),
        destructive: true,
        onConfirm: () => {
          newGame(difficulty);
          router.back();
        },
      });
    } else {
      newGame(difficulty);
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("newGame.title")}</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityLabel={t("a11y.close")}
        >
          <X size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <Text style={[styles.subtitle, { color: colors.foregroundMuted }]}>{t("newGame.chooseDifficulty")}</Text>

      <View style={styles.cards}>
        {difficulties.map((d) => (
          <DifficultyCard
            key={d.key}
            diff={d.key}
            label={d.label}
            desc={d.description}
            onPress={() => handleSelect(d.key)}
            disabled={isGenerating}
          />
        ))}
      </View>

      {isGenerating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>{t("newGame.generating")}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  cards: {
    gap: 14,
  },
  cardWrapper: {
    height: 80,
  },
  card: {
    height: 80,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 14,
    ...softShadow,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
