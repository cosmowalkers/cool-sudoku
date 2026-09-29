import React, { useEffect, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
import { Cell } from "./Cell";
import { useGameStore } from "@/stores/game-store";
import { useTheme } from "@/lib/themes";

const BOARD_PADDING = 16;
const THICK_BORDER = 3;
const MAX_BOARD_SIZE = 520;

export function Board() {
  const { colors } = useTheme();
  const completedGroups = useGameStore((s) => s.completedGroups);
  const clearCompletedGroups = useGameStore((s) => s.clearCompletedGroups);
  // 桌面端窗口宽而矮，只按宽度算格子会撑爆视口，所以量出容器实际可用空间
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (completedGroups.length > 0) {
      const timer = setTimeout(() => clearCompletedGroups(), 350);
      return () => clearTimeout(timer);
    }
  }, [completedGroups]);

  const available = Math.min(
    box.width - BOARD_PADDING * 2,
    box.height,
    MAX_BOARD_SIZE
  );
  const cellSize = Math.floor((available - 4 * THICK_BORDER) / 9);

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setBox((prev) =>
          prev.width === width && prev.height === height ? prev : { width, height }
        );
      }}
    >
      {cellSize > 0 && (
        <View
          style={[
            styles.board,
            {
              width: cellSize * 9 + 4 * THICK_BORDER,
              borderWidth: THICK_BORDER,
              borderColor: colors.borderThick,
              backgroundColor: colors.surface,
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
                    borderRightColor: col % 3 === 2 ? colors.borderThick : colors.border,
                    borderBottomWidth:
                      row === 8 ? 0 : row % 3 === 2 ? THICK_BORDER : StyleSheet.hairlineWidth,
                    borderBottomColor: row % 3 === 2 ? colors.borderThick : colors.border,
                  }}
                >
                  <Cell row={row} col={col} size={cellSize} />
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  board: {
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      } as any,
    }),
  },
  row: {
    flexDirection: "row",
  },
});
