import { describe, expect, it } from "vitest";
import { encodeQr, type QrErrorCorrectLevel } from "../encode";

/**
 * 基准值取自参考实现（qrcode.js）逐位比对通过后的输出，
 * 这里用 FNV-1a 哈希固化，防止后续改动破坏编码正确性。
 */
function fingerprint(text: string, level: QrErrorCorrectLevel) {
  const { size, modules } = encodeQr(text, level);
  let hash = 0x811c9dc5;
  for (const row of modules) {
    for (const dark of row) {
      hash ^= dark ? 49 : 48;
      hash = (hash * 0x01000193) >>> 0;
    }
  }
  return { size, hash };
}

describe("encodeQr", () => {
  it("短链接按版本 2 生成", () => {
    expect(fingerprint("https://example.com", "M")).toEqual({
      size: 25,
      hash: 3010593708,
    });
  });

  it("较长下载链接按版本 6 生成", () => {
    expect(
      fingerprint(
        "https://github.com/cosmowalkers/cool-sudoku/releases/latest/download/cool-sudoku.apk",
        "M"
      )
    ).toEqual({ size: 37, hash: 354247256 });
  });

  it("App Store 链接按版本 3 生成", () => {
    expect(fingerprint("https://apps.apple.com/cn/app/id1234567890", "M")).toEqual({
      size: 29,
      hash: 1851879960,
    });
  });

  it("矩阵边长符合版本公式", () => {
    const { size, modules } = encodeQr("https://example.com", "M");
    expect(size).toBe(25);
    expect(modules).toHaveLength(size);
    modules.forEach((row) => expect(row).toHaveLength(size));
  });

  it("三个定位图形位置固定", () => {
    const { modules } = encodeQr("https://example.com", "M");
    // 左上 / 右上 / 左下 三个角的最外圈必须为深色
    expect(modules[0][0]).toBe(true);
    expect(modules[0][6]).toBe(true);
    expect(modules[6][0]).toBe(true);
    expect(modules[0][modules.length - 1]).toBe(true);
    expect(modules[modules.length - 1][0]).toBe(true);
  });

  it("内容超出容量时抛出明确错误", () => {
    expect(() => encodeQr("x".repeat(500), "H")).toThrow(/内容过长/);
  });
});
