import { Board, Difficulty, DIFFICULTY_CONFIG } from "./types";
import { solve, hasUniqueSolution } from "./solver";

/**
 * Fisher-Yates 洗牌，返回新数组
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 填充对角线上的三个 3x3 box（互不影响，可随机填充）
 */
function fillDiagonalBoxes(board: Board): void {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const boxStart of [0, 3, 6]) {
    const shuffled = shuffle(nums);
    let idx = 0;
    for (let r = boxStart; r < boxStart + 3; r++) {
      for (let c = boxStart; c < boxStart + 3; c++) {
        board[r][c] = shuffled[idx++];
      }
    }
  }
}

/**
 * 生成一个完整有效的 9x9 数独解
 */
export function generateSolution(): Board {
  const board: Board = Array.from({ length: 9 }, () => Array(9).fill(null));

  fillDiagonalBoxes(board);

  const solved = solve(board);
  // 对角线 box 已正确填充，solve 一定能得到解
  return solved!;
}

/**
 * 根据难度生成数独谜题
 * 返回谜题和对应的完整解
 */
export function createPuzzle(difficulty: Difficulty): { puzzle: Board; solution: Board } {
  const solution = generateSolution();
  const puzzle: Board = solution.map((row) => [...row]);

  const config = DIFFICULTY_CONFIG[difficulty];
  const targetGivens =
    config.minGivens + Math.floor(Math.random() * (config.maxGivens - config.minGivens + 1));
  const targetRemovals = 81 - targetGivens;

  // 收集所有格子坐标并打乱
  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      cells.push({ row: r, col: c });
    }
  }
  const shuffledCells = shuffle(cells);

  let removed = 0;

  for (const { row, col } of shuffledCells) {
    if (removed >= targetRemovals) break;
    if (puzzle[row][col] === null) continue;

    const backup = puzzle[row][col];
    puzzle[row][col] = null;

    if (hasUniqueSolution(puzzle)) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return { puzzle, solution };
}
