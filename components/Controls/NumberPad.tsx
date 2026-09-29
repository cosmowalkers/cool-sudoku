import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGameStore } from "@/stores/game-store";
import { useTheme } from "@/lib/themes";

const SHADOW_HEIGHT = 3;

/** 数字键盘整体高度，供反馈条定位时避让 */
export const NUMPAD_HEIGHT = 48 + SHADOW_HEIGHT;

function AnimatedNumberButton({ num, onPress, disabled }: { num: number; onPress: () => void; disabled: boolean }) {
  const translateY = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const { colors } = useTheme();

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    height: SHADOW_HEIGHT - translateY.value,
  }));

  return (
    <Pressable
      onPressIn={() => {
        if (!reducedMotion && !disabled)
          translateY.value = withTiming(SHADOW_HEIGHT, { duration: 80 });
      }}
      onPressOut={() => {
        if (!reducedMotion)
          translateY.value = withTiming(0, { duration: 100 });
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
      <Animated.View
        style={[
          styles.shadow,
          { backgroundColor: colors.numpadShadow },
          shadowStyle,
        ]}
      />
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
    height: 48 + SHADOW_HEIGHT,
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
  },
  shadow: {
    width: 36,
    height: SHADOW_HEIGHT,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
