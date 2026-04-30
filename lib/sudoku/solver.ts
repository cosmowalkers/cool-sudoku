import { Board } from "./types";

/**
 * 检查在 board[row][col] 放置 num 是否合法
 * 忽略当前位置自身的值（覆盖场景）
 */
export function validatePlacement(
  board: Board,
  row: number,
  col: number,
  num: number
): boolean {
  // 检查同行
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }

  // 检查同列
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }

  // 检查 3x3 box
  const boxRowStart = Math.floor(row / 3) * 3;
  const boxColStart = Math.floor(col / 3) * 3;
  for (let r = boxRowStart; r < boxRowStart + 3; r++) {
    for (let c = boxColStart; c < boxColStart + 3; c++) {
      if (r !== row || c !== col) {
        if (board[r][c] === num) return false;
      }
    }
  }

  return true;
}

/**
 * 回溯法求解数独，返回完整解或 null（无解时）
 * 深拷贝 board 避免修改原始输入
 */
export function solve(board: Board): Board | null {
  const copy: Board = board.map((row) => [...row]);

  if (solveRecursive(copy)) {
    return copy;
  }
  return null;
}

function solveRecursive(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (validatePlacement(board, row, col, num)) {
            board[row][col] = num;
            if (solveRecursive(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * 验证是否恰好有唯一解
 * 找到第 2 个解时立即停止返回 false
 */
export function hasUniqueSolution(board: Board): boolean {
  const counter = { count: 0 };
  const copy: Board = board.map((row) => [...row]);
  countSolutions(copy, counter);
  return counter.count === 1;
}

function countSolutions(
  board: Board,
  counter: { count: number }
): void {
  if (counter.count >= 2) return;

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (validatePlacement(board, row, col, num)) {
            board[row][col] = num;
            countSolutions(board, counter);
            board[row][col] = null;
            if (counter.count >= 2) return;
          }
        }
        return;
      }
    }
  }

  // 所有格子都填满，找到一个解
  counter.count++;
}

/**
 * 检查 board 是否与 solution 完全一致（游戏完成判定）
 */
export function isComplete(board: Board, solution: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
