import { useState, useEffect } from "react";
import { Platform } from "react-native";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { playSound } from "@/lib/audio";
import type { Board, CellState, Coordinate, Difficulty, GameBoard } from "@/lib/sudoku";
import { createPuzzle, isComplete } from "@/lib/sudoku";
import { useStatsStore } from "@/stores/stats-store";

// --- Haptic 反馈 ---

function hapticLight() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}
function hapticError() {
  if (Platform.OS !== "web") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}
function hapticSuccess() {
  if (Platform.OS !== "web") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}
function hapticMedium() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

// --- 辅助函数 ---

function createEmptyGameBoard(): GameBoard {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, (): CellState => ({
      value: null,
      isGiven: false,
      isHint: false,
      notes: [],
      isError: false,
    }))
  );
}

function deepCloneBoard(board: GameBoard): GameBoard {
  return JSON.parse(JSON.stringify(board));
}

function getBoxStart(n: number): number {
  return Math.floor(n / 3) * 3;
}

/** 将 GameBoard 转为纯值 Board 用于 isComplete 判断 */
function toBoardValues(gameBoard: GameBoard): Board {
  return gameBoard.map((row) => row.map((cell) => cell.value));
}

/** 更新整个棋盘的冲突标记 */
function updateConflicts(board: GameBoard): void {
  // 先清除所有错误
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      board[r][c].isError = false;
    }
  }
  // 检查每个非空格子
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c].value;
      if (val === null) continue;
      // 检查同行
      for (let i = 0; i < 9; i++) {
        if (i !== c && board[r][i].value === val) {
          board[r][c].isError = true;
          board[r][i].isError = true;
        }
      }
      // 检查同列
      for (let i = 0; i < 9; i++) {
        if (i !== r && board[i][c].value === val) {
          board[r][c].isError = true;
          board[i][c].isError = true;
        }
      }
      // 检查同 box
      const boxR = Math.floor(r / 3) * 3;
      const boxC = Math.floor(c / 3) * 3;
      for (let br = boxR; br < boxR + 3; br++) {
        for (let bc = boxC; bc < boxC + 3; bc++) {
          if (br !== r || bc !== c) {
            if (board[br][bc].value === val) {
              board[r][c].isError = true;
              board[br][bc].isError = true;
            }
          }
        }
      }
    }
  }
}

/** 清除同行/列/box 中其他格子中包含 num 的笔记 */
function clearRelatedNotes(board: GameBoard, row: number, col: number, num: number): void {
  const boxRowStart = getBoxStart(row);
  const boxColStart = getBoxStart(col);
  for (let i = 0; i < 9; i++) {
    // 同行
    board[row][i].notes = board[row][i].notes.filter((n) => n !== num);
    // 同列
    board[i][col].notes = board[i][col].notes.filter((n) => n !== num);
  }
  // 同 box
  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      board[r][c].notes = board[r][c].notes.filter((n) => n !== num);
    }
  }
}

// --- 类型 ---

interface HistoryEntry {
  board: GameBoard;
}

interface GameState {
  // 游戏数据
  board: GameBoard;
  solution: Board;
  difficulty: Difficulty | null;

  // UI 状态
  selectedCell: Coordinate | null;
  isNotesMode: boolean;
  isGenerating: boolean;
  lastErrorCell: Coordinate | null;
  completedGroups: { type: 'row' | 'col' | 'box'; index: number }[];

  // 游戏进度
  mistakes: number;
  hintsUsed: number;
  elapsedTime: number;
  isPaused: boolean;
  isCompleted: boolean;

  // 撤销
  history: HistoryEntry[];

  // Actions
  selectCell: (coord: Coordinate) => void;
  placeNumber: (num: number) => void;
  erase: () => void;
  toggleNotesMode: () => void;
  undo: () => void;
  hint: () => void;
  newGame: (difficulty: Difficulty) => void;
  restart: () => void;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  clearLastError: () => void;
  clearCompletedGroups: () => void;
}

