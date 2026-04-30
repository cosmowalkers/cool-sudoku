import React from "react";
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useGameStore } from "@/stores/game-store";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/lib/i18n";
import type { Difficulty } from "@/lib/sudoku";

export default function NewGameScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const difficulties: { key: Difficulty; label: string; description: string }[] = [
    { key: "easy", label: t("diff.easy"), description: t("diff.easy.desc") },
    { key: "medium", label: t("diff.medium"), description: t("diff.medium.desc") },
    { key: "hard", label: t("diff.hard"), description: t("diff.hard.desc") },
    { key: "expert", label: t("diff.expert"), description: t("diff.expert.desc") },
  ];
  const isDark = colorScheme === "dark";
  const colors = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    surface: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F1F5F9" : "#0F172A",
    textMuted: isDark ? "#94A3B8" : "#64748B",
    primary: isDark ? "#60A5FA" : "#2563EB",
    border: isDark ? "#334155" : "#E2E8F0",
  };

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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t("newGame.title")}</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityLabel={t("a11y.close")}
        >
          <X size={24} color={colors.text} />
        </Pressable>
      </View>

      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t("newGame.chooseDifficulty")}</Text>

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
            <Text style={[styles.cardTitle, { color: colors.text }]}>{d.label}</Text>
            <Text style={[styles.cardDescription, { color: colors.textMuted }]}>{d.description}</Text>
          </Pressable>
        ))}
      </View>

      {isGenerating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t("newGame.generating")}</Text>
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
