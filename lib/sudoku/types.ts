export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type CellValue = number | null; // 1-9 or null for empty

export type Board = CellValue[][]; // 9x9 grid

export interface CellState {
  value: CellValue;
  isGiven: boolean;
  isHint: boolean;
  notes: number[]; // array of 1-9 for pencil marks, use array (not Set) for JSON serialization
  isError: boolean;
}

export type GameBoard = CellState[][]; // 9x9 grid of CellState

export interface Coordinate {
  row: number;
  col: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, { minGivens: number; maxGivens: number }> = {
  easy: { minGivens: 36, maxGivens: 45 },
  medium: { minGivens: 27, maxGivens: 35 },
  hard: { minGivens: 22, maxGivens: 26 },
  expert: { minGivens: 17, maxGivens: 21 },
};
