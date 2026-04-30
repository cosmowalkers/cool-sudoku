import React from "react";
import { Text, View, Pressable, StyleSheet } from "react-native";
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

function CellComponent({ row, col, size }: CellProps) {
  const cell = useGameStore((s) => s.board[row]?.[col]);
  const selectedCell = useGameStore((s) => s.selectedCell);
  const board = useGameStore((s) => s.board);
  const selectCell = useGameStore((s) => s.selectCell);

  if (!cell) return <View style={{ width: size, height: size }} />;

  const highlight = getHighlightType(row, col, cell, selectedCell, board);
  const bgColor = highlightColors[highlight];
  const textColor = getTextColor(cell);
  const isSelected = highlight === "selected";

  return (
    <Pressable
      onPress={() => selectCell({ row, col })}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: bgColor,
        },
      ]}
      accessibilityLabel={`Row ${row + 1} Column ${col + 1}, ${cell.value ? `value ${cell.value}` : "empty"}`}
    >
      {cell.value ? (
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
