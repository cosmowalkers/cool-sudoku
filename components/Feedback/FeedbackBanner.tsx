import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Sparkles } from "lucide-react-native";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";

const HIDDEN_OFFSET = 72;
const SLIDE_MS = 180;
const VISIBLE_MS = 1400;
const EDGE_HEIGHT = 4;

interface FeedbackBannerProps {
  bottomOffset: number;
}

export function FeedbackBanner({ bottomOffset }: FeedbackBannerProps) {
  const feedback = useGameStore((s) => s.feedback);
  const clearFeedback = useGameStore((s) => s.clearFeedback);
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();

  const translateY = useSharedValue(HIDDEN_OFFSET);
  const opacity = useSharedValue(0);

  const feedbackId = feedback?.id ?? null;

  useEffect(() => {
    if (feedbackId === null) return;

    if (reducedMotion) {
      translateY.value = 0;
      opacity.value = 1;
    } else {
      translateY.value = HIDDEN_OFFSET;
      opacity.value = 0;
      translateY.value = withTiming(0, { duration: SLIDE_MS });
      opacity.value = withTiming(1, { duration: SLIDE_MS });
    }

    const hideTimer = setTimeout(() => {
      if (reducedMotion) {
        opacity.value = 0;
      } else {
        translateY.value = withTiming(HIDDEN_OFFSET, { duration: SLIDE_MS });
        opacity.value = withTiming(0, { duration: SLIDE_MS });
      }
    }, VISIBLE_MS);

    // 动画退场后再清状态，避免遮挡；期间若有新事件则交给新的 effect 处理
    const clearTimer = setTimeout(() => {
      if (useGameStore.getState().feedback?.id === feedbackId) clearFeedback();
    }, VISIBLE_MS + SLIDE_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [feedbackId, reducedMotion]);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!feedback) return null;

  const message = t(`feedback.group.${feedback.groupType}`);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrapper, { bottom: bottomOffset }, wrapperStyle]}
    >
      <View
        style={[
          styles.panel,
          { backgroundColor: colors.success },
        ]}
      >
        <Sparkles size={22} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.text}>{message}</Text>
      </View>
      <View
        style={[
          styles.edge,
          { backgroundColor: colors.successShadow },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
  },
  panel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  edge: {
    height: EDGE_HEIGHT,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
