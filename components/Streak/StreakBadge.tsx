import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { useStatsStore } from "@/stores/stats-store";

export function StreakBadge() {
  const currentStreak = useStatsStore((s) => s.currentStreak);
  const lastCompletedDate = useStatsStore((s) => s.lastCompletedDate);

  if (currentStreak === 0) return null;

  const today = new Date().toISOString().split("T")[0];
  const completedToday = lastCompletedDate === today;
  const flameColor = completedToday ? "#F59E0B" : "#94A3B8";

  return (
    <View style={styles.container}>
      <Flame size={14} color={flameColor} fill={completedToday ? "#F59E0B" : "none"} />
      <Text style={[styles.text, { color: flameColor }]}>{currentStreak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
