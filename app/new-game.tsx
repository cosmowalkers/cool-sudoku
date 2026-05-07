import React from "react";
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";
import type { Difficulty } from "@/lib/sudoku";

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
    // 如果有进行中的游戏，确认是否放弃
    if (currentDifficulty && !isCompleted) {
      Alert.alert(
        t("newGame.confirmTitle"),
        t("newGame.confirmMsg"),
        [
          { text: t("newGame.cancel"), style: "cancel" },
          {
            text: t("newGame.startNew"),
            style: "destructive",
            onPress: () => {
              newGame(difficulty);
              router.back();
            },
          },
        ]
      );
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
          <Pressable
            key={d.key}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleSelect(d.key)}
            disabled={isGenerating}
          >
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{d.label}</Text>
            <Text style={[styles.cardDescription, { color: colors.foregroundMuted }]}>{d.description}</Text>
          </Pressable>
        ))}
      </View>

      {isGenerating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.foregroundMuted }]}>{t("newGame.generating")}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
    color: "#0F172A",
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
    color: "#64748B",
    marginBottom: 16,
  },
  cards: {
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardPressed: {
    backgroundColor: "#DBEAFE",
    borderColor: "#2563EB",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#64748B",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
});
