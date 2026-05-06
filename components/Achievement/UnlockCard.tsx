import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useAchievementStore, ACHIEVEMENTS } from "@/stores/achievement-store";
import { useTranslation } from "@/lib/i18n";
import { playSound } from "@/lib/audio";

export function UnlockOverlay() {
  const { t } = useTranslation();
  const newlyUnlocked = useAchievementStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAchievementStore((s) => s.clearNewlyUnlocked);

  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setCurrentIndex(0);
      playSound("achievement");
    }
  }, [newlyUnlocked]);

  if (newlyUnlocked.length === 0) return null;

  const currentId = newlyUnlocked[currentIndex];
  const achievement = ACHIEVEMENTS.find((a) => a.id === currentId);
  if (!achievement) return null;

  const handleDismiss = () => {
    if (currentIndex < newlyUnlocked.length - 1) {
      setCurrentIndex((i) => i + 1);
      playSound("achievement");
    } else {
      clearNewlyUnlocked();
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.overlay}>
      <Pressable onPress={handleDismiss} style={styles.card}>
        <Text style={styles.icon}>{achievement.icon}</Text>
        <Text style={styles.title}>{t("achievement.unlocked")}</Text>
        <Text style={styles.name}>{t(achievement.nameKey)}</Text>
        <Text style={styles.desc}>{t(achievement.descKey)}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "75%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#F59E0B",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
