import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGameStore } from "@/stores/game-store";

function AnimatedNumberButton({ num, onPress, disabled }: { num: number; onPress: () => void; disabled: boolean }) {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { if (!reducedMotion && !disabled) scale.value = withSpring(0.9); }}
      onPressOut={() => { if (!reducedMotion) scale.value = withSpring(1); }}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`Number ${num}${disabled ? ", completed" : ""}`}
    >
      <Animated.View style={[styles.button, disabled && styles.buttonDisabled, animatedStyle]}>
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
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

  // 计算每个数字已完成的数量（正确放置的次数）
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
    paddingHorizontal: 4,
  },
  button: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
    fontVariant: ["tabular-nums"],
  },
  buttonTextDisabled: {
    color: "#94A3B8",
  },
});
