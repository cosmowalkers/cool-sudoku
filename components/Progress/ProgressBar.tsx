import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGameStore } from "@/stores/game-store";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/themes";

const TOTAL_CELLS = 81;
const BAR_HEIGHT = 8;

export function ProgressBar() {
  const board = useGameStore((s) => s.board);
  const { t } = useTranslation();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();

  const { done, fillable } = useMemo(() => {
    let filled = 0;
    let givens = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell.value !== null) filled += 1;
        if (cell.isGiven) givens += 1;
      }
    }
    return { done: filled - givens, fillable: TOTAL_CELLS - givens };
  }, [board]);

  // 进度只算玩家自己填的格子。题目自带数字若算进去，简单难度一开局就 40%+，绿条几乎不动
  const ratio = fillable > 0 ? Math.min(1, Math.max(0, done / fillable)) : 0;

  const progress = useSharedValue(ratio);

  useEffect(() => {
    progress.value = reducedMotion ? ratio : withTiming(ratio, { duration: 250 });
  }, [ratio, reducedMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: colors.border }]}
      accessibilityRole="progressbar"
      accessibilityLabel={t("a11y.progress", { count: done, total: fillable })}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.success }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  fill: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
  },
});
