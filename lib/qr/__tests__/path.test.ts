import { describe, expect, it } from "vitest";
import { encodeQr } from "../encode";
import { qrToPath } from "../path";

/** 把 qrToPath 生成的路径反解析回矩阵，验证渲染层没有转置/错位 */
function parsePath(d: string, size: number): boolean[][] {
  const grid = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const token = /M(\d+) (\d+)h(\d+)v1H(\d+)z/g;
  let match: RegExpExecArray | null;

  while ((match = token.exec(d)) !== null) {
    const [, xs, ys, width, closeX] = match;
    const x = Number(xs);
    const y = Number(ys);
    const w = Number(width);
    expect(Number(closeX)).toBe(x);
    for (let i = 0; i < w; i++) grid[y][x + i] = true;
  }

  return grid;
}

describe("qrToPath", () => {
  it("路径能完整还原原始矩阵", () => {
    for (const text of ["https://example.com", "https://a.cn/p/1", "x".repeat(60)]) {
      const { size, modules } = encodeQr(text, "M");
      expect(parsePath(qrToPath(modules), size)).toEqual(modules);
    }
  });

  it("连续深色模块被合并为一条子路径", () => {
    expect(qrToPath([[true, true, true]])).toBe("M0 0h3v1H0z");
    expect(qrToPath([[true, false, true]])).toBe("M0 0h1v1H0zM2 0h1v1H2z");
    expect(qrToPath([[false, false]])).toBe("");
  });
});
