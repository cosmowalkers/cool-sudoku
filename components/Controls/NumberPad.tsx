import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGameStore } from "@/stores/game-store";
import { useTheme } from "@/lib/themes";
import { PRESS_IN_MS, PRESS_OUT_MS, PRESS_SCALE, softShadow } from "@/lib/ui/press";

/** 数字键盘整体高度，供反馈条定位时避让 */
export const NUMPAD_HEIGHT = 48;

function AnimatedNumberButton({ num, onPress, disabled }: { num: number; onPress: () => void; disabled: boolean }) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();
  const { colors } = useTheme();

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
      accessibilityLabel={`Number ${num}${disabled ? ", completed" : ""}`}
      style={[styles.wrapper, disabled && styles.wrapperDisabled]}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: colors.numpadBg },
          bodyStyle,
        ]}
      >
        <Text style={[styles.buttonText, { color: colors.numpadText }]}>
          {num}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function NumberPad() {
  const placeNumber = useGameStore((s) => s.placeNumber);
  const board = useGameStore((s) => s.board);
  const solution = useGameStore((s) => s.solution);

  const completedNumbers = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (let n = 1; n <= 9; n++) {
      let count = 0;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].value === n && board[r][c].value === solution[r][c]) {
            count++;
          }
        }
      }
      counts[n] = count;
    }
    return counts;
  }, [board, solution]);

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        const isCompleted = completedNumbers[num] >= 9;
        return (
          <AnimatedNumberButton
            key={num}
            num={num}
            onPress={() => placeNumber(num)}
            disabled={isCompleted}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingHorizontal: 8,
  },
  wrapper: {
    height: 48,
  },
  wrapperDisabled: {
    opacity: 0.3,
  },
  button: {
    width: 36,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    ...softShadow,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
