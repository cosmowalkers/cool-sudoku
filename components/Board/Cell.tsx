import React, { useEffect, useRef } from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  runOnJS,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useGameStore } from "@/stores/game-store";
import type { CellState, Coordinate } from "@/lib/sudoku";

interface CellProps {
  row: number;
  col: number;
  size: number;
}

type HighlightType = "selected" | "sameNumber" | "related" | "error" | "none";

function getHighlightType(
  row: number,
  col: number,
  cell: CellState,
  selectedCell: Coordinate | null,
  board: CellState[][]
): HighlightType {
  if (!selectedCell) return cell.isError && cell.value ? "error" : "none";

  const isSelected = row === selectedCell.row && col === selectedCell.col;
  if (isSelected) return "selected";

  // 检查冲突
  if (cell.isError && cell.value) return "error";

  // 相同数字高亮
  const selectedValue = board[selectedCell.row]?.[selectedCell.col]?.value;
  if (selectedValue && cell.value === selectedValue) return "sameNumber";

  // 同行/列/box 高亮
  const sameRow = row === selectedCell.row;
  const sameCol = col === selectedCell.col;
  const sameBox =
    Math.floor(row / 3) === Math.floor(selectedCell.row / 3) &&
    Math.floor(col / 3) === Math.floor(selectedCell.col / 3);
  if (sameRow || sameCol || sameBox) return "related";

  return "none";
}

const highlightColors = {
  selected: "#2563EB",
  sameNumber: "#EDE9FE",
  related: "#DBEAFE",
  error: "#FEE2E2",
  none: "transparent",
};

function getTextColor(cell: CellState): string {
  if (cell.isError && cell.value) return "#DC2626";
  if (cell.isHint) return "#059669";
  if (cell.isGiven) return "#0F172A";
  return "#2563EB";
}

function isCellInCompletedGroup(
  row: number,
  col: number,
  groups: { type: 'row' | 'col' | 'box'; index: number }[]
): boolean {
  return groups.some(g => {
    if (g.type === 'row') return g.index === row;
    if (g.type === 'col') return g.index === col;
    if (g.type === 'box') {
      const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
      return g.index === boxIndex;
    }
    return false;
  });
}

function CellComponent({ row, col, size }: CellProps) {
  const cell = useGameStore((s) => s.board[row]?.[col]);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const board = useGameStore((s) => s.board);
  const selectCell = useGameStore((s) => s.selectCell);
  const lastErrorCell = useGameStore((s) => s.lastErrorCell);
  const clearLastError = useGameStore((s) => s.clearLastError);
  const completedGroups = useGameStore((s) => s.completedGroups);

  const reducedMotion = useReducedMotion();

  // 动画 shared values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateX = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const pulseOpacity = useSharedValue(1);

  // 跟踪上一次 value，用于检测从 null 变为有值
  const prevValue = useRef<number | null>(cell?.value ?? null);

  // US-004: 填数弹跳
  useEffect(() => {
    if (!cell) return;
    const prev = prevValue.current;
    prevValue.current = cell.value;

    // 从 null 变为有值时触发弹跳
    if (prev === null && cell.value !== null) {
      if (reducedMotion) {
        scale.value = 1;
        opacity.value = 1;
      } else {
        scale.value = 0.6;
        opacity.value = 0;
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
        opacity.value = withTiming(1, { duration: 150 });
      }
    }
  }, [cell?.value]);

  // US-005: 错误抖动
  useEffect(() => {
    if (!lastErrorCell) return;
    if (lastErrorCell.row !== row || lastErrorCell.col !== col) return;

    if (reducedMotion) {
      runOnJS(clearLastError)();
      return;
    }

    translateX.value = withSequence(
      withTiming(4, { duration: 33 }),
      withTiming(-4, { duration: 33 }),
      withTiming(4, { duration: 33 }),
      withTiming(-4, { duration: 33 }),
      withTiming(4, { duration: 33 }),
      withTiming(0, { duration: 33, reduceMotion: undefined }, (finished) => {
        if (finished) {
          runOnJS(clearLastError)();
        }
      })
    );
  }, [lastErrorCell]);

  // US-006: 行/列/宫完成闪光
  useEffect(() => {
    if (completedGroups.length > 0 && isCellInCompletedGroup(row, col, completedGroups)) {
      if (!reducedMotion) {
        flashOpacity.value = withSequence(
          withTiming(0.3, { duration: 150 }),
          withTiming(0, { duration: 150 })
        );
      }
    }
  }, [completedGroups]);

  // US-007: 选中格脉冲
  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
  useEffect(() => {
    if (isSelected && !reducedMotion) {
      pulseOpacity.value = withRepeat(
        withTiming(0.6, { duration: 750 }),
        -1,
        true
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [isSelected, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (!cell) return <View style={{ width: size, height: size }} />;

  const highlight = getHighlightType(row, col, cell, selectedCell, board);
  const bgColor = highlightColors[highlight];
  const textColor = getTextColor(cell);

  return (
    <Pressable
      onPress={() => selectCell({ row, col })}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: isSelected ? undefined : bgColor,
        },
      ]}
      accessibilityLabel={`Row ${row + 1} Column ${col + 1}, ${cell.value ? `value ${cell.value}` : "empty"}`}
    >
      {/* 选中格脉冲背景 */}
      {isSelected && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: highlightColors.selected },
            pulseAnimatedStyle,
          ]}
          pointerEvents="none"
        />
      )}
      {cell.value ? (
        <Animated.View style={animatedStyle}>
          <Text
            style={[
              styles.cellNumber,
              {
                color: isSelected ? "#FFFFFF" : textColor,
                fontWeight: cell.isGiven ? "700" : "500",
              },
            ]}
          >
            {cell.value}
          </Text>
        </Animated.View>
      ) : cell.notes.length > 0 ? (
        <View style={styles.notesGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <Text
              key={n}
              style={[
                styles.noteNumber,
                { color: isSelected ? "#FFFFFF" : "#64748B" },
              ]}
            >
              {cell.notes.includes(n) ? n : " "}
            </Text>
          ))}
        </View>
      ) : null}
      {/* US-006: 完成闪光覆盖层 */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#2563EB' },
          flashAnimatedStyle,
        ]}
        pointerEvents="none"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
  cellNumber: {
    fontSize: 22,
    fontVariant: ["tabular-nums"],
  },
  notesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  noteNumber: {
    fontSize: 9,
    width: "33.33%",
    textAlign: "center",
    lineHeight: 11,
  },
});

export const Cell = React.memo(CellComponent);