/** 检测填数后哪些 group（行/列/宫）刚好被填满 */
function detectCompletedGroups(board: GameBoard, row: number, col: number): { type: 'row' | 'col' | 'box'; index: number }[] {
  const groups: { type: 'row' | 'col' | 'box'; index: number }[] = [];

  // 检查行
  const rowComplete = board[row].every(c => c.value !== null && !c.isError);
  if (rowComplete) groups.push({ type: 'row', index: row });

  // 检查列
  const colComplete = board.every(r => r[col].value !== null && !r[col].isError);
  if (colComplete) groups.push({ type: 'col', index: col });

  // 检查 box
  const boxRowStart = getBoxStart(row);
  const boxColStart = getBoxStart(col);
  let boxComplete = true;
  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      if (board[r][c].value === null || board[r][c].isError) {
        boxComplete = false;
        break;
      }
    }
    if (!boxComplete) break;
  }
  if (boxComplete) {
    const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    groups.push({ type: 'box', index: boxIndex });
  }

  return groups;
}

// --- Store ---

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  // 初始状态
  board: createEmptyGameBoard(),
  solution: Array.from({ length: 9 }, () => Array(9).fill(null)) as Board,
  difficulty: null,
  selectedCell: null,
  isNotesMode: false,
  isGenerating: false,
  lastErrorCell: null,
  completedGroups: [],
  mistakes: 0,
  hintsUsed: 0,
  elapsedTime: 0,
  isPaused: false,
  isCompleted: false,
  history: [],

  selectCell: (coord) => {
    set({ selectedCell: coord });
  },

  placeNumber: (num) => {
    const { selectedCell, board, solution, isNotesMode } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    // given / hint 格子不可操作
    if (cell.isGiven || cell.isHint) return;

    if (isNotesMode) {
      // 笔记模式：toggle num
      const newBoard = deepCloneBoard(board);
      const notes = newBoard[row][col].notes;
      const idx = notes.indexOf(num);
      if (idx === -1) {
        notes.push(num);
      } else {
        notes.splice(idx, 1);
      }
      set({ board: newBoard });
      return;
    }

    // 正常填数模式
    const newBoard = deepCloneBoard(board);

    // 推入历史
    set((state) => ({ history: [...state.history, { board: deepCloneBoard(state.board) }] }));

    // 填入数字
    newBoard[row][col].value = num;
    newBoard[row][col].notes = [];

    // 自动清除同行/列/box 中其他格子的笔记
    clearRelatedNotes(newBoard, row, col, num);

    // 更新冲突标记（基于数独规则：同行/列/宫不能有重复）
    updateConflicts(newBoard);

    // 判断是否产生了规则冲突（不是对比 solution，而是检测数独规则违反）
    const hasConflict = newBoard[row][col].isError;

    // 检测哪些 group 刚被完成
    const detectedGroups = detectCompletedGroups(newBoard, row, col);

    // 检查是否完成（全部填满且与 solution 一致）
    const completed = isComplete(toBoardValues(newBoard), solution);

    // 完成时统计错误数（用 solution 对比，只在结算时计算）
    if (completed) {
      let totalMistakes = 0;
      // 此刻已完成，统计整局中的实际错误不再需要（因为完成意味着全对）
      // mistakes 改为统计"当前棋盘上与 solution 不一致的格子数"（完成时为 0）
      useStatsStore.getState().recordGame({
        difficulty: get().difficulty!,
        elapsedTime: get().elapsedTime,
        mistakes: get().mistakes,
        hintsUsed: get().hintsUsed,
      });
    }

    set({
      board: newBoard,
      mistakes: hasConflict ? get().mistakes + 1 : get().mistakes,
      isCompleted: completed,
      lastErrorCell: hasConflict ? { row, col } : null,
      ...(detectedGroups.length > 0 ? { completedGroups: detectedGroups } : {}),
    });

    // Haptic 反馈 + 音效
    // 所有填数都有相同的轻反馈，只有规则冲突时才有错误反馈
    hapticLight();
    playSound("pop");
    if (hasConflict) {
      hapticError();
      playSound("error");
    }
    if (detectedGroups.length > 0) {
      playSound("lineClear");
    }
    if (completed) {
      hapticSuccess();
      playSound("complete");
    }
  },

  erase: () => {
    const { selectedCell, board } = get();
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const cell = board[row][col];

    // 只能擦除用户输入的格子
    if (cell.isGiven || cell.isHint) return;

    // 没有内容可擦除
    if (cell.value === null && cell.notes.length === 0) return;

    // 推入历史
    set((state) => ({ history: [...state.history, { board: deepCloneBoard(state.board) }] }));

    const newBoard = deepCloneBoard(board);
    newBoard[row][col].value = null;
    newBoard[row][col].notes = [];

    // 更新冲突标记
    updateConflicts(newBoard);

    set({ board: newBoard });
  },

  toggleNotesMode: () => {
    set((state) => ({ isNotesMode: !state.isNotesMode }));
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;

    const newHistory = [...history];
    const previous = newHistory.pop()!;

    // 更新冲突标记
    updateConflicts(previous.board);

    set({ board: previous.board, history: newHistory });
    playSound("undo");
  },

  hint: () => {
    const { selectedCell, board, solution, hintsUsed } = get();
    // 限制 3 次
    if (hintsUsed >= 3) return;
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];
    // 如果是 given 格子，不操作
    if (cell.isGiven) return;
    // 如果格子已有正确值，不消耗提示
    if (cell.value === solution[row][col]) return;

    // 推入 history
    const newHistory = [...get().history, { board: deepCloneBoard(board) }];
    const newBoard = deepCloneBoard(board);
    const correctValue = solution[row][col]!;
    newBoard[row][col] = {
      value: correctValue,
      isGiven: false,
      isHint: true,
      notes: [],
      isError: false,
    };

    // 自动清除关联格子的笔记
    clearRelatedNotes(newBoard, row, col, correctValue);

    // 更新冲突标记
    updateConflicts(newBoard);

    const boardValues = toBoardValues(newBoard);
    const completed = isComplete(boardValues, solution);

    if (completed) {
      useStatsStore.getState().recordGame({
        difficulty: get().difficulty!,
        elapsedTime: get().elapsedTime,
        mistakes: get().mistakes,
        hintsUsed: hintsUsed + 1,
      });
    }

    set({
      board: newBoard,
      history: newHistory,
      hintsUsed: hintsUsed + 1,
      isCompleted: completed,
    });

    // Haptic 反馈 + 音效
    hapticMedium();
    playSound("pop");
    if (completed) {
      hapticSuccess();
      playSound("complete");
    }
  },

  newGame: (difficulty) => {
    set({ isGenerating: true });

    const { puzzle, solution } = createPuzzle(difficulty);

    // 将 Board (number[][]) 转为 GameBoard (CellState[][])
    const gameBoard: GameBoard = puzzle.map((row) =>
      row.map((value) => ({
        value,
        isGiven: value !== null,
        isHint: false,
        notes: [],
        isError: false,
      }))
    );

    set({
      board: gameBoard,
      solution,
      difficulty,
      selectedCell: null,
      isNotesMode: false,
      isGenerating: false,
      mistakes: 0,
      hintsUsed: 0,
      elapsedTime: 0,
      isPaused: false,
      isCompleted: false,
      history: [],
    });
  },

  restart: () => {
    const { board, difficulty } = get();
    if (!difficulty) return;
    const resetBoard: GameBoard = board.map((row) =>
      row.map((cell) =>
        cell.isGiven
          ? { ...cell, isError: false }
          : { value: null, isGiven: false, isHint: false, notes: [], isError: false }
      )
    );
    set({
      board: resetBoard,
      selectedCell: null,
      isNotesMode: false,
      mistakes: 0,
      hintsUsed: 0,
      elapsedTime: 0,
      isPaused: false,
      isCompleted: false,
      history: [],
      lastErrorCell: null,
      completedGroups: [],
    });
  },

  pause: () => {
    set({ isPaused: true });
  },

  resume: () => {
    set({ isPaused: false });
  },

  tick: () => {
    const { isPaused, isCompleted } = get();
    if (!isPaused && !isCompleted) {
      set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
    }
  },

  clearLastError: () => {
    set({ lastErrorCell: null });
  },

  clearCompletedGroups: () => {
    set({ completedGroups: [] });
  },
    }),
    {
      name: "game-store",
      storage: {
        getItem: (name) => {
          return AsyncStorage.getItem(name).then((value) =>
            value ? JSON.parse(value) : null
          );
        },
        setItem: (() => {
          let timer: ReturnType<typeof setTimeout> | null = null;
          return (name: string, value: unknown) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
              AsyncStorage.setItem(name, JSON.stringify(value));
              timer = null;
            }, 2000);
          };
        })(),
        removeItem: (name) => {
          return AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        board: state.board,
        solution: state.solution,
        difficulty: state.difficulty,
        mistakes: state.mistakes,
        hintsUsed: state.hintsUsed,
        elapsedTime: state.elapsedTime,
        isCompleted: state.isCompleted,
        history: state.history,
      }),
    }
  )
);

// Hydration 检测 hook
export const useGameStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useGameStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // 如果已经 hydrated（比如 store 已经初始化完成）
    if (useGameStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};
