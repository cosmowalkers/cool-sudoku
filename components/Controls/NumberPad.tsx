import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useGameStore } from "@/stores/game-store";

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
          <Pressable
            key={num}
            onPress={() => !isCompleted && placeNumber(num)}
            disabled={isCompleted}
            style={({ pressed }) => [
              styles.button,
              pressed && !isCompleted && styles.buttonPressed,
              isCompleted && styles.buttonDisabled,
            ]}
            accessibilityLabel={`Number ${num}${isCompleted ? ", completed" : ""}`}
          >
            <Text
              style={[
                styles.buttonText,
                isCompleted && styles.buttonTextDisabled,
              ]}
            >
              {num}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    gap: 6,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: "#DBEAFE",
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
