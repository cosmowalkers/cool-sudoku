import React, { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { Cell } from "./Cell";
import { useGameStore } from "@/stores/game-store";

const BOARD_PADDING = 16;
const THICK_BORDER = 2;

export function Board() {
  const { width: screenWidth } = useWindowDimensions();
  const completedGroups = useGameStore((s) => s.completedGroups);
  const clearCompletedGroups = useGameStore((s) => s.clearCompletedGroups);

  useEffect(() => {
    if (completedGroups.length > 0) {
      const timer = setTimeout(() => clearCompletedGroups(), 350);
      return () => clearTimeout(timer);
    }
  }, [completedGroups]);
  const boardWidth = screenWidth - BOARD_PADDING * 2;
  const cellSize = Math.floor((boardWidth - 4 * THICK_BORDER) / 9);

  return (
    <View
      style={[
        styles.board,
        {
          width: cellSize * 9 + 4 * THICK_BORDER,
          borderWidth: THICK_BORDER,
          borderColor: "#334155",
        },
      ]}
    >
      {Array.from({ length: 9 }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: 9 }, (_, col) => (
            <View
              key={col}
              style={{
                borderRightWidth:
                  col === 8 ? 0 : col % 3 === 2 ? THICK_BORDER : StyleSheet.hairlineWidth,
                borderRightColor: col % 3 === 2 ? "#334155" : "#E2E8F0",
                borderBottomWidth:
                  row === 8 ? 0 : row % 3 === 2 ? THICK_BORDER : StyleSheet.hairlineWidth,
                borderBottomColor: row % 3 === 2 ? "#334155" : "#E2E8F0",
              }}
            >
              <Cell row={row} col={col} size={cellSize} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: "#FFFFFF",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
  },
});
